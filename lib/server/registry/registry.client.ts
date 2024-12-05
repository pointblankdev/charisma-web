import { kv } from '@vercel/kv';

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

export const charismaNames = ['CHARISMA', 'Charisma DEX', 'Charisma', 'charisma'];

// API Client
export class TokenRegistryClient {
  private readonly CACHE_TTL = 3600; // 1 hour in seconds
  private readonly CACHE_PREFIX = 'registry:';

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

  private getCacheKey(operation: string, params?: Record<string, any>): string {
    if (params && Object.keys(params).length > 0) {
      const sortedParams = Object.keys(params)
        .sort()
        .map(key => `${key}:${params[key]}`)
        .join(':');
      return `${this.CACHE_PREFIX}${operation}:${sortedParams}`;
    }
    return `${this.CACHE_PREFIX}${operation}`;
  }

  private async getWithCache<T>(
    operation: string,
    params: Record<string, any> = {},
    fetcher: () => Promise<T>
  ): Promise<T> {
    const cacheKey = this.getCacheKey(operation, params);

    try {
      // Try to get from cache
      const cached = await kv.get<T>(cacheKey);
      if (cached !== null) {
        return cached;
      }

      // If not in cache, fetch and store
      const data = await fetcher();
      await kv.set(cacheKey, data, { ex: this.CACHE_TTL });
      return data;
    } catch (error) {
      console.error(`Cache error for ${operation}:`, error);
      // If cache fails, just return the data
      return fetcher();
    }
  }

  private async invalidateCache(operation: string, params?: Record<string, any>): Promise<void> {
    try {
      const cacheKey = this.getCacheKey(operation, params);
      await kv.del(cacheKey);

      // Also invalidate list operations as they might be affected
      const listOperations = [
        'listAll',
        'listSymbols',
        'listMetadata',
        'listLpTokens',
        'listAudits',
        'listPools',
        'listPrices'
      ];

      await Promise.all(listOperations.map(op => kv.del(this.getCacheKey(op))));
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }

  // Create Operations
  async registerToken(contractId: string, metadata?: any) {
    const result = await this.request('registerToken', { contractId, metadata });
    await this.invalidateCache('getTokenInfo', { contractId });
    return result;
  }

  async registerSymbol(symbol: string, contractId: string, force?: boolean) {
    const result = await this.request('registerSymbol', { symbol, contractId, force });
    await this.invalidateCache('resolveSymbol', { symbol });
    return result;
  }

  async registerLpToken(contractId: string, lpInfo: LpTokenInfo['info']) {
    const result = await this.request('registerLpToken', { contractId, lpInfo });
    await this.invalidateCache('getLpTokens', { contractId });
    return result;
  }

  async registerCompleteLP(data: LpRegistrationData) {
    const result = await this.request('registerCompleteLP', { lpRegistration: data });
    await this.clearCache(); // Clear all cache as this affects multiple entities
    return result;
  }

  async addPoolForToken(contractId: string, poolId: string) {
    const result = await this.request('addPoolForToken', { contractId, poolId });
    await this.invalidateCache('getTokenInfo', { contractId });
    await this.invalidateCache('listPools');
    return result;
  }

  // Update Operations
  async updateMetadata(contractId: string, metadata: any) {
    const result = await this.request('updateMetadata', { contractId, metadata });
    await this.invalidateCache('getTokenInfo', { contractId });
    await this.invalidateCache('listMetadata');
    return result;
  }

  async refreshMetadata(contractId: string) {
    const result = await this.request('refreshMetadata', { contractId });
    await this.invalidateCache('getTokenInfo', { contractId });
    await this.invalidateCache('listMetadata');
    return result;
  }

  async updateAudit(contractId: string, audit: AuditInfo) {
    const result = await this.request('updateAudit', { contractId, audit });
    await this.invalidateCache('getTokenInfo', { contractId });
    await this.invalidateCache('listAudits');
    return result;
  }

  async updatePrice(symbol: string, price: number) {
    const result = await this.request('updatePrice', { symbol, price });
    await this.invalidateCache('listPrices');
    return result;
  }

  // Delete Operations
  async removeContract(contractId: string) {
    const result = await this.request('removeContract', { contractId });
    await this.clearCache(); // Clear all cache as this affects multiple entities
    return result;
  }

  async unregisterLpToken(contractId: string, lpInfo: LpTokenInfo['info']) {
    const result = await this.request('unregisterLpToken', { contractId, lpInfo });
    await this.invalidateCache('getLpTokens', { contractId });
    await this.invalidateCache('listLpTokens');
    return result;
  }

  async removePoolForToken(contractId: string, poolId: string) {
    const result = await this.request('removePoolForToken', { contractId, poolId });
    await this.invalidateCache('getTokenInfo', { contractId });
    await this.invalidateCache('listPools');
    return result;
  }

  // Query Operations (Cached)
  async getTokenInfo(contractId: string): Promise<TokenInfo> {
    return this.getWithCache('getTokenInfo', { contractId }, () =>
      this.request('getTokenInfo', { contractId })
    );
  }

  async resolveSymbol(symbol: string): Promise<{ contractId: string }> {
    return this.getWithCache('resolveSymbol', { symbol }, () =>
      this.request('resolveSymbol', { symbol })
    );
  }

  async getLpTokens(contractId: string): Promise<string[]> {
    return this.getWithCache('getLpTokens', { contractId }, () =>
      this.request('getLpTokens', { contractId })
    );
  }

  // List Operations (Cached)
  async listAll(): Promise<any> {
    return this.getWithCache('listAll', {}, () => this.request('listAll'));
  }

  async listSymbols(): Promise<SymbolMapping[]> {
    return this.getWithCache('listSymbols', {}, () => this.request('listSymbols'));
  }

  async listMetadata(): Promise<Record<string, any>[]> {
    return this.getWithCache('listMetadata', {}, () => this.request('listMetadata'));
  }

  async listLpTokens(): Promise<any> {
    return this.getWithCache('listLpTokens', {}, () => this.request('listLpTokens'));
  }

  async listAudits(): Promise<AuditInfo[]> {
    return this.getWithCache('listAudits', {}, () => this.request('listAudits'));
  }

  async listPools(): Promise<Array<{ token: string; pools: string[] }>> {
    return this.getWithCache('listPools', {}, () => this.request('listPools'));
  }

  async listPrices(): Promise<Record<string, number>> {
    return this.getWithCache('listPrices', {}, () => this.request('listPrices'));
  }

  // Maintenance Operations
  async cleanup() {
    const result = await this.request('cleanup');
    await this.clearCache(); // Clear all cache after cleanup
    return result;
  }

  async clearCache(): Promise<void> {
    try {
      const keys = await kv.keys(`${this.CACHE_PREFIX}*`);
      if (keys.length > 0) {
        await kv.del(...keys);
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
}

export default TokenRegistryClient;
