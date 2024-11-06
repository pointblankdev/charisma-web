import { describe, it, expect, beforeEach } from 'vitest';
import { dexTools } from './dex-tools';
import { toolRegistry } from './tool-registry';
import { KVPoolData, PoolService } from '../pools/pool-service';
import { KVTokenData, TokenService } from '../tokens/token-service';

describe('DEX Tools Live Tests', () => {
  let pools: KVPoolData[];
  let tokens: KVTokenData[];
  let DOG_CONTRACT: string;
  let WELSH_CONTRACT: string;
  let UPDOG_CONTRACT: string;
  const timeout = 30000;

  beforeEach(async () => {
    // Get real pool and token data
    pools = await PoolService.getAll();
    tokens = await TokenService.getAll();

    // Get contract addresses for test tokens
    const dogToken = tokens.find(t => t.symbol === 'DOG');
    const welshToken = tokens.find(t => t.symbol === 'WELSH');
    const updogToken = tokens.find(t => t.symbol === 'UPDOG');

    if (!dogToken || !welshToken || !updogToken) {
      throw new Error('Test tokens not found');
    }

    DOG_CONTRACT = dogToken.contractAddress;
    WELSH_CONTRACT = welshToken.contractAddress;
    UPDOG_CONTRACT = updogToken.contractAddress;
  });

  describe('Query Tool Tests', () => {
    it(
      'should get pool information',
      async () => {
        // Use WELSH-DOG pool since we know it exists and is referenced by UPDOG
        const updogToken = tokens.find(t => t.symbol === 'UPDOG');
        if (!updogToken?.poolId) throw new Error('UPDOG token or poolId not found');

        const result = await dexTools.queryTool.handler!({
          operation: 'get_pool',
          poolId: updogToken.poolId
        });

        // Verify the pool data structure
        expect(result).toBeDefined();
        expect(result.token0).toBeDefined();
        expect(result.token1).toBeDefined();
        expect(result['lp-token']).toBeDefined();
        expect(result.reserve0).toBeDefined();
        expect(result.reserve1).toBeDefined();
        expect(result['swap-fee']).toBeDefined();

        console.log('Pool Info:', {
          poolId: updogToken.poolId,
          token0: result.token0.value,
          token1: result.token1.value,
          lpToken: result['lp-token'].value,
          reserve0: result.reserve0.value,
          reserve1: result.reserve1.value,
          swapFee: {
            num: result['swap-fee'].value.num.value,
            den: result['swap-fee'].value.den.value
          }
        });
      },
      timeout
    );

    it(
      'should get pool reserves',
      async () => {
        // Use UPDOG's referenced pool
        const updogToken = tokens.find(t => t.symbol === 'UPDOG');
        if (!updogToken?.poolId) throw new Error('UPDOG token or poolId not found');

        const result = await dexTools.queryTool.handler!({
          operation: 'get_reserves',
          poolId: updogToken.poolId
        });

        expect(result.reserve0).toBeGreaterThan(0);
        expect(result.reserve1).toBeGreaterThan(0);

        console.log('Pool Reserves:', result);
      },
      timeout
    );

    it(
      'should calculate amounts out for WELSH to DOG swap',
      async () => {
        const updogToken = tokens.find(t => t.symbol === 'UPDOG');
        if (!updogToken?.poolId) throw new Error('UPDOG token or poolId not found');

        const welshToken = tokens.find(t => t.symbol === 'WELSH');
        const dogToken = tokens.find(t => t.symbol === 'DOG');
        if (!welshToken || !dogToken) throw new Error('Tokens not found');

        // Calculate output for 1000 WELSH
        const amountIn = 1000 * Math.pow(10, welshToken.decimals);

        const result = await dexTools.queryTool.handler!({
          operation: 'get_amounts_out',
          poolId: updogToken.poolId,
          tokenIn: WELSH_CONTRACT,
          tokenOut: DOG_CONTRACT,
          amountIn
        });

        expect(result).toBeDefined();
        expect(Number(result)).toBeGreaterThan(0);

        // Calculate human readable amount
        const amountOut = Number(result) / Math.pow(10, dogToken.decimals);

        console.log('Swap Calculation:', {
          amountInHuman: 1000,
          amountIn,
          amountOutHuman: amountOut,
          amountOut: result
        });
      },
      timeout
    );

    it(
      'should get direct quote between WELSH and DOG',
      async () => {
        const updogToken = tokens.find(t => t.symbol === 'UPDOG');
        if (!updogToken?.poolId) throw new Error('UPDOG token or poolId not found');

        const welshToken = tokens.find(t => t.symbol === 'WELSH');
        const dogToken = tokens.find(t => t.symbol === 'DOG');
        if (!welshToken || !dogToken) throw new Error('Tokens not found');

        // Get quote for 1000 WELSH
        const amountIn = 1000 * Math.pow(10, welshToken.decimals);

        const result = await dexTools.queryTool.handler!({
          operation: 'quote',
          poolId: updogToken.poolId,
          tokenIn: WELSH_CONTRACT,
          tokenOut: DOG_CONTRACT,
          amountIn
        });

        expect(result).toBeDefined();
        expect(Number(result)).toBeGreaterThan(0);

        // Calculate human readable quote
        const quoteAmount = Number(result) / Math.pow(10, dogToken.decimals);
        const rate = quoteAmount / 1000; // DOG per WELSH

        console.log('Quote Result:', {
          amountInHuman: 1000,
          amountIn,
          quoteAmountHuman: quoteAmount,
          quoteAmount: result,
          rate: `1 WELSH = ${rate} DOG`
        });
      },
      timeout
    );

    it(
      'should verify UPDOG composition matches pool reserves',
      async () => {
        const updogToken = tokens.find(t => t.symbol === 'UPDOG');
        if (!updogToken?.poolId) throw new Error('UPDOG token or poolId not found');

        // Get both UPDOG's referenced pool and any pools where UPDOG is traded
        const underlyingPool = await dexTools.queryTool.handler!({
          operation: 'get_pool',
          poolId: updogToken.poolId
        });

        // Find pools where UPDOG is traded
        const updogPools = pools.filter(
          p => p.token0Symbol === 'UPDOG' || p.token1Symbol === 'UPDOG'
        );

        // Get reserves for each UPDOG trading pool
        const updogTradeReserves = await Promise.all(
          updogPools.map(async pool => ({
            poolId: pool.id,
            reserves: await dexTools.queryTool.handler!({
              operation: 'get_reserves',
              poolId: pool.id
            })
          }))
        );

        console.log('UPDOG Analysis:', {
          underlyingPool: {
            token0: underlyingPool.token0.value,
            token1: underlyingPool.token1.value,
            reserve0: underlyingPool.reserve0.value,
            reserve1: underlyingPool.reserve1.value
          },
          tradingPools: updogTradeReserves
        });

        // Verify the data
        expect(underlyingPool.reserve0.value).toBeDefined();
        expect(underlyingPool.reserve1.value).toBeDefined();
        updogTradeReserves.forEach(poolReserves => {
          expect(poolReserves.reserves.reserve0).toBeGreaterThan(0);
          expect(poolReserves.reserves.reserve1).toBeGreaterThan(0);
        });
      },
      timeout
    );
  });
});
