import { NextApiRequest, NextApiResponse } from 'next';
import { ContractId } from 'dexterity-sdk';
import { Dexterity } from 'dexterity-sdk';
import { Kraxel } from '@lib/kraxel';
import { craftOrSalvage } from '@lib/dexterity/helpers';

// Opt out of caching; every request should send a new event
export const dynamic = "force-dynamic";

const blacklist = [
    'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.chdollar',
    'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.dmg-runes',
    'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.uahdmg',
    'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.dmg-lp-token',
    'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.stx-lp-token',
] as ContractId[];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    res.writeHead(200, {
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    });

    // Verify the request is from Vercel Cron
    // if (process.env.VERCEL_ENV === 'production' && !req.headers['x-vercel-cron']) {
    //     return res.status(401).json({ error: 'Unauthorized' });
    // }

    try {
        console.log('Dexterity LP Arbitrage Cron Job Running')
        await Dexterity.configure({
            apiKeyRotation: 'loop',
            parallelRequests: 10,
            maxHops: 4
        })

        const prices = await Kraxel.getAllTokenPrices();
        await Dexterity.discover({ blacklist, reserves: true })

        const tokens = Dexterity.getTokens()
        const txs = []

        // Process vaults in parallel with a concurrency limit
        const vaults = Dexterity.getVaults()
        const batchSize = 35;
        for (let i = 0; i < vaults.length; i += batchSize) {
            const batch = vaults.slice(i, i + batchSize);
            const results = await Promise.all(
                batch.map((vault, index) => craftOrSalvage(vault, i + index, tokens, prices))
            );
            txs.push(...results.filter((r: any) => !r.error));
        }

        console.log('Finished processing all vaults')
        console.log(txs)

        return res.status(200).json({ txs });

    } catch (error) {
        console.error('Arbitrage scan error:', error);

        return res.status(500).json({
            status: 'error',
            error: 'Internal server error during task'
        });
    }
}