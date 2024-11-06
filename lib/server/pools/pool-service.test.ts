// lib/server/pools/pool.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { KVPoolData, PoolService } from './pool-service';

describe('PoolService', () => {
  const poolData: KVPoolData[] = [
    {
      id: 1,
      token0Symbol: 'WELSH',
      token1Symbol: 'iouWELSH',
      volume24h: 0,
      contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.welsh-iouwelsh'
    },
    {
      id: 2,
      token0Symbol: 'ROO',
      token1Symbol: 'iouROO',
      volume24h: 0,
      contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.roo-iouroo'
    },
    {
      id: 3,
      token0Symbol: 'CHA',
      token1Symbol: 'WELSH',
      volume24h: 0,
      contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.cha-welsh'
    },
    {
      id: 4,
      token0Symbol: 'STX',
      token1Symbol: 'CHA',
      volume24h: 0,
      contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wstx-cha'
    },
    {
      id: 5,
      token0Symbol: 'CHA',
      token1Symbol: 'iouWELSH',
      volume24h: 0,
      contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.cha-iouwelsh'
    },
    {
      id: 6,
      token0Symbol: 'CHA',
      token1Symbol: 'ORDI',
      volume24h: 0,
      contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.cha-ordi'
    },
    {
      id: 7,
      token0Symbol: 'CHA',
      token1Symbol: 'ROO',
      volume24h: 0,
      contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.cha-roo'
    },
    {
      id: 8,
      token0Symbol: 'WELSH',
      token1Symbol: 'DOG',
      volume24h: 0,
      contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.up-dog'
    },
    {
      id: 9,
      token0Symbol: 'CHA',
      token1Symbol: 'UPDOG',
      volume24h: 0,
      contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.cha-updog'
    },
    {
      id: 10,
      token0Symbol: 'STX',
      token1Symbol: 'synSTX',
      volume24h: 0,
      contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wstx-synstx'
    }
  ];

  beforeEach(async () => {
    // await PoolService.clear();
  });

  describe('Pool Management', () => {
    it('should get all pools', async () => {
      const pools = await PoolService.getAll(true);
      console.log(pools);
    });

    it('should set all pools', async () => {
      await PoolService.set(poolData);
      const pools = await PoolService.getAll();
      expect(pools).toHaveLength(poolData.length);
      expect(pools).toEqual(poolData);
    });
  });

  describe('Database Seeding', () => {
    it('should seed database with pools', async () => {
      await PoolService.set(poolData);
      const pools = await PoolService.getAll();
      expect(pools).toHaveLength(poolData.length);

      // Verify a few specific pools
      const chaWelsh = pools.find(p => p.id === 3);
      expect(chaWelsh).toBeDefined();
      expect(chaWelsh?.token0Symbol).toBe('CHA');
      expect(chaWelsh?.token1Symbol).toBe('WELSH');
      expect(chaWelsh?.contractAddress).toBe('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.cha-welsh');
    });
  });
});
