import { describe, test, expect } from 'vitest';
import { craftOrSalvage } from './helpers';
import { ContractId, Dexterity } from 'dexterity-sdk';
import { Kraxel } from '@lib/kraxel';

// Use same blacklist as other parts of the application
const blacklist = [
    'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.chdollar',
    'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.dmg-runes',
    'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.uahdmg',
    'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.dmg-lp-token',
    'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.stx-lp-token',
] as ContractId[];

describe('Dexterity Helpers', () => {
    test('salvage should calculate arbitrage opportunities with real data', async () => {
        // Configure Dexterity SDK
        await Dexterity.configure({
            apiKeyRotation: 'loop',
            parallelRequests: 10,
            maxHops: 3
        });

        // Get prices and discover vaults
        const prices = await Kraxel.getAllTokenPrices();
        await Dexterity.discover({ blacklist });

        // Get tokens and vaults
        const tokens = Dexterity.getTokens();
        const vaults = Dexterity.getVaults();

        // Process all vaults
        for (const vault of vaults) {
            const result = await craftOrSalvage(vault, 0, tokens, prices);
            console.log(result);
        }
    }, 50000); // Increased timeout for API calls
}); 