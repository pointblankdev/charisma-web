import { NextRequest } from 'next/server';
import { getUserNotifications } from '@lib/blaze/notifications';

export const config = {
    runtime: 'edge'
};

export default async function handler(req: NextRequest) {
    console.log('[Notifications API] Received request:', {
        method: req.method,
        url: req.url
    });

    if (req.method !== 'GET') {
        console.warn('[Notifications API] Invalid method:', req.method);
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const url = new URL(req.url);
    const address = url.searchParams.get('address');
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);

    console.log('[Notifications API] Request parameters:', {
        address,
        limit,
        offset
    });

    if (!address) {
        console.warn('[Notifications API] Missing address parameter');
        return new Response(JSON.stringify({ error: 'Missing address parameter' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        console.log('[Notifications API] Fetching notifications for address:', address);
        const notifications = await getUserNotifications(address, limit, offset);
        console.log('[Notifications API] Successfully fetched notifications:', {
            count: notifications.length,
            firstNotification: notifications[0] ? {
                id: notifications[0].id,
                type: notifications[0].type,
                status: notifications[0].status
            } : null
        });

        // Even if we get no notifications, return an empty array with 200 status
        return new Response(JSON.stringify(notifications), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-transform'
            }
        });
    } catch (error) {
        console.error('[Notifications API] Error fetching notifications:', {
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : error,
            address
        });

        return new Response(JSON.stringify({
            error: 'Error fetching notifications',
            details: error instanceof Error ? error.message : 'Unknown error'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
} 