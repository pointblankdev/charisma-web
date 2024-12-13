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
  price: number;
}

export const TokenDisplay: React.FC<TokenDisplayProps> = ({
  amount,
  symbol,
  imgSrc,
  label,
  price
}) => {
  const usdValue = amount * price;

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg border-border">
      <div className="flex items-center space-x-3">
        <img src={imgSrc} alt={symbol} className="w-8 h-8 rounded-full" />
        <div>
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="text-lg font-medium">
            {numeral(amount).format('0,0.0000')} {symbol}
          </div>
        </div>
      </div>
      <div className="text-right text-muted-foreground">
        ≈ ${numeral(usdValue).format('0,0.00')}
      </div>
    </div>
  );
};

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
  isAudited?: boolean;
}

const DexterityControls: React.FC<DexterityControlsProps> = ({
  pool,
  tokenPrices,
  onAddLiquidity,
  onRemoveLiquidity,
  onSwap,
  isAudited = false
}) => {
  return (
    <div className="flex space-x-2">
      <AddLiquidityModal
        pool={pool}
        tokenPrices={tokenPrices}
        onAddLiquidity={onAddLiquidity}
        trigger={
          <Button variant="outline" disabled={!isAudited}>
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
          <Button variant="outline" disabled={!isAudited}>
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
          <Button disabled={!isAudited} variant="outline" className="flex items-center space-x-1">
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
          <Button disabled={!isAudited} variant="outline" className="flex items-center space-x-1">
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
