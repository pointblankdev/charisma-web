import { verifySecret } from '@lib/stackflow/chainhooks/auth';
import {
    handleFundChannel,
    handleCloseChannel,
    handleForceCancel,
    handleForceClose,
    handleFinalize,
    handleDeposit,
    handleWithdraw,
    handleDisputeClosure
} from '@lib/stackflow/chainhooks/event-handlers';
import { CONFIG } from '@lib/stackflow/config';
import { NextApiRequest, NextApiResponse } from 'next';

const handlers = {
    'fund-channel': handleFundChannel,
    'close-channel': handleCloseChannel,
    'force-cancel': handleForceCancel,
    'force-close': handleForceClose,
    'finalize': handleFinalize,
    'deposit': handleDeposit,
    'withdraw': handleWithdraw,
    'dispute-closure': handleDisputeClosure,
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const requestId = crypto.randomUUID();

    console.info({
        requestId,
        message: 'Received chainhook event',
        method: req.method,
        url: req.url,
        headers: {
            'content-type': req.headers['content-type'],
            'content-length': req.headers['content-length'],
            'user-agent': req.headers['user-agent'],
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
                blockHeight: block.height,
                blockHash: block.hash,
                transactionCount: block.transactions?.length || 0
            });

            const transactions = block.transactions || [];
            for (const tx of transactions) {
                console.info({
                    requestId,
                    message: 'Processing transaction',
                    txId: tx.tx_id,
                    eventCount: tx.metadata?.receipt?.events?.length || 0
                });

                const events = tx.metadata?.receipt?.events || [];
                for (const event of events) {
                    if (event.type === 'SmartContractEvent') {
                        const {
                            'channel-key': {
                                'principal-1': principal1,
                                'principal-2': principal2,
                            },
                        } = event.data.value;

                        // Skip if not involving owner
                        if (principal1 !== CONFIG.OWNER && principal2 !== CONFIG.OWNER) {
                            console.info({
                                requestId,
                                message: 'Ignoring event not involving owner',
                                principal1,
                                principal2,
                                owner: CONFIG.OWNER
                            });
                            continue;
                        }

                        console.info({
                            requestId,
                            message: 'Processing contract event',
                            eventType: event.data.value.event,
                            principal1,
                            principal2,
                            contractId: event.contract_identifier,
                            data: event.data.value
                        });

                        await handlers[event.data.value.event as keyof typeof handlers](event.data.value);
                    }
                }

                console.info({
                    requestId,
                    message: 'Transaction processing complete',
                    txId: tx.tx_id
                });

                return res.status(200).json({
                    message: 'Events processed successfully',
                    requestId
                });
            }
        }
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