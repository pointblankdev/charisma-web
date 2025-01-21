import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
import { TokenDisplay, BalanceInfo } from '../shared/token-display';
import { Vault } from 'dexterity-sdk/dist/core/vault';
import { Opcode } from 'dexterity-sdk/dist/core/opcode';
import debounce from 'lodash/debounce';
import { useGlobal } from '@lib/hooks/global-context';

export const AddLiquidityModal = ({ pool, tokenPrices, onAddLiquidity, trigger }: { pool: any, tokenPrices: any, onAddLiquidity: any, trigger: any }) => {
  const [amount, setAmount] = useState(50);
  const [isQuoting, setIsQuoting] = useState(false);
  const [quotedAmounts, setQuotedAmounts] = useState({
    lpTokens: 0,
    token0Amount: 0,
    token1Amount: 0
  });
  const { getBalance } = useGlobal();
  const [isProcessing, setIsProcessing] = useState(false);

  // Memoize the vault instance
  const vault = useMemo(() => new Vault(pool), [pool]);

  const maxAmount = useMemo(() => {
    const token0Balance = getBalance(vault.tokenA.contractId) || 0;
    const token1Balance = getBalance(vault.tokenB.contractId) || 0;

    if (!vault.supply || vault.supply === 0) return 0;

    const token0PerLp = vault.tokenA.reserves / vault.supply;
    const token1PerLp = vault.tokenB.reserves / vault.supply;

    if (token0PerLp === 0 || token1PerLp === 0) return 0;

    const maxLpFromToken0 = token0Balance / token0PerLp;
    const maxLpFromToken1 = token1Balance / token1PerLp;

    return Math.min(maxLpFromToken0, maxLpFromToken1) || 0;
  }, [getBalance, vault]);

  // Debounced fetch quote function
  const debouncedFetchQuote = useCallback(
    debounce(async (newAmount: number) => {
      setIsQuoting(true);
      const lpTokens = Math.floor(Math.min(newAmount, maxAmount));

      try {
        const quote = await vault.quote(lpTokens, Opcode.addLiquidity());
        if (quote instanceof Error) {
          setQuotedAmounts({
            lpTokens: 0,
            token0Amount: 0,
            token1Amount: 0
          });
          return;
        }

        setQuotedAmounts({
          lpTokens,
          token0Amount: quote.dx,
          token1Amount: quote.dy
        });
      } catch (error) {
        console.error('Error fetching quote:', error);
        setQuotedAmounts({
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

  // Initial quote
  useEffect(() => {
    debouncedFetchQuote(amount);
  }, []);

  const isMaxed = amount > maxAmount;

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Liquidity</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-4 relative">
            <div className="animate-pulse-glow absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-yellow-500/35 to-yellow-500/20 blur-xl rounded-lg" />
            <TokenDisplay
              price={tokenPrices[vault.contractId]}
              amount={amount / 10 ** vault.decimals}
              symbol={vault.symbol}
              imgSrc={vault.image}
              label="You will receive"
              decimals={vault.decimals}
              isLoading={isQuoting}
            />
          </div>

          <div className="space-y-4">
            <TokenDisplay
              amount={quotedAmounts.token0Amount / 10 ** pool.liquidity[0].decimals}
              symbol={pool.liquidity[0].symbol}
              imgSrc={pool.liquidity[0].image}
              price={tokenPrices[pool.liquidity[0].contractId]}
              label="You will deposit"
              decimals={pool.liquidity[0].decimals}
              isLoading={isQuoting}
            />
          </div>

          <div className="space-y-4">
            <TokenDisplay
              amount={quotedAmounts.token1Amount / 10 ** pool.liquidity[1].decimals}
              symbol={pool.liquidity[1].symbol}
              imgSrc={pool.liquidity[1].image}
              price={tokenPrices[pool.liquidity[1].contractId]}
              label="You will deposit"
              decimals={pool.liquidity[1].decimals}
              isLoading={isQuoting}
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
              onValueChange={async ([val]) => {
                setAmount(val);
                debouncedFetchQuote(val);
              }}
              max={maxAmount}
              step={0.001}
            />
          </div>

          <div className="space-y-4 border-t pt-4">
            <BalanceInfo
              balance={getBalance(pool.liquidity[0].contractId) || 0}
              symbol={pool.liquidity[0].symbol}
              price={tokenPrices[pool.liquidity[0].contractId]}
              decimals={pool.liquidity[0].decimals}
              required={quotedAmounts.token0Amount}
            />
            <BalanceInfo
              balance={getBalance(pool.liquidity[1].contractId) || 0}
              symbol={pool.liquidity[1].symbol}
              price={tokenPrices[pool.liquidity[1].contractId]}
              decimals={pool.liquidity[1].decimals}
              required={quotedAmounts.token1Amount}
            />
          </div>

          <Button
            className="w-full"
            onClick={async () => {
              setIsProcessing(true);
              try {
                await onAddLiquidity(pool, quotedAmounts.lpTokens);
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
              'Add Liquidity'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
