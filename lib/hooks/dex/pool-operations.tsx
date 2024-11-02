// lib/hooks/dex/pool-operations.tsx
import { useMemo } from 'react';
import { TokenInfo } from '@lib/server/tokens/token-service';
import { PoolInfo } from '@lib/server/pools/pool-service';

export function useAvailablePools({
  pools,
  fromToken,
  toToken,
  hasHighExperience
}: {
  pools: PoolInfo[];
  fromToken: TokenInfo;
  toToken: TokenInfo;
  hasHighExperience: boolean;
}) {
  return useMemo(() => {
    return pools.filter(pool => {
      if (pool.id === 4) {
        return hasHighExperience || (fromToken.symbol === 'STX' && toToken.symbol === 'CHA');
      }
      return true;
    });
  }, [pools, hasHighExperience, fromToken, toToken]);
}

export function useCurrentPool({
  availablePools,
  fromToken,
  toToken
}: {
  availablePools: PoolInfo[];
  fromToken: TokenInfo;
  toToken: TokenInfo;
}) {
  return useMemo(() => {
    return availablePools.find(
      pool =>
        (pool.token0.symbol === fromToken.symbol && pool.token1.symbol === toToken.symbol) ||
        (pool.token1.symbol === fromToken.symbol && pool.token0.symbol === toToken.symbol)
    );
  }, [fromToken, toToken, availablePools]);
}

export const formatBalance = (balance: number, decimals: number) => {
  return (balance / 10 ** decimals).toFixed(decimals);
};
