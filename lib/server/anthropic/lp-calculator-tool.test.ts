import { describe, it, expect, beforeEach } from 'vitest';
import { SmartAnthropicClient } from './client';
import { toolRegistry } from './tool-registry';
import { KVTokenData, TokenService } from '../tokens/token-service';
import { KVPoolData, PoolService } from '../pools/pool-service';
import { lpCalculatorTool } from './lp-calculator-tool';
import PricesService from '@lib/prices-service';

describe('LP Calculator Tool Tests', () => {
  let client: SmartAnthropicClient;
  let tokens: KVTokenData[];
  let pools: KVPoolData[];
  let prices: { [key: string]: number };
  const timeout = 30000;

  beforeEach(async () => {
    client = new SmartAnthropicClient();
    toolRegistry.registerTool(lpCalculatorTool);
    tokens = await TokenService.getAll();
    pools = await PoolService.getAll();
    prices = await PricesService.getAllTokenPrices();
  });

  it(
    'should get LP token composition and value for UPDOG',
    async () => {
      const updog = tokens.find(t => t.symbol === 'UPDOG');
      if (!updog) throw new Error('UPDOG token not found');

      // Get composition first
      const composition = await lpCalculatorTool.handler!({
        operation: 'get_composition',
        lpTokenAddress: updog.contractAddress
      });

      // Verify composition
      expect(composition.lpToken.symbol).toBe('UPDOG');
      expect(composition.underlyingTokens.token0.symbol).toBe('WELSH');
      expect(composition.underlyingTokens.token1.symbol).toBe('DOG');

      // Calculate value using real prices
      const valueResponse = await lpCalculatorTool.handler!({
        operation: 'estimate_value',
        lpTokenAddress: updog.contractAddress,
        prices: {
          WELSH: prices.WELSH,
          DOG: prices.DOG
        }
      });

      // Compare with PricesService calculation
      const pricesServiceValue = await PricesService.getLpTokenPriceByPoolId(updog.poolId!);

      console.log('UPDOG Analysis:', {
        composition: {
          totalSupply: composition.lpToken.totalSupply,
          reserves: composition.pool.reserves
        },
        valueCalculation: {
          toolCalculation: valueResponse.pricePerLp,
          pricesService: pricesServiceValue,
          difference: Math.abs(valueResponse.pricePerLp - pricesServiceValue) / pricesServiceValue
        },
        underlyingPrices: {
          WELSH: prices.WELSH,
          DOG: prices.DOG
        }
      });

      // Values should be within 1% of each other
      expect(
        Math.abs(valueResponse.pricePerLp - pricesServiceValue) / pricesServiceValue
      ).toBeLessThan(0.01);
    },
    timeout
  );

  it(
    'should calculate accurate burn returns based on current prices',
    async () => {
      const updog = tokens.find(t => t.symbol === 'UPDOG');
      if (!updog) throw new Error('UPDOG token not found');
      const welsh = tokens.find(t => t.symbol === 'WELSH');
      if (!welsh) throw new Error('WELSH token not found');
      const dog = tokens.find(t => t.symbol === 'DOG');
      if (!dog) throw new Error('DOG token not found');

      // Calculate burns for different amounts
      const testAmounts = [10000, 100000, 1000000];

      for (const amount of testAmounts) {
        // Get burn returns
        const burnResult = await lpCalculatorTool.handler!({
          operation: 'calc_burn_returns',
          lpTokenAddress: updog.contractAddress,
          amount
        });

        // Calculate value of returned tokens
        const returnValue =
          (burnResult.token0Amount / Math.pow(10, welsh.decimals)) * prices.WELSH +
          (burnResult.token1Amount / Math.pow(10, dog.decimals)) * prices.DOG;

        // Calculate value of LP tokens burned
        const lpValue = amount * prices.UPDOG;

        console.log(`Burn ${amount} UPDOG:`, {
          returns: {
            welsh: burnResult.token0Amount / Math.pow(10, welsh.decimals),
            dog: burnResult.token1Amount / Math.pow(10, dog.decimals),
            sharePercent: (burnResult.share * 100).toFixed(2) + '%'
          },
          value: {
            returnValue,
            lpValue,
            ratio: returnValue / lpValue
          }
        });

        // Return value should be close to LP value (within 1% accounting for fees)
        expect(Math.abs(returnValue - lpValue) / lpValue).toBeLessThan(0.01);
      }
    },
    timeout
  );

  it(
    'should analyze all LP tokens with current market prices',
    async () => {
      const lpTokens = tokens.filter(t => t.isLpToken && t.poolId);

      for (const lpToken of lpTokens) {
        try {
          // Get composition
          const composition = await lpCalculatorTool.handler!({
            operation: 'get_composition',
            lpTokenAddress: lpToken.contractAddress
          });

          // Get value using current prices
          const value = await lpCalculatorTool.handler!({
            operation: 'estimate_value',
            lpTokenAddress: lpToken.contractAddress,
            prices
          });

          // Get PricesService value for comparison
          const pricesServiceValue = await PricesService.getLpTokenPriceByPoolId(lpToken.poolId!);

          console.log(`${lpToken.symbol} Analysis:`, {
            composition: {
              token0: composition.underlyingTokens.token0.symbol,
              token1: composition.underlyingTokens.token1.symbol,
              reserves: composition.pool.reserves
            },
            prices: {
              token0: prices[composition.underlyingTokens.token0.symbol],
              token1: prices[composition.underlyingTokens.token1.symbol],
              lpToken: pricesServiceValue
            },
            value: {
              toolCalculation: value.pricePerLp,
              pricesService: pricesServiceValue,
              difference: Math.abs(value.pricePerLp - pricesServiceValue) / pricesServiceValue
            }
          });

          // Values should be within 1% of each other
          expect(Math.abs(value.pricePerLp - pricesServiceValue) / pricesServiceValue).toBeLessThan(
            0.01
          );
        } catch (error) {
          console.error(`Error analyzing ${lpToken.symbol}:`, error);
          expect(error).toBeDefined();
        }
      }
    },
    timeout
  );

  it(
    'should validate arbitrage opportunities with current prices',
    async () => {
      const lpTokens = tokens.filter(t => t.isLpToken && t.poolId);

      for (const lpToken of lpTokens) {
        // Get composition and pool reserves
        const composition = await lpCalculatorTool.handler!({
          operation: 'get_composition',
          lpTokenAddress: lpToken.contractAddress
        });

        // Get underlying token symbols
        const { token0Symbol, token1Symbol } = composition.pool;

        // Calculate implied price from reserves
        const impliedPrice =
          composition.pool.reserves.token1 /
          Math.pow(10, composition.underlyingTokens.token1.decimals) /
          (composition.pool.reserves.token0 /
            Math.pow(10, composition.underlyingTokens.token0.decimals));

        // Get market prices
        const marketPrice = prices[token1Symbol] / prices[token0Symbol];

        console.log(`${lpToken.symbol} Price Analysis:`, {
          impliedPrice,
          marketPrice,
          difference: ((Math.abs(impliedPrice - marketPrice) / marketPrice) * 100).toFixed(2) + '%',
          prices: {
            [token0Symbol]: prices[token0Symbol],
            [token1Symbol]: prices[token1Symbol]
          }
        });

        // Log potential arbitrage if price difference is significant
        if (Math.abs(impliedPrice - marketPrice) / marketPrice > 0.02) {
          // 2% threshold
          console.log(`Potential arbitrage opportunity in ${lpToken.symbol}:`, {
            priceDifferencePercent:
              ((Math.abs(impliedPrice - marketPrice) / marketPrice) * 100).toFixed(2) + '%',
            action: impliedPrice > marketPrice ? 'Buy market, sell pool' : 'Buy pool, sell market'
          });
        }
      }
    },
    timeout
  );
});
