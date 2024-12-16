interface ContractsByTraitResponse {
  success: boolean;
  contracts: string[];
  total: number;
}

interface ContractsByTraitOptions {
  limit?: number;
  offset?: number;
  trait?: any;
  all?: boolean;
}

export class ContractsClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  }

  private buildUrl(options: ContractsByTraitOptions = {}): string {
    const params = new URLSearchParams();

    if (options.limit) params.append('limit', options.limit.toString());
    if (options.offset) params.append('offset', options.offset.toString());
    if (options.trait) params.append('trait', JSON.stringify(options.trait));
    if (options.all) params.append('all', 'true');

    const queryString = params.toString();
    return `${this.baseUrl}/api/v0/contracts/by-trait${queryString ? `?${queryString}` : ''}`;
  }

  /**
   * Get contracts by trait with pagination
   */
  async getContracts(options: ContractsByTraitOptions = {}): Promise<ContractsByTraitResponse> {
    try {
      const response = await fetch(this.buildUrl(options));

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch contracts');
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching contracts:', error);
      throw error;
    }
  }

  /**
   * Get all contracts implementing a trait
   */
  async getAllContracts(trait?: any): Promise<string[]> {
    try {
      const response = await this.getContracts({ all: true, trait });
      return response.contracts;
    } catch (error) {
      console.error('Error fetching all contracts:', error);
      throw error;
    }
  }

  /**
   * Get contracts with default Dexterity trait
   */
  async getDexterityContracts(
    options: Omit<ContractsByTraitOptions, 'trait'> = {}
  ): Promise<ContractsByTraitResponse> {
    return this.getContracts(options);
  }

  /**
   * Get all contracts implementing Dexterity trait
   */
  async getAllDexterityContracts(): Promise<string[]> {
    return this.getAllContracts();
  }
}
