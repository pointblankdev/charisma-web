import { getTotalSupply } from "../stacks-api";
import PricesService, { TokenInfo } from "../prices-service";

const poolsData = [
    {
        id: 1,
        token0: { symbol: 'WELSH', name: 'Welsh', image: '/welsh-logo.png', contractAddress: 'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token', tokenId: 'welshcorgicoin', decimals: 6 } as TokenInfo,
        token1: { symbol: 'iouWELSH', name: 'Synthetic Welsh', image: '/welsh-logo.png', contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-welsh', tokenId: 'synthetic-welsh', decimals: 6 } as TokenInfo,
        volume24h: 0,
        contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.welsh-iouwelsh',
    },
    {
        id: 2,
        token0: { symbol: '$ROO', name: 'Roo', image: '/roo-logo.png', contractAddress: 'SP2C1WREHGM75C7TGFAEJPFKTFTEGZKF6DFT6E2GE.kangaroo', tokenId: 'kangaroo', decimals: 6 } as TokenInfo,
        token1: { symbol: 'iouROO', name: 'Synthetic Roo', image: '/roo-logo.png', contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-roo', tokenId: 'synthetic-roo', decimals: 6 } as TokenInfo,
        volume24h: 0,
        contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.roo-iouroo',
    },
    {
        id: 3,
        token0: { symbol: 'CHA', name: 'Charisma', image: '/charisma-logo-square.png', contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token', tokenId: 'charisma', decimals: 6 } as TokenInfo,
        token1: { symbol: 'WELSH', name: 'Welsh', image: '/welsh-logo.png', contractAddress: 'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token', tokenId: 'welshcorgicoin', decimals: 6 } as TokenInfo,
        volume24h: 0,
        contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.cha-welsh',
    },
    {
        id: 4,
        token0: { symbol: 'STX', name: 'Stacks', image: '/stx-logo.png', contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wstx', decimals: 6 } as TokenInfo,
        token1: { symbol: 'CHA', name: 'Charisma', image: '/charisma-logo-square.png', contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token', tokenId: 'charisma', decimals: 6 } as TokenInfo,
        volume24h: 0,
        contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wstx-cha',
    },
    {
        id: 5,
        token0: { symbol: 'CHA', name: 'Charisma', image: '/charisma-logo-square.png', contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token', tokenId: 'charisma', decimals: 6 } as TokenInfo,
        token1: { symbol: 'iouWELSH', name: 'Synthetic Welsh', image: '/welsh-logo.png', contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-welsh', tokenId: 'synthetic-welsh', decimals: 6 } as TokenInfo,
        volume24h: 0,
        contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.cha-iouwelsh',
    },
    {
        id: 6,
        token0: { symbol: 'CHA', name: 'Charisma', image: '/charisma-logo-square.png', contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token', tokenId: 'charisma', decimals: 6 } as TokenInfo,
        token1: { symbol: 'ORDI', name: 'Ordi', image: '/ordi-logo.png', contractAddress: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.brc20-ordi', tokenId: 'brc20-ordi', decimals: 8 },
        volume24h: 0,
        contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.cha-ordi',
    },
    {
        id: 7,
        token0: { symbol: 'CHA', name: 'Charisma', image: '/charisma-logo-square.png', contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token', tokenId: 'charisma', decimals: 6 } as TokenInfo,
        token1: { symbol: '$ROO', name: 'Roo', image: '/roo-logo.png', contractAddress: 'SP2C1WREHGM75C7TGFAEJPFKTFTEGZKF6DFT6E2GE.kangaroo', tokenId: 'kangaroo', decimals: 6 } as TokenInfo,
        volume24h: 0,
        contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.cha-roo',
    },
    {
        id: 8,
        token0: { symbol: 'WELSH', name: 'Welsh', image: '/welsh-logo.png', contractAddress: 'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token', tokenId: 'welshcorgicoin', decimals: 6 },
        token1: { symbol: 'DOG', name: 'DOG-GO-TO-THE-MOON', image: '/sip10/dogLogo.webp', contractAddress: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.runes-dog', tokenId: 'runes-dog', decimals: 8 },
        volume24h: 0,
        contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.up-dog',
    },
];

describe('PricesService', () => {
    jest.setTimeout(30000); // Increase timeout for API calls

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

        const totalLpSupply = await getTotalSupply('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wstx-cha');

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
});