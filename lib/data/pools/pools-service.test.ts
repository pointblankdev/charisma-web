import { PoolsService } from './pools-service';

describe('PoolsService Usage', () => {
    test('demonstrates fetching all pools', async () => {
        const pools = await PoolsService.getPools();
        console.log('All Available Pools:');
        console.log(JSON.stringify(pools, null, 2));
    });

    test('demonstrates fetching a specific pool', async () => {
        const pool = await PoolsService.getPoolById(1);
        console.log('\nSpecific Pool:');
        console.log(JSON.stringify(pool, null, 2));
    });

    test('demonstrates fetching pools by token', async () => {
        // Example with CHA token
        const chaTokenAddress = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token';
        const pools = await PoolsService.getPoolsByToken(chaTokenAddress);
        console.log('\nPools containing CHA:');
        console.log(JSON.stringify(pools, null, 2));
    });
});