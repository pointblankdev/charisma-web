import { describe, test } from 'vitest';
import { Kraxel } from '.';


describe('Kraxel API Tests', () => {

  test('getAllTokenPrices - fetch all prices', async () => {
    console.log('\nTesting getAllTokenPrices:');
    try {
      const allPrices = await Kraxel.getAllTokenPrices();
      console.log('All token prices:');
      const priceEntries = Object.entries(allPrices);
      console.log(`Total tokens with prices: ${priceEntries.length}`);

      // Log first 5 prices as sample
      console.log('\nFirst 5 prices:');
      priceEntries.slice(0, 5).forEach(([token, price]) => {
        console.log(`${token}: $${price}`);
      });
    } catch (error) {
      console.error('Error fetching all token prices:', error);
    }
  }, 50000);

  test('getEnergyEvents - fetch energy events from contract', async () => {
    console.log('\nTesting getEnergyEvents:');
    try {
      // Test with Dexterity Hold to Earn contract
      const contractId = 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dexterity-hold-to-earn';
      const energyRate = await Kraxel.getEnergyRate(contractId);

      console.log(`Energy rate: ${energyRate} Energy / block / token`);

    } catch (error) {
      console.error('Error fetching energy events:', error);
      throw error;
    }
  }, 50000);
});
