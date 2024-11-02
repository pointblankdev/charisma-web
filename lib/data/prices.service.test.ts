import { getTotalSupply } from '../stacks-api';
import PricesService, { TokenInfo } from '../prices-service';

const poolsData = [
  {
    id: 1,
    token0: {
      symbol: 'WELSH',
      name: 'Welsh',
      image: '/welsh-logo.png',
      contractAddress: 'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token',
      tokenId: 'welshcorgicoin',
      decimals: 6
    } as TokenInfo,
    token1: {
      symbol: 'iouWELSH',
      name: 'Synthetic Welsh',
      image: '/welsh-logo.png',
      contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-welsh',
      tokenId: 'synthetic-welsh',
      decimals: 6
    } as TokenInfo,
    volume24h: 0,
    contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.welsh-iouwelsh'
  },
  {
    id: 2,
    token0: {
      symbol: '$ROO',
      name: 'Roo',
      image: '/roo-logo.png',
      contractAddress: 'SP2C1WREHGM75C7TGFAEJPFKTFTEGZKF6DFT6E2GE.kangaroo',
      tokenId: 'kangaroo',
      decimals: 6
    } as TokenInfo,
    token1: {
      symbol: 'iouROO',
      name: 'Synthetic Roo',
      image: '/roo-logo.png',
      contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-roo',
      tokenId: 'synthetic-roo',
      decimals: 6
    } as TokenInfo,
    volume24h: 0,
    contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.roo-iouroo'
  },
  {
    id: 3,
    token0: {
      symbol: 'CHA',
      name: 'Charisma',
      image: '/charisma-logo-square.png',
      contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token',
      tokenId: 'charisma',
      decimals: 6
    } as TokenInfo,
    token1: {
      symbol: 'WELSH',
      name: 'Welsh',
      image: '/welsh-logo.png',
      contractAddress: 'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token',
      tokenId: 'welshcorgicoin',
      decimals: 6
    } as TokenInfo,
    volume24h: 0,
    contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.cha-welsh'
  },
  {
    id: 4,
    token0: {
      symbol: 'STX',
      name: 'Stacks',
      image: '/stx-logo.png',
      contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wstx',
      decimals: 6
    } as TokenInfo,
    token1: {
      symbol: 'CHA',
      name: 'Charisma',
      image: '/charisma-logo-square.png',
      contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token',
      tokenId: 'charisma',
      decimals: 6
    } as TokenInfo,
    volume24h: 0,
    contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wstx-cha'
  },
  {
    id: 5,
    token0: {
      symbol: 'CHA',
      name: 'Charisma',
      image: '/charisma-logo-square.png',
      contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token',
      tokenId: 'charisma',
      decimals: 6
    } as TokenInfo,
    token1: {
      symbol: 'iouWELSH',
      name: 'Synthetic Welsh',
      image: '/welsh-logo.png',
      contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-welsh',
      tokenId: 'synthetic-welsh',
      decimals: 6
    } as TokenInfo,
    volume24h: 0,
    contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.cha-iouwelsh'
  },
  {
    id: 6,
    token0: {
      symbol: 'CHA',
      name: 'Charisma',
      image: '/charisma-logo-square.png',
      contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token',
      tokenId: 'charisma',
      decimals: 6
    } as TokenInfo,
    token1: {
      symbol: 'ORDI',
      name: 'Ordi',
      image: '/ordi-logo.png',
      contractAddress: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.brc20-ordi',
      tokenId: 'brc20-ordi',
      decimals: 8
    },
    volume24h: 0,
    contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.cha-ordi'
  },
  {
    id: 7,
    token0: {
      symbol: 'CHA',
      name: 'Charisma',
      image: '/charisma-logo-square.png',
      contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token',
      tokenId: 'charisma',
      decimals: 6
    } as TokenInfo,
    token1: {
      symbol: '$ROO',
      name: 'Roo',
      image: '/roo-logo.png',
      contractAddress: 'SP2C1WREHGM75C7TGFAEJPFKTFTEGZKF6DFT6E2GE.kangaroo',
      tokenId: 'kangaroo',
      decimals: 6
    } as TokenInfo,
    volume24h: 0,
    contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.cha-roo'
  },
  {
    id: 8,
    token0: {
      symbol: 'WELSH',
      name: 'Welsh',
      image: '/welsh-logo.png',
      contractAddress: 'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token',
      tokenId: 'welshcorgicoin',
      decimals: 6
    },
    token1: {
      symbol: 'DOG',
      name: 'DOG-GO-TO-THE-MOON',
      image: '/sip10/dogLogo.webp',
      contractAddress: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.runes-dog',
      tokenId: 'runes-dog',
      decimals: 8
    },
    volume24h: 0,
    contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.up-dog'
  },
  {
    id: 9,
    token0: {
      symbol: 'CHA',
      name: 'Charisma',
      image: '/charisma-logo-square.png',
      contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token',
      tokenId: 'charisma',
      decimals: 6
    } as TokenInfo,
    token1: {
      symbol: 'UPDOG',
      name: 'Updog',
      image: '/sip10/up-dog/logo.gif',
      contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.up-dog',
      tokenId: 'lp-token',
      decimals: 6
    } as TokenInfo,
    volume24h: 0,
    contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.cha-updog'
  }
];

describe('PricesService', () => {
  test('getAllTokenPrices should return prices for all tokens', async () => {
    const prices = await PricesService.getAllTokenPrices();

    expect(prices).toBeDefined();
    expect(typeof prices).toBe('object');

    // Check if we have prices for the main tokens
    expect(prices.CHA).toBeDefined();
    expect(prices.STX).toBeDefined();
    expect(prices.ORDI).toBeDefined();
    expect(prices.WELSH).toBeDefined();
    expect(prices.iouWELSH).toBeDefined();
    expect(prices.iouROO).toBeDefined();

    // Check if prices are reasonable (non-zero and not extremely high)
    Object.values(prices).forEach(price => {
      expect(price).toBeGreaterThanOrEqual(0);
      expect(price).toBeLessThan(100000); // Adjust this upper limit as needed
    });

    // Check if iouWELSH price matches WELSH price
    expect(prices.iouWELSH).toBe(prices.WELSH);

    console.log('All token prices:', prices);
  });

  test('getLpTokenPrice should calculate LP token price correctly', async () => {
    const allPrices = await PricesService.getAllTokenPrices();
    poolsData[3].token0.price = allPrices.STX;
    poolsData[3].token1.price = allPrices.CHA;

    const totalLpSupply = await getTotalSupply(
      'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wstx-cha'
    );

    const lpTokenPrice = await PricesService.getLpTokenPrice(
      poolsData[3].id,
      poolsData[3].token0,
      poolsData[3].token1,
      totalLpSupply
    );

    expect(lpTokenPrice).toBeDefined();
    expect(lpTokenPrice).toBeGreaterThan(0);
  });

  test('getPoolReserves should return non-zero reserves for STX-CHA pool', async () => {
    const poolId = 4;
    const token0Address = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wstx';
    const token1Address = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token';

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore: Accessing private method for testing
    const reserves = await PricesService.getPoolReserves(poolId, token0Address, token1Address);

    expect(reserves.token0).toBeGreaterThan(0);
    expect(reserves.token1).toBeGreaterThan(0);

    console.log('Pool reserves:', reserves);
  });

  test('calculateChaPrice should return a reasonable CHA price', async () => {
    const allPrices = await PricesService.getAllTokenPrices();
    const stxPrice = allPrices.STX;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore: Accessing private method for testing
    const chaPrice = await PricesService.calculateChaPrice(stxPrice);

    expect(chaPrice).toBeGreaterThan(0);
    expect(chaPrice).toBeLessThan(stxPrice * 10); // Assuming CHA price is not more than 10 times STX price

    console.log('Calculated CHA price:', chaPrice);
  });

  test('getPool should return pool information for a valid pool ID', async () => {
    const poolId = 4; // STX-CHA pool

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore: Accessing private method for testing
    const poolInfo = await PricesService.getPool(poolId);

    expect(poolInfo).toBeDefined();
    expect(poolInfo.token0).toBe('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wstx');
    expect(poolInfo.token1).toBe('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token');
    expect(poolInfo.reserve0).toBeDefined();
    expect(poolInfo.reserve1).toBeDefined();
    expect(poolInfo.symbol).toBe('wSTX-CHA');

    console.log('Pool info:', poolInfo);
  });

  test('lookupPool should return pool information for valid token addresses', async () => {
    const token0Address = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wstx';
    const token1Address = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token';

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore: Accessing private method for testing
    const poolInfo = await PricesService.lookupPool(token0Address, token1Address);

    expect(poolInfo).toBeDefined();
    expect(poolInfo.pool).toBeDefined();
    expect(poolInfo.pool.token0).toBe(token0Address);
    expect(poolInfo.pool.token1).toBe(token1Address);
    expect(poolInfo.pool.reserve0).toBeDefined();
    expect(poolInfo.pool.reserve1).toBeDefined();

    console.log('Looked up pool info:', poolInfo);
  });

  test('getPoolReserves should return non-zero reserves for all pools', async () => {
    for (const pool of poolsData) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore: Accessing private method for testing
      const reserves = await PricesService.getPoolReserves(pool.id);

      expect(reserves.token0).toBeGreaterThan(0);
      expect(reserves.token1).toBeGreaterThan(0);

      console.log(`Pool ${pool.id} reserves:`, reserves);
    }
  });

  test('getLpTokenPriceByPoolId should return a valid price for updog pools', async () => {
    await PricesService.updateAllTokenPrices();
    const id = 8; // UPDOG pool
    const lpTokenPrice = await PricesService.getLpTokenPriceByPoolId(id);

    expect(lpTokenPrice).toBeDefined();
    expect(lpTokenPrice).toBeGreaterThan(0);
    expect(lpTokenPrice).toBeLessThan(1000000); // Adjust this upper limit as needed

    console.log(`Pool ${id} LP token price:`, lpTokenPrice);
  });

  test('getLpTokenPriceByPoolId should return a valid price for all pools', async () => {
    for (const pool of poolsData) {
      const lpTokenPrice = await PricesService.getLpTokenPriceByPoolId(pool.id);

      expect(lpTokenPrice).toBeDefined();
      expect(lpTokenPrice).toBeGreaterThan(0);
      expect(lpTokenPrice).toBeLessThan(1000000); // Adjust this upper limit as needed

      console.log(`Pool ${pool.id} LP token price:`, lpTokenPrice);
    }
  });

  test('getLpTokenPriceByPoolId should match getLpTokenPrice for STX-CHA pool', async () => {
    const poolId = 4; // STX-CHA pool
    const pool = poolsData.find(p => p.id === poolId);
    if (!pool) {
      throw new Error('Pool not found');
    }

    const allPrices = await PricesService.getAllTokenPrices();

    pool.token0.price = allPrices.STX;
    pool.token1.price = allPrices.CHA;

    const totalLpSupply = await getTotalSupply(pool.contractAddress);

    const lpTokenPrice1 = await PricesService.getLpTokenPrice(
      pool.id,
      pool.token0,
      pool.token1,
      totalLpSupply
    );

    const lpTokenPrice2 = await PricesService.getLpTokenPriceByPoolId(pool.id);

    expect(lpTokenPrice1).toBeCloseTo(lpTokenPrice2, 4); // Allow for small differences due to rounding

    console.log('LP token prices (should be close):', { lpTokenPrice1, lpTokenPrice2 });
  });

  test('getLpTokenPriceByPoolId should throw an error for an invalid pool ID', async () => {
    const invalidPoolId = 9999;

    await expect(PricesService.getLpTokenPriceByPoolId(invalidPoolId)).rejects.toThrow(
      'Pool not found'
    );
  });
});
