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
  Timer
} from 'lucide-react';
import { Input } from '@components/ui/input';
import { Button } from '@components/ui/button';
import { Card } from '@components/ui/card';
import { toast } from 'sonner';
import { cn } from '@lib/utils';
import PricesService from '@lib/server/prices/prices-service';
import { GetStaticProps } from 'next';

interface Props {
  data: {
    prices: Record<string, number>;
    pools: any[];
    lastUpdate: string;
  };
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  // Get all prices
  // const prices = await PricesService.getAllTokenPrices();

  // Get pools data
  // const pools = PricesService.pools;

  return {
    props: {
      data: {
        prices: {},
        pools: [],
        lastUpdate: new Date().toISOString()
      }
    },
    // Revalidate every minute
    revalidate: 60
  };
};

export default function PricesDebugPage({ data }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const lastUpdateDate = new Date(data.lastUpdate);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      // Use Next.js revalidation
      await fetch('/api/revalidate?path=/debug/prices');
      // Refresh the page to get new data
      window.location.reload();
    } catch (error) {
      toast.error('Failed to refresh prices');
      console.error(error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Helper function moved to component to work with static data
  const getUnderlyingTokens = (symbol: string, tokens: any[], pools: any[]): any[] => {
    const token = tokens.find(t => t.symbol === symbol);
    if (!token || !token.isLpToken || !token.poolId) {
      return token ? [token] : [];
    }

    const pool = pools.find(p => p.id === token.poolId);
    if (!pool) return [token];

    return [
      ...getUnderlyingTokens(pool.token0.symbol, tokens, pools),
      ...getUnderlyingTokens(pool.token1.symbol, tokens, pools)
    ];
  };

  const filteredTokens = Object.entries(data.prices).filter(([symbol]) =>
    symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTokenDetails = (symbol: string) => {
    const price = data.prices[symbol];

    return { token: { isLpToken: false }, price, underlyingTokens: [] };
  };

  return (
    <div className="container p-6 mx-auto max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Price Service Debugger</h1>
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
            {isRefreshing ? 'Refreshing...' : 'Refresh Prices'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Token List */}
        <Card className="p-4 lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <Search className="size-4 text-muted-foreground" />
            <Input
              placeholder="Search tokens..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredTokens.map(([symbol, price]) => {
              const { token } = getTokenDetails(symbol);
              return (
                <div
                  key={symbol}
                  className={cn(
                    'p-3 rounded-lg cursor-pointer hover:bg-accent-foreground border border-[var(--accents-7)]',
                    'flex flex-col items-center justify-between',
                    selectedToken === symbol && 'bg-[var(--accents-7)]'
                  )}
                  onClick={() => setSelectedToken(symbol)}
                >
                  <div className="flex items-center self-start justify-start gap-2">
                    {token.isLpToken ? (
                      <Layers className="text-purple-500 size-4" />
                    ) : (
                      <Coins className="text-blue-500 size-4" />
                    )}
                    <span>{symbol}</span>
                  </div>
                  <span className="self-end font-mono">${price.toFixed(6)}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
