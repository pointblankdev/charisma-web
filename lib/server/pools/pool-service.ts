import { cvToValue, fetchCallReadOnlyFunction, principalCV, uintCV } from '@stacks/transactions';
import { kv } from '@vercel/kv';

export type KVPoolData = {
  id: number;
  token0Symbol: string;
  token1Symbol: string;
  volume24h: number;
  contractAddress: string;
  reserves?: {
    token0: number;
    token1: number;
    lastUpdated: number;
  };
};

// For UI with full token objects
export type PoolInfo = {
  id: number;
  token0: {
    symbol: string;
    name: string;
    image: string;
    contractAddress: string;
    tokenId?: string;
    decimals: number;
  };
  token1: {
    symbol: string;
    name: string;
    image: string;
    contractAddress: string;
    tokenId?: string;
    decimals: number;
  };
  volume24h: number;
  contractAddress: string;
  reserves?: {
    token0: number;
    token1: number;
    lastUpdated: number;
  };
};

export class PoolService {
  private static readonly POOL_KEY = 'pools';
  private static readonly RESERVES_CACHE_TIME = 30000; // 30 seconds cache

  private static async callContractFunction(
    functionName: string,
    functionArgs: any[]
  ): Promise<any> {
    const contractAddress = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS';
    const contractName = 'univ2-core';

    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress,
        contractName,
        functionName,
        functionArgs,
        senderAddress: contractAddress
      });
      return cvToValue(result);
    } catch (error) {
      console.error(`Error calling contract function ${functionName}:`, error);
      throw error;
    }
  }

  public static async lookupPool(token0Address: string, token1Address: string): Promise<any> {
    return this.callContractFunction('lookup-pool', [
      principalCV(token0Address),
      principalCV(token1Address)
    ]);
  }

  public static async getPoolReserves(poolId: number): Promise<{ token0: number; token1: number }> {
    try {
      const pool = await this.getPool(poolId);
      if (pool) {
        return {
          token0: Number(pool.reserve0),
          token1: Number(pool.reserve1)
        };
      }
      return { token0: 0, token1: 0 };
    } catch (error) {
      console.error('Error fetching reserves:', error);
      return { token0: 0, token1: 0 };
    }
  }

  public static async getPool(id: number): Promise<any> {
    const response = await this.callContractFunction('get-pool', [uintCV(id)]);
    return {
      lpToken: response.value['lp-token'].value,
      token0: response.value.token0.value,
      token1: response.value.token1.value,
      reserve0: response.value.reserve0.value,
      reserve1: response.value.reserve1.value,
      symbol: response.value.symbol.value
    };
  }

  static async clear(): Promise<void> {
    await kv.del(this.POOL_KEY);
  }

  // Updated to optionally include reserves
  static async getAll(withReserves = false): Promise<KVPoolData[]> {
    const pools = (await kv.get<KVPoolData[]>(this.POOL_KEY)) || [];

    if (!withReserves) {
      return pools;
    }

    // Update reserves for all pools
    return await this.getAllWithReserves(pools);
  }

  private static async getAllWithReserves(pools: KVPoolData[]): Promise<KVPoolData[]> {
    return await Promise.all(
      pools.map(async pool => {
        // Check if reserves are fresh enough
        if (pool.reserves && Date.now() - pool.reserves.lastUpdated < this.RESERVES_CACHE_TIME) {
          return pool;
        }

        try {
          const reserves = await this.getPoolReserves(pool.id);
          return {
            ...pool,
            reserves: {
              token0: reserves.token0,
              token1: reserves.token1,
              lastUpdated: Date.now()
            }
          };
        } catch (error) {
          console.error(`Error fetching reserves for pool ${pool.id}:`, error);
          return pool;
        }
      })
    );
  }

  static async set(pools: KVPoolData[]): Promise<void> {
    await kv.set(this.POOL_KEY, pools);
  }

  // New method to update reserves for specific pools
  static async updateReserves(poolIds: number[]): Promise<void> {
    const pools = await this.getAll();
    const updatedPools = await Promise.all(
      pools.map(async pool => {
        if (!poolIds.includes(pool.id)) {
          return pool;
        }

        try {
          const reserves = await this.getPoolReserves(pool.id);
          return {
            ...pool,
            reserves: {
              token0: reserves.token0,
              token1: reserves.token1,
              lastUpdated: Date.now()
            }
          };
        } catch (error) {
          console.error(`Error updating reserves for pool ${pool.id}:`, error);
          return pool;
        }
      })
    );

    await this.set(updatedPools);
  }

  // New method to check if reserves need updating
  static checkReserves(pool: KVPoolData): boolean {
    return !pool.reserves || Date.now() - pool.reserves.lastUpdated > this.RESERVES_CACHE_TIME;
  }

  // Usage example for UI components
  static async getPoolsWithReserves(
    options: {
      poolIds?: number[];
      forceUpdate?: boolean;
    } = {}
  ): Promise<KVPoolData[]> {
    const { poolIds, forceUpdate = false } = options;
    const pools = await this.getAll();

    // Filter pools if poolIds provided
    const targetPools = poolIds ? pools.filter(p => poolIds.includes(p.id)) : pools;

    // Check which pools need reserve updates
    const poolsToUpdate = await Promise.all(
      targetPools.map(pool => ({
        pool,
        needsUpdate: forceUpdate || this.checkReserves(pool)
      }))
    );

    // Update reserves where needed
    const updatedPools = await Promise.all(
      poolsToUpdate.map(async ({ pool, needsUpdate }) => {
        if (!needsUpdate) return pool;

        try {
          const reserves = await this.getPoolReserves(pool.id);
          return {
            ...pool,
            reserves: {
              token0: reserves.token0,
              token1: reserves.token1,
              lastUpdated: Date.now()
            }
          };
        } catch (error) {
          console.error(`Error updating reserves for pool ${pool.id}:`, error);
          return pool;
        }
      })
    );

    return updatedPools;
  }
}
