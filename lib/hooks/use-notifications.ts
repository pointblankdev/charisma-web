import { useEffect, useState, useCallback } from 'react';
import { TransferNotification } from '@lib/blaze/notifications';
import { useToast } from '@components/ui/use-toast';

export function useNotifications(address: string | undefined) {
    const [notifications, setNotifications] = useState<TransferNotification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    // Fetch initial notifications
    const fetchNotifications = useCallback(async () => {
        if (!address) return;
        try {
            const response = await fetch(`/api/v0/blaze/notifications?address=${address}`);
            if (!response.ok) throw new Error('Failed to fetch notifications');
            const data = await response.json();
            setNotifications(data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setIsLoading(false);
        }
    }, [address]);

    // Mark notifications as read
    const markAsRead = useCallback(async (notificationIds: string[]) => {
        if (!address || notificationIds.length === 0) return;
        try {
            const response = await fetch('/api/v0/blaze/notifications/mark-read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address, notificationIds })
            });
            if (!response.ok) throw new Error('Failed to mark notifications as read');

            // Update local state
            setNotifications(prev => prev.map(n =>
                notificationIds.includes(n.id) ? { ...n, read: true } : n
            ));
        } catch (error) {
            console.error('Error marking notifications as read:', error);
        }
    }, [address]);

    // Delete notifications
    const deleteNotifications = useCallback(async (notificationIds: string[]) => {
        if (!address || notificationIds.length === 0) return;
        try {
            const response = await fetch('/api/v0/blaze/notifications/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address, notificationIds })
            });
            if (!response.ok) throw new Error('Failed to delete notifications');

            // Update local state
            setNotifications(prev => prev.filter(n => !notificationIds.includes(n.id)));

            toast({
                title: 'Notifications Deleted',
                description: `Successfully deleted ${notificationIds.length} notification${notificationIds.length === 1 ? '' : 's'}`,
                duration: 3000
            });
        } catch (error) {
            console.error('Error deleting notifications:', error);
            toast({
                title: 'Error',
                description: 'Failed to delete notifications',
                duration: 3000
            });
        }
    }, [address, toast]);

    return {
        notifications,
        isLoading,
        markAsRead,
        deleteNotifications,
        refetch: fetchNotifications
    };
} 