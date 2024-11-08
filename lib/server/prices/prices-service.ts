import velarApi from '../../velar-api';
import cmc from '../../cmc-api';
import { DexClient } from '../pools/pools.client';

const client = new DexClient();

export type TokenInfo = {
  symbol: string;
  name: string;
  image: string;
  contractAddress: string;
  price?: number;
  tokenId?: string;
  decimals: number;
};

class PricesService {
  private static tokenPrices: { [key: string]: number } = {};

  private static async getVelarTokenPrices(): Promise<{ [key: string]: number }> {
    const prices = await velarApi.tokens('all');
    return prices.reduce((acc: { [key: string]: number }, token: any) => {
      acc[token.symbol] = token.price;
      return acc;
    }, {});
  }

  public static async updateAllTokenPrices(): Promise<void> {
    const velarPrices = await this.getVelarTokenPrices();
    const cmcPriceData = await cmc.getQuotes({ symbol: ['STX', 'ORDI', 'WELSH', 'DOG'] });

    const stxChaPool = await client.getPoolById('4');

    const ratio = Number(stxChaPool.reserve0) / Number(stxChaPool.reserve1);

    const convertedVelarPrices = Object.keys(velarPrices).reduce(
      (acc: { [key: string]: number }, key: string) => {
        acc[key] = Number(velarPrices[key]);
        return acc;
      },
      {}
    );

    this.tokenPrices = {
      ...convertedVelarPrices,
      CHA: ratio * cmcPriceData.data['STX'].quote.USD.price,
      STX: cmcPriceData.data['STX'].quote.USD.price,
      wSTX: cmcPriceData.data['STX'].quote.USD.price,
      synSTX: cmcPriceData.data['STX'].quote.USD.price,
      ordi: cmcPriceData.data['ORDI'].quote.USD.price,
      DOG: cmcPriceData.data['DOG'].quote.USD.price,
      WELSH: cmcPriceData.data['WELSH'].quote.USD.price,
      iouWELSH: cmcPriceData.data['WELSH'].quote.USD.price,
      ROO: convertedVelarPrices['$ROO'],
      iouROO: convertedVelarPrices['$ROO']
    };
  }

  public static async getAllTokenPrices(): Promise<{ [key: string]: number }> {
    if (Object.keys(this.tokenPrices).length === 0) {
      await this.updateAllTokenPrices();
    }
    return this.tokenPrices;
  }
}

export default PricesService;
