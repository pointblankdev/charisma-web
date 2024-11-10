import { useState } from 'react';
import { ArrowUpDown } from 'lucide-react';
import LiquidityDialog from './liquidity-modal.tsx/add-liquidity';
import QuickBuyDialog from './quick-buy-dialog';
import {
  type Pool,
  calculateTotalTVL,
  calculatePoolTVL,
  formatUSD,
  PoolDefinition,
  PoolComposition,
  PoolReserves,
  PoolActions,
  DialogContainer
} from './pool-helpers';

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
  const [isQuickBuyDialogOpen, setIsQuickBuyDialogOpen] = useState(false);
  const [selectedPoolForQuickBuy, setSelectedPoolForQuickBuy] = useState<Pool | null>(null);

  const totalTVL = calculateTotalTVL(data.pools, data.tokenPrices);

  const sortedPools = [...data.pools].sort((a, b) => {
    const tvlA = calculatePoolTVL(a, data.tokenPrices);
    const tvlB = calculatePoolTVL(b, data.tokenPrices);
    return sortOrder === 'asc' ? tvlA - tvlB : tvlB - tvlA;
  });

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
    setSelectedPoolForQuickBuy(pool);
    setIsQuickBuyDialogOpen(true);
  };

  const handleCloseQuickBuyDialog = () => {
    setIsQuickBuyDialogOpen(false);
    setSelectedPoolForQuickBuy(null);
  };

  return (
    <div className="sm:mx-auto sm:px-4">
      <div className="mt-6">
        <div className="relative sm:px-6 pb-4 pt-5 sm:rounded-lg bg-[var(--sidebar)] border border-[var(--accents-7)] overflow-hidden">
          <div className="flex items-center justify-between px-4 mb-4 sm:px-0">
            <h1 className="text-2xl font-bold text-white/95">{title}</h1>
            <span className="px-3 text-lg font-light text-white border rounded-full border-primary bg-accent-foreground">
              {formatUSD(totalTVL)}
            </span>
          </div>

          <div className="px-4 overflow-x-auto sm:px-0">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400">
                  <th className="py-2">Definition</th>
                  <th className="py-2">Composition</th>
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
                    <td className="py-4 pr-4 space-y-1 text-white min-w-48">
                      <PoolReserves pool={pool} tokenPrices={data.tokenPrices} />
                    </td>
                    <td className="py-4 text-white min-w-24">
                      {formatUSD(calculatePoolTVL(pool, data.tokenPrices))}
                    </td>
                    <td className="py-4 min-w-36">
                      <PoolActions
                        pool={pool}
                        onLiquidityAction={handleLiquidityAction}
                        onQuickBuy={handleQuickBuy}
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