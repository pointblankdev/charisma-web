import { ToolDefinition } from './tool-registry';
import {
  contractPrincipalCV,
  uintCV,
  tupleCV,
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  fetchCallReadOnlyFunction,
  ClarityValue,
  cvToValue
} from '@stacks/transactions';
import { network } from '@components/stacks-session/connect';
import { CharacterTransactionService } from '@lib/data/characters.service';

// Types for the tool parameters
interface QueryPoolParams {
  operation: 'get_pool' | 'get_reserves' | 'get_amounts_out' | 'quote';
  poolId: number;
  tokenIn?: string;
  tokenOut?: string;
  amountIn?: number;
}

interface SwapParams {
  operation: 'swap' | 'multi_swap';
  amountIn: number;
  amountOutMin: number;
  tokenIn: string;
  tokenOut: string;
  path?: string[];
}

interface LiquidityParams {
  operation: 'add' | 'remove';
  poolId: number;
  token0Amount: number;
  token1Amount: number;
  minToken0?: number;
  minToken1?: number;
}

interface DexToolParams {
  ownerAddress: string;
}

// Contract addresses
const CONTRACTS = {
  core: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.univ2-core',
  router: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.univ2-router',
  library: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.univ2-library',
  path: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.univ2-path2'
};

// Tool Definitions
export const dexQueryTool: ToolDefinition = {
  name: 'query_dex',
  description: `Query DEX information including pool data, reserves, and price quotes. 
                Use this tool to get information about pools, check token prices, and calculate swap amounts. 
                All queries are read-only and do not modify state.`,
  input_schema: {
    type: 'object',
    properties: {
      operation: {
        type: 'string',
        enum: ['get_pool', 'get_reserves', 'get_amounts_out', 'quote'],
        description: 'The query operation to perform'
      },
      poolId: {
        type: 'number',
        description: 'Pool ID to query'
      },
      tokenIn: {
        type: 'string',
        description: 'Contract principal for input token (required for swap calculations)'
      },
      tokenOut: {
        type: 'string',
        description: 'Contract principal for output token (required for swap calculations)'
      },
      amountIn: {
        type: 'number',
        description: 'Input amount for swap calculations'
      }
    },
    required: ['operation', 'poolId']
  },
  handler: async (params: QueryPoolParams) => {
    switch (params.operation) {
      case 'get_pool':
        return await getPool(params.poolId);
      case 'get_reserves':
        return await getReserves(params.poolId);
      case 'get_amounts_out':
        if (!params.tokenIn || !params.tokenOut || !params.amountIn) {
          throw new Error('Missing required parameters for get_amounts_out');
        }
        return await getAmountsOut(params.amountIn, params.tokenIn, params.tokenOut);
      case 'quote':
        if (!params.tokenIn || !params.tokenOut || !params.amountIn) {
          throw new Error('Missing required parameters for quote');
        }
        return await getQuote(params.amountIn, params.tokenIn, params.tokenOut);
      default:
        throw new Error(`Unknown operation: ${params.operation}`);
    }
  }
};

export const dexSwapTool: ToolDefinition = {
  name: 'swap_tokens',
  description: `Execute token swaps on the DEX. 
                Supports direct swaps between two tokens or multi-hop swaps through multiple pools. 
                Includes slippage protection through amountOutMin parameter. 
                Requires sufficient token allowance and balance.`,
  input_schema: {
    type: 'object',
    properties: {
      ownerAddress: {
        type: 'string',
        description: 'Address of the account executing the swap'
      },
      operation: {
        type: 'string',
        enum: ['swap', 'multi_swap'],
        description: 'Type of swap to perform'
      },
      amountIn: {
        type: 'number',
        description: 'Amount of input tokens to swap'
      },
      amountOutMin: {
        type: 'number',
        description: 'Minimum amount of output tokens to receive (slippage protection)'
      },
      tokenIn: {
        type: 'string',
        description: 'Contract principal for input token'
      },
      tokenOut: {
        type: 'string',
        description: 'Contract principal for output token'
      },
      path: {
        type: 'array',
        items: {
          type: 'string'
        },
        description: 'Array of token addresses for multi-hop swap'
      }
    },
    required: ['ownerAddress', 'operation', 'amountIn', 'amountOutMin', 'tokenIn', 'tokenOut']
  },
  handler: async (params: SwapParams & DexToolParams) => {
    const characterService = new CharacterTransactionService();
    const senderKey = await characterService.getStxPrivateKey(params.ownerAddress);

    if (params.operation === 'multi_swap' && (!params.path || params.path.length < 3)) {
      throw new Error('Multi-hop swap requires a path of at least 3 tokens');
    }

    if (!params.amountOutMin) {
      throw new Error('Swap requires a minimum output amount');
    }

    let poolId = 0;
    if (params.operation === 'swap') {
      poolId = await getPoolId(params.tokenIn, params.tokenOut);
    }
    const contractAddress =
      params.operation === 'swap' ? CONTRACTS.router.split('.')[0] : CONTRACTS.path.split('.')[0];
    const contractName =
      params.operation === 'swap' ? CONTRACTS.router.split('.')[1] : CONTRACTS.path.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName:
        params.operation === 'swap'
          ? 'swap-exact-tokens-for-tokens'
          : `swap-${params.path!.length}`,
      functionArgs:
        params.operation === 'swap' ? getSwapArgs(poolId, params) : getMultiSwapArgs(params),
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      senderKey,
      fee: 1100000
    };

    const transaction = await makeContractCall(txOptions);
    return broadcastTransaction({ transaction, network });
  }
};

export const dexLiquidityTool: ToolDefinition = {
  name: 'manage_liquidity',
  description: `Add or remove liquidity from DEX pools. 
                Includes slippage protection through minimum amount parameters. 
                When adding liquidity, tokens must be pre-approved. 
                When removing liquidity, LP tokens must be pre-approved.`,
  input_schema: {
    type: 'object',
    properties: {
      ownerAddress: {
        type: 'string',
        description: 'Address of the account managing liquidity'
      },
      operation: {
        type: 'string',
        enum: ['add', 'remove'],
        description: 'Whether to add or remove liquidity'
      },
      poolId: {
        type: 'number',
        description: 'Pool ID to interact with'
      },
      token0Amount: {
        type: 'number',
        description: 'Amount of token0 to add/remove'
      },
      token1Amount: {
        type: 'number',
        description: 'Amount of token1 to add/remove'
      },
      minToken0: {
        type: 'number',
        description: 'Minimum amount of token0 (slippage protection)'
      },
      minToken1: {
        type: 'number',
        description: 'Minimum amount of token1 (slippage protection)'
      }
    },
    required: ['ownerAddress', 'operation', 'poolId', 'token0Amount', 'token1Amount']
  },
  handler: async (params: LiquidityParams & DexToolParams) => {
    const characterService = new CharacterTransactionService();
    const senderKey = await characterService.getStxPrivateKey(params.ownerAddress);

    const pool = await getPool(params.poolId);
    const txOptions = {
      contractAddress: CONTRACTS.router.split('.')[0],
      contractName: CONTRACTS.router.split('.')[1],
      functionName: params.operation === 'add' ? 'add-liquidity' : 'remove-liquidity',
      functionArgs: getLiquidityArgs(pool, params),
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      senderKey,
      fee: 1100000
    };

    const transaction = await makeContractCall(txOptions);
    return broadcastTransaction({ transaction, network });
  }
};

// Helper functions
async function getPool(poolId: number) {
  const result = await fetchCallReadOnlyFunction({
    contractAddress: CONTRACTS.core.split('.')[0],
    contractName: CONTRACTS.core.split('.')[1],
    functionName: 'get-pool',
    functionArgs: [uintCV(poolId)],
    network,
    senderAddress: CONTRACTS.router
  });
  return cvToValue(result).value;
}

async function getPoolId(token0: string, token1: string): Promise<number> {
  const result = await fetchCallReadOnlyFunction({
    contractAddress: CONTRACTS.core.split('.')[0],
    contractName: CONTRACTS.core.split('.')[1],
    functionName: 'get-pool-id',
    functionArgs: [
      contractPrincipalCV(token0.split('.')[0], token0.split('.')[1]),
      contractPrincipalCV(token1.split('.')[0], token1.split('.')[1])
    ],
    network,
    senderAddress: CONTRACTS.router
  });
  return Number(cvToValue(result).value);
}

// Helper functions for read-only operations
async function getReserves(poolId: number) {
  const pool = await getPool(poolId);
  return {
    reserve0: Number(pool.reserve0.value),
    reserve1: Number(pool.reserve1.value)
  };
}

async function getAmountsOut(amountIn: number, tokenIn: string, tokenOut: string) {
  const pool = await lookupPool(tokenIn, tokenOut);
  if (!pool) throw new Error('Pool not found');

  const poolInfo = pool.pool.value;
  const isToken0 = !pool.flipped.value;

  const result = await fetchCallReadOnlyFunction({
    contractAddress: CONTRACTS.library.split('.')[0],
    contractName: CONTRACTS.library.split('.')[1],
    functionName: 'get-amount-out',
    functionArgs: [
      uintCV(amountIn),
      uintCV(isToken0 ? Number(poolInfo.reserve0.value) : Number(poolInfo.reserve1.value)),
      uintCV(isToken0 ? Number(poolInfo.reserve1.value) : Number(poolInfo.reserve0.value)),
      tupleCV({
        num: uintCV(Number(poolInfo['swap-fee'].value.num.value)),
        den: uintCV(Number(poolInfo['swap-fee'].value.den.value))
      })
    ],
    network,
    senderAddress: CONTRACTS.router
  });

  return cvToValue(result).value;
}

async function getQuote(amountIn: number, tokenIn: string, tokenOut: string) {
  const pool = await lookupPool(tokenIn, tokenOut);
  if (!pool) throw new Error('Pool not found');

  const poolInfo = pool.pool.value;
  const isToken0 = !pool.flipped.value;

  const result = await fetchCallReadOnlyFunction({
    contractAddress: CONTRACTS.library.split('.')[0],
    contractName: CONTRACTS.library.split('.')[1],
    functionName: 'quote',
    functionArgs: [
      uintCV(amountIn),
      uintCV(isToken0 ? Number(poolInfo.reserve0.value) : Number(poolInfo.reserve1.value)),
      uintCV(isToken0 ? Number(poolInfo.reserve1.value) : Number(poolInfo.reserve0.value))
    ],
    network,
    senderAddress: CONTRACTS.router
  });
  return cvToValue(result).value;
}

async function lookupPool(token0: string, token1: string) {
  const result = await fetchCallReadOnlyFunction({
    contractAddress: CONTRACTS.core.split('.')[0],
    contractName: CONTRACTS.core.split('.')[1],
    functionName: 'lookup-pool',
    functionArgs: [
      contractPrincipalCV(token0.split('.')[0], token0.split('.')[1]),
      contractPrincipalCV(token1.split('.')[0], token1.split('.')[1])
    ],
    network,
    senderAddress: CONTRACTS.router
  });
  // console.log('Lookup result:', cvToValue(result).value);
  return cvToValue(result).value;
}

// Helper functions for constructing transaction arguments
function getSwapArgs(poolId: number, params: SwapParams): ClarityValue[] {
  return [
    uintCV(poolId),
    contractPrincipalCV(params.tokenIn.split('.')[0], params.tokenIn.split('.')[1]),
    contractPrincipalCV(params.tokenOut.split('.')[0], params.tokenOut.split('.')[1]),
    contractPrincipalCV(params.tokenIn.split('.')[0], params.tokenIn.split('.')[1]),
    contractPrincipalCV(params.tokenOut.split('.')[0], params.tokenOut.split('.')[1]),
    contractPrincipalCV(CONTRACTS.core.split('.')[0], 'univ2-share-fee-to'),
    uintCV(params.amountIn),
    uintCV(params.amountOutMin || 1)
  ];
}

function getMultiSwapArgs(params: SwapParams): ClarityValue[] {
  if (!params.path) throw new Error('Path required for multi-swap');

  return [
    uintCV(params.amountIn),
    uintCV(params.amountOutMin || 1),
    ...params.path.map(token => contractPrincipalCV(token.split('.')[0], token.split('.')[1])),
    contractPrincipalCV(CONTRACTS.core.split('.')[0], 'univ2-share-fee-to')
  ];
}

function getLiquidityArgs(pool: any, params: LiquidityParams): ClarityValue[] {
  return [
    uintCV(params.poolId),
    contractPrincipalCV(
      pool.value.token0.value.split('.')[0],
      pool.value.token0.value.split('.')[1]
    ),
    contractPrincipalCV(
      pool.value.token1.value.split('.')[0],
      pool.value.token1.value.split('.')[1]
    ),
    contractPrincipalCV(
      pool.value.lpToken.value.split('.')[0],
      pool.value.lpToken.value.split('.')[1]
    ),
    uintCV(params.token0Amount),
    uintCV(params.token1Amount),
    uintCV(params.minToken0 || params.token0Amount),
    uintCV(params.minToken1 || params.token1Amount)
  ];
}

// Export all tools
export const dexTools = {
  queryTool: dexQueryTool,
  swapTool: dexSwapTool,
  liquidityTool: dexLiquidityTool
};
