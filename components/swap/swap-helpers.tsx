import {
  contractPrincipalCV,
  Pc,
  PostConditionMode,
  uintCV,
  cvToValue,
  listCV
} from '@stacks/transactions';
import { fetchCallReadOnlyFunction } from '@stacks/transactions';
import { network } from '@components/stacks-session/connect';
import { getGraph } from './swap-graph';

// Cache key generator
const getAmountCacheKey = (
  fromAmount: string,
  fromToken: any,
  toToken: any,
  swapPath: any[]
): string => {
  return `${fromAmount}-${fromToken.contractId}-${toToken.contractId}-${swapPath
    .map(token => token.contractId)
    .join('-')}`;
};

// Simple cache implementation
const amountCache = new Map<string, { amount: string; timestamp: number }>();

// Cache duration in milliseconds (e.g., 30 seconds)
const CACHE_DURATION = 30 * 1000;

// Export cache clear function for manual cache invalidation if needed
export const clearAmountCache = () => {
  amountCache.clear();
};

// Wrapper for calculateEstimatedAmountOut with caching
export const calculateEstimatedAmountOutWithCache = async (
  fromAmount: string,
  fromToken: any,
  toToken: any,
  swapPath: any[],
  stxAddress: string,
  isMultiHop: boolean,
  _currentPool?: any
): Promise<string> => {
  const cacheKey = getAmountCacheKey(fromAmount, fromToken, toToken, swapPath);
  const now = Date.now();

  // Check cache
  const cached = amountCache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_DURATION) {
    console.log('Cache hit for amount calculation:', cacheKey);
    return cached.amount;
  }

  // Calculate if not in cache or expired
  const amount = await calculateEstimatedAmountOut(
    fromAmount,
    fromToken,
    toToken,
    swapPath,
    stxAddress,
    isMultiHop,
    _currentPool
  );

  // Update cache
  amountCache.set(cacheKey, {
    amount,
    timestamp: now
  });

  // Clean up old cache entries periodically
  if (amountCache.size > 100) {
    // Arbitrary limit
    const oldestAllowedTimestamp = now - CACHE_DURATION;
    for (const [key, value] of amountCache.entries()) {
      if (value.timestamp < oldestAllowedTimestamp) {
        amountCache.delete(key);
      }
    }
  }

  return amount;
};

export const calculateEstimatedAmountOut = async (
  fromAmount: string,
  fromToken: any,
  toToken: any,
  swapPath: any[],
  stxAddress: string,
  isMultiHop: boolean,
  _currentPool?: any // We won't use this anymore
): Promise<string> => {
  if (!fromAmount || isNaN(parseFloat(fromAmount))) {
    return '0';
  }

  const graph = getGraph();
  const amountInMicroTokens = BigInt(
    Math.floor(parseFloat(fromAmount) * 10 ** fromToken.metadata.decimals)
  );

  try {
    const contractAddress = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS';
    const contractName = 'univ2-path2';

    let response;
    if (isMultiHop) {
      const functionName = `get-amount-out-${swapPath.length}`;
      const functionArgs = [
        uintCV(amountInMicroTokens),
        ...swapPath.map(token =>
          contractPrincipalCV(token.contractId.split('.')[0], token.contractId.split('.')[1])
        )
      ];

      if (swapPath.length === 4) functionArgs.push(listCV([]) as any);

      response = await fetchCallReadOnlyFunction({
        contractAddress,
        contractName,
        functionName,
        functionArgs,
        senderAddress: stxAddress
      });
    } else {
      // Get pool from graph for single-hop swap
      const pool = graph.getDirectPool(fromToken.contractId, toToken.contractId);
      if (!pool) {
        throw new Error(
          `No pool found between ${fromToken.metadata.symbol} and ${toToken.metadata.symbol}`
        );
      }

      response = await fetchCallReadOnlyFunction({
        contractAddress,
        contractName,
        functionName: 'amount-out',
        functionArgs: [
          uintCV(amountInMicroTokens),
          contractPrincipalCV(
            fromToken.contractId.split('.')[0],
            fromToken.contractId.split('.')[1]
          ),
          contractPrincipalCV(toToken.contractId.split('.')[0], toToken.contractId.split('.')[1])
        ],
        senderAddress: stxAddress
      });
    }

    const result = cvToValue(response);

    if (isMultiHop) {
      const lastHopResult = result[Object.keys(result).pop() as any];
      return (Number(lastHopResult.value) / 10 ** toToken.metadata.decimals).toFixed(
        toToken.metadata.decimals
      );
    }

    return (Number(result) / 10 ** toToken.metadata.decimals).toFixed(toToken.metadata.decimals);
  } catch (error) {
    console.error('Error calculating estimated amount:', error);
    return '0';
  }
};

// Updated helper functions using graph
export const findBestSwapPath = async (
  fromToken: any,
  toToken: any,
  fromAmount: string,
  stxAddress: string,
  hasHighExperience: boolean
): Promise<any[] | null> => {
  const graph = getGraph();
  const paths = graph.findAllPaths(fromToken.contractId, toToken.contractId, hasHighExperience);

  if (paths.length === 0) return null;

  // For single path, return immediately
  if (paths.length === 1) return paths[0];

  try {
    // Calculate amounts for all paths
    const pathAmounts = await Promise.all(
      paths.map(async path => {
        try {
          const amount = await calculateEstimatedAmountOutWithCache(
            fromAmount,
            fromToken,
            toToken,
            path,
            stxAddress,
            path.length > 2 // isMultiHop if path length > 2
          );
          return {
            path,
            amount: parseFloat(amount)
          };
        } catch (error) {
          console.warn('Error calculating amount for path:', error);
          return {
            path,
            amount: 0
          };
        }
      })
    );

    // Sort by amount in descending order and filter out failed paths
    const validPathAmounts = pathAmounts
      .filter(result => result.amount > 0)
      .sort((a, b) => b.amount - a.amount);

    // Log path comparison for debugging
    console.log(
      'Path comparison:',
      validPathAmounts.map(result => ({
        pathLength: result.path.length,
        symbols: result.path.map((token: any) => token.metadata.symbol),
        amount: result.amount
      }))
    );

    // Return the path with highest output amount, or null if no valid paths
    return validPathAmounts.length > 0 ? validPathAmounts[0].path : null;
  } catch (error) {
    console.error('Error finding best path:', error);
    // Fallback to shortest path in case of error
    return paths[0];
  }
};

export const isValidTokenPair = (fromToken: any, toToken: any, _pools: any[]): boolean => {
  if (!fromToken?.contractId || !toToken?.contractId) return false;

  const graph = getGraph();

  // Check direct pool first
  if (graph.getDirectPool(fromToken.contractId, toToken.contractId)) {
    return true;
  }

  // Then check for path
  return graph.findPath(fromToken.contractId, toToken.contractId, true) !== null;
};

// Helper function to check if a pool exists for two tokens
export const poolExists = (token0: any, token1: any, pools: any[]): boolean => {
  return pools.some(
    pool =>
      (pool.token0.metadata?.symbol === token0.metadata?.symbol &&
        pool.token1.metadata?.symbol === token1.metadata?.symbol) ||
      (pool.token1.metadata?.symbol === token0.metadata?.symbol &&
        pool.token0.metadata?.symbol === token1.metadata?.symbol)
  );
};

export const createSwapTransaction = ({
  fromToken,
  toToken,
  fromAmount,
  minimumAmountOut,
  swapPath,
  isMultiHop,
  stxAddress,
  onFinish,
  onCancel
}: any) => {
  const graph = getGraph();
  const pool = isMultiHop ? null : graph.getDirectPool(fromToken.contractId, toToken.contractId);

  const postConditions: any[] = [];
  const amountInMicroTokens = Math.floor(
    parseFloat(fromAmount) * 10 ** fromToken.metadata.decimals
  );
  const minAmountOutMicroTokens = Math.floor(
    parseFloat(minimumAmountOut) * 10 ** toToken.metadata.decimals
  );

  // Add post-condition for the initial token transfer from the user
  if (fromToken.metadata.symbol !== 'STX') {
    postConditions.push(
      Pc.principal(stxAddress)
        .willSendLte(amountInMicroTokens)
        .ft(fromToken.contractId, fromToken.audit.fungibleTokens[0].tokenIdentifier)
    );
  } else {
    postConditions.push(Pc.principal(stxAddress).willSendLte(amountInMicroTokens).ustx());
  }

  if (isMultiHop) {
    // Add post-conditions for intermediate hops
    for (let i = 1; i < swapPath.length - 1; i++) {
      const intermediateToken = swapPath[i];
      if (intermediateToken.symbol !== 'STX') {
        postConditions.push(
          Pc.principal('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.univ2-core')
            .willSendGte(1)
            .ft(
              intermediateToken.contractId,
              intermediateToken.audit.fungibleTokens[0].tokenIdentifier
            ),
          Pc.principal(stxAddress)
            .willSendGte(1)
            .ft(
              intermediateToken.contractId,
              intermediateToken.audit.fungibleTokens[0].tokenIdentifier
            )
        );
      } else {
        postConditions.push(
          Pc.principal('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.univ2-core').willSendGte(1).ustx()
        );
      }
    }
  }

  // Add post-condition for the final token transfer to the user
  if (toToken.metadata.symbol !== 'STX') {
    postConditions.push(
      Pc.principal('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.univ2-core')
        .willSendGte(minAmountOutMicroTokens)
        .ft(toToken.contractId, toToken.audit.fungibleTokens[0].tokenIdentifier)
    );
  } else {
    postConditions.push(
      Pc.principal('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.univ2-core')
        .willSendGte(minAmountOutMicroTokens)
        .ustx()
    );
  }

  console.log(postConditions);

  const contractName = isMultiHop ? 'univ2-path2' : 'univ2-router';
  const functionName = isMultiHop ? `swap-${swapPath.length}` : 'swap-exact-tokens-for-tokens';

  const functionArgs = isMultiHop
    ? [
        uintCV(amountInMicroTokens),
        uintCV(minAmountOutMicroTokens),
        ...swapPath.map((token: any) =>
          contractPrincipalCV(token.contractId.split('.')[0], token.contractId.split('.')[1])
        ),
        contractPrincipalCV('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS', 'univ2-share-fee-to')
      ]
    : [
        uintCV(pool.poolData.id),
        contractPrincipalCV(
          pool.token0.contractId.split('.')[0],
          pool.token0.contractId.split('.')[1]
        ),
        contractPrincipalCV(
          pool.token1.contractId.split('.')[0],
          pool.token1.contractId.split('.')[1]
        ),
        contractPrincipalCV(fromToken.contractId.split('.')[0], fromToken.contractId.split('.')[1]),
        contractPrincipalCV(toToken.contractId.split('.')[0], toToken.contractId.split('.')[1]),
        contractPrincipalCV('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS', 'univ2-share-fee-to'),
        uintCV(amountInMicroTokens),
        uintCV(minAmountOutMicroTokens)
      ];

  return {
    network,
    contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
    contractName,
    functionName,
    functionArgs,
    postConditionMode: PostConditionMode.Deny,
    postConditions,
    onFinish,
    onCancel
  };
};

export const calculateMinimumAmountOut = (
  estimatedAmount: string,
  slippage: number,
  decimals: number
): string => {
  const estimated = parseFloat(estimatedAmount);
  if (isNaN(estimated)) return '0';
  const minAmount = estimated * (1 - slippage / 100);
  return minAmount.toFixed(decimals);
};

export const formatUSD = (amount: number, price: number) => {
  const value = amount * price;
  // return `$${value.toFixed(2)}`;
  return value;
};
