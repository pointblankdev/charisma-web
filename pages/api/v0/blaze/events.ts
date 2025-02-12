import type { NextApiRequest, NextApiResponse } from 'next';
import { kv } from '@vercel/kv';
import { verifySecret } from '@lib/blaze/auth';

type EventData = {
    user: string;
    amount: string;
    nonce?: number;
    from?: string;
    to?: string;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const requestId = crypto.randomUUID();

    console.info({
        requestId,
        message: 'Received blaze chainhook event',
        method: req.method,
        url: req.url,
        headers: {
            'content-type': req.headers['content-type'],
            'content-length': req.headers['content-length'],
        }
    });

    if (!verifySecret(req.headers)) {
        console.error({
            requestId,
            message: 'Invalid authorization',
            headers: req.headers
        });
        return res.status(403).json({ error: 'Forbidden: Invalid authorization' });
    }

    if (req.method !== 'POST') {
        console.error({
            requestId,
            message: 'Invalid method',
            method: req.method
        });
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!req.body.apply || !Array.isArray(req.body.apply)) {
        console.error({
            requestId,
            message: 'Invalid payload structure',
            body: req.body
        });
        return res.status(400).json({ message: 'Invalid payload structure' });
    }

    try {
        for (const block of req.body.apply) {
            console.info({
                requestId,
                message: 'Processing block',
                transactionCount: block.transactions?.length || 0,
                block_identifier: block.block_identifier,
            });

            const transactions = block.transactions || [];
            for (const tx of transactions) {
                console.info({
                    requestId,
                    message: 'Processing transaction',
                    eventCount: tx.metadata?.receipt?.events?.length || 0,
                    transaction_identifier: tx.transaction_identifier,
                });

                for (const operation of tx.operations) {
                    console.info({
                        requestId,
                        message: 'Processing operation',
                        operation: operation,
                    });
                }

                const events = tx.metadata?.receipt?.events || [];
                for (const event of events) {
                    if (event.type === 'SmartContractEvent') {
                        console.info({
                            requestId,
                            message: 'Processing contract event',
                            data: event.data,
                            position: event.position,
                            type: event.type,
                        });

                        switch (event.data.value.event) {
                            case 'deposit':
                                await handleDeposit(event.data.value);
                                break;
                            case 'withdraw':
                                await handleWithdraw(event.data.value);
                                break;
                            case 'transfer':
                                await handleTransfer(event.data.value);
                                break;
                            default:
                                console.warn({
                                    requestId,
                                    message: 'Unknown event type',
                                    eventType: event.data.value.event
                                });
                        }
                    }
                }
            }
        }

        return res.status(200).json({
            message: 'Events processed successfully',
            requestId
        });
    } catch (error) {
        console.error({
            requestId,
            message: 'Error processing event',
            error: error instanceof Error ? {
                name: error.name,
                message: error.message,
                stack: error.stack
            } : error
        });
        return res.status(500).json({
            message: 'Error processing event',
            requestId
        });
    }
}

// TODO: ADD TOKEN/CONTRACT SUPPORT
// Currently, we don't know the token/contract for the event, so we can't store it properly.
// We should store the contract address in the balance key, and then use that to look up the token.

async function handleDeposit(data: EventData) {
    const { user, amount } = data;
    const currentBalance = await kv.get<string>(`balance:${user}`) || '0';

    // Update balance atomically
    await kv.set(`balance:${user}`, (BigInt(currentBalance) + BigInt(amount)).toString());
}

async function handleWithdraw(data: EventData) {
    const { user, amount } = data;
    const currentBalance = await kv.get<string>(`balance:${user}`) || '0';

    if (BigInt(currentBalance) < BigInt(amount)) {
        throw new Error('Insufficient balance');
    }

    // Update balance atomically
    await kv.set(`balance:${user}`, (BigInt(currentBalance) - BigInt(amount)).toString());
}

async function handleTransfer(data: EventData) {
    const { from, to, amount, nonce } = data;
    if (!from || !to || !nonce) throw new Error('Missing required fields');

    const fromBalance = await kv.get<string>(`balance:${from}`) || '0';
    const currentNonce = await kv.get<number>(`nonce:${from}`) || 0;

    // Verify nonce is greater than current
    if (nonce <= currentNonce) {
        throw new Error('Nonce too low');
    }

    // Verify sufficient balance
    if (BigInt(fromBalance) < BigInt(amount)) {
        throw new Error('Insufficient balance');
    }
}