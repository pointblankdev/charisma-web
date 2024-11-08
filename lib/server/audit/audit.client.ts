// src/lib/clients/contract-audit.client.ts

interface ArcanaMetrics {
  alignment: number;
  qualityScore: number;
  circulatingSupply: number;
  metadataUri: string;
}

interface FungibleToken {
  name: string;
  symbol: string;
  decimals: number;
  tokenIdentifier: string;
  isTransferable: boolean;
  isMintable: boolean;
  isBurnable: boolean;
  totalSupply?: string;
  maxSupply?: string;
  arcana?: ArcanaMetrics;
}

interface ContractAudit {
  contractId: string;
  deploymentInfo: {
    blockHeight: number;
    txId: string;
    clarityVersion: number | null;
  };
  fungibleTokens: FungibleToken[];
  nonFungibleTokens: {
    name: string;
    assetIdentifier: string;
    isMintable: boolean;
    isTransferable: boolean;
    totalSupply?: string;
    arcana?: ArcanaMetrics;
  }[];
  publicFunctions: {
    name: string;
    access: 'public' | 'read_only';
    args: { name: string; type: string }[];
    outputs: { type: string };
  }[];
  traits: {
    name: string;
    isImplemented: boolean;
    missingFunctions?: string[];
  }[];
  variables: {
    name: string;
    type: string;
    access: 'public' | 'private';
    constant: boolean;
    currentValue?: string;
  }[];
  maps: {
    name: string;
    keyType: string;
    valueType: string;
    description: string;
  }[];
  arcanaRecommendation: ArcanaMetrics;
  permissions: {
    canMint: boolean;
    canBurn: boolean;
    hasAdminFunctions: boolean;
    hasEmergencyFunctions: boolean;
    hasPauseFunctionality: boolean;
  };
  security: {
    hasRoleBasedAccess: boolean;
    hasOwnershipControl: boolean;
    hasTimelock: boolean;
    hasFlashLoanPrevention: boolean;
  };
  analysis: {
    riskLevel: 'low' | 'medium' | 'high';
    warnings: string[];
    recommendations: string[];
  };
}

export class ContractAuditError extends Error {
  constructor(message: string, public status?: number, public data?: any) {
    super(message);
    this.name = 'ContractAuditError';
  }
}

export class ContractAuditClient {
  constructor(
    private readonly baseUrl = 'https://explore.charisma.rocks/api/v0',
    private readonly fetchOptions: RequestInit = {}
  ) {}

  /**
   * Request a contract audit
   */
  async auditContract(contractId: string, forceRefresh: boolean = false): Promise<ContractAudit> {
    try {
      const response = await fetch(`${this.baseUrl}/audit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.fetchOptions.headers
        },
        body: JSON.stringify({
          contractId,
          forceRefresh
        }),
        ...this.fetchOptions
      });

      const data = await response.json();

      if (!response.ok) {
        throw new ContractAuditError(
          data.error || 'Contract audit request failed',
          response.status,
          data
        );
      }

      if (!data.success) {
        throw new ContractAuditError(data.error || 'Contract audit failed', 400, data);
      }

      return data.data;
    } catch (error) {
      if (error instanceof ContractAuditError) throw error;

      throw new ContractAuditError(
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
    }
  }
}
