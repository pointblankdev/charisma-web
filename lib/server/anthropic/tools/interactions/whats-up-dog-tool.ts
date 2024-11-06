import {
  contractPrincipalCV,
  uintCV,
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  stringAsciiCV
} from '@stacks/transactions';
import { ToolDefinition } from '../../tool-registry';
import PricesService from '@lib/prices-service';
import { TokenService } from '@lib/server/tokens/token-service';
import { network } from '@components/stacks-session/connect';
import { PoolService } from '@lib/server/pools/pool-service';
import { CharacterTransactionService } from '@lib/data/characters.service';

interface ArbitrageParams {
  operation: 'analyze' | 'execute';
  path: 'forward' | 'reverse';
  ownerAddress: string;
  checkOnly?: boolean;
}

interface ArbitrageOpportunity {
  profitableAmount: number;
  expectedProfit: number;
  profitPercentage: number;
  path: string[];
  prices: {
    updogMarket: number;
    updogComposition: number;
    welsh: number;
    dog: number;
  };
}

export const arbitrageTool: ToolDefinition = {
  name: 'arbitrage_analyzer',
  description: `Analyze and execute arbitrage opportunities between UPDOG LP token and its components.
                Can check profitability and execute trades through the arbitrage contract.
                
                Operations:
                - analyze: Calculate potential profits from current market conditions
                - execute: Execute arbitrage if profitable through contract call
                
                Paths:
                - forward: Buy UPDOG -> Remove liquidity -> Sell components
                - reverse: Buy components -> Add liquidity -> Sell UPDOG
                
                Example: "Check if there's a profitable arbitrage opportunity with UPDOG"`,
  input_schema: {
    type: 'object',
    properties: {
      operation: {
        type: 'string',
        enum: ['analyze', 'execute'],
        description: 'Operation to perform'
      },
      path: {
        type: 'string',
        enum: ['forward', 'reverse'],
        description: 'Arbitrage path to analyze/execute'
      },
      ownerAddress: {
        type: 'string',
        description: 'Address of the character executing the arbitrage'
      },
      checkOnly: {
        type: 'boolean',
        description: 'Only check profitability without executing'
      }
    },
    required: ['operation', 'path', 'ownerAddress']
  },
  handler: async (params: ArbitrageParams) => {
    // Get latest prices and pools
    const prices = await PricesService.getAllTokenPrices();
    const pools = await PoolService.getAll(true);
    const tokens = await TokenService.getAll();
    const characterService = new CharacterTransactionService();
    const senderKey = await characterService.getStxPrivateKey(params.ownerAddress);

    // Get UPDOG and component tokens
    const updog = tokens.find(t => t.symbol === 'UPDOG');
    const welsh = tokens.find(t => t.symbol === 'WELSH');
    const dog = tokens.find(t => t.symbol === 'DOG');

    if (!updog?.poolId || !welsh || !dog) {
      throw new Error('Required tokens not found');
    }

    // Get current UPDOG composition value
    const updogPool = pools.find((p: { id: number | undefined }) => p.id === updog.poolId);
    if (!updogPool?.reserves) {
      throw new Error('UPDOG pool data not found');
    }

    const updogCompositionValue = await PricesService.getLpTokenPrice(
      updog.poolId,
      {
        symbol: 'WELSH',
        decimals: welsh.decimals,
        contractAddress: welsh.contractAddress,
        name: welsh.name,
        image: welsh.imagePath
      },
      {
        symbol: 'DOG',
        decimals: dog.decimals,
        contractAddress: dog.contractAddress,
        name: dog.name,
        image: dog.imagePath
      },
      await TokenService.getLpTokenTotalSupply(updog.contractAddress)
    );

    const opportunity: ArbitrageOpportunity = {
      profitableAmount: 0,
      expectedProfit: 0,
      profitPercentage: 0,
      path: [],
      prices: {
        updogMarket: prices.UPDOG,
        updogComposition: updogCompositionValue,
        welsh: prices.WELSH,
        dog: prices.DOG
      }
    };

    if (params.path === 'forward') {
      // Calculate forward path profit (buy UPDOG -> remove liquidity -> sell components)
      const profit = updogCompositionValue - prices.UPDOG;
      const profitPercentage = (profit / prices.UPDOG) * 100;

      if (profitPercentage > 1) {
        // More than 1% profit
        opportunity.profitableAmount = 1000 * Math.pow(10, updog.decimals); // Start with 1000 UPDOG
        opportunity.expectedProfit = profit * 1000;
        opportunity.profitPercentage = profitPercentage;
        opportunity.path = ['Buy UPDOG', 'Remove Liquidity', 'Sell WELSH', 'Sell DOG'];
      }
    } else {
      // Calculate reverse path profit (buy components -> add liquidity -> sell UPDOG)
      const profit = prices.UPDOG - updogCompositionValue;
      const profitPercentage = (profit / updogCompositionValue) * 100;

      if (profitPercentage > 1) {
        opportunity.profitableAmount = 1000 * Math.pow(10, welsh.decimals); // Start with 1000 WELSH worth
        opportunity.expectedProfit = profit * 1000;
        opportunity.profitPercentage = profitPercentage;
        opportunity.path = ['Buy WELSH', 'Buy DOG', 'Add Liquidity', 'Sell UPDOG'];
      }
    }

    // If just analyzing, return the opportunity
    if (params.operation === 'analyze' || params.checkOnly) {
      return opportunity;
    }

    // If profitable and executing, call the arbitrage contract
    if (opportunity.profitPercentage > 1) {
      const txOptions = {
        contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
        contractName: 'updog-arbitrage',
        functionName: 'execute',
        functionArgs: [
          contractPrincipalCV('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS', 'rulebook'),
          stringAsciiCV(params.path.toUpperCase())
        ],
        senderKey,
        network: network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        fee: 1100000
      };

      const transaction = await makeContractCall(txOptions);
      const result = await broadcastTransaction({ transaction, network });

      return {
        ...opportunity,
        execution: {
          txid: result.txid,
          status: 'broadcasted'
        }
      };
    }

    return {
      ...opportunity,
      execution: {
        status: 'not_profitable'
      }
    };
  }
};
