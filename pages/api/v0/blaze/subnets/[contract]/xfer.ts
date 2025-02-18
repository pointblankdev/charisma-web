// pages/api/transfer.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Subnet, Transfer } from 'blaze-sdk';

const contract = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.blaze-welsh-v0';
const subnet = new Subnet(contract);

// Configuration for transfer processing
const CONFIG = {
    // Batch processing rules
    batch: {
        enabled: true,
        minSize: 20, // Minimum transfers to trigger batch processing
        maxSize: 200, // Maximum batch size (from contract)
        maxWaitTime: 5 * 60 * 1000, // Maximum time to wait before processing batch (5 minutes)
    },
    // Immediate processing rules
    immediate: {
        // Process immediately if amount is above this threshold
        amountThreshold: 10 ** 6,
        // List of addresses that should always be processed immediately
        priorityAddresses: [
            // 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
            'FAKE_ADDRESS',
            // Add other priority addresses
        ],
        // Process immediately during these hours (UTC)
        quietHours: {
            start: 0, // 12 AM UTC
            end: 4,   // 4 AM UTC
        }
    }
} as const;

// Track the last batch processing time
let lastBatchProcessTime = Date.now();

function shouldProcessImmediately(transfer: Transfer): boolean {
    // Check amount threshold
    if (transfer.amount >= CONFIG.immediate.amountThreshold) {
        console.log('Processing immediately due to high amount:', transfer.amount);
        return true;
    }

    // Check priority addresses
    if (CONFIG.immediate.priorityAddresses.includes(transfer.signer as any) ||
        CONFIG.immediate.priorityAddresses.includes(transfer.to as any)) {
        console.log('Processing immediately due to priority address');
        return true;
    }

    // Check quiet hours
    const currentHour = new Date().getUTCHours();
    if (currentHour >= CONFIG.immediate.quietHours.start &&
        currentHour < CONFIG.immediate.quietHours.end) {
        console.log('Processing immediately during quiet hours');
        return true;
    }

    return false;
}

function shouldProcessBatch(queueSize: number): boolean {
    if (!CONFIG.batch.enabled) return false;

    // Check if queue is big enough
    if (queueSize >= CONFIG.batch.minSize) {
        console.log('Processing batch due to queue size:', queueSize);
        return true;
    }

    // Check if we've waited too long since last batch
    const timeSinceLastBatch = Date.now() - lastBatchProcessTime;
    if (timeSinceLastBatch >= CONFIG.batch.maxWaitTime && queueSize > 0) {
        console.log('Processing batch due to wait time:', timeSinceLastBatch);
        return true;
    }

    return false;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        console.warn('Invalid method:', req.method);
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const transferMessage: Transfer = req.body;
        console.log('Processing transfer:', {
            ...transferMessage,
            signature: `${transferMessage.signature.slice(0, 10)}...`
        });

        // Verify signature
        const isValid = await subnet.verifySignature(transferMessage);
        if (!isValid) {
            console.warn('Invalid signature for transfer:', transferMessage.signer);
            return res.status(401).json({ error: 'Invalid signature' });
        }

        console.log('Signature verified!');

        // Get and verify balances
        const fromBalance = await subnet.getBalance(transferMessage.signer);
        if (fromBalance.total < transferMessage.amount) {
            console.warn('Insufficient balance:', {
                signer: transferMessage.signer,
                amount: transferMessage.amount,
                balance: fromBalance
            });
            return res.status(400).json({ error: 'Insufficient balance' });
        }

        console.log('Balances verified!');

        let processResult = null;

        // Check if we should process this transfer immediately
        if (shouldProcessImmediately(transferMessage)) {
            processResult = await subnet.executeTransfer(transferMessage);
            return res.status(200).json({
                success: true,
                queued: false,
                immediate: true,
                processResult
            });
        }

        // Add transfer to queue
        await subnet.addTransferToQueue(transferMessage);

        // Get current queue status
        const status = subnet.getStatus();
        const queueSize = status.queueSizes[contract];
        console.log('Queue size:', queueSize);

        // Check if we should process the batch
        if (shouldProcessBatch(queueSize || 0)) {
            processResult = await subnet.processTransfers();
            lastBatchProcessTime = Date.now();
            console.log('Batch process result:', processResult);
        }

        return res.status(200).json({
            success: true,
            queued: true,
            batched: processResult !== null,
            queueSize,
            processResult
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