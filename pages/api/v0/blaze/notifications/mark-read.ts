import { NextRequest } from 'next/server';
import { markNotificationsAsRead } from '@lib/blaze/notifications';

export const config = {
    runtime: 'edge'
};

export default async function handler(req: NextRequest) {
    if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    try {
        const body = await req.json();
        const { address, notificationIds } = body;

        if (!address || !notificationIds || !Array.isArray(notificationIds)) {
            return new Response('Invalid request body', { status: 400 });
        }

        await markNotificationsAsRead(address, notificationIds);

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('[Notifications] Error marking notifications as read:', error);
        return new Response('Error marking notifications as read', { status: 500 });
    }
} 