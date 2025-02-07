import { createEventHandler } from '@lib/stackflow/chainhooks/authorizer';
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
    const apply = req.body.apply[0];

    if (!apply || !Array.isArray(apply)) {
        console.error('Invalid payload structure');
        return res.status(400).json({ message: 'Invalid payload structure' });
    }

    try {
        for (const block of apply) {
            const transactions = block.transactions || [];
            for (const tx of transactions) {
                const events = tx.metadata?.receipt?.events || [];
                for (const event of events) {
                    if (
                        event.type === 'SmartContractEvent'
                    ) {
                        const {
                            'channel-key': {
                                'principal-1': principal1,
                                'principal-2': principal2,
                            },
                        } = event.data.value;

                        // Skip if not involving owner
                        if (principal1 !== CONFIG.OWNER && principal2 !== CONFIG.OWNER) {
                            console.info('Ignoring event not involving owner');
                            continue;
                        }

                        console.log('Chainhooks Event:', event.data.value);
                        await handlers[event.data.value.event as keyof typeof handlers](event.data.value);
                        return res.status(200).json({ message: 'Event processed successfully' });
                    }
                }
            }
        }
    } catch (error) {
        console.error(`Error processing event:`, error);
        return res.status(500).json({ message: 'Error processing event' });
    }
}