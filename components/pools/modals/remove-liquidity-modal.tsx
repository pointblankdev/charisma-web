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

export const RemoveLiquidityModal = ({ pool, tokenPrices, onRemoveLiquidity, trigger }: { pool: any, tokenPrices: any, onRemoveLiquidity: any, trigger: any }) => {
  const [amount, setAmount] = useState(50);
  const { getBalance } = useWallet();

  const maxAmount = useMemo(() => {
    const lpBalance = getBalance(pool.contractId) || 0;
    const token0ReservesTVL =
      (pool.liquidity[0].reserves * tokenPrices[pool.liquidity[0].contractId]) /
      10 ** pool.liquidity[0].decimals;
    const token1ReservesTVL =
      (pool.liquidity[1].reserves * tokenPrices[pool.liquidity[1].contractId]) /
      10 ** pool.liquidity[1].decimals;
    const lpTokenPrice =
      (token0ReservesTVL + token1ReservesTVL) /
      (pool.supply / 10 ** pool.decimals);

    return (lpBalance / 10 ** pool.decimals) * lpTokenPrice;
  }, [pool, tokenPrices, getBalance]);

  const amounts = useMemo(() => {
    const baseAmount = Math.min(amount, maxAmount);

    const ratio = pool.liquidity[1].reserves / pool.liquidity[0].reserves;
    const token0USD = baseAmount / (1 + ratio);
    const token1USD = baseAmount - token0USD;

    const token0Price = tokenPrices[pool.liquidity[0].contractId];
    const token1Price = tokenPrices[pool.liquidity[1].contractId];

    const token0ReservesTVL =
      (pool.liquidity[0].reserves * token0Price) / 10 ** pool.liquidity[0].decimals;
    const token1ReservesTVL =
      (pool.liquidity[1].reserves * token1Price) / 10 ** pool.liquidity[1].decimals;

    const lpTokenPrice =
      (token0ReservesTVL + token1ReservesTVL) /
      (pool.supply / 10 ** pool.decimals);

    return {
      lpTokens: (baseAmount / lpTokenPrice) * 10 ** pool.decimals,
      token0Amount: (token0USD / token0Price) * 10 ** pool.liquidity[0].decimals,
      token1Amount: (token1USD / token1Price) * 10 ** pool.liquidity[1].decimals
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
              amount={amounts.token0Amount / 10 ** pool.liquidity[0].decimals}
              symbol={pool.liquidity[0].symbol}
              imgSrc={pool.liquidity[0].image}
              label="You will receive"
            />
            <TokenDisplay
              amount={amounts.token1Amount / 10 ** pool.liquidity[1].decimals}
              symbol={pool.liquidity[1].symbol}
              imgSrc={pool.liquidity[1].image}
              label="You will receive"
            />
          </div> */}

          <div className="space-y-4">
            <TokenDisplay
              amount={amounts.lpTokens / 10 ** pool.decimals}
              symbol={pool.symbol}
              imgSrc={pool.image}
              price={tokenPrices[pool.contractId]}
              label="You will burn"
              rounded={false}
            />
            <BalanceInfo
              balance={getBalance(pool.contractId) || 0}
              symbol={pool.symbol}
              price={(pool.tvl / pool.supply) * 10 ** pool.decimals}
              decimals={pool.decimals}
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
