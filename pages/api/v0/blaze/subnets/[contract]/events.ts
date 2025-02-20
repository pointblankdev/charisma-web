import { NextApiRequest, NextApiResponse } from 'next';
import { Subnet, BlazeEvent } from 'blaze-sdk';
import { addTransferNotification, TransferNotification, NotificationType, NotificationStatus } from '@lib/blaze/notifications';



function createTransferNotification(eventWithTimestamp: BlazeEvent) {
    const notification: TransferNotification = {
        id: eventWithTimestamp.data.txid!,
        type: eventWithTimestamp.type as NotificationType,
        from: eventWithTimestamp.data.from!,
        to: eventWithTimestamp.data.to!,
        amount: eventWithTimestamp.data.amount!,
        contract: eventWithTimestamp.contract,
        timestamp: eventWithTimestamp.data.timestamp,
        status: eventWithTimestamp.data.status as NotificationStatus
    };
    addTransferNotification(notification);
}

// Debug logging utility
const debug = (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
        console.log(`[Blaze SSE] ${message}`, ...args);
    }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { contract, signer } = req.query;
    if (!contract || !signer) {
        return res.status(400).json({ error: 'Missing contract or signer parameter' });
    }

    debug('New connection request', { contract, signer });

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable buffering for Nginx

    // Initialize subnet
    let subnetInstance: Subnet;
    try {
        subnetInstance = new Subnet(contract as string, process.env.STACKS_ORACLE_ADDRESS!);
        debug('Subnet instance initialized');
    } catch (error) {
        console.error('[SSE] Error initializing subnet:', error);
        return res.status(500).json({ error: 'Failed to initialize subnet' });
    }

    // Track connection state
    let isConnectionClosed = false;
    let heartbeatCount = 0;

    // Setup heartbeat (every 5 seconds)
    const heartbeatInterval = setInterval(() => {
        if (!isConnectionClosed) {
            heartbeatCount++;
            res.write('data: heartbeat\n\n');
            debug(`Heartbeat sent #${heartbeatCount}`);
        }
    }, 5000);

    // Setup event handler
    const eventHandler = (event: BlazeEvent) => {
        if (!isConnectionClosed) {
            try {
                const eventWithTimestamp = {
                    ...event,
                    timestamp: Date.now()
                };
                res.write(`data: ${JSON.stringify(eventWithTimestamp)}\n\n`);
                debug('Event sent:', eventWithTimestamp);

                if (eventWithTimestamp.type === 'transfer') {
                    createTransferNotification(eventWithTimestamp);
                }


                // TODO: Add notifications for other event types



            } catch (error) {
                console.error('[SSE] Error sending event:', error);
            }
        }
    };

    try {
        // Subscribe to events
        await subnetInstance.addEventClient(signer as string, eventHandler);
        debug(`Client ${signer} subscribed to subnet ${contract} events`);

        // Send initial state
        const status = await subnetInstance.getStatus();
        if (status) {
            debug('Sending initial status:', status);
            eventHandler({
                type: 'status',
                data: status
            } as any);
        }

        // Cleanup on client disconnect
        res.on('close', () => {
            isConnectionClosed = true;
            clearInterval(heartbeatInterval);
            debug(`Connection closed after ${heartbeatCount} heartbeats`);

            // Remove event listener
            try {
                subnetInstance.removeEventClient(signer as string, eventHandler);
                debug(`Client ${signer} disconnected from subnet ${contract} events`);
            } catch (error: unknown) {
                console.error('[SSE] Error removing event client:', error);
            }
        });

        // Keep the connection alive
        return new Promise<void>(() => {
            debug('SSE connection established and waiting for events');
            // This promise intentionally never resolves, keeping the connection open
            // It will be cleaned up when the client disconnects
        });
    } catch (error) {
        console.error('[SSE] Error setting up event stream:', error);
        isConnectionClosed = true;
        clearInterval(heartbeatInterval);
        return res.status(500).json({ error: 'Failed to setup event stream' });
    }
}

export const config = {
    api: {
        bodyParser: false,
    },
}; 