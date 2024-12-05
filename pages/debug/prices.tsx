import { useEffect, useState } from 'react';
import {
  Coins,
  RefreshCcw,
  Search,
  Info,
  ChevronRight,
  ArrowRight,
  Layers,
  DollarSign,
  Timer,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  ArrowDownUp
} from 'lucide-react';
import { Input } from '@components/ui/input';
import { Button } from '@components/ui/button';
import { Card } from '@components/ui/card';
import { Badge } from '@components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip';
import { toast } from 'sonner';
import { cn } from '@lib/utils';
import PricesService from '@lib/server/prices/prices-service';
import { GetStaticProps } from 'next';

interface TokenData {
  contractAddress: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: number;
}

interface Pool {
  poolId: number;
  lpToken: string;
  reserve0: string;
  reserve1: string;
  reserve0ConvertUsd: string;
  reserve1ConvertUsd: string;
  token0Price: string;
  token1Price: string;
  symbol: string;
  token0: string;
  token1: string;
  source: string;
  lastUpdated: string;
  token0Info: TokenData;
  token1Info: TokenData;
}

interface Props {
  data: {
    prices: Record<string, number>;
    pools: Pool[];
    lastUpdate: string;
  };
}

const service = PricesService.getInstance();

export const getStaticProps: GetStaticProps<Props> = async () => {
  const [prices, pools] = await Promise.all([service.getAllTokenPrices(), service.getAllPools()]);

  return {
    props: {
      data: {
        prices,
        pools,
        lastUpdate: new Date().toISOString()
      }
    },
    revalidate: 60
  };
};

const formatNumber = (num: number | string) => {
  const value = typeof num === 'string' ? parseFloat(num) : num;
  if (value >= 1e9) return (value / 1e9).toFixed(2) + 'B';
  if (value >= 1e6) return (value / 1e6).toFixed(2) + 'M';
  if (value >= 1e3) return (value / 1e3).toFixed(2) + 'K';
  return value.toFixed(2);
};

const formatPrice = (price: number | string) => {
  const value = typeof price === 'string' ? parseFloat(price) : price;
  if (value >= 100) return value.toFixed(2);
  if (value >= 1) return value.toFixed(4);
  return value.toFixed(6);
};

const getSourceColor = (source: string): string => {
  const colors: { [key: string]: string } = {
    charisma: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    velar: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
  };
  return (
    colors[source.toLowerCase()] ||
    'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
  );
};

export default function PricesDebugPage({ data }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'tokens' | 'pools'>('tokens');
  const lastUpdateDate = new Date(data.lastUpdate);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await fetch('/api/revalidate?path=/debug/prices');
      window.location.reload();
    } catch (error) {
      toast.error('Failed to refresh prices');
      console.error(error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const isStale = (date: string) => {
    return new Date().getTime() - new Date(date).getTime() > 5 * 60 * 1000;
  };

  const filteredData =
    viewMode === 'tokens'
      ? Object.entries(data.prices)
          .filter(([token]) => token.toLowerCase().includes(searchTerm.toLowerCase()))
          .sort((a, b) => b[1] - a[1])
      : data.pools.filter(
          pool =>
            pool.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pool.token0Info.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pool.token1Info.symbol.toLowerCase().includes(searchTerm.toLowerCase())
        );

  return (
    <TooltipProvider>
      <div className="container p-6 mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Price Service Debugger</h1>
            <div className="flex overflow-hidden border rounded-lg">
              <Button
                variant={viewMode === 'tokens' ? 'default' : 'ghost'}
                onClick={() => setViewMode('tokens')}
                className="rounded-none"
              >
                <Coins className="mr-2 size-4" />
                Tokens
              </Button>
              <Button
                variant={viewMode === 'pools' ? 'default' : 'ghost'}
                onClick={() => setViewMode('pools')}
                className="rounded-none"
              >
                <Layers className="mr-2 size-4" />
                Pools
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Timer className="size-4" />
              Last update: {lastUpdateDate.toLocaleTimeString()}
            </div>
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
              className="gap-2"
            >
              <RefreshCcw className={cn('size-4', isRefreshing && 'animate-spin')} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Search className="size-4 text-muted-foreground" />
          <Input
            placeholder={viewMode === 'tokens' ? 'Search tokens...' : 'Search pools...'}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {viewMode === 'tokens' ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {(filteredData as [string, number][]).map(([token, price]) => {
              const pool = data.pools.find(p => p.token0 === token || p.token1 === token);
              const tokenInfo = pool?.token0 === token ? pool.token0Info : pool?.token1Info;

              return (
                <Card
                  key={token}
                  className={cn(
                    'p-4 hover:shadow-md transition-shadow cursor-pointer',
                    selectedToken === token && 'ring-2 ring-primary'
                  )}
                  onClick={() => setSelectedToken(token)}
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Coins className="text-blue-500 size-4" />
                        <div className="font-medium truncate" title={token}>
                          {tokenInfo?.symbol || token.split('.').pop()}
                        </div>
                      </div>
                      {pool && (
                        <Tooltip>
                          <TooltipTrigger>
                            <Layers className="text-purple-500 size-4" />
                          </TooltipTrigger>
                          <TooltipContent>Available in pools</TooltipContent>
                        </Tooltip>
                      )}
                    </div>

                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-2xl font-bold">${formatPrice(price)}</span>
                    </div>

                    {tokenInfo && (
                      <div className="text-xs text-muted-foreground">
                        <div className="truncate" title={tokenInfo.name}>
                          {tokenInfo.name}
                        </div>
                        <div>Decimals: {tokenInfo.decimals}</div>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(filteredData as Pool[]).map(pool => (
              <Card key={pool.poolId} className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-medium">{pool.symbol}</h3>
                      <Badge className={getSourceColor(pool.source)}>{pool.source}</Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <DollarSign className="text-green-500 size-4" />
                      <span className="text-xl font-bold">
                        $
                        {formatNumber(
                          parseFloat(pool.reserve0ConvertUsd) + parseFloat(pool.reserve1ConvertUsd)
                        )}
                      </span>
                    </div>
                  </div>
                  {isStale(pool.lastUpdated) && (
                    <Tooltip>
                      <TooltipTrigger>
                        <AlertCircle className="text-yellow-500 size-5" />
                      </TooltipTrigger>
                      <TooltipContent>Data may be stale</TooltipContent>
                    </Tooltip>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 rounded bg-accent-foreground/50">
                    <div>
                      <div className="font-medium">{pool.token0Info.symbol}</div>
                      <div className="text-sm text-muted-foreground">
                        ${formatNumber(pool.reserve0ConvertUsd)} ({formatNumber(pool.reserve0)}{' '}
                        tokens)
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">1 {pool.token0Info.symbol} =</div>
                      <div className="text-sm text-muted-foreground">
                        {formatPrice(pool.token0Price)} {pool.token1Info.symbol}
                      </div>
                    </div>
                  </div>

                  <ArrowDownUp className="mx-auto size-4 text-muted-foreground" />

                  <div className="flex items-center justify-between p-2 rounded bg-accent-foreground/50">
                    <div>
                      <div className="font-medium">{pool.token1Info.symbol}</div>
                      <div className="text-sm text-muted-foreground">
                        ${formatNumber(pool.reserve1ConvertUsd)} ({formatNumber(pool.reserve1)}{' '}
                        tokens)
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">1 {pool.token1Info.symbol} =</div>
                      <div className="text-sm text-muted-foreground">
                        {formatPrice(pool.token1Price)} {pool.token0Info.symbol}
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-muted-foreground">
                    Pool ID: {pool.poolId} • Last Updated:{' '}
                    {new Date(pool.lastUpdated).toLocaleString()}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
