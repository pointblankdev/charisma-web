import { describe, test } from 'vitest';
import PricesService from './prices-service';

describe('PricesService Integration Tests', () => {
  const service = PricesService.getInstance();

  // Test tokens array
  const testTokens = [
    'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.token-abtc',
    'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.brc20-ordi',
    'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token'
  ];

  test('getTokenPrice - single token price fetch', async () => {
    console.log('\nTesting getTokenPrice:');
    try {
      const price = await service.getTokenPrice(testTokens[0]);
      console.log(`Price for ${testTokens[0]}: $${price}`);
    } catch (error) {
      console.error('Error fetching single token price:', error);
    }
  });

  test('getTokenPrices - multiple token prices fetch', async () => {
    console.log('\nTesting getTokenPrices:');
    try {
      const prices = await service.getTokenPrices(testTokens);
      console.log('Prices for multiple tokens:');
      Object.entries(prices).forEach(([token, price]) => {
        console.log(`${token}: $${price}`);
      });
    } catch (error) {
      console.error('Error fetching multiple token prices:', error);
    }
  });

  test('getAllTokenPrices - fetch all prices', async () => {
    console.log('\nTesting getAllTokenPrices:');
    try {
      const allPrices = await service.getAllTokenPrices();
      console.log('All token prices:');
      const priceEntries = Object.entries(allPrices);
      console.log(`Total tokens with prices: ${priceEntries.length}`);

      // Log first 5 prices as sample
      console.log('\nFirst 5 prices:');
      priceEntries.slice(0, 5).forEach(([token, price]) => {
        console.log(`${token}: $${price}`);
      });
    } catch (error) {
      console.error('Error fetching all token prices:', error);
    }
  });

  test('getAllPools - fetch all pools', async () => {
    console.log('\nTesting getAllPools:');
    try {
      const pools = await service.getAllPools();
      if (!pools) {
        console.log('No pools data received');
        return;
      }

      console.log(`Total pools: ${pools.length}`);

      // Log first pool as sample
      if (pools.length > 0) {
        const samplePool = pools[0];
        console.log('\nSample pool data:');
        console.log({
          poolId: samplePool.poolId,
          symbol: samplePool.symbol,
          token0: {
            symbol: samplePool.token0Info.symbol,
            price: samplePool.token0Price
          },
          token1: {
            symbol: samplePool.token1Info.symbol,
            price: samplePool.token1Price
          },
          reserves: {
            token0USD: samplePool.reserve0ConvertUsd,
            token1USD: samplePool.reserve1ConvertUsd
          },
          source: samplePool.source,
          lastUpdated: samplePool.lastUpdated
        });
      }
    } catch (error) {
      console.error('Error fetching pools:', error);
    }
  });
});
