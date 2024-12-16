export interface TokenMetadata {
  name?: string;
  symbol?: string;
  decimals?: number;
  identifier?: string;
  description?: string;
  image?: string;
  image_data?: string;
  external_url?: string;
  background_color?: string;
  animation_url?: string;
  youtube_url?: string;
  properties?: Record<string, any>;
}

export interface GenerateMetadataRequest {
  name: string;
  symbol: string;
  decimals: number;
  identifier: string;
  description: string;
  properties?: Record<string, any>;
  imagePrompt?: string;
}

export interface ApiResponse<T> {
  success?: boolean;
  error?: string;
  contractId?: string;
  metadata?: T;
  lastUpdated?: string;
}

export class TokenMetadataClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    this.apiKey = apiKey;
  }

  private async fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = `${this.baseUrl}/api/v0/metadata${endpoint}`;
    const headers = {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return response;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch from token metadata API');
    }
  }

  /**
   * Generate new token metadata with AI-generated image
   */
  async generate(
    contractId: string,
    data: GenerateMetadataRequest
  ): Promise<ApiResponse<TokenMetadata>> {
    const response = await this.fetchWithAuth(`/generate/${contractId}`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return response.json();
  }

  /**
   * Get existing token metadata
   */
  async get(contractId: string): Promise<ApiResponse<TokenMetadata>> {
    const response = await this.fetchWithAuth(`/${contractId}`);
    return response.json();
  }

  /**
   * Fully update token metadata
   */
  async update(contractId: string, metadata: TokenMetadata): Promise<ApiResponse<TokenMetadata>> {
    const response = await this.fetchWithAuth(`/update/${contractId}`, {
      method: 'POST',
      body: JSON.stringify(metadata)
    });
    return response.json();
  }

  /**
   * Partially update token metadata
   */
  async patch(
    contractId: string,
    updates: Partial<TokenMetadata>
  ): Promise<ApiResponse<TokenMetadata>> {
    const response = await this.fetchWithAuth(`/update/${contractId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
    return response.json();
  }
}

// Example usage:
/**
const client = new TokenMetadataClient(
  'https://your-site.vercel.app',
  'your-api-secret-key'
);

// Generate new metadata
const result = await client.generate('SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.my-token', {
  name: "Bitcoin Lightning",
  symbol: "LTNG",
  decimals: 8,
  description: "A token for Bitcoin Lightning Network transactions",
  properties: {
    website: "https://lightning.network",
    twitter: "@lightning"
  }
});

// Get metadata
const metadata = await client.get('SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.my-token');

// Update metadata
await client.update('SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.my-token', {
  name: "Updated Name",
  symbol: "LTNG",
  decimals: 8,
  description: "Updated description"
});

// Patch metadata
await client.patch('SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.my-token', {
  description: "Partially updated description"
});
*/
