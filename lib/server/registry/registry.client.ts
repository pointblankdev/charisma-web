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

// New types for LP registration
export type LpRegistrationData = {
  lpContract: string;
  token0: {
    contract: string;
    symbol: string;
  };
  token1: {
    contract: string;
    symbol: string;
  };
  dex: 'CHARISMA' | 'VELAR';
  poolId: string;
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
      mode: 'no-cors',
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

  // Create Operations
  async registerToken(contractId: string, metadata?: any): Promise<{ registered: boolean }> {
    return this.request('registerToken', { contractId, metadata });
  }

  async registerSymbol(
    symbol: string,
    contractId: string,
    force?: boolean
  ): Promise<{
    registered: boolean;
    conflict: boolean;
  }> {
    return this.request('registerSymbol', { symbol, contractId, force });
  }

  async registerLpToken(
    contractId: string,
    lpInfo: LpTokenInfo['info']
  ): Promise<{
    contractId: string;
    lpInfo: LpTokenInfo['info'];
  }> {
    return this.request('registerLpToken', { contractId, lpInfo });
  }

  async registerCompleteLP(
    data: LpRegistrationData
  ): Promise<{
    registrationResults: {
      contracts: Record<string, boolean>;
      symbols: Record<string, boolean>;
      pool: Record<string, boolean>;
      lpToken: boolean;
      metadata: Record<string, boolean>;
    };
    lpToken: {
      info: TokenInfo;
      metadata: any;
    };
    baseTokens: {
      token0: {
        info: TokenInfo;
        metadata: any;
      };
      token1: {
        info: TokenInfo;
        metadata: any;
      };
    };
    pool: {
      dex: string;
      id: string;
    };
  }> {
    return this.request('registerCompleteLP', { lpRegistration: data });
  }

  async addPoolForToken(
    contractId: string,
    poolId: string
  ): Promise<{
    contractId: string;
    poolId: string;
    added: boolean;
  }> {
    return this.request('addPoolForToken', { contractId, poolId });
  }

  // Update Operations
  async updateMetadata(
    contractId: string,
    metadata: any
  ): Promise<{
    contractId: string;
    metadata: any;
  }> {
    return this.request('updateMetadata', { contractId, metadata });
  }

  async refreshMetadata(
    contractId: string
  ): Promise<{
    contractId: string;
  }> {
    return this.request('refreshMetadata', { contractId });
  }

  async updateAudit(
    contractId: string,
    audit: AuditInfo
  ): Promise<{
    contractId: string;
    updated: boolean;
  }> {
    return this.request('updateAudit', { contractId, audit });
  }

  async updatePrice(
    symbol: string,
    price: number
  ): Promise<{
    symbol: string;
    price: number;
  }> {
    return this.request('updatePrice', { symbol, price });
  }

  // Delete Operations
  async removeContract(
    contractId: string
  ): Promise<{
    contractId: string;
    removed: boolean;
  }> {
    return this.request('removeContract', { contractId });
  }

  async unregisterLpToken(
    contractId: string,
    lpInfo: LpTokenInfo['info']
  ): Promise<{
    contractId: string;
    unregistered: boolean;
  }> {
    return this.request('unregisterLpToken', { contractId, lpInfo });
  }

  async removePoolForToken(
    contractId: string,
    poolId: string
  ): Promise<{
    contractId: string;
    poolId: string;
    removed: boolean;
  }> {
    return this.request('removePoolForToken', { contractId, poolId });
  }

  // Existing Query Operations
  async getTokenInfo(contractId: string): Promise<TokenInfo> {
    return this.request('getTokenInfo', { contractId });
  }

  async resolveSymbol(symbol: string): Promise<{ contractId: string }> {
    return this.request('resolveSymbol', { symbol });
  }

  async getLpTokens(contractId: string): Promise<string[]> {
    return this.request('getLpTokens', { contractId });
  }

  // Existing List Operations
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

  // Maintenance Operations
  async cleanup(): Promise<{ cleaned: boolean }> {
    return this.request('cleanup');
  }
}

export default TokenRegistryClient;
