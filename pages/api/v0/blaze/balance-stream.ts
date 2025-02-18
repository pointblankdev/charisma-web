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

function getBalanceKey(contract: string, user: string, type: 'confirmed' | 'unconfirmed'): string {
    return `${contract}:${user}:${type}`;
}

export default async function handler(req: NextRequest) {
    // Get user address and subnet from query parameters
    const url = new URL(req.url);
    const userAddress = url.searchParams.get('address');
    const subnet = url.searchParams.get('subnet') || 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.blaze-welsh-v0';

    if (!userAddress) {
        return new Response('Missing address parameter', { status: 400 });
    }

    // Log connection attempt
    console.log(`[SSE] New connection from ${userAddress} for subnet ${subnet} (${req.headers.get('user-agent')})`);

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
                // Send initial balances for the user
                try {
                    // Get confirmed and unconfirmed balances
                    const [confirmedBalance, unconfirmedBalance] = await Promise.all([
                        kv.get<number>(getBalanceKey(subnet, userAddress, 'confirmed')),
                        kv.get<number>(getBalanceKey(subnet, userAddress, 'unconfirmed'))
                    ]);

                    const total = (confirmedBalance || 0) + (unconfirmedBalance || 0);
                    console.log(`[SSE] Balance for ${userAddress} on ${subnet}: ${total} (confirmed: ${confirmedBalance || 0}, unconfirmed: ${unconfirmedBalance || 0})`);

                    const update: BalanceUpdate = {
                        contract: subnet,
                        address: userAddress,
                        balance: total,
                        timestamp: Date.now()
                    };

                    const data = `data: ${JSON.stringify(update)}\n\n`;
                    controller.enqueue(encoder.encode(data));
                    messageCount++;

                    console.log(`[SSE] Sent initial balance for ${userAddress} on ${subnet}: ${total}`);
                } catch (error) {
                    console.error('[SSE] Error sending initial balance:', error);
                }

                const checkForUpdates = async () => {
                    if (isConnectionClosed) return;

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
                                if (isConnectionClosed) break;

                                try {
                                    const update = JSON.parse(rawUpdate) as BalanceUpdate;

                                    // Only send updates for the connected user and specific subnet
                                    if (update.address === userAddress && update.contract === subnet) {
                                        const data = `data: ${JSON.stringify(update)}\n\n`;
                                        controller.enqueue(encoder.encode(data));
                                        lastTimestamp = Math.max(lastTimestamp, update.timestamp);
                                        messageCount++;

                                        // Log each update
                                        console.log(`[SSE] Sent update #${messageCount} to ${userAddress} for ${subnet}: balance=${update.balance}`);
                                    }
                                } catch (parseError) {
                                    console.error('[SSE] Error parsing update:', parseError);
                                }
                            }
                        }

                        // Send heartbeat to keep connection alive
                        if (!isConnectionClosed) {
                            controller.enqueue(encoder.encode("data:  heartbeat\n\n"));
                        }
                    } catch (error) {
                        console.error('[SSE] Error checking for updates:', error);
                        // Don't close the connection on transient errors
                        if (!isConnectionClosed && error instanceof Error && error.message.includes('Controller is already closed')) {
                            isConnectionClosed = true;
                        }
                    }
                };

                // Initial check
                await checkForUpdates();
                console.log('[SSE] Initial check completed');

                // Set up polling interval (every 1 second)
                const interval = setInterval(async () => {
                    if (!isConnectionClosed) {
                        await checkForUpdates();
                    } else {
                        clearInterval(interval);
                    }
                }, 1000);

                // Handle client disconnect
                req.signal.addEventListener('abort', () => {
                    isConnectionClosed = true;
                    clearInterval(interval);
                    console.log(`[SSE] Client ${userAddress} disconnected after ${messageCount} messages`);
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