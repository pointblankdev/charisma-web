/**
 * Types for SIP010 token interactions
 */
export interface TokenMetadata {
  name?: string;
  description?: string;
  image?: string;
  external_url?: string;
  animation_url?: string;
  background_color?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
    display_type?: string;
  }>;
  [key: string]: any;
}

export interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  tokenUri?: string;
  metadata?: TokenMetadata;
}

/**
 * Error class for SIP010 client operations
 */
export class Sip10ClientError extends Error {
  constructor(message: string, public status?: number, public data?: any) {
    super(message);
    this.name = 'Sip10ClientError';
  }
}

/**
 * Client for interacting with SIP010 tokens
 */
export class Sip10Client {
  constructor(
    private readonly baseUrl = 'https://explore.charisma.rocks/api/v0',
    private readonly fetchOptions: RequestInit = {}
  ) {}

  /**
   * Helper method to make API calls
   */
  private async call<T = any>(operation: string, params: Record<string, any> = {}): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}/sip/10`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.fetchOptions.headers
        },
        body: JSON.stringify({
          operation,
          ...params
        }),
        ...this.fetchOptions
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Sip10ClientError(error.error || 'API request failed', response.status, error);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Sip10ClientError(result.error || 'Operation failed', 400, result);
      }

      return result.data;
    } catch (error) {
      if (error instanceof Sip10ClientError) throw error;

      throw new Sip10ClientError(error instanceof Error ? error.message : 'Unknown error occurred');
    }
  }

  /**
   * Get complete token information
   */
  async getTokenInfo(contractAddress: string, contractName: string): Promise<TokenInfo> {
    const data = await this.call<{ tokenInfo: TokenInfo }>('getTokenInfo', {
      contractAddress,
      contractName
    });
    return data.tokenInfo;
  }

  /**
   * Get token name
   */
  async getName(contractAddress: string, contractName: string): Promise<string> {
    const data = await this.call<{ name: string }>('getName', {
      contractAddress,
      contractName
    });
    return data.name;
  }

  /**
   * Get token symbol
   */
  async getSymbol(contractAddress: string, contractName: string): Promise<string> {
    const data = await this.call<{ symbol: string }>('getSymbol', {
      contractAddress,
      contractName
    });
    return data.symbol;
  }

  /**
   * Get token decimals
   */
  async getDecimals(contractAddress: string, contractName: string): Promise<number> {
    const data = await this.call<{ decimals: number }>('getDecimals', {
      contractAddress,
      contractName
    });
    return data.decimals;
  }

  /**
   * Get token balance for an address
   */
  async getBalance(
    contractAddress: string,
    contractName: string,
    ownerAddress: string
  ): Promise<string> {
    const data = await this.call<{ balance: string }>('getBalance', {
      contractAddress,
      contractName,
      ownerAddress
    });
    return data.balance;
  }

  /**
   * Get token total supply
   */
  async getTotalSupply(contractAddress: string, contractName: string): Promise<string> {
    const data = await this.call<{ totalSupply: string }>('getTotalSupply', {
      contractAddress,
      contractName
    });
    return data.totalSupply;
  }

  /**
   * Get token URI
   */
  async getTokenUri(contractAddress: string, contractName: string): Promise<string | undefined> {
    const data = await this.call<{ tokenUri?: string }>('getTokenUri', {
      contractAddress,
      contractName
    });
    return data.tokenUri;
  }

  /**
   * Get token URI and metadata
   */
  async getTokenUriAndMetadata(
    contractAddress: string,
    contractName: string
  ): Promise<{ uri?: string; metadata?: TokenMetadata }> {
    const data = await this.call<{
      tokenUri?: string;
      metadata?: TokenMetadata;
    }>('getTokenUriAndMetadata', {
      contractAddress,
      contractName
    });
    return {
      uri: data.tokenUri,
      metadata: data.metadata
    };
  }

  /**
   * Batch get token information
   */
  async batchGetTokenInfo(
    tokens: Array<{ contractAddress: string; contractName: string }>
  ): Promise<TokenInfo[]> {
    const data = await this.call<{ tokensInfo: TokenInfo[] }>('batchGetTokenInfo', { tokens });
    return data.tokensInfo;
  }

  /**
   * Batch get token balances
   */
  async batchGetBalances(
    queries: Array<{
      contractAddress: string;
      contractName: string;
      ownerAddress: string;
    }>
  ): Promise<Record<string, string>> {
    const data = await this.call<{ balances: Record<string, string> }>('batchGetBalances', {
      balanceQueries: queries
    });
    return data.balances;
  }

  /**
   * Format token amount considering decimals
   */
  async formatAmount(
    amount: string,
    contractAddress: string,
    contractName: string,
    displayDecimals?: number
  ): Promise<string> {
    const decimals = await this.getDecimals(contractAddress, contractName);
    const value = Number(amount) / Math.pow(10, decimals);
    return value.toFixed(displayDecimals !== undefined ? displayDecimals : decimals);
  }

  /**
   * Parse token amount from decimal string to integer
   */
  async parseAmount(
    amount: string,
    contractAddress: string,
    contractName: string
  ): Promise<string> {
    const decimals = await this.getDecimals(contractAddress, contractName);
    const value = Number(amount) * Math.pow(10, decimals);
    return Math.floor(value).toString();
  }
}
