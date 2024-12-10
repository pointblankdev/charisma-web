import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@components/ui/dialog';
import { Button } from '@components/ui/button';
import { Slider } from '@components/ui/slider';
import { Minus, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@components/ui/alert';
import { Pool } from '../pool-helpers';
import useWallet from '@lib/hooks/wallet-balance-provider';
import numeral from 'numeral';
import { TokenDisplay, BalanceInfo } from '../dexterity-controls';
import { useColor } from 'color-thief-react';

const PoolVisualizer = ({ pool, amounts, tokenPrices }: any) => {
  const { data: color0 } = useColor(pool.token0.metadata.image || '/dmg-logo.png', 'hex', {
    crossOrigin: 'anonymous',
    quality: 10
  });
  const { data: color1 } = useColor(pool.token1.metadata.image || '/dmg-logo.png', 'hex', {
    crossOrigin: 'anonymous',
    quality: 10
  });

  const currentToken0USD =
    (pool.poolData.reserve0 / 10 ** pool.token0.metadata.decimals) *
    tokenPrices[pool.token0.contractId];
  const currentToken1USD =
    (pool.poolData.reserve1 / 10 ** pool.token1.metadata.decimals) *
    tokenPrices[pool.token1.contractId];
  const removedToken0USD =
    (amounts.token0Amount / 10 ** pool.token0.metadata.decimals) *
    tokenPrices[pool.token0.contractId];
  const removedToken1USD =
    (amounts.token1Amount / 10 ** pool.token1.metadata.decimals) *
    tokenPrices[pool.token1.contractId];

  const total = currentToken0USD + currentToken1USD;
  const token0Percent = (currentToken0USD / total) * 100;
  const token1Percent = (currentToken1USD / total) * 100;

  const newTotal = total - removedToken0USD - removedToken1USD;
  const newToken0Percent = ((currentToken0USD - removedToken0USD) / newTotal) * 100;
  const newToken1Percent = ((currentToken1USD - removedToken1USD) / newTotal) * 100;

  const token0Price = tokenPrices[pool.token0.contractId] / tokenPrices[pool.token1.contractId];
  const token1Price = tokenPrices[pool.token1.contractId] / tokenPrices[pool.token0.contractId];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Current Pool</div>
          <div className="flex h-3 overflow-hidden rounded-full">
            <div style={{ width: `${token0Percent}%`, backgroundColor: color0 || '#1d4ed8' }} />
            <div style={{ width: `${token1Percent}%`, backgroundColor: color1 || '#4f46e5' }} />
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">After Removal</div>
          <div className="flex h-3 overflow-hidden rounded-full">
            <div style={{ width: `${newToken0Percent}%`, backgroundColor: color0 || '#1d4ed8' }} />
            <div style={{ width: `${newToken1Percent}%`, backgroundColor: color1 || '#4f46e5' }} />
          </div>
        </div>
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color0 || '#1d4ed8' }} />
          <span>
            {pool.token0.metadata.symbol}: {token0Percent.toFixed(1)}% →{' '}
            {newToken0Percent.toFixed(1)}%
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color1 || '#4f46e5' }} />
          <span>
            {pool.token1.metadata.symbol}: {token1Percent.toFixed(1)}% →{' '}
            {newToken1Percent.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="text-sm">
          <span className="text-muted-foreground">1 {pool.token0.metadata.symbol} = </span>
          <span>
            {numeral(token0Price).format('0,0.0000')} {pool.token1.metadata.symbol}
          </span>
        </div>
        <div className="text-sm text-right">
          <span className="text-muted-foreground">1 {pool.token1.metadata.symbol} = </span>
          <span>
            {numeral(token1Price).format('0,0.0000')} {pool.token0.metadata.symbol}
          </span>
        </div>
      </div>
    </div>
  );
};

export const RemoveLiquidityModal = ({ pool, tokenPrices, onRemoveLiquidity, trigger }: any) => {
  const [amount, setAmount] = useState(50);
  const { getBalance } = useWallet();

  const maxAmount = useMemo(() => {
    const lpBalance = getBalance(pool.contractId) || 0;
    const token0ReservesTVL =
      (pool.poolData.reserve0 * tokenPrices[pool.token0.contractId]) /
      10 ** pool.token0.metadata.decimals;
    const token1ReservesTVL =
      (pool.poolData.reserve1 * tokenPrices[pool.token1.contractId]) /
      10 ** pool.token1.metadata.decimals;
    const lpTokenPrice =
      (token0ReservesTVL + token1ReservesTVL) /
      (pool.poolData.totalSupply / 10 ** pool.metadata.decimals);

    return (lpBalance / 10 ** pool.metadata.decimals) * lpTokenPrice;
  }, [pool, tokenPrices, getBalance]);

  const amounts = useMemo(() => {
    const baseAmount = Math.min(amount, maxAmount);

    const ratio = pool.poolData.reserve1 / pool.poolData.reserve0;
    const token0USD = baseAmount / (1 + ratio);
    const token1USD = baseAmount - token0USD;

    const token0Price = tokenPrices[pool.token0.contractId];
    const token1Price = tokenPrices[pool.token1.contractId];

    const token0ReservesTVL =
      (pool.poolData.reserve0 * token0Price) / 10 ** pool.token0.metadata.decimals;
    const token1ReservesTVL =
      (pool.poolData.reserve1 * token1Price) / 10 ** pool.token1.metadata.decimals;

    const lpTokenPrice =
      (token0ReservesTVL + token1ReservesTVL) /
      (pool.poolData.totalSupply / 10 ** pool.metadata.decimals);

    return {
      lpTokens: (baseAmount / lpTokenPrice) * 10 ** pool.metadata.decimals,
      token0Amount: (token0USD / token0Price) * 10 ** pool.token0.metadata.decimals,
      token1Amount: (token1USD / token1Price) * 10 ** pool.token1.metadata.decimals
    };
  }, [amount, maxAmount, pool, tokenPrices]);

  const isMaxed = amount > maxAmount;

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Remove Liquidity</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* <div className="space-y-4">
            <TokenDisplay
              amount={amounts.token0Amount / 10 ** pool.token0.metadata.decimals}
              symbol={pool.token0.metadata.symbol}
              imgSrc={pool.token0.metadata.image}
              label="You will receive"
            />
            <TokenDisplay
              amount={amounts.token1Amount / 10 ** pool.token1.metadata.decimals}
              symbol={pool.token1.metadata.symbol}
              imgSrc={pool.token1.metadata.image}
              label="You will receive"
            />
          </div> */}

          <div className="space-y-4">
            <TokenDisplay
              amount={amounts.lpTokens / 10 ** pool.metadata.decimals}
              symbol={pool.metadata.symbol}
              imgSrc={pool.metadata.image}
              label="You will burn"
              rounded={false}
            />
            <BalanceInfo
              balance={getBalance(pool.contractId) || 0}
              symbol={pool.metadata.symbol}
              price={(pool.tvl / pool.poolData.totalSupply) * 10 ** pool.metadata.decimals}
              decimals={pool.metadata.decimals}
              required={amounts.lpTokens}
            />
          </div>

          <div className="col-span-2 space-y-4">
            {isMaxed && (
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>Amount limited by your LP token balance</AlertDescription>
              </Alert>
            )}

            {/* <PoolVisualizer pool={pool} amounts={amounts} tokenPrices={tokenPrices} /> */}

            <Slider
              value={[amount]}
              onValueChange={([val]) => setAmount(val)}
              max={maxAmount}
              step={0.001}
            />

            <Button
              className="w-full"
              onClick={() => onRemoveLiquidity(pool, amounts.lpTokens)}
              disabled={isMaxed}
            >
              Remove Liquidity
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
