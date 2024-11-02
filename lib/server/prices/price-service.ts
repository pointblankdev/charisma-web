import velarApi from '../../velar-api';
import cmc from '../../cmc-api';
import { PoolService } from '../pools/pool-service';

export class PriceService {
  private static tokenPrices: { [key: string]: number } = {};

  private static async getVelarTokenPrices(): Promise<{ [key: string]: number }> {
    const prices = await velarApi.tokens('all');
    return prices.reduce((acc: { [key: string]: number }, token: any) => {
      acc[token.symbol] = token.price;
      return acc;
    }, {});
  }

  private static async calculateChaPrice(stxPrice: number): Promise<number> {
    // This should use PoolService to get reserves
    const stxChaReserves = await PoolService.getPoolReserves(4);
    const chaPrice = (stxPrice * stxChaReserves.token0) / stxChaReserves.token1;
    return chaPrice || 1;
  }

  public static async getChaPerStx(): Promise<number> {
    try {
      const pool = await PoolService.lookupPool(
        'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wstx',
        'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token'
      );
      const poolInfo = pool.value.pool;
      const reserve0 = BigInt(poolInfo.value.reserve0.value);
      const reserve1 = BigInt(poolInfo.value.reserve1.value);
      return Number(reserve1) / Number(reserve0);
    } catch (error) {
      console.error('Error getting CHA/STX ratio:', error);
      return 0;
    }
  }

  public static async updateAllTokenPrices(): Promise<void> {
    const velarPrices = await this.getVelarTokenPrices();
    const cmcPriceData = await cmc.getQuotes({ symbol: ['STX', 'ORDI', 'WELSH', 'DOG'] });

    const chaPrice = await this.calculateChaPrice(cmcPriceData.data['STX'].quote.USD.price);

    this.tokenPrices = {
      ...velarPrices,
      CHA: chaPrice,
      STX: cmcPriceData.data['STX'].quote.USD.price,
      wSTX: cmcPriceData.data['STX'].quote.USD.price,
      synSTX: cmcPriceData.data['STX'].quote.USD.price,
      ORDI: cmcPriceData.data['ORDI'].quote.USD.price,
      DOG: cmcPriceData.data['DOG'].quote.USD.price,
      WELSH: cmcPriceData.data['WELSH'].quote.USD.price,
      iouWELSH: cmcPriceData.data['WELSH'].quote.USD.price,
      ROO: velarPrices['$ROO'],
      iouROO: velarPrices['$ROO']
    };
  }

  public static async getAllPrices(): Promise<{ [key: string]: number }> {
    if (Object.keys(this.tokenPrices).length === 0) {
      await this.updateAllTokenPrices();
    }
    return this.tokenPrices;
  }
}
