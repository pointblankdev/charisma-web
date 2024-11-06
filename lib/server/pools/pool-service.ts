import { cvToValue, fetchCallReadOnlyFunction, uintCV } from '@stacks/transactions';
import { kv } from '@vercel/kv';
import { TokenInfo, TokenService } from '@lib/server/tokens/token-service';
import { getTokenImage, getTokenName, getTotalSupply } from '@lib/stacks-api';

export type KVPoolData = {
  id: number;
  token0Symbol: string;
  token1Symbol: string;
  contractAddress: string;
};

export type PoolInfo = {
  id: number;
  name: string;
  symbol: string;
  image: string;
  token0: TokenInfo;
  token1: TokenInfo;
  reserves: {
    token0: number;
    token1: number;
  };
  tvl: number;
  contractAddress: string;
  totalLpSupply: number;
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

  private static async calculateTVL(
    reserves: { token0: number; token1: number },
    token0: TokenInfo,
    token1: TokenInfo
  ): Promise<number> {
    return (
      (reserves.token0 / 10 ** token0.decimals) * (token0.price || 0) +
      (reserves.token1 / 10 ** token1.decimals) * (token1.price || 0)
    );
  }

  public static async getEnrichedPools(): Promise<PoolInfo[]> {
    // Get base pool data and enriched tokens
    const [poolsData, enrichedTokens] = await Promise.all([
      this.getAll(),
      TokenService.getAllWithPrices()
    ]);

    // Enrich pool data with token details, reserves, and TVL
    const enrichedPools: PoolInfo[] = await Promise.all(
      poolsData.map(async pool => {
        const token0 = enrichedTokens.find(t => t.symbol === pool.token0Symbol);
        const token1 = enrichedTokens.find(t => t.symbol === pool.token1Symbol);

        if (!token0 || !token1) {
          throw new Error(`Token not found for pool ${pool.id}`);
        }

        // Get on-chain data
        const poolData = await this.getPool(pool.id);
        const totalLpSupply = await getTotalSupply(pool.contractAddress);

        const reserves = {
          token0: Number(poolData.reserve0),
          token1: Number(poolData.reserve1)
        };

        const tvl = await this.calculateTVL(reserves, token0, token1);

        return {
          id: pool.id,
          name: await getTokenName(pool.contractAddress),
          symbol: poolData.symbol,
          image: await getTokenImage(pool.contractAddress),
          token0,
          token1,
          reserves,
          tvl,
          contractAddress: pool.contractAddress,
          totalLpSupply
        };
      })
    );

    return enrichedPools;
  }

  public static async getSpotPools(): Promise<PoolInfo[]> {
    const pools = await this.getEnrichedPools();
    return pools.filter(pool => !pool.token0.isLpToken && !pool.token1.isLpToken);
  }

  public static async getDerivativePools(): Promise<PoolInfo[]> {
    const pools = await this.getEnrichedPools();
    return pools.filter(pool => pool.token0.isLpToken || pool.token1.isLpToken);
  }

  public static async getAll(): Promise<KVPoolData[]> {
    return (await kv.get(this.POOL_KEY)) || [];
  }

  static async set(pools: KVPoolData[]): Promise<void> {
    await kv.set(this.POOL_KEY, pools);
  }

  static async clear(): Promise<void> {
    await kv.del(this.POOL_KEY);
  }
}
