import React, { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@components/ui/dialog';
import { Button } from '@components/ui/button';
import { Slider } from '@components/ui/slider';
import { ArrowRightLeft, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@components/ui/alert';
import { Pool } from '../pool-helpers';
import useWallet from '@lib/hooks/wallet-balance-provider';
import numeral from 'numeral';
import { TokenDisplay, BalanceInfo } from '../dexterity-controls';
import { useColor } from 'color-thief-react';

const PoolVisualizer = ({ pool, amounts, tokenPrices, isToken0 }: any) => {
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

  const swapToken0USD = isToken0
    ? ((amounts.outAmount || 0) / 10 ** pool.token0.metadata.decimals) *
      tokenPrices[pool.token0.contractId]
    : ((amounts.inAmount || 0) / 10 ** pool.token0.metadata.decimals) *
      tokenPrices[pool.token0.contractId];
  const swapToken1USD = isToken0
    ? ((amounts.inAmount || 0) / 10 ** pool.token1.metadata.decimals) *
      tokenPrices[pool.token1.contractId]
    : ((amounts.outAmount || 0) / 10 ** pool.token1.metadata.decimals) *
      tokenPrices[pool.token1.contractId];

  const total = currentToken0USD + currentToken1USD;
  const token0Percent = (currentToken0USD / total) * 100;
  const token1Percent = (currentToken1USD / total) * 100;

  const newTotal =
    total +
    (isToken0 ? swapToken0USD : -swapToken0USD) +
    (isToken0 ? -swapToken1USD : swapToken1USD);
  const newToken0Percent =
    ((currentToken0USD + (isToken0 ? swapToken0USD : -swapToken0USD)) / newTotal) * 100;
  const newToken1Percent =
    ((currentToken1USD + (isToken0 ? -swapToken1USD : swapToken1USD)) / newTotal) * 100;

  const token0Price = tokenPrices[pool.token0.contractId] / tokenPrices[pool.token1.contractId];
  const token1Price = tokenPrices[pool.token1.contractId] / tokenPrices[pool.token0.contractId];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Current Pool</div>
          <div className="flex h-3 overflow-hidden rounded-full">
            <div style={{ width: `${token0Percent}%`, backgroundColor: color0 || '#1d4ed800' }} />
            <div style={{ width: `${token1Percent}%`, backgroundColor: color1 || '#4f46e500' }} />
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">After Swap</div>
          <div className="flex h-3 overflow-hidden rounded-full">
            <div
              style={{ width: `${newToken1Percent}%`, backgroundColor: color0 || '#1d4ed800' }}
            />
            <div
              style={{ width: `${newToken0Percent}%`, backgroundColor: color1 || '#4f46e500' }}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        <div className="flex items-center space-x-1">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: color0 || '#1d4ed800' }}
          />
          <span>
            {pool.token0.metadata.symbol}: {token1Percent.toFixed(1)}% →{' '}
            {newToken1Percent.toFixed(1)}%
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: color1 || '#4f46e500' }}
          />
          <span>
            {pool.token1.metadata.symbol}: {token0Percent.toFixed(1)}% →{' '}
            {newToken0Percent.toFixed(1)}%
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

export const SwapModal = ({ pool, tokenPrices, onSwap, isToken0, trigger }: any) => {
  const [amount, setAmount] = useState(50);
  const [quoteAmount, setQuoteAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getBalance } = useWallet();

  const inToken = isToken0 ? pool.token1 : pool.token0;
  const outToken = isToken0 ? pool.token0 : pool.token1;

  const maxAmount = useMemo(() => {
    const balance = getBalance(inToken.contractId) || 0;
    return (balance / 10 ** inToken.metadata.decimals) * tokenPrices[inToken.contractId] * 0.99;
  }, [inToken, tokenPrices, getBalance]);

  const swapAmounts = useMemo(() => {
    const baseAmount = Math.min(amount, maxAmount);
    const inAmount =
      (baseAmount / tokenPrices[inToken.contractId]) * 10 ** inToken.metadata.decimals;
    return {
      inAmount,
      outAmount: quoteAmount
    };
  }, [amount, maxAmount, inToken, tokenPrices, quoteAmount]);

  useEffect(() => {
    const fetchQuote = async () => {
      if (swapAmounts.inAmount <= 0) {
        setQuoteAmount(0);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          contract: pool.contractId,
          forwardSwap: (!isToken0).toString(),
          amountIn: Math.floor(swapAmounts.inAmount).toString()
        });

        const response = await fetch(`/api/v0/dex/quote?${params}`);
        if (!response.ok) {
          throw new Error('Failed to fetch quote');
        }

        const data = await response.json();
        setQuoteAmount(data.quote);
      } catch (err) {
        console.error('Error fetching quote:', err);
        setError('Failed to fetch quote. Please try again.');
        setQuoteAmount(0);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchQuote();
    }, 50); // Debounce quote fetching
    return () => clearTimeout(timeoutId);
  }, [pool.contractId, isToken0, swapAmounts.inAmount]);

  const isMaxed = amount >= maxAmount;
  const expectedPrice =
    quoteAmount > 0
      ? swapAmounts.inAmount /
        10 ** inToken.metadata.decimals /
        (quoteAmount / 10 ** outToken.metadata.decimals)
      : 0;

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Buy {outToken.metadata.symbol}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-4">
            <TokenDisplay
              amount={swapAmounts.inAmount / 10 ** inToken.metadata.decimals}
              symbol={inToken.metadata.symbol}
              imgSrc={inToken.metadata.image}
              label="You pay"
            />
            <div className="flex justify-center">
              <ArrowRightLeft
                className={`${isLoading ? 'animate-spin duration-100' : ''} text-muted-foreground`}
              />
            </div>
            <TokenDisplay
              amount={quoteAmount / 10 ** outToken.metadata.decimals}
              symbol={outToken.metadata.symbol}
              imgSrc={outToken.metadata.image}
              label="You receive (estimated)"
            />
            <BalanceInfo
              balance={getBalance(inToken.contractId) || 0}
              symbol={inToken.metadata.symbol}
              price={tokenPrices[inToken.contractId]}
              decimals={inToken.metadata.decimals}
              required={swapAmounts.inAmount}
            />
          </div>

          <div className="col-span-2 space-y-4">
            {isMaxed && (
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>
                  Amount limited by your {inToken.metadata.symbol} balance
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <PoolVisualizer
              pool={pool}
              amounts={swapAmounts}
              tokenPrices={tokenPrices}
              isToken0={isToken0}
            />

            <div className="text-sm text-center text-muted-foreground">
              {expectedPrice > 0 && (
                <span>
                  1 {inToken.metadata.symbol} = {numeral(expectedPrice).format('0,0.0000')}{' '}
                  {outToken.metadata.symbol}
                </span>
              )}
            </div>

            <Slider
              value={[amount]}
              onValueChange={([val]) => setAmount(val)}
              max={maxAmount}
              step={0.001}
            />

            <Button
              className="w-full"
              onClick={() => onSwap(isToken0, swapAmounts.inAmount)}
              disabled={isMaxed || quoteAmount === 0 || isLoading || error !== null}
            >
              {isLoading ? 'Calculating...' : 'Swap'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
