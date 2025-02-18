import { useGlobal } from '@lib/hooks/global-context';
import { useEffect, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { cn } from '@lib/utils';

export function SseStatus() {
    const { sseStatus, lastUpdateTime } = useGlobal();
    const [visible, setVisible] = useState(true);
    const [lastUpdate, setLastUpdate] = useState<string>('');

    useEffect(() => {
        if (!lastUpdateTime) return;

        const updateTimeDisplay = () => {
            const seconds = Math.floor((Date.now() - lastUpdateTime.getTime()) / 1000);
            if (seconds < 60) {
                setLastUpdate(`${seconds}s ago`);
            } else if (seconds < 3600) {
                setLastUpdate(`${Math.floor(seconds / 60)}m ago`);
            } else {
                setLastUpdate(lastUpdateTime.toLocaleTimeString());
            }
        };

        updateTimeDisplay();
        const interval = setInterval(updateTimeDisplay, 1000);

        return () => clearInterval(interval);
    }, [lastUpdateTime]);

    if (!visible) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <div className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium shadow-lg transition-colors",
                "backdrop-blur-md bg-background/80 border",
                {
                    'text-green-500 border-green-500/20': sseStatus === 'connected',
                    'text-yellow-500 border-yellow-500/20': sseStatus === 'connecting',
                    'text-red-500 border-red-500/20': sseStatus === 'disconnected',
                }
            )}>
                <div className="flex items-center gap-1.5">
                    {sseStatus === 'connected' ? (
                        <Wifi className="w-3.5 h-3.5" />
                    ) : (
                        <WifiOff className="w-3.5 h-3.5" />
                    )}
                    <span>
                        {sseStatus === 'connected' && 'Connected'}
                        {sseStatus === 'connecting' && 'Connecting...'}
                        {sseStatus === 'disconnected' && 'Disconnected'}
                    </span>
                </div>
                {lastUpdate && sseStatus === 'connected' && (
                    <>
                        <span className="text-muted-foreground/30">•</span>
                        <span className="text-muted-foreground">
                            Updated {lastUpdate}
                        </span>
                    </>
                )}
                <button
                    onClick={() => setVisible(false)}
                    className="ml-2 text-muted-foreground hover:text-foreground"
                >
                    ×
                </button>
            </div>
        </div>
    );
} 