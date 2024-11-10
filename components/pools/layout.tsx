import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  ChartBarIcon,
  LineChartIcon,
  Users2Icon,
  CoinsIcon,
  ArrowRightLeftIcon,
  LayersIcon
} from 'lucide-react';
import { cn } from '@lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip';

const PoolTooltip = ({ icon: Icon, title, subtitle, description }: any) => (
  <div className="flex gap-3 p-0.5">
    <div className="mt-1">
      <div className="p-2 rounded-md">
        <Icon className="w-5 h-5" />
      </div>
    </div>
    <div className="my-2 mb-4 mr-2 space-y-1">
      <h3 className="font-medium leading-none">{title}</h3>
      <p className="text-xs text-primary">{subtitle}</p>
      <p className="text-sm leading-snug text-muted-foreground">{description}</p>
    </div>
  </div>
);

export default function PoolsLayout({ children }: any) {
  const router = useRouter();
  const currentPath = router.pathname;

  return (
    <div className="flex flex-col w-full max-w-[2400px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="my-2 mt-4 sm:px-4">
        <h1 className="mb-3 text-3xl font-bold tracking-tight">Liquidity Pools</h1>
        <p className="text-lg text-muted-foreground/90">
          View and manage liquidity pools on the Charisma DEX
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="w-full mb-0 sm:px-4">
        <div className="relative z-50 grid grid-cols-3 max-w-xl gap-2 p-1 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-lg">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative flex items-center justify-center gap-2 px-4 py-2 rounded-md cursor-not-allowed opacity-60">
                  <Users2Icon className="w-4 h-4" />
                  <span>Community Pools</span>
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-primary text-primary-foreground text-[10px] font-medium rounded-full">
                    Soon
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="w-[400px] m-2">
                <PoolTooltip
                  icon={CoinsIcon}
                  title="Community Pools"
                  subtitle="Zero Protocol Fees"
                  description="These pools have zero protocol fees and utilize 100% of the swap fees to compensate LP providers, maximizing returns for liquidity providers."
                />
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/pools/spot"
                  className={cn(
                    'relative flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-all',
                    'hover:bg-accent/50 hover:text-accent-foreground',
                    currentPath === '/pools/spot'
                      ? 'bg-accent/90 text-accent-foreground shadow-sm'
                      : 'text-muted-foreground'
                  )}
                >
                  <ChartBarIcon className="w-4 h-4" />
                  <span>Spot Pools</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="w-[400px] m-2">
                <PoolTooltip
                  icon={ArrowRightLeftIcon}
                  title="Spot Pools"
                  subtitle="Community Managed"
                  description="These are pools created, managed and funded by the Charisma community, with protocol fees contributing to the development and expansion of the platform."
                />
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/pools/derivatives"
                  className={cn(
                    'relative flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-all',
                    'hover:bg-accent/50 hover:text-accent-foreground',
                    currentPath === '/pools/derivatives'
                      ? 'bg-accent/90 text-accent-foreground shadow-sm'
                      : 'text-muted-foreground'
                  )}
                >
                  <LineChartIcon className="w-4 h-4" />
                  <span>Derivative Pools</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="w-[400px] m-2">
                <PoolTooltip
                  icon={LayersIcon}
                  title="Derivative Pools"
                  subtitle="Multi-Asset Exposure"
                  description="These pools feature LP tokens as swappable liquidity which enables traders to get exposure to multiple assets with a single token."
                />
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative">{children}</div>
    </div>
  );
}
