// lib/services/prices-service.ts

import { callReadOnlyFunction, principalCV } from "@stacks/transactions";
import velarApi from "./velar-api";
import cmc from "./cmc-api";

export type TokenInfo = {
  symbol: string;
  name: string;
  image: string;
  contractAddress: string;
  price?: number;
  tokenId?: string
  decimals: number;
};

class PricesService {
  private static async getPoolReserves(poolId: number, token0Address: string, token1Address: string): Promise<{ token0: number; token1: number }> {
    try {
      const result: any = await callReadOnlyFunction({
        contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
        contractName: "univ2-core",
        functionName: "lookup-pool",
        functionArgs: [
          principalCV(token0Address),
          principalCV(token1Address)
        ],
        senderAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
      });

      if (result.value) {
        const poolInfo = result.value.data.pool;
        const reserve0 = Number(poolInfo.data.reserve0.value);
        const reserve1 = Number(poolInfo.data.reserve1.value);
        return { token0: reserve0, token1: reserve1 };
      } else {
        console.error("Pool not found");
        return { token0: 0, token1: 0 };
      }
    } catch (error) {
      console.error("Error fetching reserves:", error);
      return { token0: 0, token1: 0 };
    }
  }

  private static async calculateChaPrice(stxPrice: number): Promise<number> {
    const stxChaReserves = await this.getPoolReserves(
      4,
      "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wstx",
      "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token"
    );

    const chaPrice = (stxPrice * stxChaReserves.token0) / stxChaReserves.token1;
    return chaPrice || 0.30;
  }

  private static async getVelarTokenPrices(): Promise<{ [key: string]: number }> {
    const prices = await velarApi.tokens('all');
    return prices.reduce((acc: { [key: string]: number }, token: any) => {
      acc[token.symbol] = token.price;
      return acc;
    }, {});
  }

  public static async getAllTokenPrices(): Promise<{ [key: string]: number }> {
    const velarPrices = await this.getVelarTokenPrices();
    const cmcPriceData = await cmc.getQuotes({ symbol: ['STX', 'ORDI', 'WELSH', 'DOG'] });

    const chaPrice = await this.calculateChaPrice(cmcPriceData.data['STX'].quote.USD.price);

    // Convert all velar prices to numbers
    const convertedVelarPrices = Object.keys(velarPrices).reduce((acc: { [key: string]: number }, key: string) => {
      acc[key] = Number(velarPrices[key]);
      return acc;
    }, {});

    return {
      ...convertedVelarPrices,
      'CHA': chaPrice,
      'STX': cmcPriceData.data['STX'].quote.USD.price,
      'ORDI': cmcPriceData.data['ORDI'].quote.USD.price,
      'DOG': cmcPriceData.data['DOG'].quote.USD.price,
      'WELSH': cmcPriceData.data['WELSH'].quote.USD.price,
      'iouWELSH': cmcPriceData.data['WELSH'].quote.USD.price,
      'iouROO': convertedVelarPrices['$ROO'], // Assuming $ROO price is in velarPrices
    };
  }

  public static async getLpTokenPrice(
    poolId: number,
    token0: TokenInfo,
    token1: TokenInfo,
    totalLpSupply: number
  ): Promise<number> {
    try {
      const reserves = await this.getPoolReserves(poolId, token0.contractAddress, token1.contractAddress);

      // Calculate the total value of the pool
      const totalValue = (reserves.token0 / (10 ** token0.decimals) * (token0.price || 0)) + (reserves.token1 / (10 ** token1.decimals) * (token1.price || 0));

      // Calculate the price per LP token
      const lpTokenPrice = totalValue / (totalLpSupply || 1);

      return lpTokenPrice;
    } catch (error) {
      console.error("Error calculating LP token price:", error);
      return 0;
    }
  }
}

export default PricesService;