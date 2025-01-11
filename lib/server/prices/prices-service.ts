import cmc from "@lib/cmc-api";

export interface TokenInfo {
  symbol: string;
  name: string;
  image: string;
  contractAddress: string;
  price?: number;
  tokenId?: string;
  decimals: number;
}

interface ApiPriceResponse {
  success: boolean;
  data?: {
    prices?: Record<string, number>;
    price?: number;
  };
  error?: {
    code: string;
    message: string;
  };
  timestamp?: string;
}

interface ApiPoolResponse {
  success: boolean;
  data: {
    pools: Array<{
      poolId: number;
      lpToken: string;
      reserve0: string;
      reserve1: string;
      reserve0ConvertUsd: string;
      reserve1ConvertUsd: string;
      token0Price: string;
      token1Price: string;
      symbol: string;
      token0: string;
      token1: string;
      source: string;
      lastUpdated: string;
      token0Info: {
        contractAddress: string;
        name: string;
        symbol: string;
        decimals: number;
        totalSupply: number;
      };
      token1Info: {
        contractAddress: string;
        name: string;
        symbol: string;
        decimals: number;
        totalSupply: number;
      };
    }>;
  };
  error?: {
    code: string;
    message: string;
  };
  timestamp?: string;
}

class PricesService {
  private static instance: PricesService;
  private readonly API_URL = 'https://explore.charisma.rocks';

  private constructor() { }

  public static getInstance(): PricesService {
    if (!PricesService.instance) {
      PricesService.instance = new PricesService();
    }
    return PricesService.instance;
  }

  private async fetchFromApi<T>(endpoint: string, body: any): Promise<T> {
    try {
      const response = await fetch(`${this.API_URL}/api/v0/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching from ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Get all token prices
   */
  public async getAllTokenPrices() {
    const MAX_RETRIES = 3;
    let attempts = 0;

    while (attempts < MAX_RETRIES) {
      try {
        const response = await fetch('https://kraxel.io/api/v2/token-prices', {
          method: 'GET',
          headers: {
            'X-Api-Key': process.env.KRAXEL_API_KEY || '',
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`API request failed: ${response.statusText}`);
        }

        const { data } = await response.json();
        const cmcPriceData = await cmc.getQuotes({ symbol: ['STX'] });
        data.prices['.stx'] = cmcPriceData.data['STX'].quote.USD.price;

        return data.prices;
      } catch (error) {
        attempts++;
        console.error(`Error fetching all prices (attempt ${attempts}):`, error);
        if (attempts >= MAX_RETRIES) {
          console.error('Failed to fetch all token prices');
          return {};
        }
      }
    }
  }

  /**
   * Get price for a specific token
   */
  public async getTokenPrice(contractAddress: string): Promise<number> {
    try {
      const response = await this.fetchFromApi<ApiPriceResponse>('prices', {
        operation: 'getPrice',
        token: contractAddress
      });

      if (!response.success || (!response.data?.price && response.data?.price !== 0)) {
        throw new Error('Failed to fetch token price');
      }

      return typeof response.data.price === 'string'
        ? parseFloat(response.data.price)
        : response.data.price;
    } catch (error) {
      console.error(`Error fetching price for ${contractAddress}:`, error);
      return 0;
    }
  }

  /**
   * Get prices for multiple tokens
   */
  public async getTokenPrices(contractAddresses: string[]): Promise<Record<string, number>> {
    try {
      const response = await this.fetchFromApi<ApiPriceResponse>('prices', {
        operation: 'getPrices',
        tokens: contractAddresses
      });

      if (!response.success || !response.data?.prices) {
        throw new Error('Failed to fetch token prices');
      }

      return Object.entries(response.data.prices).reduce((acc, [token, price]) => {
        acc[token] = typeof price === 'string' ? parseFloat(price) : price;
        return acc;
      }, {} as Record<string, number>);
    } catch (error) {
      console.error('Error fetching token prices:', error);
      return {};
    }
  }

  /**
   * Get all pools
   */
  public async getAllPools(): Promise<ApiPoolResponse['data']['pools']> {
    try {
      const response = await this.fetchFromApi<ApiPoolResponse>('prices', {
        operation: 'getAllPools'
      });

      if (!response.success || !response.data?.pools) {
        throw new Error('Failed to fetch pools');
      }

      return response.data.pools;
    } catch (error) {
      console.error('Error fetching pools:', error);
      return [];
    }
  }
}

export default PricesService;
