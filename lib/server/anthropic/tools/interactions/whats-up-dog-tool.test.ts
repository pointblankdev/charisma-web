import { describe, it, expect, beforeEach } from 'vitest';
import { SmartAnthropicClient } from '../../client';
import { KVTokenData, TokenService } from '@lib/server/tokens/token-service';
import { KVPoolData, PoolService } from '@lib/server/pools/pool-service';
import { arbitrageTool } from './whats-up-dog-tool';
import { toolRegistry } from '../../tool-registry';
import PricesService from '@lib/prices-service';

describe('Arbitrage Tool Tests', () => {
  let client: SmartAnthropicClient;
  let tokens: KVTokenData[];
  let pools: KVPoolData[];
  let prices: { [key: string]: number };
  const TEST_ADDRESS = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  const timeout = 30000;

  beforeEach(async () => {
    client = new SmartAnthropicClient();
    toolRegistry.registerTool(arbitrageTool);
    tokens = await TokenService.getAll();
    prices = await PricesService.getAllTokenPrices();
    pools = await PoolService.getAll(true);
    await PricesService.updateAllTokenPrices();
    await PricesService.updateAllLpTokenPrices();
  });

  it(
    'should analyze UPDOG arbitrage opportunities',
    async () => {
      // Check both paths
      const forwardAnalysis = await arbitrageTool.handler!({
        operation: 'analyze',
        path: 'forward',
        ownerAddress: TEST_ADDRESS
      });

      const reverseAnalysis = await arbitrageTool.handler!({
        operation: 'analyze',
        path: 'reverse',
        ownerAddress: TEST_ADDRESS
      });

      console.log('Forward Path Analysis:', {
        marketPrice: forwardAnalysis.prices.updogMarket,
        compositionValue: forwardAnalysis.prices.updogComposition,
        profitPercentage: forwardAnalysis.profitPercentage,
        expectedProfit: forwardAnalysis.expectedProfit
      });

      console.log('Reverse Path Analysis:', {
        marketPrice: reverseAnalysis.prices.updogMarket,
        compositionValue: reverseAnalysis.prices.updogComposition,
        profitPercentage: reverseAnalysis.profitPercentage,
        expectedProfit: reverseAnalysis.expectedProfit
      });

      // Verify analysis structure
      expect(forwardAnalysis.prices).toBeDefined();
      expect(forwardAnalysis.profitPercentage).toBeDefined();
      expect(reverseAnalysis.prices).toBeDefined();
      expect(reverseAnalysis.profitPercentage).toBeDefined();
    },
    timeout
  );
});
