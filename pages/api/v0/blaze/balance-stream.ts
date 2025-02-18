import { kv } from '@vercel/kv';
import { NextRequest } from 'next/server';

export const config = {
    runtime: 'edge'
};

// shorten wallet address helper
function shortenAddress(address: string): string {
    return address.slice(0, 6) + '...' + address.slice(-4);
}

interface BalanceUpdate {
    contract: string;
    address: string;
    balance: number;
    timestamp: number;
}

function getBalanceKey(contract: string, user: string, type: 'confirmed' | 'unconfirmed'): string {
    return `${contract}:${user}:${type}`;
}

async function getCurrentBalance(subnet: string, userAddress: string): Promise<number> {
    const [confirmedBalance, unconfirmedBalance] = await Promise.all([
        kv.get<number>(getBalanceKey(subnet, userAddress, 'confirmed')),
        kv.get<number>(getBalanceKey(subnet, userAddress, 'unconfirmed'))
    ]);

    return (confirmedBalance || 0) + (unconfirmedBalance || 0);
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
    let lastBalance: number | null = null;
    let messageCount = 0;
    let isConnectionClosed = false;

    try {
        const stream = new ReadableStream({
            async start(controller) {
                // Send initial balances for the user
                try {
                    // Get initial balance
                    const total = await getCurrentBalance(subnet, userAddress);
                    lastBalance = total;

                    console.log(`[SSE] Initial balance for ${shortenAddress(userAddress)} on ${subnet}: ${total}`);

                    const update: BalanceUpdate = {
                        contract: subnet,
                        address: userAddress,
                        balance: total,
                        timestamp: Date.now()
                    };

                    const data = `data: ${JSON.stringify(update)}\n\n`;
                    controller.enqueue(encoder.encode(data));
                    messageCount++;
                } catch (error) {
                    console.error('[SSE] Error sending initial balance:', error);
                }

                const checkForUpdates = async () => {
                    if (isConnectionClosed) return;

                    try {
                        // Get current balance
                        const currentBalance = await getCurrentBalance(subnet, userAddress);

                        // Only send update if balance has changed
                        if (lastBalance !== currentBalance) {
                            const update: BalanceUpdate = {
                                contract: subnet,
                                address: userAddress,
                                balance: currentBalance,
                                timestamp: Date.now()
                            };

                            const data = `data: ${JSON.stringify(update)}\n\n`;
                            controller.enqueue(encoder.encode(data));
                            messageCount++;
                            lastBalance = currentBalance;

                            // Log balance change
                            console.log(`[SSE] Balance changed for ${shortenAddress(userAddress)} on ${subnet}: ${currentBalance}`);
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