import React from 'react';
import { AddLiquidityModal } from './modals/add-liquidity-modal';
import { RemoveLiquidityModal } from './modals/remove-liquidity-modal';
import { SwapModal } from './modals/swap-modal';
import { Button } from '@components/ui/button';
import { Plus, Minus } from 'lucide-react';
import { Pool } from './pool-helpers';
import numeral from 'numeral';
import { cn } from '@lib/utils';

interface TokenDisplayProps {
  amount: number;
  symbol: string;
  imgSrc?: string;
  label: string;
  rounded?: boolean;
}

export const TokenDisplay: React.FC<TokenDisplayProps> = ({
  amount,
  symbol,
  imgSrc,
  label,
  rounded = true
}) => (
  <div className="flex items-center p-4 space-x-2 rounded-lg bg-secondary/5">
    <img
      src={imgSrc || '/dmg-logo.png'}
      alt={symbol}
      className={cn('w-8 h-8', rounded ? 'rounded-full' : 'rounded-md')}
    />
    <div className="flex flex-col">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-baseline space-x-2">
        <span className="text-xl font-medium">{numeral(amount).format('0,0.00')}</span>
        <span className="text-sm text-muted-foreground">{symbol}</span>
      </div>
    </div>
  </div>
);

interface BalanceInfoProps {
  balance: number;
  symbol: string;
  price: number;
  decimals: number;
  required?: number;
}

export const BalanceInfo: React.FC<BalanceInfoProps> = ({
  balance,
  symbol,
  price,
  decimals,
  required
}) => {
  const formattedBalance = balance / 10 ** decimals;

  return (
    <div className="flex flex-col space-y-1">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>
          Balance: {numeral(formattedBalance).format('0,0.00')} {symbol}
        </span>
        <span>${numeral(formattedBalance * price).format('0,0.00')}</span>
      </div>
    </div>
  );
};

interface DexterityControlsProps {
  pool: Pool;
  tokenPrices: Record<string, number>;
  onAddLiquidity: (pool: Pool, amount: number) => void;
  onRemoveLiquidity: (pool: Pool, amount: number) => void;
  onSwap: (isSwap0: boolean, swapAmount: number) => void;
}

const DexterityControls: React.FC<DexterityControlsProps> = ({
  pool,
  tokenPrices,
  onAddLiquidity,
  onRemoveLiquidity,
  onSwap
}) => {
  return (
    <div className="flex space-x-2">
      <AddLiquidityModal
        pool={pool}
        tokenPrices={tokenPrices}
        onAddLiquidity={onAddLiquidity}
        trigger={
          <Button variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        }
      />

      <RemoveLiquidityModal
        pool={pool}
        tokenPrices={tokenPrices}
        onRemoveLiquidity={onRemoveLiquidity}
        trigger={
          <Button variant="outline">
            <Minus className="w-4 h-4 mr-2" />
            Remove
          </Button>
        }
      />

      <SwapModal
        pool={pool}
        tokenPrices={tokenPrices}
        onSwap={onSwap}
        isToken0={true}
        trigger={
          <Button variant="outline" className="flex items-center space-x-1">
            <img
              src={pool.token0.metadata.image || '/dmg-logo.png'}
              className="w-6 h-6 rounded-full"
              alt={pool.token0.metadata.symbol}
            />
          </Button>
        }
      />

      <SwapModal
        pool={pool}
        tokenPrices={tokenPrices}
        onSwap={onSwap}
        isToken0={false}
        trigger={
          <Button variant="outline" className="flex items-center space-x-1">
            <img
              src={pool.token1.metadata.image || '/dmg-logo.png'}
              className="w-6 h-6 rounded-full"
              alt={pool.token1.metadata.symbol}
            />
          </Button>
        }
      />
    </div>
  );
};

export default DexterityControls;
