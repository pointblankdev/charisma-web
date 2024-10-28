import { EnergyMetricsService } from './energy-metrics-service';

describe('EnergyMetricsService Usage', () => {
    test('demonstrates getting metrics for all engines', async () => {
        const metrics = await EnergyMetricsService.getAllMetrics();
        console.log('All Engine Metrics:');
        console.log(JSON.stringify(metrics, null, 2));
    });

    test('demonstrates getting single engine metrics', async () => {
        const contractId = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.meme-engine-cha-rc6';
        const metrics = await EnergyMetricsService.getMetricsByContractId(contractId);
        console.log('\nSingle Engine Metrics:');
        console.log(JSON.stringify(metrics, null, 2));
    });
});