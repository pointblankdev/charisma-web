import PricesService from '@lib/prices-service';
import { ToolDefinition } from './tool-registry';

interface PricesQueryParams {
  operation: 'get_token_price' | 'get_lp_price' | 'get_all_prices';
  symbol?: string;
  poolId?: number;
  amountIn?: number;
}

export const pricesQueryTool: ToolDefinition = {
  name: 'query_prices',
  description: `Query token and LP token prices from various sources including DEX pools and external price feeds.
                Calculate price for trades and get real-time price data.
                
                Operations:
                - get_token_price: Get current price for any supported token
                - get_lp_price: Calculate LP token price based on underlying assets
                - get_all_prices: Get all current token prices
                
                Examples:
                - Get WELSH price in USD
                - Calculate UPDOG LP token value
                - Compare synthetic token prices to underlying`,
  input_schema: {
    type: 'object',
    properties: {
      operation: {
        type: 'string',
        enum: ['get_token_price', 'get_lp_price', 'get_all_prices'],
        description: 'The price query operation to perform'
      },
      symbol: {
        type: 'string',
        description: 'Token symbol for single token queries'
      },
      poolId: {
        type: 'number',
        description: 'Pool ID for LP token or price impact calculations'
      },
      amountIn: {
        type: 'number',
        description: 'Amount for price impact calculation'
      }
    },
    required: ['operation']
  },
  handler: async (params: PricesQueryParams) => {
    switch (params.operation) {
      case 'get_token_price':
        if (!params.symbol) {
          throw new Error('Symbol required for token price query');
        }
        const prices = await PricesService.getAllTokenPrices();
        const price = prices[params.symbol];
        if (price === undefined) {
          throw new Error(`Price not found for token ${params.symbol}`);
        }
        return {
          symbol: params.symbol,
          price,
          timestamp: Date.now()
        };

      case 'get_lp_price':
        if (!params.poolId) {
          throw new Error('Pool ID required for LP token price');
        }
        const lpPrice = await PricesService.getLpTokenPriceByPoolId(params.poolId);
        return {
          poolId: params.poolId,
          price: lpPrice,
          timestamp: Date.now()
        };

      case 'get_all_prices':
        const allPrices = await PricesService.getAllTokenPrices();
        return {
          prices: allPrices,
          timestamp: Date.now()
        };

      default:
        throw new Error(`Unknown operation: ${params.operation}`);
    }
  }
};
