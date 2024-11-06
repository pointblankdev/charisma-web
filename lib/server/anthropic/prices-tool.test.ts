import { describe, it, expect, beforeEach } from 'vitest';
import { SmartAnthropicClient } from './client';
import { toolRegistry } from './tool-registry';
import { pricesQueryTool } from './prices-tool';
import { KVTokenData, TokenService } from '../tokens/token-service';
import PricesService from '@lib/prices-service';
import { PoolService } from '../pools/pool-service';

describe('Prices Query Tool Tests', () => {
  let client: SmartAnthropicClient;
  let tokens: KVTokenData[];
  const timeout = 30000;

  beforeEach(async () => {
    client = new SmartAnthropicClient();
    toolRegistry.registerTool(pricesQueryTool);
    tokens = await TokenService.getAll();
    // Update prices at start of each test
    await PricesService.updateAllTokenPrices();
    await PricesService.updateAllLpTokenPrices();
  });

  it(
    'should get individual token prices',
    async () => {
      // Test a variety of token types
      const testTokens = ['WELSH', 'DOG', 'STX', 'CHA', 'iouWELSH'];

      for (const symbol of testTokens) {
        const response = await pricesQueryTool.handler!({
          operation: 'get_token_price',
          symbol
        });

        // Verify response structure
        expect(response.symbol).toBe(symbol);
        expect(response.price).toBeGreaterThan(0);
        expect(response.timestamp).toBeLessThanOrEqual(Date.now());

        console.log(`${symbol} Price:`, {
          price: response.price,
          timestamp: new Date(response.timestamp).toISOString()
        });
      }
    },
    timeout
  );

  it(
    'should get LP token prices',
    async () => {
      // Get LP tokens from token service
      const lpTokens = tokens.filter(t => t.isLpToken && t.poolId);

      for (const lpToken of lpTokens) {
        const response = await pricesQueryTool.handler!({
          operation: 'get_lp_price',
          poolId: lpToken.poolId!
        });

        // Verify response structure
        expect(response.poolId).toBe(lpToken.poolId);
        expect(response.price).toBeGreaterThan(0);
        expect(response.timestamp).toBeLessThanOrEqual(Date.now());

        // Get underlying token prices for comparison
        const pool = await PoolService.getPool(lpToken.poolId!);
        const token0Symbol = pool.symbol.split('-')[0];
        const token1Symbol = pool.symbol.split('-')[1];
        const prices = await PricesService.getAllTokenPrices();

        console.log(`${lpToken.symbol} Analysis:`, {
          lpPrice: response.price,
          underlyingPrices: {
            [token0Symbol]: prices[token0Symbol],
            [token1Symbol]: prices[token1Symbol]
          },
          timestamp: new Date(response.timestamp).toISOString()
        });
      }
    },
    timeout
  );

  it(
    'should get all token prices and verify relationships',
    async () => {
      const response = await pricesQueryTool.handler!({
        operation: 'get_all_prices'
      });

      const prices = response.prices;

      // Verify we have prices for all tokens
      for (const token of tokens) {
        expect(prices[token.symbol]).toBeDefined();
      }

      // Verify synthetic token relationships
      const synthPairs = [
        ['WELSH', 'iouWELSH'],
        ['ROO', 'iouROO'],
        ['STX', 'synSTX']
      ];

      for (const [baseSymbol, synthSymbol] of synthPairs) {
        const basePrice = prices[baseSymbol];
        const synthPrice = prices[synthSymbol];

        console.log(`${baseSymbol} vs ${synthSymbol}:`, {
          basePrice,
          synthPrice,
          difference: (Math.abs(basePrice - synthPrice) / basePrice) * 100
        });

        // Prices should be reasonably close (within 5%)
        expect(Math.abs(basePrice - synthPrice) / basePrice).toBeLessThan(0.05);
      }

      // Log timestamp and total tokens priced
      console.log('Price Update Info:', {
        totalTokens: Object.keys(prices).length,
        timestamp: new Date(response.timestamp).toISOString(),
        topPrices: Object.entries(prices)
          .sort(([, a], [, b]) => (b as any) - (a as any))
          .slice(0, 5)
          .reduce((acc, [symbol, price]) => ({ ...acc, [symbol]: price }), {})
      });
    },
    timeout
  );

  it(
    'should handle UPDOG price calculation correctly',
    async () => {
      // Get UPDOG price both ways
      const updogDirect = await pricesQueryTool.handler!({
        operation: 'get_token_price',
        symbol: 'UPDOG'
      });

      const updog = tokens.find(t => t.symbol === 'UPDOG');
      if (!updog?.poolId) throw new Error('UPDOG token not found');

      const updogLp = await pricesQueryTool.handler!({
        operation: 'get_lp_price',
        poolId: updog.poolId
      });

      // Get underlying token prices
      const allPrices = await PricesService.getAllTokenPrices();
      const welshPrice = allPrices.WELSH;
      const dogPrice = allPrices.DOG;

      // Get pool reserves
      const reserves = await PricesService.getPoolReserves(updog.poolId);

      console.log('UPDOG Price Analysis:', {
        directPrice: updogDirect.price,
        lpCalculated: updogLp.price,
        underlying: {
          WELSH: {
            price: welshPrice,
            reserve: reserves.token0
          },
          DOG: {
            price: dogPrice,
            reserve: reserves.token1
          }
        },
        difference: (Math.abs(updogDirect.price - updogLp.price) / updogDirect.price) * 100
      });

      // Prices should match within 1%
      expect(Math.abs(updogDirect.price - updogLp.price) / updogDirect.price).toBeLessThan(0.01);
    },
    timeout
  );

  it(
    'should handle errors appropriately',
    async () => {
      // Test invalid symbol
      await expect(
        pricesQueryTool.handler!({
          operation: 'get_token_price',
          symbol: 'INVALID'
        })
      ).rejects.toThrow(/Price not found/);

      // Test missing required parameters
      await expect(
        pricesQueryTool.handler!({
          operation: 'get_token_price'
        })
      ).rejects.toThrow(/Symbol required/);

      await expect(
        pricesQueryTool.handler!({
          operation: 'get_lp_price'
        })
      ).rejects.toThrow(/Pool ID required/);

      // Test invalid pool ID
      await expect(
        pricesQueryTool.handler!({
          operation: 'get_lp_price',
          poolId: 99999
        })
      ).rejects.toThrow(/Pool not found/);
    },
    timeout
  );
});
