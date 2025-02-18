import { kv } from '@vercel/kv';

export type NotificationType = 'transfer' | 'deposit' | 'withdraw';
export type NotificationStatus = 'processing' | 'confirmed' | 'completed';

export interface TransferNotification {
    id: string;           // Unique identifier for the notification
    type: NotificationType; // Type of transaction
    from: string;         // Sender address
    to: string;          // Recipient address
    amount: number;       // Transfer amount
    contract: string;     // Subnet contract
    timestamp: number;    // When the transfer occurred
    status: NotificationStatus;  // Transaction status
    txId?: string;       // Optional transaction ID
    read?: boolean;      // Whether the notification has been read
    description?: string; // Optional description for context
}

const GLOBAL_TRANSFER_LIMIT = 100;  // Keep last 100 global transfers
const USER_NOTIFICATION_LIMIT = 50;  // Keep last 50 notifications per user

/**
 * Get the notification key for a specific user
 */
export function getUserNotificationKey(address: string): string {
    return `blaze:notifications:${address}`;
}

/**
 * Add a new transfer notification
 */
export async function addTransferNotification(notification: TransferNotification): Promise<void> {
    console.log('[Notifications] Adding new notification:', {
        id: notification.id,
        type: notification.type,
        from: notification.from,
        to: notification.to,
        amount: notification.amount,
        status: notification.status,
        timestamp: new Date(notification.timestamp).toISOString()
    });

    const pipeline = kv.pipeline();
    const notificationJson = JSON.stringify(notification);

    // Add to global transfer history
    pipeline.zadd('blaze:transfers', {
        score: notification.timestamp,
        member: notificationJson
    });

    // Add to sender's notifications if not a system transfer
    if (notification.from !== 'system') {
        const senderKey = getUserNotificationKey(notification.from);
        console.log('[Notifications] Adding to sender notifications:', {
            key: senderKey,
            notification: notificationJson
        });
        pipeline.zadd(senderKey, {
            score: notification.timestamp,
            member: notificationJson
        });
    }

    // Add to recipient's notifications
    const recipientKey = getUserNotificationKey(notification.to);
    console.log('[Notifications] Adding to recipient notifications:', {
        key: recipientKey,
        notification: notificationJson
    });
    pipeline.zadd(recipientKey, {
        score: notification.timestamp,
        member: notificationJson
    });

    // Execute pipeline and prune
    try {
        await pipeline.exec();
        console.log('[Notifications] Successfully added notification to KV store');
        await pruneNotifications(notification.from, notification.to);
    } catch (error) {
        console.error('[Notifications] Error adding notification:', error);
        throw error;
    }
}

/**
 * Prune old notifications to maintain storage limits
 */
async function pruneNotifications(...addresses: string[]): Promise<void> {
    console.log('[Notifications] Pruning notifications for addresses:', addresses);
    const pipeline = kv.pipeline();

    // Prune global transfers
    pipeline.zremrangebyrank('blaze:transfers', 0, -(GLOBAL_TRANSFER_LIMIT + 1));

    // Prune user-specific notifications
    for (const address of addresses) {
        if (address && address !== 'system') {
            const key = getUserNotificationKey(address);
            console.log('[Notifications] Pruning user notifications:', {
                key,
                limit: USER_NOTIFICATION_LIMIT
            });
            pipeline.zremrangebyrank(key, 0, -(USER_NOTIFICATION_LIMIT + 1));
        }
    }

    try {
        await pipeline.exec();
        console.log('[Notifications] Successfully pruned notifications');
    } catch (error) {
        console.error('[Notifications] Error pruning notifications:', error);
        throw error;
    }
}

/**
 * Get notifications for a user
 */
export async function getUserNotifications(
    address: string,
    limit: number = 20,
    offset: number = 0
): Promise<TransferNotification[]> {
    console.log('[Notifications] Fetching notifications:', {
        address,
        limit,
        offset
    });

    const key = getUserNotificationKey(address);
    console.log('[Notifications] Using key:', key);

    let notifications: string[];
    try {
        notifications = await kv.zrange(key, -limit - offset, -1 - offset) as string[];
        console.log('[Notifications] Raw notifications from KV:', notifications);
    } catch (error) {
        console.error('[Notifications] Error fetching from KV:', error);
        throw error;
    }

    if (!notifications || !Array.isArray(notifications)) {
        console.log('[Notifications] No notifications found or invalid response');
        return [];
    }

    // Filter out any invalid notifications
    const validNotifications = notifications.reduce((acc: TransferNotification[], n: string) => {
        try {
            console.log('[Notifications] Parsing notification:', n);
            const parsed = n as unknown as TransferNotification;

            // Validate required fields
            if (parsed.id && parsed.type && parsed.from && parsed.to &&
                typeof parsed.amount === 'number' && parsed.timestamp) {
                acc.push(parsed);
                console.log('[Notifications] Successfully parsed notification:', {
                    id: parsed.id,
                    type: parsed.type,
                    status: parsed.status
                });
            } else {
                console.warn('[Notifications] Invalid notification format:', parsed);
            }
        } catch (error) {
            console.error('[Notifications] Error parsing notification:', {
                error,
                notification: n
            });
        }
        return acc;
    }, []);

    console.log('[Notifications] Total valid notifications:', validNotifications.length);

    // Sort by timestamp
    const sortedNotifications = validNotifications.sort((a, b) => b.timestamp - a.timestamp);
    return sortedNotifications;
}

/**
 * Get global transfer history
 */
export async function getGlobalTransfers(
    limit: number = 20,
    offset: number = 0
): Promise<TransferNotification[]> {
    const transfers = await kv.zrange('blaze:transfers', -limit - offset, -1 - offset) as string[];

    return transfers
        .map(t => JSON.parse(t) as TransferNotification)
        .sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Mark notifications as read for a user
 */
export async function markNotificationsAsRead(
    address: string,
    notificationIds: string[]
): Promise<void> {
    const key = getUserNotificationKey(address);
    const notifications = await getUserNotifications(address, USER_NOTIFICATION_LIMIT);
    const pipeline = kv.pipeline();

    for (const notification of notifications) {
        if (notificationIds.includes(notification.id)) {
            notification.read = true;
            pipeline.zadd(key, {
                score: notification.timestamp,
                member: JSON.stringify(notification)
            });
        }
    }

    await pipeline.exec();
}

/**
 * Generate a unique notification ID
 */
export function generateNotificationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Add a new notification for deposit
 */
export async function addDepositNotification(params: {
    address: string;
    amount: number;
    contract: string;
    txId?: string;
}): Promise<void> {
    await addTransferNotification({
        id: generateNotificationId(),
        type: 'deposit',
        from: 'system',
        to: params.address,
        amount: params.amount,
        contract: params.contract,
        timestamp: Date.now(),
        status: params.txId ? 'completed' : 'processing',
        txId: params.txId,
        description: 'Deposit to Blaze Subnet'
    });
}

/**
 * Add a new notification for withdraw
 */
export async function addWithdrawNotification(params: {
    address: string;
    amount: number;
    contract: string;
    txId?: string;
}): Promise<void> {
    await addTransferNotification({
        id: generateNotificationId(),
        type: 'withdraw',
        from: params.address,
        to: 'system',
        amount: params.amount,
        contract: params.contract,
        timestamp: Date.now(),
        status: params.txId ? 'completed' : 'processing',
        txId: params.txId,
        description: 'Withdraw from Blaze Subnet'
    });
}

// Helper function to get status description
export function getStatusDescription(status: NotificationStatus): string {
    switch (status) {
        case 'processing':
            return 'Processing in Blaze Subnet';
        case 'confirmed':
            return 'Confirmed in Blaze Subnet';
        case 'completed':
            return 'Completed';
        default:
            return '';
    }
}

// Helper function to get type description
export function getTypeDescription(type: NotificationType, isReceiving: boolean): string {
    switch (type) {
        case 'transfer':
            return isReceiving ? 'Received Transfer' : 'Sent Transfer';
        case 'deposit':
            return 'Deposit to Blaze Subnet';
        case 'withdraw':
            return 'Withdraw from Blaze Subnet';
        default:
            return '';
    }
} 