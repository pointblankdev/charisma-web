/**
 * Response interfaces for different operation types
 */
export interface PoolData {
  id: string;
  token0: string;
  token1: string;
  reserve0: string; // Stringified bigint
  reserve1: string; // Stringified bigint
  totalSupply: string; // Stringified bigint
  swapFee: {
    numerator: number;
    denominator: number;
  };
}

// Add DEX provider configuration
interface DexConfig {
  baseUrl: string;
  defaultHeaders?: Record<string, string>;
}

export enum DexProvider {
  CHARISMA = 'CHARISMA',
  VELAR = 'VELAR'
}

const DEX_CONFIGS: Record<DexProvider, DexConfig> = {
  CHARISMA: {
    baseUrl: 'https://explore.charisma.rocks/api/v0/exchanges/charisma',
    defaultHeaders: {
      // Add any Charisma-specific headers here
    }
  },
  VELAR: {
    baseUrl: 'https://explore.charisma.rocks/api/v0/exchanges/velar',
    defaultHeaders: {
      // Add any Velar-specific headers here
    }
  }
};

export interface SwapQuoteData {
  path: string[];
  amountIn: string; // Stringified bigint
  amountOut: string; // Stringified bigint
  priceImpact: number;
}

export interface LiquidityData {
  poolId: string;
  token0Amount: string; // Stringified bigint
  token1Amount: string; // Stringified bigint
  liquidityTokens: string; // Stringified bigint
  shareOfPool: number;
  priceImpact?: number;
}

export interface RemovalQuoteData {
  token0Amount: string; // Stringified bigint
  token1Amount: string; // Stringified bigint
  shareOfPool: number;
  percentage?: number;
}

/**
 * Combined response type for DEX operations
 */
interface DexResponse {
  success: boolean;
  data?: {
    numberOfPools?: number;
    pool?: PoolData;
    pools?: PoolData[];
    swapQuote?: SwapQuoteData;
    swapQuotes?: SwapQuoteData[];
    liquidityQuote?: LiquidityData;
    liquidityQuotes?: LiquidityData[];
    removalQuote?: RemovalQuoteData;
    removalQuotes?: RemovalQuoteData[];
  };
  error?: string;
}

/**
 * Custom error class for DEX client errors
 */
export class DexClientError extends Error {
  constructor(message: string, public status?: number, public data?: any) {
    super(message);
    this.name = 'DexClientError';
  }
}

/**
 * Client class for interacting with DEX APIs
 */
export class DexClient {
  private readonly config: DexConfig;

  constructor(
    private readonly provider: DexProvider = DexProvider.CHARISMA,
    private readonly options: RequestInit = {}
  ) {
    const providerConfig = DEX_CONFIGS[provider];
    if (!providerConfig) {
      throw new DexClientError(`Invalid DEX provider: ${provider}`);
    }
    this.config = providerConfig;
  }

  /**
   * Helper method to make API calls
   */
  private async call<T = any>(operation: string, params: Record<string, any> = {}): Promise<T> {
    try {
      const response = await fetch(this.config.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.config.defaultHeaders,
          ...this.options.headers
        },
        body: JSON.stringify({
          operation,
          dex: this.provider,
          ...params
        }),
        ...this.options
      });

      const data: DexResponse = await response.json();

      if (!response.ok) {
        throw new DexClientError(data.error || 'API request failed', response.status, data);
      }

      if (!data.success) {
        throw new DexClientError(data.error || 'Operation failed', 400, data);
      }

      return data.data as T;
    } catch (error) {
      if (error instanceof DexClientError) throw error;
      console.error('DEX API error:', error);

      console.log('Error:', error);

      throw new DexClientError(error instanceof Error ? error.message : 'Unknown error occurred');
    }
  }

  // Pool Information Methods

  async getNumberOfPools(): Promise<number> {
    const data = await this.call<{ numberOfPools: number }>('getNumberOfPools');
    return data.numberOfPools;
  }

  async getPoolById(poolId: string): Promise<PoolData> {
    const data = await this.call<{ pool: PoolData }>('getPoolById', {
      pools: { poolId }
    });
    return data.pool;
  }

  async getPool(token0: string, token1: string): Promise<PoolData> {
    const data = await this.call<{ pool: PoolData }>('getPool', {
      pools: { token0, token1 }
    });
    return data.pool;
  }

  async getPools(ids: string[]): Promise<PoolData[]> {
    const data = await this.call<{ pools: PoolData[] }>('getPools', {
      pools: { ids }
    });
    return data.pools;
  }

  // Trading Methods

  async getSwapQuote(tokenIn: string, tokenOut: string, amount: string): Promise<SwapQuoteData> {
    const data = await this.call<{ swapQuote: SwapQuoteData }>('getSwapQuote', {
      swap: { tokenIn, tokenOut, amount }
    });
    return data.swapQuote;
  }

  async getSwapQuoteForExactOutput(
    tokenIn: string,
    tokenOut: string,
    amount: string
  ): Promise<SwapQuoteData> {
    const data = await this.call<{ swapQuote: SwapQuoteData }>('getSwapQuoteForExactOutput', {
      swap: { tokenIn, tokenOut, amount }
    });
    return data.swapQuote;
  }

  async getMultiHopQuote(path: string[], amount: string): Promise<SwapQuoteData> {
    const data = await this.call<{ swapQuote: SwapQuoteData }>('getMultiHopQuote', {
      swap: { path, amount }
    });
    return data.swapQuote;
  }

  async getMultiHopQuoteForExactOutput(path: string[], amount: string): Promise<SwapQuoteData> {
    const data = await this.call<{ swapQuote: SwapQuoteData }>('getMultiHopQuoteForExactOutput', {
      swap: { path, amount }
    });
    return data.swapQuote;
  }

  async batchGetQuotes(paths: string[][], amount: string): Promise<SwapQuoteData[]> {
    const data = await this.call<{ swapQuotes: SwapQuoteData[] }>('batchGetQuotes', {
      swap: { paths, amount }
    });
    return data.swapQuotes;
  }

  // Liquidity Methods

  async getLiquidityQuote(
    poolId: string,
    amount0: string,
    amount1: string,
    minAmount0: string = '0',
    minAmount1: string = '0'
  ): Promise<LiquidityData> {
    const data = await this.call<{ liquidityQuote: LiquidityData }>('getLiquidityQuote', {
      liquidity: {
        poolId,
        amount0,
        amount1,
        minAmount0,
        minAmount1
      }
    });
    return data.liquidityQuote;
  }

  async calculateLiquidityTokens(
    poolId: string,
    amount0: string,
    amount1: string
  ): Promise<LiquidityData> {
    const data = await this.call<{ liquidityQuote: LiquidityData }>('calculateLiquidityTokens', {
      liquidity: {
        poolId,
        amount0,
        amount1
      }
    });
    return data.liquidityQuote;
  }

  async batchGetLiquidityQuotes(
    queries: Array<{
      poolId: string;
      desiredAmount0: string;
      desiredAmount1: string;
      minAmount0?: string;
      minAmount1?: string;
    }>
  ): Promise<LiquidityData[]> {
    const data = await this.call<{ liquidityQuotes: LiquidityData[] }>('batchGetLiquidityQuotes', {
      liquidity: { queries }
    });
    return data.liquidityQuotes;
  }

  // Removal Methods

  async getRemoveLiquidityQuote(
    poolId: string,
    liquidityTokens: string
  ): Promise<RemovalQuoteData> {
    const data = await this.call<{ removalQuote: RemovalQuoteData }>('getRemoveLiquidityQuote', {
      removal: { poolId, liquidityTokens }
    });
    return data.removalQuote;
  }

  async getRemoveLiquidityRangeQuotes(
    poolId: string,
    liquidityTokens: string
  ): Promise<RemovalQuoteData[]> {
    const data = await this.call<{ removalQuotes: RemovalQuoteData[] }>(
      'getRemoveLiquidityRangeQuotes',
      {
        removal: { poolId, liquidityTokens }
      }
    );
    return data.removalQuotes;
  }

  async batchGetRemoveLiquidityQuotes(
    queries: Array<{
      poolId: string;
      liquidityTokens: string;
    }>
  ): Promise<RemovalQuoteData[]> {
    const data = await this.call<{ removalQuotes: RemovalQuoteData[] }>(
      'batchGetRemoveLiquidityQuotes',
      {
        removal: { queries }
      }
    );
    return data.removalQuotes;
  }
}
