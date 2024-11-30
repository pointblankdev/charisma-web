import velarApi from '../../velar-api';
import cmc from '../../cmc-api';
import { DexClient } from '../pools/pools.client';
import TokenRegistryClient, { charismaNames } from '../registry/registry.client';
import { buildDexterityPools } from 'pages/pools/dexterity';
import { getDexterityQuote, getDexterityReserves } from '@lib/stacks-api';

const dexClient = new DexClient();
const registryClient = new TokenRegistryClient();

export interface TokenInfo {
  symbol: string;
  name: string;
  image: string;
  contractAddress: string;
  price?: number;
  tokenId?: string;
  decimals: number;
  isLpToken?: boolean;
  poolId?: string | null;
}

interface PoolInfo {
  id: string;
  token0: TokenInfo;
  token1: TokenInfo;
  reserves: {
    token0: number;
    token1: number;
  };
  totalLpSupply: number;
}

class PricesService {
  static tokenPrices: { [key: string]: number } = {};
  static pools: PoolInfo[] = [];
  static tokens: TokenInfo[] = [];
  static lpPriceCache: { [symbol: string]: number } = {};

  /**
   * Get Velar token prices
   */
  private static async getVelarTokenPrices(): Promise<{ [key: string]: number }> {
    const prices = await velarApi.tokens('all');
    return prices.reduce((acc: { [key: string]: number }, token: any) => {
      acc[token.symbol] = token.price;
      return acc;
    }, {});
  }

  /**
   * Calculate LP token price recursively with decimal adjustment
   */
  private static calculateLpTokenPrice(token: any): number {
    if (!token?.metadata?.symbol) {
      console.warn('Invalid token object: missing metadata or symbol');
      return 0;
    }

    console.log(`Calculating price for ${token.metadata.symbol}`);

    // Return cached price if available and valid
    const cachedPrice = this.tokenPrices[token.metadata.symbol];
    if (typeof cachedPrice === 'number' && !isNaN(cachedPrice) && cachedPrice > 0) {
      console.log(`Returning cached price for ${token.metadata.symbol}: ${cachedPrice}`);
      return cachedPrice;
    }

    // Handle non-LP tokens (base case)
    if (!token.lpInfo && !token.token0 && !token.token1) {
      const baseTokenPrice = Number(this.tokenPrices[token.metadata.symbol]);
      if (!isNaN(baseTokenPrice) && baseTokenPrice > 0) {
        console.log(`Base token ${token.metadata.symbol} price: ${baseTokenPrice}`);
        return baseTokenPrice;
      }
      console.warn(`No price found for base token ${token.metadata.symbol}`);
      return 0;
    }

    // Validate LP token data
    if (!token.token0 || !token.token1 || !token.poolData) {
      console.log(token.token0, token.token1, token.poolData);
      console.warn(`Missing required LP data for ${token.metadata.symbol}`);
      return 0;
    }

    const { reserve0, reserve1, totalSupply } = token.poolData;

    // Validate pool data
    if (!reserve0 || !reserve1 || !totalSupply || totalSupply <= 0) {
      console.warn(`Invalid pool data for ${token.metadata.symbol}`);
      return 0;
    }

    // Get token decimals (default to 6 if not specified)
    const token0Decimals = token.token0.metadata?.decimals ?? 6;
    const token1Decimals = token.token1.metadata?.decimals ?? 6;
    const lpDecimals = token.metadata?.decimals ?? 6;

    // Calculate prices for underlying tokens
    const token0Price = this.calculateLpTokenPrice(token.token0);
    const token1Price = this.calculateLpTokenPrice(token.token1);

    // If either underlying token has no price, we can't calculate LP token price
    if (token0Price <= 0 || token1Price <= 0) {
      console.warn(
        `Unable to calculate LP price for ${token.metadata.symbol} due to missing underlying prices`
      );
      return 0;
    }

    // Adjust reserves and total supply for decimals
    const adjustedReserve0 = Number(reserve0) / Math.pow(10, token0Decimals);
    const adjustedReserve1 = Number(reserve1) / Math.pow(10, token1Decimals);
    const adjustedTotalSupply = Number(totalSupply) / Math.pow(10, lpDecimals);

    // console.log(`${token.metadata.symbol} adjusted values:`, {
    //   reserve0: adjustedReserve0,
    //   reserve1: adjustedReserve1,
    //   totalSupply: adjustedTotalSupply,
    //   token0Decimals,
    //   token1Decimals,
    //   lpDecimals
    // });

    // Calculate LP token price with decimal-adjusted values
    const totalPoolValue = token0Price * adjustedReserve0 + token1Price * adjustedReserve1;
    const lpTokenPrice = totalPoolValue / adjustedTotalSupply;

    // Validate result
    if (isNaN(lpTokenPrice) || lpTokenPrice <= 0) {
      console.warn(`Invalid LP token price calculated for ${token.metadata.symbol}`);
      return 0;
    }

    // Cache the valid calculated price
    this.tokenPrices[token.metadata.symbol] = lpTokenPrice;
    console.log(`Calculated price for ${token.metadata.symbol}: ${lpTokenPrice}`);

    return lpTokenPrice;
  }

  /**
   * Update all token prices including LP tokens
   */
  public static async updateAllTokenPrices(): Promise<void> {
    // Get base prices
    const [velarPrices, cmcPriceData] = await Promise.all([
      this.getVelarTokenPrices(),
      cmc.getQuotes({ symbol: ['STX', 'ORDI', 'WELSH', 'DOG'] })
    ]);

    // Get STX/CHA ratio
    const stxChaPool = await dexClient.getPoolById('31');
    const stxChaRatio = Number(stxChaPool.reserve0) / Number(stxChaPool.reserve1);
    const chaPrice = stxChaRatio * cmcPriceData.data['STX'].quote.USD.price;

    // Get WELSH/iouWELSH ratio
    const welshIouWelshPool = await dexClient.getPoolById('1');
    const welshIouWelshratio =
      Number(welshIouWelshPool.reserve0) / Number(welshIouWelshPool.reserve1);

    // Get ROO/iouROO ratio
    const rooIouRooPool = await dexClient.getPoolById('2');
    const rooIouRooratio = Number(rooIouRooPool.reserve0) / Number(rooIouRooPool.reserve1);

    // get STX/synSTX ratio
    const stxSynStxPool = await dexClient.getPoolById('10');
    const stxSynStxratio = Number(stxSynStxPool.reserve0) / Number(stxSynStxPool.reserve1);

    // Get STX/SHARK ratio
    const stxSharkPool = await dexClient.getPoolById('30');
    const stxSharkRatio = Number(stxSharkPool.reserve0) / Number(stxSharkPool.reserve1);

    // Get DMG/CHA ratio
    const amountIn = 1000000;
    const amountOut = await getDexterityQuote(
      'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.cyclops-liquidity-dexterity',
      true,
      amountIn,
      false
    );
    const chaDmgRatio = Number(amountIn) / Number(amountOut);
    const dmgPrice = chaDmgRatio * chaPrice;

    // Get DMG/HOOT ratio
    const dmgHootReserves = await getDexterityReserves(
      'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.hoot-dex'
    );
    const dmgHootRatio = Number(dmgHootReserves.token0) / Number(dmgHootReserves.token1);
    const hootPrice = dmgHootRatio * dmgPrice;

    // Get pCHA price
    const dmgpChaReserves = await getDexterityReserves(
      'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.dmgpcha-dexterity'
    );
    const dmgpChaRatio = Number(dmgpChaReserves.token0) / Number(dmgpChaReserves.token1);
    const pChaPrice = dmgpChaRatio * dmgPrice;

    // Get RZR price
    const dmgRZRReserves = await getDexterityReserves(
      'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.dmgrzr-dexterity'
    );
    const dmgRZRRatio = Number(dmgRZRReserves.token0) / Number(dmgRZRReserves.token1);
    const RZRPrice = dmgRZRRatio * dmgPrice;

    // Get pRZR price
    const dmgpRZRReserves = await getDexterityReserves(
      'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.dmgprzr-dexterity'
    );
    const dmgpRZRRatio = Number(dmgpRZRReserves.token0) / Number(dmgpRZRReserves.token1);
    const pRZRPrice = dmgpRZRRatio * dmgPrice;

    // Get CREAM price
    const dmgCreamReserves = await getDexterityReserves(
      'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.dmgcream-dexterity'
    );
    const dmgCreamRatio = Number(dmgCreamReserves.token0) / Number(dmgCreamReserves.token1);
    const CreamPrice = dmgCreamRatio * dmgPrice;

    // Get CROW price
    const dmgCrowReserves = await getDexterityReserves(
      'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.dmgcrow-dexterity'
    );
    const dmgCrowRatio = Number(dmgCrowReserves.token0) / Number(dmgCrowReserves.token1);
    const CrowPrice = dmgCrowRatio * dmgPrice;

    // Convert Velar prices
    const convertedVelarPrices = Object.keys(velarPrices).reduce(
      (acc: { [key: string]: number }, key: string) => {
        acc[key] = Number(velarPrices[key]);
        return acc;
      },
      {}
    );

    // Set base token prices
    this.tokenPrices = {
      ...convertedVelarPrices,
      CHA: chaPrice,
      STX: cmcPriceData.data['STX'].quote.USD.price,
      wSTX: cmcPriceData.data['STX'].quote.USD.price,
      synSTX: stxSynStxratio * cmcPriceData.data['STX'].quote.USD.price,
      SHARK: stxSharkRatio * cmcPriceData.data['STX'].quote.USD.price,
      ordi: cmcPriceData.data['ORDI'].quote.USD.price,
      DOG: cmcPriceData.data['DOG'].quote.USD.price,
      WELSH: cmcPriceData.data['WELSH'].quote.USD.price,
      iouWELSH: welshIouWelshratio * cmcPriceData.data['WELSH'].quote.USD.price,
      vLiSTX: cmcPriceData.data['STX'].quote.USD.price * 1.1,
      stSTX: cmcPriceData.data['STX'].quote.USD.price * 1.1,
      ROO: convertedVelarPrices['$ROO'],
      iouROO: rooIouRooratio * convertedVelarPrices['$ROO'],
      DMG: dmgPrice,
      HOOT: hootPrice,
      LUCK: 0.0000013,
      pCHA: pChaPrice,
      RZR: RZRPrice,
      Rozar: pRZRPrice,
      CREAM: CreamPrice,
      CROW: CrowPrice
    };

    // build pools data
    const { tokens } = await registryClient.listAll();
    const lpTokens = tokens.filter((t: any) => charismaNames.includes(t.lpInfo?.dex));
    const pools = [];
    for (const lpToken of lpTokens) {
      const poolData = await dexClient.getPool(lpToken.lpInfo.token0, lpToken.lpInfo.token1);
      const token0 = tokens.find((t: any) => t.contractId === lpToken.lpInfo.token0) || {};
      const token1 = tokens.find((t: any) => t.contractId === lpToken.lpInfo.token1) || {};
      pools.push({ ...lpToken, token0: token0, token1: token1, poolData });
    }

    // Calculate LP token prices
    for (const pool of pools) {
      this.calculateLpTokenPrice(pool);
    }

    // Calculate dexterity index token prices
    const dexterityPools = await buildDexterityPools(tokens);
    for (const pool of dexterityPools) {
      try {
        this.calculateLpTokenPrice(pool);
      } catch (error) {
        console.error(error);
      }
    }
  }

  /**
   * Get all token prices including LP tokens
   */
  public static async getAllTokenPrices(): Promise<{ [key: string]: number }> {
    if (Object.keys(this.tokenPrices).length === 0) {
      await this.updateAllTokenPrices();
    }
    return this.tokenPrices;
  }

  /**
   * Get price for a specific token
   */
  public static async getTokenPrice(symbol: string): Promise<number> {
    const prices = await this.getAllTokenPrices();
    return prices[symbol] || 0;
  }

  /**
   * Set token data (should be called during app initialization)
   */
  public static setTokenData(tokens: TokenInfo[]): void {
    this.tokens = tokens;
  }

  /**
   * Debug: Get underlying tokens for an LP token
   */
  public static getUnderlyingTokens(symbol: string): TokenInfo[] {
    const token = this.tokens.find(t => t.symbol === symbol);
    if (!token || !token.isLpToken || !token.poolId) {
      return token ? [token] : [];
    }

    const pool = this.pools.find(p => p.id === token.poolId);
    if (!pool) return [token];

    return [
      ...this.getUnderlyingTokens(pool.token0.symbol),
      ...this.getUnderlyingTokens(pool.token1.symbol)
    ];
  }
}

export default PricesService;
