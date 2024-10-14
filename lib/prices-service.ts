// lib/services/prices-service.ts

import { callReadOnlyFunction, principalCV, uintCV, cvToValue } from "@stacks/transactions";
import velarApi from "./velar-api";
import cmc from "./cmc-api";
import { getDecimals, getTotalSupply } from "./stacks-api";

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
  private static contractAddress = "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS";
  private static contractName = "univ2-core";
  private static tokenPrices: { [key: string]: number } = {};

  private static async callContractFunction(functionName: string, functionArgs: any[]): Promise<any> {
    try {
      const result = await callReadOnlyFunction({
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: functionName,
        functionArgs: functionArgs,
        senderAddress: this.contractAddress,
      });
      return cvToValue(result);
    } catch (error) {
      console.error(`Error calling contract function ${functionName}:`, error);
      throw error;
    }
  }

  private static async getPool(id: number): Promise<any> {
    const response = await this.callContractFunction("get-pool", [uintCV(id)]);
    return {
      lpToken: (response.value['lp-token'].value),
      token0: (response.value.token0.value),
      token1: (response.value.token1.value),
      reserve0: (response.value.reserve0.value),
      reserve1: (response.value.reserve1.value),
      symbol: (response.value.symbol.value),
    };
  }

  private static async lookupPool(token0Address: string, token1Address: string): Promise<any> {
    return this.callContractFunction("lookup-pool", [principalCV(token0Address), principalCV(token1Address)]);
  }

  private static async calculateChaPrice(stxPrice: number): Promise<number> {
    const stxChaReserves = await this.getPoolReserves(4);
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

  public static async getPoolReserves(poolId: number): Promise<{ token0: number; token1: number }> {
    try {
      const poolInfo = await this.getPool(poolId);
      if (poolInfo) {
        const reserve0 = Number(poolInfo.reserve0);
        const reserve1 = Number(poolInfo.reserve1);
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

  public static async updateAllTokenPrices(): Promise<void> {
    const velarPrices = await this.getVelarTokenPrices();
    const cmcPriceData = await cmc.getQuotes({ symbol: ['STX', 'ORDI', 'WELSH', 'DOG'] });

    const chaPrice = await this.calculateChaPrice(cmcPriceData.data['STX'].quote.USD.price);

    const convertedVelarPrices = Object.keys(velarPrices).reduce((acc: { [key: string]: number }, key: string) => {
      acc[key] = Number(velarPrices[key]);
      return acc;
    }, {});

    this.tokenPrices = {
      ...convertedVelarPrices,
      'CHA': chaPrice,
      'STX': cmcPriceData.data['STX'].quote.USD.price,
      'wSTX': cmcPriceData.data['STX'].quote.USD.price,
      'synSTX': cmcPriceData.data['STX'].quote.USD.price,
      'ORDI': cmcPriceData.data['ORDI'].quote.USD.price,
      'DOG': cmcPriceData.data['DOG'].quote.USD.price,
      'WELSH': cmcPriceData.data['WELSH'].quote.USD.price,
      'iouWELSH': cmcPriceData.data['WELSH'].quote.USD.price,
      'iouROO': convertedVelarPrices['$ROO'],
    };
  }

  public static async updateAllLpTokenPrices(): Promise<void> {
    this.tokenPrices = {
      ...this.tokenPrices,
      'UPDOG': await this.getLpTokenPriceByPoolId(8)
    };
  }

  public static async getAllTokenPrices(): Promise<{ [key: string]: number }> {
    if (Object.keys(this.tokenPrices).length === 0) {
      await this.updateAllTokenPrices();
      await this.updateAllLpTokenPrices();
    }
    return this.tokenPrices;
  }

  public static async getLpTokenPrice(
    poolId: number,
    token0: TokenInfo,
    token1: TokenInfo,
    totalLpSupply: number
  ): Promise<number> {
    try {
      const reserves = await this.getPoolReserves(poolId);
      const prices = await this.getAllTokenPrices();

      const totalValue = (reserves.token0 / (10 ** token0.decimals) * (prices[token0.symbol] || 0)) +
        (reserves.token1 / (10 ** token1.decimals) * (prices[token1.symbol] || 0));
      const lpTokenPrice = totalValue / (totalLpSupply || 1);

      return lpTokenPrice;
    } catch (error) {
      console.error("Error calculating LP token price:", error);
      return 0;
    }
  }

  public static async getLpTokenPriceByPoolId(poolId: number): Promise<number> {
    try {
      const poolInfo = await this.getPool(poolId);
      if (!poolInfo) {
        throw new Error("Pool not found");
      }

      const token0Address = poolInfo.token0;
      const token1Address = poolInfo.token1;
      const reserves = { token0: Number(poolInfo.reserve0), token1: Number(poolInfo.reserve1) };

      const token0Info: TokenInfo = {
        symbol: poolInfo.symbol.split('-')[0],
        name: poolInfo.symbol.split('-')[0],
        image: '',
        contractAddress: token0Address,
        price: this.tokenPrices[poolInfo.symbol.split('-')[0]] || 0,
        decimals: await getDecimals(token0Address),
      };

      const token1Info: TokenInfo = {
        symbol: poolInfo.symbol.split('-')[1],
        name: poolInfo.symbol.split('-')[1],
        image: '',
        contractAddress: token1Address,
        price: this.tokenPrices[poolInfo.symbol.split('-')[1]] || 0,
        decimals: await getDecimals(token1Address),
      };

      const totalLpSupply = await getTotalSupply(poolInfo.lpToken) / (10 ** await getDecimals(poolInfo.lpToken));

      const totalValue = (reserves.token0 / (10 ** token0Info.decimals) * token0Info.price!) +
        (reserves.token1 / (10 ** token1Info.decimals) * token1Info.price!);

      const lpTokenPrice = totalValue / totalLpSupply;

      return lpTokenPrice;
    } catch (error) {
      console.error("Error calculating LP token price by poolId:", error);
      return 0;
    }
  }
}

export default PricesService;