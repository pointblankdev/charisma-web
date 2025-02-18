import { Bell } from 'lucide-react';
import { cn } from '@lib/utils';
import { useEffect, useState } from 'react';
import { TransferNotification } from '@lib/blaze/notifications';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';

interface NotificationBellProps {
    notifications: TransferNotification[];
    onClick: () => void;
}

// Dynamically import the Bell icon to prevent SSR
const DynamicBell = dynamic(() => Promise.resolve(Bell), {
    ssr: false,
    loading: () => (
        <div className="w-5 h-5" /> // Placeholder while loading
    ),
});

export function NotificationBell({ notifications, onClick }: NotificationBellProps) {
    const [mounted, setMounted] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const unreadCount = notifications.filter(n => !n.read).length;

    // Only start animations after component is mounted
    useEffect(() => {
        setMounted(true);
    }, []);

    // Animate bell when new notifications arrive
    useEffect(() => {
        if (mounted && unreadCount > 0) {
            setIsAnimating(true);
            const timeout = setTimeout(() => setIsAnimating(false), 1000);
            return () => clearTimeout(timeout);
        }
    }, [unreadCount, mounted]);

    if (notifications.length === 0) {
        return null;
    }

    return (
        <button
            onClick={onClick}
            className={cn(
                "relative inline-flex items-center justify-center w-10 h-10 rounded-full",
                "hover:bg-accent transition-colors duration-200",
                "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
            )}
        >
            <div className="relative w-5 h-5">
                {mounted ? (
                    <motion.div
                        animate={isAnimating ? {
                            rotate: [0, -10, 10, -10, 10, 0],
                            transition: { duration: 0.5 }
                        } : {}}
                    >
                        <DynamicBell className="w-5 h-5" />
                    </motion.div>
                ) : (
                    <div className="w-5 h-5" /> // Static placeholder during SSR
                )}
            </div>
            <AnimatePresence>
                {mounted && unreadCount > 0 && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className={cn(
                            "absolute -top-1 -right-1 w-5 h-5",
                            "flex items-center justify-center rounded-full",
                            "bg-red-500 text-white text-xs font-medium"
                        )}
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.div>
                )}
            </AnimatePresence>
        </button>
    );
} 