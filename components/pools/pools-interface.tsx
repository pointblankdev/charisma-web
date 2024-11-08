import Image from 'next/image';
import { useState } from 'react';
import { ArrowUpDown, Minus, Plus, RefreshCw, ShoppingCart } from 'lucide-react';
import numeral from 'numeral';
import { Button } from '@components/ui/button';
import Link from 'next/link';
import { Dialog } from '@components/ui/dialog';
import LiquidityDialog from './add-liquidity';
import QuickBuyDialog from './quick-buy-dialog';
import RebalanceDialog from './rebalance-dialog';
import { PoolInfo } from 'pages/pools/spot';

type Props = {
  data: {
    pools: PoolInfo[];
    tokenPrices: { [key: string]: number };
  };
  title: string;
};

export const PoolsInterface = ({ data, title = 'Liquidity Pools' }: Props) => {
  const [sortBy, setSortBy] = useState<'tvl' | 'priceAlignment'>('tvl');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedPool, setSelectedPool] = useState<PoolInfo | null>(null);
  const [isAddLiquidity, setIsAddLiquidity] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRebalanceDialogOpen, setIsRebalanceDialogOpen] = useState(false);
  const [selectedPoolForRebalance, setSelectedPoolForRebalance] = useState<PoolInfo | null>(null);
  const [isQuickBuyDialogOpen, setIsQuickBuyDialogOpen] = useState(false);
  const [selectedPoolForQuickBuy, setSelectedPoolForQuickBuy] = useState<PoolInfo | null>(null);

  const calculatePriceAlignment = (pool: PoolInfo) => {
    if (pool.token0.symbol === 'STX' && pool.token1.symbol === 'CHA') {
      return 100; // STX-CHA pool is always 100% aligned
    }

    if (pool.token0.isLpToken || pool.token1.isLpToken) {
      return null; // Skip LP tokens
    }

    if (!pool.token0.price || !pool.token1.price) {
      return null; // Skip pools with missing prices
    }

    if (pool.token0.symbol === 'CHA' || pool.token1.symbol === 'CHA') {
      const otherToken = pool.token0.symbol === 'CHA' ? pool.token1 : pool.token0;
      const chaReserve = pool.token0.symbol === 'CHA' ? pool.reserves.token0 : pool.reserves.token1;
      const otherReserve =
        pool.token0.symbol === 'CHA' ? pool.reserves.token1 : pool.reserves.token0;
      const poolChaPrice = (otherToken.price * otherReserve) / chaReserve;
      return (poolChaPrice / data.tokenPrices['CHA']) * 100;
    }

    // For WELSH-iouWELSH and ROO-iouROO pools
    if (
      (pool.token0.symbol === 'WELSH' && pool.token1.symbol === 'iouWELSH') ||
      (pool.token0.symbol === '$ROO' && pool.token1.symbol === 'iouROO')
    ) {
      const priceRatio = pool.reserves.token0 / pool.reserves.token1;
      return priceRatio * 100;
    }

    return null;
  };

  const getAlignmentColor = (alignment: number) => {
    const hue = Math.max(0, Math.min(120, 120 * (1 - Math.abs(alignment - 100) / 15)));
    return `hsl(${hue}, 100%, 40%, 90%)`;
  };

  const sortedPools = [...data.pools].sort((a, b) => {
    if (sortBy === 'priceAlignment') {
      const alignmentA = calculatePriceAlignment(a) || 0;
      const alignmentB = calculatePriceAlignment(b) || 0;
      return sortOrder === 'asc' ? alignmentA - alignmentB : alignmentB - alignmentA;
    }
    return sortOrder === 'asc' ? a.tvl - b.tvl : b.tvl - a.tvl;
  });

  const totalTVL = data.pools.reduce((sum, pool) => sum + Number(pool.tvl), 0);

  const handleSort = (newSortBy: 'tvl' | 'priceAlignment') => {
    if (newSortBy === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  const handleLiquidityAction = (pool: PoolInfo, isAdd: boolean) => {
    setSelectedPool(pool);
    setIsAddLiquidity(isAdd);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedPool(null);
  };

  const handleRebalance = (pool: PoolInfo) => {
    setSelectedPoolForRebalance(pool);
    setIsRebalanceDialogOpen(true);
  };

  const handleCloseRebalanceDialog = () => {
    setIsRebalanceDialogOpen(false);
    setSelectedPoolForRebalance(null);
  };

  const handleQuickBuy = (pool: PoolInfo) => {
    setSelectedPoolForQuickBuy(pool);
    setIsQuickBuyDialogOpen(true);
  };

  const handleCloseQuickBuyDialog = () => {
    setIsQuickBuyDialogOpen(false);
    setSelectedPoolForQuickBuy(null);
  };

  const isStxChaPool = (pool: PoolInfo) => {
    return pool.token0.symbol === 'STX' && pool.token1.symbol === 'CHA';
  };

  const needsRebalance = (pool: PoolInfo, alignment: number | null) => {
    if (isStxChaPool(pool) || pool.token0.isLpToken || pool.token1.isLpToken) {
      return false;
    }
    return alignment !== null && Math.abs(alignment - 100) > 1; // 1% threshold
  };

  return (
    <div className="sm:mx-auto sm:px-4">
      <div className="mt-6">
        <div className="relative sm:px-6 pb-4 pt-5 sm:rounded-lg bg-[var(--sidebar)] border border-[var(--accents-7)] overflow-hidden">
          <div className="flex items-center justify-between px-4 mb-4 sm:px-0">
            <h1 className="text-2xl font-bold text-white/95">{title}</h1>
            <span className="px-3 text-lg font-light text-white border rounded-full border-primary bg-accent-foreground">
              ${numeral(totalTVL).format('0,0.00')}
            </span>
          </div>

          <div className="px-4 overflow-x-auto sm:px-0">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400">
                  <th className="py-2">Definition</th>
                  <th className="py-2">Composition</th>
                  <th className="py-2">Reserves</th>
                  <th className="py-2 cursor-pointer" onClick={() => handleSort('tvl')}>
                    TVL {sortBy === 'tvl' && <ArrowUpDown className="inline ml-1" size={16} />}
                  </th>
                  <th
                    className="items-center hidden py-2 cursor-pointer sm:flex"
                    onClick={() => handleSort('priceAlignment')}
                  >
                    Price Alignment{' '}
                    {sortBy === 'priceAlignment' && (
                      <ArrowUpDown className="inline ml-1" size={16} />
                    )}
                  </th>
                  <th className="py-2 sr-only">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedPools.map(pool => {
                  const priceAlignment = calculatePriceAlignment(pool);
                  const poolNeedsRebalance = needsRebalance(pool, priceAlignment);
                  const isStxCha = isStxChaPool(pool);

                  const PriceAlignment = ({ pool }: any) => {
                    const alignment = calculatePriceAlignment(pool);
                    if (alignment !== null) {
                      const color = getAlignmentColor(alignment);
                      return (
                        <span style={{ color }}>
                          <div className="leading-none">{alignment.toPrecision(4)}%</div>
                        </span>
                      );
                    }
                    return <>-</>;
                  };

                  return (
                    <tr key={pool.id} className="border-t border-gray-700/50">
                      <td className="py-4 text-left text-white min-w-36 sm:min-w-48">
                        <div className="flex items-center mr-4">
                          <Image
                            src={pool.image}
                            alt={pool.symbol}
                            width={240}
                            height={240}
                            className="w-6 mr-2 rounded-full"
                          />
                          <div className="leading-tight">
                            <div className="text-white">{pool.name}</div>
                            {/* <div className="text-muted-foreground">
                              {pool.symbol}
                            </div> */}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 min-w-60">
                        <div className="flex items-center">
                          <Image
                            src={pool.token0.image}
                            alt={pool.token0.symbol}
                            width={240}
                            height={240}
                            className="w-6 mr-2 rounded-full"
                          />
                          <Image
                            src={pool.token1.image}
                            alt={pool.token1.symbol}
                            width={240}
                            height={240}
                            className="w-6 mr-2 rounded-full"
                          />
                          <div className="leading-none">
                            <div className="text-white">
                              {pool.token0.symbol}-{pool.token1.symbol}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-white min-w-48">
                        {numeral(pool.reserves.token0).format('0,0')} {pool.token0.symbol}
                        <br />
                        {numeral(pool.reserves.token1).format('0,0')} {pool.token1.symbol}
                      </td>
                      <td className="py-4 text-white min-w-24">
                        ${numeral(pool.tvl).format('0,0.00')}
                      </td>
                      <td className="py-4 text-center text-white min-w-24 sm:min-w-36">
                        <PriceAlignment pool={pool} />
                      </td>
                      <td className="py-4 min-w-64">
                        <div className="flex justify-between space-x-6">
                          <div className="flex rounded-md">
                            <span className="px-4 py-1 text-sm font-medium leading-7 border border-r-0 rounded-l-md border-gray-700/80 bg-background">
                              Liquidity
                            </span>
                            <button
                              type="button"
                              className="relative inline-flex items-center px-2 py-2 text-sm font-medium border bg-background hover:bg-accent/90 hover:text-accent-foreground border-gray-700/80 focus:z-10 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accentring-accent"
                              onClick={() => handleLiquidityAction(pool, true)}
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              className="relative inline-flex items-center px-2 py-2 -ml-px text-sm font-medium border bg-background hover:bg-accent/90 hover:text-accent-foreground border-gray-700/80 rounded-r-md focus:z-10 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accentring-accent"
                              onClick={() => handleLiquidityAction(pool, false)}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                          </div>
                          {poolNeedsRebalance && (
                            <Button size="sm" onClick={() => handleRebalance(pool)}>
                              <RefreshCw className="w-4 h-4 mr-1" /> Rebalance
                            </Button>
                          )}
                          {isStxCha && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleQuickBuy(pool)}
                              className="whitespace-nowrap"
                            >
                              <ShoppingCart className="w-4 h-4 mr-1" /> Quick Buy
                            </Button>
                          )}

                          <Link href={`/pools/${pool.id}`} passHref>
                            <Button variant="link" className="whitespace-nowrap">
                              View Chart
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <LiquidityDialog pool={selectedPool} isAdd={isAddLiquidity} onClose={handleCloseDialog} />
      </Dialog>

      <Dialog open={isRebalanceDialogOpen} onOpenChange={setIsRebalanceDialogOpen}>
        <RebalanceDialog
          pool={selectedPoolForRebalance}
          referenceChaPrice={data.tokenPrices['CHA']}
          onClose={handleCloseRebalanceDialog}
        />
      </Dialog>

      <Dialog open={isQuickBuyDialogOpen} onOpenChange={setIsQuickBuyDialogOpen}>
        <QuickBuyDialog pool={selectedPoolForQuickBuy} onClose={handleCloseQuickBuyDialog} />
      </Dialog>
    </div>
  );
};
