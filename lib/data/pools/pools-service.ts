import { SITE_URL } from "../../constants";

interface Token {
  symbol: string;
  name: string;
  image: string;
  contractAddress: string;
  tokenId: string;
  decimals: number;
}

interface Pool {
  id: number;
  token0: Token;
  token1: Token;
  volume24h: number;
  contractAddress: string;
}

export class PoolsService {
  private static API_ENDPOINT = `${SITE_URL}/api/v0/pools`;

  /**
   * Fetch all available pools
   */
  static async getPools(): Promise<Pool[]> {
    try {
      const response = await fetch(this.API_ENDPOINT);

      if (!response.ok) {
        throw new Error(`Failed to fetch pools: ${response.statusText}`);
      }

      const pools = await response.json();
      return pools;
    } catch (error) {
      console.error('Error fetching pools:', error);
      throw error;
    }
  }

  /**
   * Get a specific pool by ID
   */
  static async getPoolById(id: number): Promise<Pool | null> {
    const pools = await this.getPools();
    return pools.find(pool => pool.id === id) || null;
  }

  /**
   * Get pools containing a specific token
   */
  static async getPoolsByToken(tokenAddress: string): Promise<Pool[]> {
    const pools = await this.getPools();
    return pools.filter(pool =>
      pool.token0.contractAddress === tokenAddress ||
      pool.token1.contractAddress === tokenAddress
    );
  }
}