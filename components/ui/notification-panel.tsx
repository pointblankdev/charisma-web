import { TransferNotification, getStatusDescription, getTypeDescription } from '@lib/blaze/notifications';
import { cn } from '@lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Bell, Check, Clock, ExternalLink, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ScrollArea } from './scroll-area';

interface NotificationPanelProps {
    notifications: TransferNotification[];
    onMarkAsRead: (ids: string[]) => void;
    isOpen: boolean;
    onClose: () => void;
}

function shortenAddress(address: string): string {
    if (address === 'system') return 'Blaze Subnet';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatAmount(amount: number): string {
    return amount.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 6
    });
}

function formatTimeAgo(timestamp: number): string {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
}

function getNotificationIcon(type: string) {
    switch (type) {
        case 'deposit':
            return <ArrowDownToLine className="w-4 h-4 text-green-500" />;
        case 'withdraw':
            return <ArrowUpFromLine className="w-4 h-4 text-blue-500" />;
        default:
            return <ArrowRight className="w-4 h-4" />;
    }
}

function getStatusColor(status: string) {
    switch (status) {
        case 'processing':
            return 'text-yellow-500';
        case 'confirmed':
            return 'text-green-500';
        case 'completed':
            return 'text-green-600';
        default:
            return 'text-muted-foreground';
    }
}

function getStatusIcon(status: string) {
    switch (status) {
        case 'processing':
            return <Clock className="w-3 h-3 text-yellow-500 animate-pulse" />;
        case 'confirmed':
            return <Check className="w-3 h-3 text-green-500" />;
        case 'completed':
            return <Check className="w-3 h-3 text-green-600" />;
        default:
            return null;
    }
}

export function NotificationPanel({ notifications, onMarkAsRead, isOpen, onClose }: NotificationPanelProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const hasUnread = notifications.some(n => !n.read);

    // Auto mark notifications as read when panel is opened
    useEffect(() => {
        if (isOpen && hasUnread) {
            const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
            onMarkAsRead(unreadIds);
        }
    }, [isOpen, hasUnread, notifications, onMarkAsRead]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className={cn(
                            "fixed right-4 top-[4.5rem] z-50",
                            "w-[380px] rounded-lg border bg-card text-card-foreground shadow-lg"
                        )}
                    >
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="text-lg font-semibold">Notifications</h2>
                            {notifications.length > 0 && (
                                <button
                                    onClick={() => setSelectedIds(notifications.map(n => n.id))}
                                    className="text-xs text-muted-foreground hover:text-foreground"
                                >
                                    Select all
                                </button>
                            )}
                        </div>

                        <ScrollArea className="h-[400px] p-4">
                            {notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                                    <Bell className="w-12 h-12 text-muted-foreground/30" />
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        No notifications yet
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {notifications.map((notification) => (
                                        <motion.div
                                            key={notification.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className={cn(
                                                "p-3 rounded-lg border",
                                                "transition-colors duration-200",
                                                notification.read ? "bg-card" : "bg-accent/5",
                                                selectedIds.includes(notification.id) && "ring-2 ring-primary"
                                            )}
                                            onClick={() => {
                                                if (selectedIds.includes(notification.id)) {
                                                    setSelectedIds(selectedIds.filter(id => id !== notification.id));
                                                } else {
                                                    setSelectedIds([...selectedIds, notification.id]);
                                                }
                                            }}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-center gap-1.5">
                                                        {getNotificationIcon(notification.type)}
                                                        <span className="text-sm font-medium">
                                                            {getTypeDescription(notification.type, notification.to === notification.from)}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm">
                                                        <span className="font-medium">
                                                            {shortenAddress(notification.from)}
                                                        </span>
                                                        <ArrowRight className="inline-block w-4 h-4 mx-1" />
                                                        <span className="font-medium">
                                                            {shortenAddress(notification.to)}
                                                        </span>
                                                    </p>
                                                    <p className="text-sm font-medium">
                                                        {formatAmount(notification.amount)} tokens
                                                    </p>
                                                    <div className="flex items-center gap-2 text-xs">
                                                        <Clock className="w-3 h-3" />
                                                        {formatTimeAgo(notification.timestamp)}
                                                        <span>•</span>
                                                        {getStatusIcon(notification.status)}
                                                        <span className={getStatusColor(notification.status)}>
                                                            {getStatusDescription(notification.status)}
                                                        </span>
                                                    </div>
                                                </div>
                                                {notification.txId && (
                                                    <a
                                                        href={`https://explorer.hiro.so/txid/${notification.txId}?chain=mainnet`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={cn(
                                                            "p-1.5 rounded-md",
                                                            "text-muted-foreground hover:text-foreground",
                                                            "hover:bg-accent transition-colors duration-200"
                                                        )}
                                                        onClick={e => e.stopPropagation()}
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                    </a>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
} 