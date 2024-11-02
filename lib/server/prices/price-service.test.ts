// lib/server/prices/price.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { PriceService } from './price-service';

describe('PriceService', () => {
  describe('Price Management', () => {
    it('should get all prices', async () => {
      const prices = await PriceService.getAllPrices();

      // Test existence of key prices
      expect(prices['STX']).toBeDefined();
      expect(prices['CHA']).toBeDefined();
      expect(prices['WELSH']).toBeDefined();
      expect(prices['DOG']).toBeDefined();
      expect(prices['ORDI']).toBeDefined();

      // Test synthetic tokens match their base tokens
      expect(prices['iouWELSH']).toBe(prices['WELSH']);
      expect(prices['iouROO']).toBe(prices['ROO']);
      expect(prices['synSTX']).toBe(prices['STX']);

      // Log prices for inspection
      console.log('Current prices:', prices);
    });

    it('should calculate CHA price based on STX pool reserves', async () => {
      const prices = await PriceService.getAllPrices();

      expect(prices['CHA']).toBeGreaterThan(0);
      expect(prices['CHA']).toBeLessThan(prices['STX'] * 10); // Sanity check

      console.log('CHA price:', prices['CHA']);
      console.log('STX price:', prices['STX']);
    });

    it('should cache prices between calls', async () => {
      const firstPrices = await PriceService.getAllPrices();
      const secondPrices = await PriceService.getAllPrices();

      expect(firstPrices).toEqual(secondPrices);
    });

    // This test is useful to see all current prices in the log
    it('should log all available prices', async () => {
      const prices = await PriceService.getAllPrices();
      const sortedSymbols = Object.keys(prices).sort();

      console.log('\nCurrent prices for all tokens:');
      sortedSymbols.forEach(symbol => {
        console.log(`${symbol}: $${prices[symbol]}`);
      });

      expect(sortedSymbols.length).toBeGreaterThan(0);
    });
  });
});
