// pages/api/transfer.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { kv } from '@vercel/kv';
import { makeContractCall, broadcastTransaction, Cl } from '@stacks/transactions';
import { getBlazeBalance, getBlazeContractForToken, verifyBlazeSignature } from '@lib/blaze/helpers';
import { network } from '@components/stacks-session/connect';

const TOKEN_BATCH_SIZES: Record<string, number> = {
    'default': 100,
    'token-with-high-volume': 200,
    'token-with-low-volume': 10
};

const getBatchSize = (token: string) => TOKEN_BATCH_SIZES[token] || TOKEN_BATCH_SIZES.default;

export const getTransferQueueKey = (token: string) => `blaze:transfer:queue:${token}`;

type Transfer = {
    to: string;
    amount: number;
    nonce: number;
    signature: string;
};

const MINIMUM_BATCH_SIZE = 10;

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    console.log('Transfer request received:', {
        method: req.method,
        body: req.body,
        timestamp: new Date().toISOString()
    });

    if (req.method !== 'POST') {
        console.warn('Invalid method:', req.method);
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const {
            signature,
            from,
            token,
            amount,
            to,
            nonce,
        }: {
            signature: string;
            from: string;
            token: string;
            amount: number;
            to: string;
            nonce: number;
        } = req.body;

        const contract = getBlazeContractForToken(token);

        console.log('Processing transfer:', {
            contract,
            token,
            from,
            to,
            amount,
            nonce,
            signature: `${signature.slice(0, 10)}...`
        });

        // Verify signature matches the message structure
        const isValid = await verifyBlazeSignature(contract, signature, from, to, amount, nonce);
        console.log('Signature verification:', { isValid, from });

        if (!isValid) {
            console.warn('Invalid signature for transfer:', { from, to, nonce });
            return res.status(401).json({ error: 'Invalid signature' });
        }

        // Update off-chain balances immediately
        const pipeline = kv.pipeline();
        const fromBalance = await getBlazeBalance(contract, from);
        const toBalance = await getBlazeBalance(contract, to);

        // Verify sufficient balance
        if (BigInt(fromBalance) < BigInt(amount)) {
            console.warn('Insufficient balance:', { from, amount, balance: fromBalance });
            return res.status(400).json({ error: 'Insufficient balance' });
        }

        // Update balances atomically
        console.log('Updating off-chain balances:', {
            from,
            fromBalance,
            to,
            toBalance,
            amount
        });

        pipeline.set(`balance:${contract}:${from}`, (BigInt(fromBalance) - BigInt(amount)).toString());
        pipeline.set(`balance:${contract}:${to}`, (BigInt(toBalance) + BigInt(amount)).toString());
        await pipeline.exec();

        console.log('Off-chain balances updated successfully');

        // Add transfer to queue for on-chain settlement
        const transfer: Transfer = {
            to,
            amount,
            nonce,
            signature
        };

        // Use token-specific queue
        const queueKey = getTransferQueueKey(token);
        await kv.lpush(queueKey, JSON.stringify(transfer));
        console.log('Transfer added to settlement queue:', { from, to, token, queueKey });

        // Check queue length for this specific token
        const queueLength = await kv.llen(queueKey);
        console.log('Current queue status:', { token, queueLength, batchSize: getBatchSize(token) });

        // If we've hit batch size for this token, process its batch
        if (queueLength >= getBatchSize(token)) {
            console.log('Batch size reached for token, processing batch...', { token });
            await processBatch(contract, token);
        }

        // Get updated balances for response
        const newFromBalance = await getBlazeBalance(contract, from);
        const newToBalance = await getBlazeBalance(contract, to);

        return res.status(200).json({
            success: true,
            queued: true,
            queueLength,
            contract,
            token,
            balances: {
                from: newFromBalance,
                to: newToBalance
            }
        });

    } catch (error) {
        console.error('Transfer error:', {
            error: error instanceof Error ? error.message : error,
            stack: error instanceof Error ? error.stack : undefined,
            timestamp: new Date().toISOString()
        });
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function processBatch(contract: string, token: string) {
    console.log('Starting batch processing', { token });
    const [contractAddress, contractName] = contract.split('.');

    const queueKey = getTransferQueueKey(token);
    // Get BATCH_SIZE transfers from token-specific queue
    const transfers = await kv.lrange(queueKey, 0, getBatchSize(token) - 1);
    console.log('Retrieved transfers from queue:', {
        count: transfers?.length || 0,
        firstTransfer: transfers?.[0] ? JSON.parse(transfers[0]) : null
    });

    if (!transfers || transfers.length === 0) {
        console.log('No transfers to process');
        return;
    }

    // Parse transfers and convert to Clarity values
    console.log('Converting transfers to Clarity values');
    const operations = transfers.map((transfer, index) => {
        const { to, amount, nonce, signature } = JSON.parse(transfer) as Transfer;
        console.log(`Converting transfer ${index + 1}/${transfers.length}:`, {
            contractAddress,
            contractName,
            to,
            amount,
            nonce,
            signaturePrefix: `${signature.slice(0, 10)}...`
        });
        return Cl.tuple({
            to: Cl.principal(to),
            amount: Cl.uint(amount),
            nonce: Cl.uint(nonce),
            signature: Cl.bufferFromHex(signature.replace('0x', ''))
        });
    });

    // Prepare contract call
    const txOptions = {
        contractAddress,
        contractName,
        functionName: 'batch-transfer',
        functionArgs: [Cl.list(operations)],
        senderKey: process.env.PRIVATE_KEY!,
        network,
        fee: 1500
    };

    console.log('Prepared contract call:', {
        contractAddress,
        contractName,
        function: 'batch-transfer',
        operationCount: operations.length,
    });

    try {
        // Make and broadcast the transaction
        console.log('Making contract call...');
        const transaction = await makeContractCall(txOptions);

        console.log('Broadcasting transaction...');
        const response: any = await broadcastTransaction({
            transaction,
            network,
        });

        if (response.error) {
            console.error('Broadcast error:', response.error);
            throw new Error(`Broadcast error: ${response.error}`);
        }

        console.log('Transaction broadcast successful:', {
            txid: response.txid,
            status: response.status
        });

        // Remove processed transfers from queue
        console.log('Removing processed transfers from queue');
        await kv.ltrim(queueKey, getBatchSize(token), -1);

        console.log('Batch processed successfully:', {
            txid: response.txid,
            processedCount: transfers.length
        });
    } catch (error) {
        console.error('Batch processing error:', {
            error: error instanceof Error ? error.message : error,
            stack: error instanceof Error ? error.stack : undefined,
            timestamp: new Date().toISOString()
        });
        throw error;
    }
}

async function processTokenQueues() {
    // Get all queue keys
    const keys = await kv.keys('blaze:transfer:queue:*');

    for (const queueKey of keys) {
        const token = queueKey.split(':').pop()!;
        const queueLength = await kv.llen(queueKey);

        // Process if we have at least the minimum batch size
        if (queueLength >= MINIMUM_BATCH_SIZE) {
            const contract = getBlazeContractForToken(token);
            await processBatch(contract, token);
        }
    }
}