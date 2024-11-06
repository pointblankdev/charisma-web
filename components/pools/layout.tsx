import { useRouter } from 'next/router';
import Link from 'next/link';
import { ChartBarIcon, LineChartIcon } from 'lucide-react';
import { cn } from '@lib/utils';

export default function PoolsLayout({ children }: any) {
    const router = useRouter();
    const currentPath = router.pathname;

    return (
        <div className="flex flex-col w-full max-w-[2400px] mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="my-2 mt-4 sm:px-4">
                <h1 className="text-3xl font-bold tracking-tight mb-3">
                    Liquidity Pools
                </h1>
                <p className="text-muted-foreground/90 text-lg">
                    View and manage liquidity pools on the Charisma DEX
                </p>
            </div>

            {/* Tabs Navigation */}
            <div className="w-full mb-0 sm:px-4">
                <div className="grid grid-cols-2 max-w-md gap-2 p-1 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-lg">
                    <Link
                        href="/pools/spot"
                        className={cn(
                            "relative flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-all",
                            "hover:bg-accent/50 hover:text-accent-foreground",
                            currentPath === '/pools/spot' ?
                                "bg-accent/90 text-accent-foreground shadow-sm" :
                                "text-muted-foreground"
                        )}
                    >
                        <ChartBarIcon className="w-4 h-4" />
                        <span>Spot Pools</span>
                    </Link>
                    <Link
                        href="/pools/derivatives"
                        className={cn(
                            "relative flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-all",
                            "hover:bg-accent/50 hover:text-accent-foreground",
                            currentPath === '/pools/derivatives' ?
                                "bg-accent/90 text-accent-foreground shadow-sm" :
                                "text-muted-foreground"
                        )}
                    >
                        <LineChartIcon className="w-4 h-4" />
                        <span>Derivative Pools</span>
                    </Link>
                </div>
            </div>

            {/* Content Section */}
            {/* <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
                className="w-full sm:mx-auto sm:px-4"
            >
                <div className="w-full px-6 py-4 mb-6 rounded-lg border bg-card flex flex-wrap gap-6 justify-center sm:justify-start items-center">
                    <div className="text-center sm:text-left">
                        <div className="text-sm text-muted-foreground">Total Pools</div>
                        <div className="text-xl font-semibold">14</div>
                    </div>
                    <div className="text-center sm:text-left">
                        <div className="text-sm text-muted-foreground">Total TVL</div>
                        <div className="text-xl font-semibold">$1.2M</div>
                    </div>
                    <div className="text-center sm:text-left">
                        <div className="text-sm text-muted-foreground">Active Users</div>
                        <div className="text-xl font-semibold">342</div>
                    </div>
                </div>
            </motion.div> */}

            {/* Main Content */}
            <div className="relative">
                {children}
            </div>
        </div>
    );
}