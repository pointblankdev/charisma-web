import { getDecimals, getTotalSupply } from '@lib/stacks-api';
import { kv } from '@vercel/kv';
import { StaticImageData } from 'next/image';

export type KVTokenData = {
  symbol: string;
  name: string;
  tokenName?: string;
  contractAddress: string;
  decimals: number;
  imagePath: string;
  isLpToken?: boolean;
  poolId?: number; // For LP tokens
};

export type TokenInfo = {
  symbol: string;
  name: string;
  image: StaticImageData | string;
  tokenName?: string;
  contractAddress: string;
  decimals: number;
  isLpToken?: boolean;
  poolId?: number;
};

export class TokenService {
  private static readonly TOKEN_KEY = 'tokens';

  static async clear(): Promise<void> {
    await kv.del(this.TOKEN_KEY);
  }

  static async getAll(): Promise<KVTokenData[]> {
    return (await kv.get<KVTokenData[]>(this.TOKEN_KEY)) || [];
  }

  static async set(tokens: KVTokenData[]): Promise<void> {
    await kv.set(this.TOKEN_KEY, tokens);
  }

  static async getLpTokenTotalSupply(lpTokenAddress: string): Promise<number> {
    const decimals = await getDecimals(lpTokenAddress);
    const totalSupply = await getTotalSupply(lpTokenAddress);
    return totalSupply / 10 ** decimals;
  }

  static async calculateLpTokenPrice(
    poolId: number,
    reserves: { token0: number; token1: number },
    token0Symbol: string,
    token1Symbol: string,
    lpTokenAddress: string,
    prices: { [key: string]: number }
  ): Promise<number> {
    try {
      const tokens = await this.getAll();
      const token0 = tokens.find(t => t.symbol === token0Symbol);
      const token1 = tokens.find(t => t.symbol === token1Symbol);

      if (!token0 || !token1) throw new Error('Token not found');

      const totalLpSupply = await this.getLpTokenTotalSupply(lpTokenAddress);

      const totalValue =
        (reserves.token0 / 10 ** token0.decimals) * (prices[token0.symbol] || 0) +
        (reserves.token1 / 10 ** token1.decimals) * (prices[token1.symbol] || 0);

      return totalValue / (totalLpSupply || 1);
    } catch (error) {
      console.error('Error calculating LP token price:', error);
      return 0;
    }
  }
}
