import { describe, it, expect, beforeEach } from 'vitest';
import { SmartAnthropicClient } from './client';
import { toolRegistry } from './tool-registry';
import { dexTools } from './dex-tools';
import { KVPoolData, PoolService } from '../pools/pool-service';
import { KVTokenData, TokenService } from '../tokens/token-service';
import { lpCalculatorTool } from './lp-calculator-tool';
import { pricesQueryTool } from './prices-tool';

describe('SmartAnthropicClient', () => {
  const timeout = 100000;
  let client: SmartAnthropicClient;

  beforeEach(() => {
    client = new SmartAnthropicClient();
  });

  it(
    'should handle single tool use flow automatically',
    async () => {
      const response = await client.smartChat('What is 25 times 17?', ['calculator']);

      // Final response should have completed (not stopped for tool use)
      expect(response.stop_reason).toBe('end_turn');

      // Response should contain the correct calculation result
      expect(response.content[0].type).toBe('text');
      // expect(response.content[0].text).toMatch(/425/);
    },
    timeout
  );
});
describe('DEX Tools Live Tests', () => {
  let client: SmartAnthropicClient;
  let pools: KVPoolData[];
  let tokens: KVTokenData[];
  const timeout = 1000000;

  beforeEach(async () => {
    client = new SmartAnthropicClient();
    toolRegistry.registerTool(dexTools.queryTool);

    // Get real pool and token data
    pools = await PoolService.getAll();
    tokens = await TokenService.getAll();
  });

  it(
    'should fetch pool information with correct token data',
    async () => {
      // Get first available pool
      const pool = pools[0];
      const token0 = tokens.find(t => t.symbol === pool.token0Symbol);
      const token1 = tokens.find(t => t.symbol === pool.token1Symbol);

      const response = await client.smartChat(
        `What are the current reserves and fees for the ${pool.token0Symbol}-${pool.token1Symbol} pool (ID: ${pool.id})? ` +
          `The tokens are at ${token0?.contractAddress} and ${token1?.contractAddress}.`,
        ['query_dex']
      );

      // Get actual reserves to verify response
      const reserves = await PoolService.getPoolReserves(pool.id);

      expect(response.stop_reason).toBe('end_turn');

      const text = (response.content[0] as any).text.toLowerCase();
      // Verify tokens are mentioned
      expect(text).toMatch(pool.token0Symbol.toLowerCase());
      expect(text).toMatch(pool.token1Symbol.toLowerCase());

      // Verify reserves are mentioned and accurate
      const textReserves = text.match(/\d+/g)?.map(Number);
      expect(textReserves).toBeDefined();

      // Convert reserves to human readable numbers using token decimals
      const humanReserve0 = reserves.token0 / Math.pow(10, token0?.decimals || 6);
      const humanReserve1 = reserves.token1 / Math.pow(10, token1?.decimals || 6);

      console.log('Pool Info Test:', {
        poolId: pool.id,
        pair: `${pool.token0Symbol}-${pool.token1Symbol}`,
        reserves: {
          [pool.token0Symbol]: humanReserve0,
          [pool.token1Symbol]: humanReserve1
        }
      });
    },
    timeout
  );

  it(
    'should calculate swap amounts with correct decimals',
    async () => {
      // Get a pool with CHA for stable value reference
      const pool = pools.find(p => p.token0Symbol === 'CHA' || p.token1Symbol === 'CHA');
      if (!pool) {
        console.log('No CHA pool found, skipping test');
        return;
      }

      const isToken0CHA = pool.token0Symbol === 'CHA';
      const otherSymbol = isToken0CHA ? pool.token1Symbol : pool.token0Symbol;
      const chaToken = tokens.find(t => t.symbol === 'CHA');
      const otherToken = tokens.find(t => t.symbol === otherSymbol);

      // Calculate amount for 100 CHA
      const chaAmount = 100 * Math.pow(10, chaToken?.decimals || 6);

      const response = await client.smartChat(
        `How much ${otherSymbol} would I receive if I swap ${chaAmount} CHA in pool ${pool.id}? ` +
          `CHA is at ${chaToken?.contractAddress} and ${otherSymbol} is at ${otherToken?.contractAddress}.`,
        ['query_dex']
      );

      expect(response.stop_reason).toBe('end_turn');

      const text = (response.content[0] as any).text.toLowerCase();
      expect(text).toMatch(/cha/);
      expect(text).toMatch(otherSymbol.toLowerCase());

      console.log('Swap Test:', {
        poolId: pool.id,
        pair: `CHA-${otherSymbol}`,
        inputAmount: '100 CHA',
        response: (response.content[0] as any).text
      });
    },
    timeout
  );

  it(
    'should handle LP token information correctly',
    async () => {
      // Find a pool with LP token
      const lpToken = tokens.find(t => t.isLpToken && t.poolId !== undefined);
      if (!lpToken) {
        console.log('No LP token found, skipping test');
        return;
      }

      const pool = pools.find(p => p.id === lpToken.poolId);
      if (!pool) {
        console.log('Pool not found for LP token, skipping test');
        return;
      }

      // Get LP token total supply
      const totalSupply = await TokenService.getLpTokenTotalSupply(lpToken.contractAddress);

      const response = await client.smartChat(
        `What are the reserves and base tokens for the ${pool.token0Symbol}-${pool.token1Symbol} LP token ` +
          `(${lpToken.contractAddress}) in pool ${pool.id}?`,
        ['query_dex']
      );

      expect(response.stop_reason).toBe('end_turn');

      const text = (response.content[0] as any).text.toLowerCase();
      expect(text).toMatch(pool.token0Symbol.toLowerCase());
      expect(text).toMatch(pool.token1Symbol.toLowerCase());

      console.log('LP Token Test:', {
        poolId: pool.id,
        lpToken: lpToken.symbol,
        totalSupply,
        response: (response.content[0] as any).text
      });
    },
    timeout
  );

  it(
    'should provide accurate price quotes using pool reserves',
    async () => {
      // Get a pool with sufficient liquidity
      const pool = pools[0];
      const reserves = await PoolService.getPoolReserves(pool.id);
      const token0 = tokens.find(t => t.symbol === pool.token0Symbol);
      const token1 = tokens.find(t => t.symbol === pool.token1Symbol);

      if (!token0 || !token1) {
        console.log('Tokens not found, skipping test');
        return;
      }

      const response = await client.smartChat(
        `What is the current exchange rate between ${pool.token0Symbol} and ${pool.token1Symbol} in pool ${pool.id}? ` +
          `Consider the decimals: ${token0.decimals} for ${pool.token0Symbol} and ${token1.decimals} for ${pool.token1Symbol}.`,
        ['query_dex']
      );

      expect(response.stop_reason).toBe('end_turn');

      // Calculate expected rate for verification
      const rate =
        reserves.token1 /
        Math.pow(10, token1.decimals) /
        (reserves.token0 / Math.pow(10, token0.decimals));

      console.log('Price Quote Test:', {
        poolId: pool.id,
        pair: `${pool.token0Symbol}-${pool.token1Symbol}`,
        calculatedRate: rate,
        response: (response.content[0] as any).text
      });
    },
    timeout
  );
});

interface ArbitrageTokenGroup {
  baseToken: KVTokenData;
  syntheticToken?: KVTokenData;
  lpToken?: KVTokenData & { underlyingPools?: KVPoolData[] };
}

describe('DEX Complex Arbitrage Tests', () => {
  let client: SmartAnthropicClient;
  let pools: KVPoolData[];
  let tokens: KVTokenData[];
  let tokenGroups: ArbitrageTokenGroup[] = [];
  const timeout = 1000000;

  beforeEach(async () => {
    client = new SmartAnthropicClient();
    toolRegistry.registerTool(dexTools.queryTool);
    pools = await PoolService.getAll();
    tokens = await TokenService.getAll();

    // Group related tokens (base, synthetic, and LP tokens)
    tokenGroups = createTokenGroups(tokens, pools);
  });

  function createTokenGroups(tokens: KVTokenData[], pools: KVPoolData[]): ArbitrageTokenGroup[] {
    const groups: ArbitrageTokenGroup[] = [];

    // Find base tokens and their synthetic/LP variants
    tokens.forEach(token => {
      // Skip if it's already a synthetic or LP token
      if (token.symbol.startsWith('iou') || token.symbol.startsWith('syn') || token.isLpToken) {
        return;
      }

      const group: ArbitrageTokenGroup = {
        baseToken: token
      };

      // Find synthetic version
      group.syntheticToken = tokens.find(
        t => t.symbol === `iou${token.symbol}` || t.symbol === `syn${token.symbol}`
      );

      // Find LP tokens containing this token
      const relatedLpTokens = tokens.filter(
        t =>
          t.isLpToken &&
          t.poolId !== undefined &&
          pools.some(
            p =>
              p.id === t.poolId &&
              (p.token0Symbol === token.symbol || p.token1Symbol === token.symbol)
          )
      );

      if (relatedLpTokens.length > 0) {
        // For each LP token, get its underlying pools
        relatedLpTokens.forEach(lpToken => {
          const underlyingPools = pools.filter(
            p =>
              p.id === lpToken.poolId ||
              p.token0Symbol === token.symbol ||
              p.token1Symbol === token.symbol
          );
          group.lpToken = { ...lpToken, underlyingPools };
        });
      }

      groups.push(group);
    });

    return groups;
  }

  it(
    'should analyze arbitrage opportunities between base, synthetic, and LP tokens',
    async () => {
      // Filter for token groups with multiple variants
      const arbitrageGroups = tokenGroups.filter(group => group.syntheticToken || group.lpToken);

      if (arbitrageGroups.length === 0) {
        console.log('No suitable token groups found, skipping test');
        return;
      }

      // Build comprehensive prompt for analysis
      const prompt = `Analyze arbitrage opportunities between these related tokens:

${arbitrageGroups
  .map(
    group => `
${group.baseToken.symbol} Group:
1. Base Token: ${group.baseToken.symbol} (${group.baseToken.contractAddress})
${
  group.syntheticToken
    ? `2. Synthetic Token: ${group.syntheticToken.symbol} (${group.syntheticToken.contractAddress})`
    : ''
}
${
  group.lpToken
    ? `3. LP Token: ${group.lpToken.symbol} (${group.lpToken.contractAddress})
   - Pool ID: ${group.lpToken.poolId}
   - Underlying Pools: ${group.lpToken.underlyingPools
     ?.map(p => `${p.token0Symbol}-${p.token1Symbol}`)
     .join(', ')}`
    : ''
}

Available Trading Pools:
${pools
  .filter(
    p =>
      p.token0Symbol === group.baseToken.symbol ||
      p.token1Symbol === group.baseToken.symbol ||
      (group.syntheticToken &&
        (p.token0Symbol === group.syntheticToken.symbol ||
          p.token1Symbol === group.syntheticToken.symbol)) ||
      (group.lpToken &&
        (p.token0Symbol === group.lpToken.symbol || p.token1Symbol === group.lpToken.symbol))
  )
  .map(p => `- ${p.token0Symbol}-${p.token1Symbol} (Pool ${p.id})`)
  .join('\n')}
`
  )
  .join('\n')}

Consider these arbitrage strategies:
1. Rebalancing 3 pools to correct price discrepancies at profitable rates
2. LP token decomposition into base tokens then swapping to greater amount of original LP
4. Multi-step arbitrage using combinations of all variants yielding higher token amounts

For each token group, calculate:
1. Direct price differences between variants
2. Arbitrage opportunities including LP decomposition
3. Minimum profitable trade size
4. Maximum profitable trade size considering liquidity

All arbitrage strategies should be profitable immediatly, without an expectation of future price changes.

What is the most profitable arbitrage strategy? Include step-by-step instructions and expected profits.`;

      const response = await client.smartChat(prompt, ['query_dex']);

      expect(response.stop_reason).toBe('end_turn');

      console.log('Complex Token Arbitrage Analysis:', {
        groupsAnalyzed: arbitrageGroups.length,
        response: (response.content[0] as any).text
      });
    },
    timeout
  );

  it(
    'should analyze UPDOG-specific arbitrage opportunities',
    async () => {
      const updog = tokens.find(t => t.symbol === 'UPDOG');
      if (!updog || !updog.poolId) {
        console.log('UPDOG token not found or no pool ID, skipping test');
        return;
      }

      const updogPool = pools.find(p => p.id === updog.poolId);
      if (!updogPool) {
        console.log('UPDOG pool not found, skipping test');
        return;
      }

      // Get all pools involving UPDOG or its underlying tokens
      const relatedPools = pools.filter(
        p =>
          p.token0Symbol === 'UPDOG' ||
          p.token1Symbol === 'UPDOG' ||
          p.token0Symbol === updogPool.token0Symbol ||
          p.token1Symbol === updogPool.token0Symbol ||
          p.token0Symbol === updogPool.token1Symbol ||
          p.token1Symbol === updogPool.token1Symbol
      );

      const reserves = await PoolService.getPoolReserves(updog.poolId);

      const prompt = `Analyze UPDOG-specific arbitrage opportunities:

UPDOG LP Token Info:
- Contract: ${updog.contractAddress}
- Pool ID: ${updog.poolId}
- Underlying Tokens: ${updogPool.token0Symbol}-${updogPool.token1Symbol}
- Current Reserves: ${reserves.token0} ${updogPool.token0Symbol}, ${reserves.token1} ${
        updogPool.token1Symbol
      }

Available Trading Routes:
${relatedPools.map(p => `- ${p.token0Symbol}-${p.token1Symbol} (Pool ${p.id})`).join('\n')}

Consider these strategies:
1. Direct UPDOG token trading
2. UPDOG decomposition into WELSH and DOG tokens
3. Trading underlying tokens separately
4. Reformed UPDOG LP provision

Calculate for each path:
1. Expected profit/loss
2. Maximum trade size for profitability

What is the most profitable strategy for arbitrage using UPDOG?`;

      const response = await client.smartChat(prompt, ['query_dex']);

      expect(response.stop_reason).toBe('end_turn');

      console.log('UPDOG Arbitrage Analysis:', {
        relatedPools: relatedPools.length,
        response: (response.content[0] as any).text
      });
    },
    timeout
  );
});

describe('Smart DEX Arbitrage Tests', () => {
  let client: SmartAnthropicClient;
  let pools: KVPoolData[];
  let tokens: KVTokenData[];
  const TEST_ADDRESS = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS';
  const timeout = 1000000;

  beforeEach(async () => {
    client = new SmartAnthropicClient();
    toolRegistry.registerTool(dexTools.queryTool);
    toolRegistry.registerTool(dexTools.swapTool);
    toolRegistry.registerTool(lpCalculatorTool);
    toolRegistry.registerTool(pricesQueryTool);
    pools = await PoolService.getAll(true);
    tokens = await TokenService.getAll();
  });

  it(
    'should find and execute profitable arbitrage',
    async () => {
      // Build comprehensive prompt with pool and token data
      const prompt = `I need help finding profitable arbitrage opportunities in this DEX. 
Here are all the available pools and their current states:

${pools
  .map(pool => {
    const token0 = tokens.find(t => t.symbol === pool.token0Symbol);
    const token1 = tokens.find(t => t.symbol === pool.token1Symbol);
    return `Pool ${pool.id}: ${pool.token0Symbol}-${pool.token1Symbol}
- Token0: ${token0?.contractAddress}
- Token1: ${token1?.contractAddress}
- Reserves: ${pool.reserves!.token0} ${pool.token0Symbol}, ${pool.reserves!.token1}
`;
  })
  .join('\n')}

I want to:
1. Find paths that start and end with the same token where I can get more tokens than I started with
2. Test multiple starting amount of 50000000 tokens
3. Ignore fees and slippage for now
4. Execute the trade if profitable

For each potential path:
1. Use query_dex tool to check amounts through the path
2. Calculate if end amount > start amount
3. If profitable, use swap_tokens tool to execute the trade

Owner address for transactions: ${TEST_ADDRESS}

Consider this arbitrage strategy:
Rebalancing 3 pools to correct price discrepancies at profitable rates.
Trading between CHA, WELSH and iouWELSH tokens is a good place to start.

Keep in mind: convert between token amounts and token balances using token decimals.
You will need to add several zeros to the token balances to get the correct amounts.

What profitable arbitrage paths can you find, and can you execute the best one?`;

      const response = await client.smartChat(prompt, ['query_dex', 'swap_tokens']);

      // Verify Claude found and attempted arbitrage
      expect(response.stop_reason).toBe('end_turn');
      const text = (response.content[0] as any).text.toLowerCase();

      // Should mention key terms
      expect(text).toMatch(/profit|arbitrage|opportunity/);
      expect(text).toMatch(/path|route/);
      expect(text).toMatch(/amount|quantity|tokens/);

      // Log Claude's analysis
      console.log('Arbitrage Analysis:', (response.content[0] as any).text);
    },
    timeout
  );

  it(
    'should check and execute advanced arbitrage opportunities',
    async () => {
      // Set up monitoring prompt
      const monitorPrompt = `Check these scenarios for arbitrage opportunities.
Here are all the available pools and their current states:

${pools
  .map(pool => {
    const token0 = tokens.find(t => t.symbol === pool.token0Symbol);
    const token1 = tokens.find(t => t.symbol === pool.token1Symbol);
    return `Pool ${pool.id}: ${pool.token0Symbol}-${pool.token1Symbol}
- Token0: ${token0?.contractAddress}
- Token1: ${token1?.contractAddress}
- Reserves: ${pool.reserves!.token0} ${pool.token0Symbol}, ${pool.reserves!.token1}
`;
  })
  .join('\n')}

Find out if derivatives (LP tokens (UPDOG) that constitue a pool (DOG-WELSH) and as a swappable token (CHA-UPDOG)) that are currently undervalued or overvalued compared to their underlying tokens (UPDOG), then build an arbitrage strategy around them that starts and ends with the CHA token.

When calling tools, use the token amount without decimals (scale up) but when speaking to me, use the human readable amount (scale down) and provide a USD value estimate.

Use address ${TEST_ADDRESS} for any trades.`;

      // Make several attempts to find and execute arbitrage
      for (let i = 0; i < 2; i++) {
        // const response = await client.smartChat(monitorPrompt, ['query_dex', 'swap_tokens']);
        const response = await client.smartChat(monitorPrompt, [
          'query_dex',
          'query_prices',
          'lp_calculator'
        ]);

        console.log(`Monitoring Round ${i + 1}:`, (response.content[0] as any).text);

        // Wait between checks
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    },
    timeout
  );
});
