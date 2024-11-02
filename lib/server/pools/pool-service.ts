import { cvToValue, fetchCallReadOnlyFunction, principalCV, uintCV } from '@stacks/transactions';
import { kv } from '@vercel/kv';

export type KVPoolData = {
  id: number;
  token0Symbol: string;
  token1Symbol: string;
  volume24h: number;
  contractAddress: string;
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
};

export class PoolService {
  private static readonly POOL_KEY = 'pools';

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

  private static async getPool(id: number): Promise<any> {
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

  static async getAll(): Promise<KVPoolData[]> {
    return (await kv.get<KVPoolData[]>(this.POOL_KEY)) || [];
  }

  static async set(pools: KVPoolData[]): Promise<void> {
    await kv.set(this.POOL_KEY, pools);
  }
}
