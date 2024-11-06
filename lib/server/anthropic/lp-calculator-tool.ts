import { PoolService } from '../pools/pool-service';
import { TokenService } from '../tokens/token-service';
import { ToolDefinition } from './tool-registry';

interface LPCalculatorParams {
  operation: 'get_composition' | 'estimate_value' | 'calc_burn_returns';
  lpTokenAddress: string;
  amount?: number;
  prices?: { [symbol: string]: number };
}

interface LPCompositionResult {
  lpToken: {
    symbol: string;
    name: string;
    address: string;
    totalSupply: number;
  };
  pool: {
    id: number;
    token0Symbol: string;
    token1Symbol: string;
    reserves: {
      token0: number;
      token1: number;
    };
  };
  underlyingTokens: {
    token0: {
      symbol: string;
      decimals: number;
      valuePerLp: number;
    };
    token1: {
      symbol: string;
      decimals: number;
      valuePerLp: number;
    };
  };
}

export const lpCalculatorTool: ToolDefinition = {
  name: 'lp_calculator',
  description: `LP Token calculator for analyzing liquidity pool tokens.
                Calculate token composition, estimate value, and calculate burn returns.
                
                Operations:
                - get_composition: Get current reserves and token information
                - estimate_value: Calculate LP token value in USD or other denominations. This expects raw token amounts ignoring decimal point positions.
                - calc_burn_returns: Calculate expected token returns from burning LP tokens
                
                Example: "Calculate the value of 1000 UPDOG tokens based on current WELSH and DOG prices"`,
  input_schema: {
    type: 'object',
    properties: {
      operation: {
        type: 'string',
        enum: ['get_composition', 'estimate_value', 'calc_burn_returns'],
        description: 'The calculation operation to perform'
      },
      lpTokenAddress: {
        type: 'string',
        description: 'Contract principal of the LP token'
      },
      amount: {
        type: 'number',
        description: 'Amount of LP tokens (required for burn calculations)'
      },
      prices: {
        type: 'object',
        description: 'Token prices for value estimation',
        additionalProperties: { type: 'number' }
      }
    },
    required: ['operation', 'lpTokenAddress']
  },
  handler: async (params: LPCalculatorParams) => {
    switch (params.operation) {
      case 'get_composition':
        return getComposition(params.lpTokenAddress);

      case 'estimate_value':
        if (!params.prices) {
          throw new Error('Prices required for value estimation');
        }
        const composition = await getComposition(params.lpTokenAddress);
        return calculateValue(composition, params.prices);

      case 'calc_burn_returns':
        if (!params.amount) {
          throw new Error('Amount required for burn calculation');
        }
        const lpData = await getComposition(params.lpTokenAddress);
        return calculateBurnAmount(lpData, params.amount);

      default:
        throw new Error(`Unknown operation: ${params.operation}`);
    }
  }
};

async function getComposition(lpTokenAddress: string): Promise<LPCompositionResult> {
  // Get token data
  const tokens = await TokenService.getAll();
  const lpToken = tokens.find(t => t.contractAddress === lpTokenAddress);

  if (!lpToken?.isLpToken || !lpToken.poolId) {
    throw new Error('Invalid LP token address');
  }

  // Get pool with reserves
  const pool = (
    await PoolService.getPoolsWithReserves({
      poolIds: [lpToken.poolId],
      forceUpdate: true
    })
  )[0];

  if (!pool?.reserves) {
    throw new Error('Pool reserves not available');
  }

  // Get underlying tokens
  const token0 = tokens.find(t => t.symbol === pool.token0Symbol);
  const token1 = tokens.find(t => t.symbol === pool.token1Symbol);

  if (!token0 || !token1) {
    throw new Error('Underlying tokens not found');
  }

  const totalSupply = await TokenService.getLpTokenTotalSupply(lpTokenAddress);

  // Calculate per-LP token values
  const valuePerLp0 = pool.reserves.token0 / totalSupply;
  const valuePerLp1 = pool.reserves.token1 / totalSupply;

  return {
    lpToken: {
      symbol: lpToken.symbol,
      name: lpToken.name,
      address: lpToken.contractAddress,
      totalSupply
    },
    pool: {
      id: pool.id,
      token0Symbol: pool.token0Symbol,
      token1Symbol: pool.token1Symbol,
      reserves: pool.reserves
    },
    underlyingTokens: {
      token0: {
        symbol: token0.symbol,
        decimals: token0.decimals,
        valuePerLp: valuePerLp0
      },
      token1: {
        symbol: token1.symbol,
        decimals: token1.decimals,
        valuePerLp: valuePerLp1
      }
    }
  };
}

async function calculateValue(
  composition: LPCompositionResult,
  prices: { [symbol: string]: number }
): Promise<{
  pricePerLp: number;
  totalValue: number;
  tokenValues: {
    [symbol: string]: number;
  };
}> {
  return TokenService.calculateLpTokenPrice(
    composition.pool.id,
    composition.pool.reserves,
    composition.pool.token0Symbol,
    composition.pool.token1Symbol,
    composition.lpToken.address,
    prices
  ).then(pricePerLp => ({
    pricePerLp,
    totalValue: pricePerLp * composition.lpToken.totalSupply,
    tokenValues: {
      [composition.pool.token0Symbol]:
        composition.pool.reserves.token0 * (prices[composition.pool.token0Symbol] || 0),
      [composition.pool.token1Symbol]:
        composition.pool.reserves.token1 * (prices[composition.pool.token1Symbol] || 0)
    }
  }));
}

function calculateBurnAmount(
  composition: LPCompositionResult,
  amount: number
): {
  token0Amount: number;
  token1Amount: number;
  share: number;
} {
  const share = amount / composition.lpToken.totalSupply;

  return {
    token0Amount: Math.floor(composition.pool.reserves.token0 * share),
    token1Amount: Math.floor(composition.pool.reserves.token1 * share),
    share
  };
}
