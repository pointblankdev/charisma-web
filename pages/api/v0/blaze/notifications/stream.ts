import { NextRequest } from 'next/server';
import { kv } from '@vercel/kv';
import { getUserNotificationKey, TransferNotification } from '@lib/blaze/notifications';

export const config = {
    runtime: 'edge'
};

export default async function handler(req: NextRequest) {
    if (req.method !== 'GET') {
        return new Response('Method not allowed', { status: 405 });
    }

    const url = new URL(req.url);
    const address = url.searchParams.get('address');

    if (!address) {
        return new Response('Missing address parameter', { status: 400 });
    }

    // Log connection attempt
    console.log(`[SSE] New notification connection from ${address}`);

    const headers = {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
    };

    const encoder = new TextEncoder();
    let lastTimestamp = Date.now();
    let messageCount = 0;
    let isConnectionClosed = false;

    try {
        const stream = new ReadableStream({
            async start(controller) {
                const checkForNotifications = async () => {
                    if (isConnectionClosed) return;

                    try {
                        // Get new notifications since last check
                        const key = getUserNotificationKey(address);
                        const notifications = await kv.zrange(
                            key,
                            lastTimestamp,
                            '+inf',
                            { byScore: true }
                        ) as string[];

                        if (notifications && notifications.length > 0) {
                            for (const notificationJson of notifications) {
                                if (isConnectionClosed) break;

                                try {
                                    const notification = notificationJson as unknown as TransferNotification;

                                    // Only send if it's newer than our last check
                                    if (notification.timestamp > lastTimestamp) {
                                        // Ensure proper JSON stringification
                                        const data = `data: ${JSON.stringify(notification)}\n\n`;
                                        controller.enqueue(encoder.encode(data));
                                        lastTimestamp = Math.max(lastTimestamp, notification.timestamp);
                                        messageCount++;

                                        console.log(`[SSE] Sent notification #${messageCount} to ${address}`);
                                    }
                                } catch (parseError) {
                                    console.error('[SSE] Error parsing notification:', parseError);
                                }
                            }
                        }

                        // Send heartbeat to keep connection alive
                        if (!isConnectionClosed) {
                            controller.enqueue(encoder.encode("data:  heartbeat\n\n"));
                        }
                    } catch (error) {
                        console.error('[SSE] Error checking for notifications:', error);
                        if (!isConnectionClosed && error instanceof Error && error.message.includes('Controller is already closed')) {
                            isConnectionClosed = true;
                        }
                    }
                };

                // Set up polling interval (every 1 second)
                const interval = setInterval(async () => {
                    if (!isConnectionClosed) {
                        await checkForNotifications();
                    } else {
                        clearInterval(interval);
                    }
                }, 1000);

                // Handle client disconnect
                req.signal.addEventListener('abort', () => {
                    isConnectionClosed = true;
                    clearInterval(interval);
                    console.log(`[SSE] Client ${address} disconnected after ${messageCount} notifications`);
                    try {
                        controller.close();
                    } catch (error) {
                        console.error('[SSE] Error closing controller:', error);
                    }
                });
            },
        });

        return new Response(stream, { headers });
    } catch (error) {
        console.error('[SSE] Stream Error:', error);
        return new Response('Error establishing SSE connection', { status: 500 });
    }
} 