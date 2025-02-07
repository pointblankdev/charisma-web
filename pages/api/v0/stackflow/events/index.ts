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
import { NextApiRequest, NextApiResponse } from 'next';

const handlers = {
    'fund-channel': createEventHandler('FUND_CHANNEL', handleFundChannel),
    'close-channel': createEventHandler('CLOSE_CHANNEL', handleCloseChannel),
    'force-cancel': createEventHandler('FORCE_CANCEL', handleForceCancel),
    'force-close': createEventHandler('FORCE_CLOSE', handleForceClose),
    'finalize': createEventHandler('FINALIZE', handleFinalize),
    'deposit': createEventHandler('DEPOSIT', handleDeposit),
    'withdraw': createEventHandler('WITHDRAW', handleWithdraw),
    'dispute-closure': createEventHandler('DISPUTE_CLOSURE', handleDisputeClosure),
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    for (const transaction of req.body.apply[0].transactions) {
        for (const event of transaction.metadata.receipt.events) {
            if (event.type === 'SmartContractEvent') {
                console.log('Event:', event.data.value);
            }
        }
    }

    return res.status(200).json({ message: 'Event processed successfully' });
    // return handlers[event as keyof typeof handlers](req, res);
}