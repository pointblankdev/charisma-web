import type { NextApiRequest, NextApiResponse } from 'next';
import { verifySecret } from '@lib/blaze/auth';
import { processDepositEvent, processWithdrawEvent, processTransferEvent } from 'blaze-sdk';

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

                        const contract = event.data.contract_identifier;
                        const eventData = event.data.value;

                        try {
                            switch (eventData.event) {
                                case 'deposit':
                                    await processDepositEvent(contract, eventData.user, eventData.amount);
                                    break;
                                case 'withdraw':
                                    await processWithdrawEvent(contract, eventData.user, eventData.amount);
                                    break;
                                case 'transfer':
                                    if (!eventData.from || !eventData.to) {
                                        throw new Error('Missing from/to in transfer event');
                                    }
                                    await processTransferEvent(contract, eventData.from, eventData.to, eventData.amount);
                                    break;
                                default:
                                    console.warn({
                                        requestId,
                                        message: 'Unknown event type',
                                        eventType: eventData.event
                                    });
                            }
                        } catch (error) {
                            console.error({
                                requestId,
                                message: 'Error processing event',
                                event: eventData,
                                error
                            });
                            // Continue processing other events even if one fails
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