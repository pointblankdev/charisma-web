import { useMemo, useState } from 'react';
import { ArrowUpDown } from 'lucide-react';
import LiquidityDialog from './liquidity-modal.tsx/add-liquidity';
import {
  type Pool,
  calculateTotalTVL,
  calculatePoolTVL,
  formatUSD,
  PoolDefinition,
  PoolComposition,
  PoolReserves,
  PoolActions,
  DialogContainer,
  PoolFees
} from './pool-helpers';
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover';
import { Button } from '@components/ui/button';
import { Checkbox } from '@components/ui/checkbox';
import { cn } from '@lib/utils';
import _ from 'lodash';
import Image from 'next/image';
import Link from 'next/link';
import numeral from 'numeral';

type Props = {
  data: {
    pools: Pool[];
    tokenPrices: { [key: string]: number };
  };
  title: string;
};

export const PoolsInterface = ({ data, title = 'Liquidity Pools' }: Props) => {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  const [isAddLiquidity, setIsAddLiquidity] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<any | null>(null);

  const totalTVL = calculateTotalTVL(data.pools, data.tokenPrices);

  // Filter pools based on selected token
  const uniqueBaseTokens = useMemo(() => {
    const uniqueToken0s = data.pools.map(pool => pool.token0);
    const uniqueToken1s = data.pools.map(pool => pool.token0);
    return _.uniqBy([...uniqueToken0s, ...uniqueToken1s], 'contractId')
  }, [data.pools]);
  
  // Filter pools based on selected token
  const filteredPools = useMemo(() => {
    if (!selectedToken) return data.pools;
    return data.pools.filter(pool => pool.token0.contractId === selectedToken.contractId);
  }, [data.pools, selectedToken]);

  const sortedPools = useMemo(() => {
    return [...filteredPools].sort((a, b) => {
      const tvlA = calculatePoolTVL(a, data.tokenPrices);
      const tvlB = calculatePoolTVL(b, data.tokenPrices);
      return sortOrder === 'asc' ? tvlA - tvlB : tvlB - tvlA;
    });
  }, [filteredPools, data.tokenPrices, sortOrder]);

  const handleSort = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleLiquidityAction = (pool: Pool, isAdd: boolean) => {
    setSelectedPool(pool);
    setIsAddLiquidity(isAdd);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedPool(null);
  };

  const handleQuickBuy = (pool: Pool) => {
  };

  const handleTokenSelect = (value: any) => {
    setSelectedToken((prevToken: any) => prevToken?.contractId === value.contractId ? null : value);
  };

  const subtitle = title === 'Community Pools' ? 'Zero protocol fees and high APYs to support our incredible memecoin communities' 
    : title ==='Spot Pools' ? 'Earn high APYs by providing LP in unique meme-to-meme liquidity pools'
    : title ==='Derivative Pools' ? 'Put your LP tokens to work and earn additional yield with unique LP-to-LP pools'
    : title ==='Dexterity Pools' ? `One-click to deploy your own mini-DEX, then collect trading fees anytime someone swaps between your tokens!`: '';

  return (
    <div className="sm:mx-auto sm:px-4">
      <div className="mt-6">
      <div className="relative sm:px-6 pb-4 pt-5 sm:rounded-lg bg-[var(--sidebar)] border border-[var(--accents-7)] overflow-hidden">
          <div className="flex flex-col gap-4 px-4 mb-4 sm:px-0">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white/95">{title}</h1>
                <div className="text-sm text-muted-foreground">{subtitle}</div>
              </div>
              <span className="px-3 text-lg font-light text-white border rounded-full border-primary bg-accent-foreground">
                {formatUSD(totalTVL)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex overflow-hidden overflow-x-auto border rounded-xl scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
                {uniqueBaseTokens.map(token => (
                  <Button
                    key={token.contractId} 
                    variant={selectedToken?.contractId === token.contractId ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => handleTokenSelect(token)}
                    className="h-8 px-3 py-0 rounded-none shrink-0"
                    >
                    <div className='flex items-center space-x-1'>
                      <Image
                        src={token.metadata.image || '/dmg-logo.gif'}
                        alt={token.metadata.symbol}
                        width={24}
                        height={24}
                        className="w-6 h-6 rounded-full" 
                      />
                      <div>{token.metadata.symbol || token.contractId.split('.')[1]}</div>
                    </div>
                  </Button>
                ))}
              </div>
              <Link className='text-sm min-w-80' href='/launchpad'>Want to create your own pool and collect fees?</Link>
            </div>
          </div>

          <div className="px-4 overflow-x-auto sm:px-0">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400">
                  <th className="py-2">Name</th>
                  <th className="py-2">Composition</th>
                  <th className="py-2">Swap Fee</th>
                  <th className="py-2 text-center">Reserves</th>
                  <th className="py-2 cursor-pointer" onClick={handleSort}>
                    TVL {<ArrowUpDown className="inline ml-1" size={16} />}
                  </th>
                  <th className="py-2 sr-only">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedPools.map(pool => (
                  <tr key={pool.contractId} className="border-t border-gray-700/50">
                    <td className="py-4 overflow-scroll text-left text-white min-w-36 sm:min-w-48 sm:max-w-80">
                      <PoolDefinition pool={pool} />
                    </td>
                    <td className="py-4 min-w-32">
                      <PoolComposition pool={pool} />
                    </td>
                    <td className="w-20 py-4">
                      <PoolFees pool={pool} />
                    </td>
                    <td className="py-4 pr-4 space-y-1 text-white min-w-48">
                      <PoolReserves pool={pool} tokenPrices={data.tokenPrices} />
                    </td>
                    <td className="py-4 text-white min-w-24">
                      <div className='flex flex-col leading-tight'>
                        <div className=''>{formatUSD(calculatePoolTVL(pool, data.tokenPrices))}</div>
                        <div className='text-xs text-gray-500/90'>{numeral(pool.poolData.totalSupply / 10 ** pool.metadata.decimals).format('0a')} total supply</div>
                        <div className='text-xs text-primary/90'>{formatUSD(calculatePoolTVL(pool, data.tokenPrices) / (pool.poolData.totalSupply / 10 ** pool.metadata.decimals))} / token</div>
                      </div>
                    </td>
                    <td className="py-4 min-w-36">
                      <PoolActions
                        pool={pool}
                        onLiquidityAction={handleLiquidityAction}
                        onQuickBuy={handleQuickBuy}
                        tokenPrices={data.tokenPrices}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <DialogContainer open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <LiquidityDialog pool={selectedPool!} isAdd={isAddLiquidity} onClose={handleCloseDialog} prices={data.tokenPrices} />
      </DialogContainer>

      {/* <DialogContainer open={isQuickBuyDialogOpen} onOpenChange={setIsQuickBuyDialogOpen}>
        <QuickBuyDialog pool={selectedPoolForQuickBuy} onClose={handleCloseQuickBuyDialog} prices={data.tokenPrices}/>
      </DialogContainer> */}
    </div>
  );
};

export default PoolsInterface;