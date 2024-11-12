import { describe, expect, test } from 'vitest';
import { DexClient, DexClientError, DexProvider } from './pools.client';

// Initialize client - update URL to match your test environment
const client = new DexClient();
const velarClient = new DexClient('VELAR' as DexProvider);

// Known valid test data - update these with real values from your DEX
const TEST_DATA = {
  VALID_POOL_ID: '1',
  TOKEN0: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wstx',
  TOKEN1: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token',
  AMOUNT: '1000000', // Example amount as string
  LIQUIDITY_TOKENS: '100000'
};

describe('DexClient Integration Tests', () => {
  // Pool Information Tests

  test('getNumberOfPools returns total pool count', async () => {
    const count = await velarClient.getNumberOfPools();
    console.log(count);
  });

  test('getPoolById returns valid pool data', async () => {
    const pool = await client.getPoolById('13');
    console.log(pool);
    expect(pool).toMatchObject({
      id: expect.any(String),
      token0: expect.any(String),
      token1: expect.any(String),
      reserve0: expect.any(String),
      reserve1: expect.any(String),
      totalSupply: expect.any(String),
      swapFee: {
        numerator: expect.any(Number),
        denominator: expect.any(Number)
      }
    });
  });

  test('getPool returns pool by token addresses', async () => {
    const pool = await client.getPool(TEST_DATA.TOKEN0, TEST_DATA.TOKEN1);
    expect(pool).toMatchObject({
      id: expect.any(String),
      token0: expect.any(String),
      token1: expect.any(String),
      reserve0: expect.any(String),
      reserve1: expect.any(String),
      totalSupply: expect.any(String),
      swapFee: {
        numerator: expect.any(Number),
        denominator: expect.any(Number)
      }
    });
  });

  test('getPools returns multiple pools', async () => {
    const pools = await client.getPools(['13']);
    console.log(pools);
    expect(Array.isArray(pools)).toBe(true);
    expect(pools.length).toBeGreaterThan(0);
    expect(pools[0]).toMatchObject({
      id: expect.any(String),
      token0: expect.any(String),
      token1: expect.any(String)
    });
  });

  // Trading Tests

  test('getSwapQuote returns valid quote', async () => {
    const quote = await client.getSwapQuote(TEST_DATA.TOKEN0, TEST_DATA.TOKEN1, TEST_DATA.AMOUNT);
    expect(quote).toMatchObject({
      path: expect.any(Array),
      amountIn: expect.any(String),
      amountOut: expect.any(String),
      priceImpact: expect.any(Number)
    });
  });

  test('getSwapQuoteForExactOutput returns valid quote', async () => {
    const quote = await client.getSwapQuoteForExactOutput(
      TEST_DATA.TOKEN0,
      TEST_DATA.TOKEN1,
      TEST_DATA.AMOUNT
    );
    expect(quote).toMatchObject({
      path: expect.any(Array),
      amountIn: expect.any(String),
      amountOut: expect.any(String),
      priceImpact: expect.any(Number)
    });
  });

  test('getMultiHopQuote returns valid quote', async () => {
    const quote = await client.getMultiHopQuote(
      [TEST_DATA.TOKEN0, TEST_DATA.TOKEN1],
      TEST_DATA.AMOUNT
    );
    expect(quote).toMatchObject({
      path: expect.any(Array),
      amountIn: expect.any(String),
      amountOut: expect.any(String),
      priceImpact: expect.any(Number)
    });
  });

  test('getMultiHopQuoteForExactOutput returns valid quote', async () => {
    const quote = await client.getMultiHopQuoteForExactOutput(
      [TEST_DATA.TOKEN0, TEST_DATA.TOKEN1],
      TEST_DATA.AMOUNT
    );
    expect(quote).toMatchObject({
      path: expect.any(Array),
      amountIn: expect.any(String),
      amountOut: expect.any(String),
      priceImpact: expect.any(Number)
    });
  });

  test('batchGetQuotes returns multiple quotes', async () => {
    const quotes = await client.batchGetQuotes(
      [[TEST_DATA.TOKEN0, TEST_DATA.TOKEN1]],
      TEST_DATA.AMOUNT
    );
    expect(Array.isArray(quotes)).toBe(true);
    expect(quotes.length).toBeGreaterThan(0);
    expect(quotes[0]).toMatchObject({
      path: expect.any(Array),
      amountIn: expect.any(String),
      amountOut: expect.any(String),
      priceImpact: expect.any(Number)
    });
  });

  // Liquidity Tests

  test('getLiquidityQuote returns valid quote', async () => {
    const quote = await client.getLiquidityQuote(
      TEST_DATA.VALID_POOL_ID,
      TEST_DATA.AMOUNT,
      TEST_DATA.AMOUNT
    );
    expect(quote).toMatchObject({
      poolId: expect.any(String),
      token0Amount: expect.any(String),
      token1Amount: expect.any(String),
      liquidityTokens: expect.any(String),
      shareOfPool: expect.any(Number)
    });
  });

  test('calculateLiquidityTokens returns token amount', async () => {
    const result = await client.calculateLiquidityTokens(
      TEST_DATA.VALID_POOL_ID,
      TEST_DATA.AMOUNT,
      TEST_DATA.AMOUNT
    );
    expect(result).toMatchObject({
      poolId: expect.any(String),
      token0Amount: expect.any(String),
      token1Amount: expect.any(String),
      liquidityTokens: expect.any(String),
      shareOfPool: expect.any(Number)
    });
  });

  test('batchGetLiquidityQuotes returns multiple quotes', async () => {
    const quotes = await client.batchGetLiquidityQuotes([
      {
        poolId: TEST_DATA.VALID_POOL_ID,
        desiredAmount0: TEST_DATA.AMOUNT,
        desiredAmount1: TEST_DATA.AMOUNT
      }
    ]);
    expect(Array.isArray(quotes)).toBe(true);
    expect(quotes.length).toBeGreaterThan(0);
    expect(quotes[0]).toMatchObject({
      poolId: expect.any(String),
      token0Amount: expect.any(String),
      token1Amount: expect.any(String),
      liquidityTokens: expect.any(String),
      shareOfPool: expect.any(Number)
    });
  });

  // Removal Tests

  test('getRemoveLiquidityQuote returns valid quote', async () => {
    const quote = await client.getRemoveLiquidityQuote(
      TEST_DATA.VALID_POOL_ID,
      TEST_DATA.LIQUIDITY_TOKENS
    );
    expect(quote).toMatchObject({
      token0Amount: expect.any(String),
      token1Amount: expect.any(String),
      shareOfPool: expect.any(Number)
    });
  });

  test('getRemoveLiquidityRangeQuotes returns multiple quotes', async () => {
    const quotes = await client.getRemoveLiquidityRangeQuotes(
      TEST_DATA.VALID_POOL_ID,
      TEST_DATA.LIQUIDITY_TOKENS
    );
    expect(Array.isArray(quotes)).toBe(true);
    expect(quotes.length).toBeGreaterThan(0);
    expect(quotes[0]).toMatchObject({
      token0Amount: expect.any(String),
      token1Amount: expect.any(String),
      shareOfPool: expect.any(Number),
      percentage: expect.any(Number)
    });
  });

  test('batchGetRemoveLiquidityQuotes returns multiple quotes', async () => {
    const quotes = await client.batchGetRemoveLiquidityQuotes([
      {
        poolId: TEST_DATA.VALID_POOL_ID,
        liquidityTokens: TEST_DATA.LIQUIDITY_TOKENS
      }
    ]);
    expect(Array.isArray(quotes)).toBe(true);
    expect(quotes.length).toBeGreaterThan(0);
    expect(quotes[0]).toMatchObject({
      token0Amount: expect.any(String),
      token1Amount: expect.any(String),
      shareOfPool: expect.any(Number)
    });
  });

  // Error Cases

  test('invalid pool ID throws DexClientError', async () => {
    await expect(client.getPoolById('999999')).rejects.toThrow(DexClientError);
  });

  test('invalid token addresses throw DexClientError', async () => {
    await expect(client.getPool('invalid.token1', 'invalid.token2')).rejects.toThrow(
      DexClientError
    );
  });

  test('zero amount throws DexClientError', async () => {
    await expect(client.getSwapQuote(TEST_DATA.TOKEN0, TEST_DATA.TOKEN1, '0')).rejects.toThrow(
      DexClientError
    );
  });
});
