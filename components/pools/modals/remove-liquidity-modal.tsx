import React, { useState, useMemo, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@components/ui/dialog';
import { Button } from '@components/ui/button';
import { Slider } from '@components/ui/slider';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@components/ui/alert';
import { TokenDisplay, BalanceInfo } from '../shared/token-display';
import { Vault } from 'dexterity-sdk/dist/core/vault';
import { Opcode } from 'dexterity-sdk/dist/core/opcode';
import debounce from 'lodash/debounce';
import { useGlobal } from '@lib/hooks/global-context';

export const RemoveLiquidityModal = ({ pool, tokenPrices, onRemoveLiquidity, trigger }: { pool: any, tokenPrices: any, onRemoveLiquidity: any, trigger: any }) => {
  const [amount, setAmount] = useState(50);
  const [isQuoting, setIsQuoting] = useState(false);
  const { getBalance } = useGlobal();
  const vault = useMemo(() => new Vault(pool), [pool]);

  const maxAmount = useMemo(() => {
    const lpBalance = getBalance(`${pool.contractId}::${pool.identifier}`) || 0;
    return lpBalance;
  }, [pool, getBalance]);

  const debouncedFetchQuote = useCallback(
    debounce(async (newAmount: number) => {
      setIsQuoting(true);
      const lpTokens = Math.floor(Math.min(newAmount, maxAmount));

      try {
        const quote = await vault.quote(lpTokens, Opcode.removeLiquidity());
        if (quote instanceof Error) {
          setAmounts({
            lpTokens: 0,
            token0Amount: 0,
            token1Amount: 0
          });
          return;
        }

        setAmounts({
          lpTokens,
          token0Amount: quote.dx,
          token1Amount: quote.dy
        });
      } catch (error) {
        console.error('Error fetching quote:', error);
        setAmounts({
          lpTokens: 0,
          token0Amount: 0,
          token1Amount: 0
        });
      } finally {
        setIsQuoting(false);
      }
    }, 50),
    [maxAmount, vault]
  );

  const [amounts, setAmounts] = useState({
    lpTokens: 0,
    token0Amount: 0,
    token1Amount: 0
  });

  const isMaxed = amount > maxAmount;

  const [isProcessing, setIsProcessing] = useState(false);

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Remove Liquidity</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-4">
            <TokenDisplay
              amount={amounts.token0Amount / 10 ** pool.liquidity[0].decimals}
              symbol={pool.liquidity[0].symbol}
              imgSrc={pool.liquidity[0].image}
              price={tokenPrices[pool.liquidity[0].contractId]}
              label="You will receive"
              decimals={pool.liquidity[0].decimals}
              isLoading={isQuoting}
            />
            <TokenDisplay
              amount={amounts.token1Amount / 10 ** pool.liquidity[1].decimals}
              symbol={pool.liquidity[1].symbol}
              imgSrc={pool.liquidity[1].image}
              price={tokenPrices[pool.liquidity[1].contractId]}
              label="You will receive"
              decimals={pool.liquidity[1].decimals}
              isLoading={isQuoting}
            />
          </div>

          <div className="space-y-4 relative">
            <div className="animate-pulse-glow absolute -translate-y-4 inset-0 bg-gradient-to-r from-destructive/15 via-destructive/20 to-destructive/15 blur-xl rounded-lg" />
            <TokenDisplay
              amount={amount / 10 ** pool.decimals}
              symbol={pool.symbol}
              imgSrc={pool.image}
              price={tokenPrices[pool.contractId]}
              label="You will burn"
              decimals={pool.decimals}
              isLoading={isQuoting}
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
              onValueChange={async ([val]) => {
                setAmount(val);
                debouncedFetchQuote(val);
              }}
              max={maxAmount}
              step={0.001}
            />

            <Button
              className="w-full"
              onClick={async () => {
                setIsProcessing(true);
                try {
                  await onRemoveLiquidity(pool, amounts.lpTokens);
                } finally {
                  setIsProcessing(false);
                }
              }}
              disabled={isMaxed || isProcessing}
            >
              {isProcessing ? (
                <div className="flex items-center justify-center">
                  <div className="mr-2">Processing</div>
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" />
                  </div>
                </div>
              ) : (
                'Remove Liquidity'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
