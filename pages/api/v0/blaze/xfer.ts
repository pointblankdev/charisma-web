// pages/api/transfer.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { kv } from '@vercel/kv';
import { makeContractCall, broadcastTransaction, Cl, ClarityValue } from '@stacks/transactions';
import { CONFIG } from '@lib/stackflow/config';
import { verifyBlazeSignature } from '@lib/blaze/helpers';
import { network } from '@components/stacks-session/connect';

const BATCH_SIZE = 200;
const TRANSFER_QUEUE_KEY = 'blaze:transfer:queue';

type Transfer = {
    to: string;
    amount: string;
    nonce: number;
    signature: string;
};

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
            amount,
            to,
            nonce,
        } = req.body;

        console.log('Processing transfer:', {
            from,
            to,
            amount,
            nonce,
            signature: signature.slice(0, 10) + '...'
        });

        // Verify signature matches the message structure
        const isValid = await verifyBlazeSignature(signature, from, to, amount, nonce);
        console.log('Signature verification:', { isValid, from });

        if (!isValid) {
            console.warn('Invalid signature for transfer:', { from, to, nonce });
            return res.status(401).json({ error: 'Invalid signature' });
        }

        // Update off-chain balances immediately
        const pipeline = kv.pipeline();
        const fromBalance = await kv.get<string>(`balance:${from}`) || '0';
        const toBalance = await kv.get<string>(`balance:${to}`) || '0';

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

        pipeline.set(`balance:${from}`, (BigInt(fromBalance) - BigInt(amount)).toString());
        pipeline.set(`balance:${to}`, (BigInt(toBalance) + BigInt(amount)).toString());
        await pipeline.exec();

        console.log('Off-chain balances updated successfully');

        // Add transfer to queue for on-chain settlement
        const transfer: Transfer = {
            to,
            amount,
            nonce,
            signature
        };

        await kv.lpush(TRANSFER_QUEUE_KEY, JSON.stringify(transfer));
        console.log('Transfer added to settlement queue:', { from, to, queueKey: TRANSFER_QUEUE_KEY });

        // Check queue length
        const queueLength = await kv.llen(TRANSFER_QUEUE_KEY);
        console.log('Current queue status:', { queueLength, batchSize: BATCH_SIZE });

        // If we've hit batch size, process the batch
        if (queueLength >= BATCH_SIZE) {
            console.log('Batch size reached, processing batch...');
            await processBatch();
        }

        // Get updated balances for response
        const newFromBalance = await kv.get<string>(`balance:${from}`);
        const newToBalance = await kv.get<string>(`balance:${to}`);

        return res.status(200).json({
            success: true,
            queued: true,
            queueLength,
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

async function processBatch() {
    console.log('Starting batch processing');

    // Get BATCH_SIZE transfers from queue
    const transfers = await kv.lrange(TRANSFER_QUEUE_KEY, 0, BATCH_SIZE - 1);
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
            to,
            amount,
            nonce,
            signaturePrefix: signature.slice(0, 10) + '...'
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
        contractAddress: CONFIG.CONTRACT_ADDRESS!,
        contractName: CONFIG.CONTRACT_NAME!,
        functionName: 'batch-transfer',
        functionArgs: [Cl.list(operations)],
        senderKey: CONFIG.PRIVATE_KEY!,
        network: network,
        fee: 1500
    };

    console.log('Prepared contract call:', {
        contract: `${CONFIG.CONTRACT_ADDRESS}.${CONFIG.CONTRACT_NAME}`,
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
            network: network,
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
        await kv.ltrim(TRANSFER_QUEUE_KEY, BATCH_SIZE, -1);

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