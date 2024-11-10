// Types
export type TokenInfo = {
  contractId: string;
  metadata?: {
    name?: string;
    symbol?: string;
    decimals?: number;
    website?: string;
    description?: string;
  };
  audit?: AuditInfo;
  lpInfo?: {
    dex: string;
    poolId: string;
    token0: string;
    token1: string;
  };
  pools?: string[];
  price?: number;
  stats?: {
    lastSeen: number;
    interactions: number;
  };
};

export type SymbolMapping = {
  symbol: string;
  contractId: string;
};

export type LpTokenInfo = {
  lpToken: string;
  info: {
    dex: string;
    poolId: string;
    token0: string;
    token1: string;
  };
};

export type AuditInfo = {
  contractId: string;
  fungibleTokens: any[];
};

// API Client
export class TokenRegistryClient {
  constructor(private readonly baseUrl = 'https://explore.charisma.rocks/api/v0') {}

  private async request<T>(operation: string, params: Record<string, any> = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}/registry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        operation,
        ...params
      })
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Operation failed');
    }

    return data.data;
  }

  // Query Operations
  async getTokenInfo(contractId: string): Promise<TokenInfo> {
    return this.request('getTokenInfo', { contractId });
  }

  async resolveSymbol(symbol: string): Promise<{ contractId: string }> {
    return this.request('resolveSymbol', { symbol });
  }

  async getLpTokens(contractId: string): Promise<string[]> {
    return this.request('getLpTokens', { contractId });
  }

  // List Operations
  async listAll(): Promise<any> {
    return this.request('listAll');
  }

  async listSymbols(): Promise<SymbolMapping[]> {
    return this.request('listSymbols');
  }

  async listMetadata(): Promise<Record<string, any>[]> {
    return this.request('listMetadata');
  }

  async listLpTokens(): Promise<any> {
    return this.request('listLpTokens');
  }

  async listAudits(): Promise<AuditInfo[]> {
    return this.request('listAudits');
  }

  async listPools(): Promise<Array<{ token: string; pools: string[] }>> {
    return this.request('listPools');
  }

  async listPrices(): Promise<Record<string, number>> {
    return this.request('listPrices');
  }
}

// Usage example:
/*
const registry = new TokenRegistryClient();

// Get token info
const token = await registry.getTokenInfo('SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.token');

// List all tokens
const allTokens = await registry.listAll();

// Get token by symbol
const { contractId } = await registry.resolveSymbol('TOKEN');

// Get all LP tokens
const lpTokens = await registry.listLpTokens();
*/

export default TokenRegistryClient;
