// pages/api/transfer.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getBlazeContractForToken, verifyBlazeSignature } from '@lib/blaze/helpers';
import { BlazeTransferService, Transfer, BlazeBalanceService } from '@lib/blaze/node';
import { BlazeContractService } from '@lib/blaze/node';

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

        // Verify signature
        const isValid = await verifyBlazeSignature(contract, signature, from, to, amount, nonce);
        if (!isValid) {
            console.warn('Invalid signature for transfer:', { from, to, nonce });
            return res.status(401).json({ error: 'Invalid signature' });
        }

        console.log('Signature verified');

        // Get and verify balances
        const fromBalance = await BlazeBalanceService.getBalance(contract, from);
        const toBalance = await BlazeBalanceService.getBalance(contract, to);

        if (fromBalance < amount) {
            console.warn('Insufficient balance:', { from, amount, balance: fromBalance });
            return res.status(400).json({ error: 'Insufficient balance' });
        }

        console.log('Balances verified');

        // Update balances
        await BlazeBalanceService.updateBalances(contract, [
            { address: from, amount: fromBalance - amount },
            { address: to, amount: toBalance + amount }
        ]);

        // Add transfer to queue
        const transfer: Transfer = { to, amount, nonce, signature };
        await BlazeTransferService.addTransferToQueue(token, transfer);

        // Check queue length and process if needed
        const queueLength = await BlazeTransferService.getQueueLength(token);
        if (queueLength >= BlazeTransferService.getBatchSize(token)) {
            await processBatch(contract, token);
        }

        // Get updated balances for response
        const newFromBalance = await BlazeBalanceService.getBalance(contract, from);
        const newToBalance = await BlazeBalanceService.getBalance(contract, to);

        // increment nonce
        const newNonce = await BlazeBalanceService.incrementNonce(contract, from);

        return res.status(200).json({
            success: true,
            queued: true,
            queueLength,
            contract,
            token,
            nonce: newNonce,
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

    // Get BATCH_SIZE transfers from token-specific queue
    const transfers = await BlazeTransferService.getTransfersFromQueue(token);
    console.log('Retrieved transfers from queue:', {
        count: transfers?.length || 0,
        firstTransfer: transfers?.[0] ? transfers[0] : null
    });

    if (!transfers || transfers.length === 0) {
        console.log('No transfers to process');
        return;
    }

    try {
        // Execute batch transfer
        const result = await BlazeContractService.executeBatchTransfer(
            contractAddress,
            contractName,
            transfers
        );

        console.log('Transaction broadcast successful:', {
            txid: result.txid,
            status: result.status,
            processedCount: transfers.length
        });

        // Remove processed transfers from queue
        console.log('Removing processed transfers from queue');
        await BlazeTransferService.removeProcessedTransfers(token);

    } catch (error) {
        console.error('Batch processing error:', {
            error: error instanceof Error ? error.message : error,
            stack: error instanceof Error ? error.stack : undefined,
            timestamp: new Date().toISOString()
        });
        throw error;
    }
}