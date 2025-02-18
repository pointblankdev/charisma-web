// pages/api/transfer.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Subnet, Transfer } from 'blaze-sdk';

const contract = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.blaze-test-2';
const subnet = new Subnet(contract);

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
            signature: `${signature.slice(0, 10)}...`
        });

        const transferMessage: Transfer = { to, amount, nonce, signature, signer: from };

        // Verify signature
        const isValid = await subnet.verifySignature(transferMessage);
        if (!isValid) {
            console.warn('Invalid signature for transfer:', { from, to, nonce });
            return res.status(401).json({ error: 'Invalid signature' });
        }

        console.log('Signature verified!');

        // Get and verify balances
        const fromBalance = await subnet.getBalance(from);

        if (fromBalance.total < amount) {
            console.warn('Insufficient balance:', { from, amount, balance: fromBalance });
            return res.status(400).json({ error: 'Insufficient balance' });
        }

        console.log('Balances verified!');

        // Add transfer to queue
        await subnet.addTransferToQueue(transferMessage);

        // Check queue length and process if queue is longer than 10
        const status = subnet.getStatus();
        console.log('Queue length:', status);

        // Process transfers if queue is longer than 5
        let processResult = null;
        if (status.queueSizes[contract] >= 2) {
            processResult = await subnet.processTransfers();
            console.log('Process transfers result:', processResult);
        }

        return res.status(200).json({
            success: true,
            queued: true,
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