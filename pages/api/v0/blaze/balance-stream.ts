import { kv } from '@vercel/kv';
import { NextRequest } from 'next/server';

export const config = {
    runtime: 'edge'
};

interface BalanceUpdate {
    contract: string;
    address: string;
    balance: number;
    timestamp: number;
}

export default async function handler(req: NextRequest) {
    const headers = {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
    };

    const encoder = new TextEncoder();
    let lastTimestamp = Date.now();

    try {
        const stream = new ReadableStream({
            async start(controller) {
                const checkForUpdates = async () => {
                    try {
                        // Get updates since last check using zrange with min/max scores
                        const rawUpdates = await kv.zrange(
                            'blaze-balance-updates',
                            lastTimestamp,
                            '+inf',
                            { byScore: true }
                        ) as string[];

                        if (rawUpdates && rawUpdates.length > 0) {
                            // Parse and send each update to the client
                            for (const rawUpdate of rawUpdates) {
                                const update = JSON.parse(rawUpdate) as BalanceUpdate;
                                const data = `data: ${JSON.stringify(update)}\n\n`;
                                controller.enqueue(encoder.encode(data));
                                lastTimestamp = Math.max(lastTimestamp, update.timestamp);
                            }
                        }

                        // Send heartbeat to keep connection alive
                        controller.enqueue(encoder.encode(': heartbeat\n\n'));
                    } catch (error) {
                        console.error('Error checking for updates:', error);
                    }
                };

                // Initial check
                await checkForUpdates();

                // Set up polling interval (every 1 second)
                const interval = setInterval(checkForUpdates, 1000);

                // Handle client disconnect
                req.signal.addEventListener('abort', () => {
                    clearInterval(interval);
                    controller.close();
                });
            },
        });

        return new Response(stream, { headers });
    } catch (error) {
        console.error('SSE Error:', error);
        return new Response('Error establishing SSE connection', { status: 500 });
    }
} 