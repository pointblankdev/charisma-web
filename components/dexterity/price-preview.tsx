import React, { useEffect, useState } from 'react';
import { Card } from '@components/ui/card';
import { Alert, AlertDescription } from '@components/ui/alert';
import { Info, AlertCircle } from 'lucide-react';

interface TokenMetadata {
  decimals: number;
  name?: string;
  symbol?: string;
}

interface PricePreviewProps {
  tokenAContract: string;
  tokenBContract: string;
  initialLiquidityA: number;
  initialLiquidityB: number;
  tokenPrices: { [key: string]: number };
  tokenAMetadata: TokenMetadata;
  tokenBMetadata: TokenMetadata;
}

interface TokenValue {
  amount: number;
  adjustedAmount: number;
  usdValue: number;
  price: number;
  decimals: number;
  symbol?: string;
}

export function PricePreview({
  tokenAContract,
  tokenBContract,
  initialLiquidityA,
  initialLiquidityB,
  tokenPrices,
  tokenAMetadata,
  tokenBMetadata
}: PricePreviewProps) {
  const [tokenA, setTokenA] = useState<TokenValue | null>(null);
  const [tokenB, setTokenB] = useState<TokenValue | null>(null);
  const [priceDeviation, setPriceDeviation] = useState<number | null>(null);
  const [totalValue, setTotalValue] = useState<number>(0);

  useEffect(() => {
    const priceA = tokenPrices[tokenAContract] || 0;
    const priceB = tokenPrices[tokenBContract] || 0;

    if (initialLiquidityA && initialLiquidityB && (priceA || priceB)) {
      // Adjust amounts based on decimals
      const adjustedAmountA = initialLiquidityA / Math.pow(10, tokenAMetadata.decimals);
      const adjustedAmountB = initialLiquidityB / Math.pow(10, tokenBMetadata.decimals);

      // Calculate USD values using adjusted amounts
      const tokenAValue = {
        amount: initialLiquidityA,
        adjustedAmount: adjustedAmountA,
        usdValue: adjustedAmountA * priceA,
        price: priceA,
        decimals: tokenAMetadata.decimals,
        symbol: tokenAMetadata.symbol
      };

      const tokenBValue = {
        amount: initialLiquidityB,
        adjustedAmount: adjustedAmountB,
        usdValue: adjustedAmountB * priceB,
        price: priceB,
        decimals: tokenBMetadata.decimals,
        symbol: tokenBMetadata.symbol
      };

      setTokenA(tokenAValue);
      setTokenB(tokenBValue);
      setTotalValue(tokenAValue.usdValue + tokenBValue.usdValue);

      // Calculate price deviation using adjusted amounts and prices
      if (priceA && priceB) {
        const marketRatio = priceA / priceB;
        const impliedRatio = (adjustedAmountB * priceB) / (adjustedAmountA * priceA);
        const deviation = (impliedRatio - 1) * 100;

        // Only set deviation if the calculation is meaningful
        if (isFinite(deviation) && !isNaN(deviation)) {
          setPriceDeviation(deviation);
        } else {
          setPriceDeviation(null);
        }
      } else {
        setPriceDeviation(null);
      }
    } else {
      setTokenA(null);
      setTokenB(null);
      setPriceDeviation(null);
      setTotalValue(0);
    }
  }, [
    tokenAContract,
    tokenBContract,
    initialLiquidityA,
    initialLiquidityB,
    tokenPrices,
    tokenAMetadata,
    tokenBMetadata
  ]);

  if (!tokenA || !tokenB) return null;

  const formatNumber = (num: number) => {
    if (num < 0.000001) return num.toExponential(6);
    return num.toLocaleString(undefined, {
      maximumFractionDigits: 6,
      minimumFractionDigits: 2
    });
  };

  const formatUSD = (num: number) => {
    return num.toLocaleString(undefined, {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    });
  };

  const formatPercentage = (num: number) => {
    return num.toLocaleString(undefined, {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    });
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Liquidity Preview</h3>
        <span className="text-sm text-gray-500">Total Value: ${formatUSD(totalValue)}</span>
      </div>

      <div className="space-y-4">
        <div className="flex w-full space-x-2">
          {/* Token A Details */}
          <div className="w-full p-3 rounded-lg bg-accent-foreground/30">
            <div className="flex justify-between mb-1">
              <span className="text-sm text-gray-600">{tokenA.symbol || 'Token A'} Amount:</span>
              <span className="font-medium">{formatNumber(tokenA.adjustedAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">USD Value:</span>
              <span className="font-medium">${formatUSD(tokenA.usdValue)}</span>
            </div>
          </div>

          {/* Token B Details */}
          <div className="w-full p-3 rounded-lg bg-accent-foreground/30">
            <div className="flex justify-between mb-1">
              <span className="text-sm text-gray-600">{tokenB.symbol || 'Token B'} Amount:</span>
              <span className="font-medium">{formatNumber(tokenB.adjustedAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">USD Value:</span>
              <span className="font-medium">${formatUSD(tokenB.usdValue)}</span>
            </div>
          </div>
        </div>

        {/* Price Information */}
        {tokenA.price > 0 && tokenB.price > 0 && (
          <div className="p-3 space-y-2 border rounded-lg">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Current Market Rate:</span>
              <span className="font-medium">
                1 {tokenA.symbol || 'Token A'} = ${formatUSD(tokenA.price)} ($
                {formatUSD(tokenB.price)} {tokenB.symbol || 'Token B'})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Your Pool Rate:</span>
              <span className="font-medium">
                1 {tokenA.symbol || 'Token A'} ={' '}
                {formatNumber(tokenB.adjustedAmount / tokenA.adjustedAmount)}{' '}
                {tokenB.symbol || 'Token B'}
              </span>
            </div>
          </div>
        )}

        {/* Warnings */}
        {priceDeviation !== null && Math.abs(priceDeviation) > 1 && (
          <Alert variant={Math.abs(priceDeviation) > 5 ? 'destructive' : 'default'}>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              {Math.abs(priceDeviation) > 5 ? (
                <>
                  Your pool value ratio deviates significantly (
                  {formatPercentage(Math.abs(priceDeviation))}%) from the market rate. Consider
                  adjusting your amounts to avoid potential arbitrage.
                </>
              ) : (
                <>
                  Your pool value ratio differs slightly (
                  {formatPercentage(Math.abs(priceDeviation))}%) from the market rate. You may want
                  to fine-tune your amounts.
                </>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Value Imbalance Warning */}
        {tokenA.usdValue > 0 &&
          tokenB.usdValue > 0 &&
          Math.abs(tokenA.usdValue - tokenB.usdValue) / Math.max(tokenA.usdValue, tokenB.usdValue) >
            0.1 && (
            <Alert>
              <Info className="w-4 h-4" />
              <AlertDescription>
                The USD value of your tokens is unbalanced. Consider providing equal values for
                optimal liquidity provision.
              </AlertDescription>
            </Alert>
          )}
      </div>
    </Card>
  );
}
