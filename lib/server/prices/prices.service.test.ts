import PricesService from './prices-service';


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

  test('getLpTokenPriceByPoolId should return a valid price for updog pools', async () => {
    await PricesService.updateAllTokenPrices();
    const id = 8; // UPDOG pool
    const lpTokenPrice = await PricesService.getLpTokenPriceByPoolId(id);

    expect(lpTokenPrice).toBeDefined();
    expect(lpTokenPrice).toBeGreaterThan(0);
    expect(lpTokenPrice).toBeLessThan(1000000); // Adjust this upper limit as needed

    console.log(`Pool ${id} LP token price:`, lpTokenPrice);
  });

  test('getLpTokenPriceByPoolId should throw an error for an invalid pool ID', async () => {
    const invalidPoolId = 9999;

    await expect(PricesService.getLpTokenPriceByPoolId(invalidPoolId)).rejects.toThrow(
      'Pool not found'
    );
  });
});
