import { NextRequest } from 'next/server';
import { kv } from '@vercel/kv';
import { getUserNotificationKey, getUserNotifications } from '@lib/blaze/notifications';

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

        const key = getUserNotificationKey(address);

        // Get current notifications
        const notifications = await getUserNotifications(address);

        // Filter out the notifications to be deleted
        const remainingNotifications = notifications.filter(n => !notificationIds.includes(n.id));

        // Clear the existing sorted set
        await kv.del(key);

        // If there are remaining notifications, add them back
        if (remainingNotifications.length > 0) {
            const pipeline = kv.pipeline();

            for (const notification of remainingNotifications) {
                pipeline.zadd(key, {
                    score: notification.timestamp,
                    member: JSON.stringify(notification)
                });
            }

            await pipeline.exec();
        }

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('[Notifications] Error deleting notifications:', error);
        return new Response('Error deleting notifications', { status: 500 });
    }
} 