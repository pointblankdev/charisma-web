import {
  contractPrincipalCV,
  Pc,
  PostConditionMode,
  uintCV,
  cvToValue,
  listCV,
  bufferCV,
  someCV,
  optionalCVOf,
  tupleCV
} from '@stacks/transactions';
import { fetchCallReadOnlyFunction } from '@stacks/transactions';
import { network } from '@components/stacks-session/connect';
import { getGraph, SwapGraph } from './swap-graph-dexterity';
import { uniqBy } from 'lodash';
import { hexToBytes } from '@stacks/common';

// Helper to determine if path exists and get pool info
function getPoolFromGraph(fromToken: string, toToken: string, graph: SwapGraph) {
  // Get node from graph
  const node = graph.nodes.get(fromToken);
  if (!node) return null;

  // Get connection to target token
  const connection = node.connections.get(toToken);
  if (!connection) return null;

  return connection.pool;
}

// Helper to create hop tuple
function createHopTuple(pool: any, isAToB: boolean) {
  return tupleCV({
    pool: contractPrincipalCV(pool.contractId.split('.')[0], pool.contractId.split('.')[1]),
    opcode: optionalCVOf(bufferCV(hexToBytes(isAToB ? '00' : '01')))
  });
}

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
const amountCache = new Map<string, { amounts: any[]; timestamp: number }>();

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
  stxAddress: string
): Promise<any[]> => {
  const cacheKey = getAmountCacheKey(fromAmount, fromToken, toToken, swapPath);
  const now = Date.now();

  // Check cache
  const cached = amountCache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_DURATION) {
    console.log('Cache hit for amount calculation:', cacheKey);
    return cached.amounts;
  }

  // Calculate if not in cache or expired
  const amounts = await calculateEstimatedAmountOut(
    fromAmount,
    fromToken,
    toToken,
    swapPath,
    stxAddress
  );

  // Update cache
  amountCache.set(cacheKey, {
    amounts,
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

  return amounts;
};

export const calculateEstimatedAmountOut = async (
  fromAmount: string,
  fromToken: any,
  toToken: any,
  swapPath: any[],
  stxAddress: string
): Promise<any[]> => {
  if (!fromAmount || isNaN(parseFloat(fromAmount))) return [];

  const graph = getGraph();
  let currentAmount = BigInt(
    Math.floor(parseFloat(fromAmount) * 10 ** fromToken.metadata.decimals)
  );
  const results = [];

  try {
    // Process each hop in the path
    for (let i = 0; i < swapPath.length - 1; i++) {
      const currentToken = swapPath[i];
      const nextToken = swapPath[i + 1];

      // Get pool from graph
      const pool = getPoolFromGraph(currentToken.contractId, nextToken.contractId, graph);
      if (!pool)
        throw new Error(
          `No pool found between ${currentToken.metadata.symbol} and ${nextToken.metadata.symbol}`
        );

      // Determine direction
      const isAToB = pool.token0.contractId === currentToken.contractId;

      // Get quote from pool
      const response = await fetchCallReadOnlyFunction({
        contractAddress: pool.contractId.split('.')[0],
        contractName: pool.contractId.split('.')[1],
        functionName: 'quote',
        functionArgs: [
          uintCV(currentAmount),
          optionalCVOf(bufferCV(hexToBytes(isAToB ? '00' : '01')))
        ],
        senderAddress: stxAddress
      });

      const result = cvToValue(response).value;
      results.push(result);
      currentAmount = BigInt(result.dy.value);
    }

    console.log('Amounts:', results);

    // Return final amount
    return results;
  } catch (error) {
    console.error('Error calculating quote:', error);
    return [];
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
  const paths = graph.findAllPaths(fromToken?.contractId, toToken?.contractId, hasHighExperience);

  if (paths.length === 0) return null;

  // For single path, return immediately
  if (paths.length === 1) return paths[0];

  try {
    // Calculate amounts for all paths
    const pathAmounts = await Promise.all(
      paths.map(async path => {
        try {
          const amounts = await calculateEstimatedAmountOutWithCache(
            fromAmount,
            fromToken,
            toToken,
            path,
            stxAddress
          );
          return {
            path,
            amount: parseFloat(amounts[amounts.length - 1].dy.value)
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

export const createSwapTransaction = async ({
  fromAmount,
  swapPath,
  onFinish,
  stxAddress,
  slippage
}: any) => {
  const graph = getGraph();
  const functionName = `swap-${swapPath.length - 1}`;

  // Get quotes first to determine amounts for each hop
  const results = await calculateEstimatedAmountOut(
    fromAmount,
    swapPath[0],
    swapPath[swapPath.length - 1],
    swapPath,
    stxAddress
  );

  // Create hop tuples and gather pools with quote results
  const hops = swapPath.slice(0, -1).map((token: any, index: number) => {
    const nextToken = swapPath[index + 1];
    const pool = getPoolFromGraph(token.contractId, nextToken.contractId, graph);
    if (!pool)
      throw new Error(
        `No pool found between ${token.metadata.symbol} and ${nextToken.metadata.symbol}`
      );

    const isAToB = pool.token0.contractId === token.contractId;

    return {
      tuple: createHopTuple(pool, isAToB),
      pool,
      fromToken: token,
      toToken: nextToken,
      quoteResult: results[index] // Add quote result
    };
  });

  // Calculate amount in micro tokens
  const amountInMicroTokens = Math.floor(
    parseFloat(fromAmount) * 10 ** swapPath[0].metadata.decimals
  );

  // Create post conditions
  const postConditions: any = [];

  // Add pool contract transfers for each hop
  hops.forEach((hop: any, index: number) => {
    const { pool, fromToken, toToken, quoteResult } = hop;
    const poolPrincipal = pool.contractId;

    // Get expected amounts from quote
    const inputAmount = index === 0 ? amountInMicroTokens : hops[index - 1].quoteResult.dy.value;
    const outputAmount = quoteResult.dy.value;

    // Pool receives token from sender (first hop) or previous pool
    if (fromToken.metadata.symbol !== 'STX') {
      postConditions.push(
        Pc.principal(stxAddress)
          .willSendLte(inputAmount)
          .ft(fromToken.contractId, fromToken.metadata.identifier)
      );
    } else {
      postConditions.push(Pc.principal(stxAddress).willSendLte(inputAmount).ustx());
    }

    const outputWithSlippage = Math.floor(outputAmount * (1 - slippage / 100));
    // Pool sends token to next recipient (final recipient or next pool)
    if (toToken.metadata.symbol !== 'STX') {
      postConditions.push(
        Pc.principal(poolPrincipal)
          .willSendGte(outputWithSlippage)
          .ft(toToken.contractId, toToken.metadata.identifier)
      );
    } else {
      postConditions.push(Pc.principal(poolPrincipal).willSendGte(outputWithSlippage).ustx());
    }
  });

  // Remove duplicates while preserving order
  const uniqueConditions = uniqBy(postConditions, JSON.stringify);

  return {
    network,
    contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
    contractName: 'multihop',
    functionName,
    functionArgs: [uintCV(amountInMicroTokens), ...hops.map((h: any) => h.tuple)],
    postConditionMode: PostConditionMode.Deny,
    postConditions: uniqueConditions,
    onFinish
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
