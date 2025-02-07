import { verifySecret } from '@lib/stackflow/auth';
import { EVENTS } from '@lib/stackflow/chainhooks/event-handlers';
import { processEvent } from './event-handlers';
import { NextApiRequest, NextApiResponse } from 'next';

export function createEventHandler(
    eventType: keyof typeof EVENTS,
    handler: (data: any) => Promise<void>
) {
    return async function (req: NextApiRequest, res: NextApiResponse) {
        if (!verifySecret(req.headers)) {
            return res.status(403).json({ error: 'Forbidden: Invalid authorization' });
        }

        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        try {
            const body = req.body;
            await processEvent(eventType, handler, body.apply);
            return res.status(200).json({ message: 'Event processed successfully' });
        } catch (error) {
            console.error(`Error processing ${eventType} event:`, error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}