import { kv } from '@vercel/kv';
import { getBlazeContractForToken } from './helpers';
import { makeContractCall, broadcastTransaction, Cl, TxBroadcastResult } from '@stacks/transactions';

export type Transfer = {
    to: string;
    amount: number;
    nonce: number;
    signature: string;
};

export class BlazeTransferService {
    private static readonly TOKEN_BATCH_SIZES: Record<string, number> = {
        'default': 1
    };

    private static readonly MINIMUM_BATCH_SIZE = 1;

    static getBatchSize(token: string): number {
        return this.TOKEN_BATCH_SIZES[token] || this.TOKEN_BATCH_SIZES.default;
    }

    static getTransferQueueKey(token: string): string {
        return `blaze:transfer:queue:${token}`;
    }

    static async getQueueLength(token: string): Promise<number> {
        return await kv.llen(this.getTransferQueueKey(token));
    }

    static async addTransferToQueue(token: string, transfer: Transfer): Promise<void> {
        const queueKey = this.getTransferQueueKey(token);
        await kv.lpush(queueKey, JSON.stringify(transfer));
    }

    static async getTransfersFromQueue(token: string): Promise<Transfer[]> {
        const queueKey = this.getTransferQueueKey(token);
        const transfers: Transfer[] = await kv.lrange(queueKey, 0, this.getBatchSize(token) - 1);
        return transfers;
    }

    static async removeProcessedTransfers(token: string): Promise<void> {
        const queueKey = this.getTransferQueueKey(token);
        await kv.ltrim(queueKey, this.getBatchSize(token), -1);
    }

    static async getAllQueueKeys(): Promise<string[]> {
        return await kv.keys('blaze:transfer:queue:*');
    }

    static async shouldProcessQueue(token: string): Promise<boolean> {
        const queueLength = await this.getQueueLength(token);
        return queueLength >= this.MINIMUM_BATCH_SIZE;
    }
}

export class BlazeBalanceService {
    static async updateBalances(contract: string, updates: { address: string, amount: number }[]): Promise<void> {
        const pipeline = kv.pipeline();
        const timestamp = Date.now();

        for (const update of updates) {
            // Update the balance in KV store
            pipeline.set(`balance:${contract}:${update.address}`, Number(update.amount));

            // Add update to sorted set for real-time updates
            const balanceUpdate = {
                contract,
                address: update.address,
                balance: Number(update.amount),
                timestamp
            };

            await kv.zadd('blaze-balance-updates', {
                score: timestamp,
                member: balanceUpdate
            });
        }

        await pipeline.exec();
    }

    static async getBalance(contract: string, address: string): Promise<number> {
        const balance = await kv.get<number>(`balance:${contract}:${address}`);
        return balance || 0;
    }

    static async incrementNonce(contract: string, address: string): Promise<number> {
        const currentNonce = await kv.get<number>(`nonce:${contract}:${address}`) || 0;
        await kv.set(`nonce:${contract}:${address}`, currentNonce + 1);
        return currentNonce + 1;
    }

    static async getNonce(contract: string, address: string): Promise<number> {
        const nonce = await kv.get<number>(`nonce:${contract}:${address}`);
        return nonce || 0;
    }
}

export interface BatchTransferOperation {
    to: string;
    amount: number;
    nonce: number;
    signature: string;
}

export class BlazeContractService {
    static async executeBatchTransfer(
        contractAddress: string,
        contractName: string,
        operations: BatchTransferOperation[]
    ): Promise<{ txid: string; status: string }> {
        const clarityOperations = operations.map(operation => {
            const { to, amount, nonce, signature } = operation;
            return Cl.tuple({
                to: Cl.principal(to),
                amount: Cl.uint(amount),
                nonce: Cl.uint(nonce),
                signature: Cl.bufferFromHex(signature.replace('0x', ''))
            });
        });

        const txOptions = {
            contractAddress,
            contractName,
            functionName: 'batch-transfer',
            functionArgs: [Cl.list(clarityOperations)],
            senderKey: process.env.PRIVATE_KEY!,
            network: 'mainnet',
            fee: 1800
        };

        const transaction = await makeContractCall(txOptions as any);
        const response: TxBroadcastResult = await broadcastTransaction({
            transaction,
            network: 'mainnet',
        });

        if ('error' in response) {
            throw new Error(response.error);
        }

        return {
            txid: response.txid,
            status: response.txid ? 'success' : 'failed'
        };
    }
}

export async function processTokenQueues() {
    // Get all queue keys
    const keys = await BlazeTransferService.getAllQueueKeys();

    for (const queueKey of keys) {
        const token = queueKey.split(':').pop()!;
        const queueLength = await BlazeTransferService.getQueueLength(token);

        // Process if we have at least the minimum batch size
        if (queueLength >= BlazeTransferService.getBatchSize(token)) {
            const contract = getBlazeContractForToken(token);
            console.log('Processing queue for subnet:', contract);
            // await processBatch(contract, token);
        }
    }
}