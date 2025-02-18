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

    // Set up SSE connection for real-time notifications
    useEffect(() => {
        if (!address) return;

        let eventSource: EventSource;
        const connect = () => {
            eventSource = new EventSource(`/api/v0/blaze/notifications/stream?address=${address}`);

            eventSource.onmessage = (event) => {
                try {
                    // Handle heartbeat
                    if (event.data.trim() === 'heartbeat') return;

                    const notification = event.data as TransferNotification;

                    // Add new notification to state
                    setNotifications(prev => {
                        // Check if we already have this notification
                        if (prev.some(n => n.id === notification.id)) return prev;

                        // Show toast for new notification
                        toast({
                            title: 'New Transfer',
                            description: `${notification.from.slice(0, 6)}...${notification.from.slice(-4)} → ${notification.to.slice(0, 6)}...${notification.to.slice(-4)}: ${notification.amount.toLocaleString()} tokens`,
                            duration: 5000
                        });

                        // Add new notification at the beginning
                        return [notification, ...prev];
                    });
                } catch (error) {
                    console.error('Error processing notification:', error);
                }
            };

            eventSource.onerror = () => {
                eventSource.close();
                setTimeout(connect, 5000); // Reconnect after 5 seconds
            };
        };

        connect();
        fetchNotifications();

        return () => {
            if (eventSource) {
                eventSource.close();
            }
        };
    }, [address, fetchNotifications, toast]);

    return {
        notifications,
        isLoading,
        markAsRead,
        refetch: fetchNotifications
    };
} 