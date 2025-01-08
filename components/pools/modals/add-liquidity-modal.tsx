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
import { Plus, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@components/ui/alert';
import { Pool } from '../pool-helpers';
import useWallet from '@lib/hooks/wallet-balance-provider';
import numeral from 'numeral';
import { TokenDisplay, BalanceInfo } from '../dexterity-controls';
import { useColor } from 'color-thief-react';

export const AddLiquidityModal = ({ pool, tokenPrices, onAddLiquidity, trigger }: { pool: any, tokenPrices: any, onAddLiquidity: any, trigger: any }) => {
  const [amount, setAmount] = useState(50);
  const { getBalance } = useWallet();
  console.log(pool);

  const maxAmount = useMemo(() => {
    const token0Balance = getBalance(pool.liquidity[0].contractId) || 0;
    const token1Balance = getBalance(pool.liquidity[1].contractId) || 0;

    // Calculate token amounts needed for the entire pool
    const token0PerLp = pool.liquidity[0].reserves / pool.supply;
    const token1PerLp = pool.liquidity[1].reserves / pool.supply;

    // Calculate max LP tokens possible with each token's balance
    const maxLpFromToken0 = token0Balance / token0PerLp;
    const maxLpFromToken1 = token1Balance / token1PerLp;

    // Return the minimum possible LP tokens based on limiting token
    return Math.min(maxLpFromToken0, maxLpFromToken1);
  }, [pool, getBalance]);

  const amounts = useMemo(() => {
    const lpTokens = Math.min(amount, maxAmount);

    // Calculate token amounts proportional to the pool ratio
    const token0Amount = (lpTokens * pool.liquidity[0].reserves) / pool.supply;
    const token1Amount = (lpTokens * pool.liquidity[1].reserves) / pool.supply;

    return {
      lpTokens,
      token0Amount,
      token1Amount
    };
  }, [amount, maxAmount, pool]);

  const isMaxed = amount > maxAmount;

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Liquidity</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-4">
            <TokenDisplay
              amount={amounts.token0Amount / 10 ** pool.liquidity[0].decimals}
              symbol={pool.liquidity[0].symbol}
              imgSrc={pool.liquidity[0].image}
              price={tokenPrices[pool.liquidity[0].contractId]}
              label="You will deposit"
            />
            <BalanceInfo
              balance={getBalance(pool.liquidity[0].contractId) || 0}
              symbol={pool.liquidity[0].symbol}
              price={tokenPrices[pool.liquidity[0].contractId]}
              decimals={pool.liquidity[0].decimals}
              required={amounts.token0Amount}
            />
          </div>

          <div className="space-y-4">
            <TokenDisplay
              amount={amounts.token1Amount / 10 ** pool.liquidity[1].decimals}
              symbol={pool.liquidity[1].symbol}
              imgSrc={pool.liquidity[1].image}
              price={tokenPrices[pool.liquidity[1].contractId]}
              label="You will deposit"
            />
            <BalanceInfo
              balance={getBalance(pool.liquidity[1].contractId) || 0}
              symbol={pool.liquidity[1].symbol}
              price={tokenPrices[pool.liquidity[1].contractId]}
              decimals={pool.liquidity[1].decimals}
              required={amounts.token1Amount}
            />
          </div>

          <div className="col-span-2 space-y-4">
            {isMaxed && (
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>Amount limited by your wallet balance</AlertDescription>
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
              onClick={() => onAddLiquidity(pool, amounts.lpTokens)}
              disabled={isMaxed}
            >
              Add Liquidity
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
