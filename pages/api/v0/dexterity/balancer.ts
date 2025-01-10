import { NextApiRequest, NextApiResponse } from 'next';
import { ContractId, Dexterity } from 'dexterity-sdk';

// Reference to existing Dexterity configuration from:
const blacklist = [
    'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.chdollar',
    'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.dmg-runes',
    'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.uahdmg',
    'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.dmg-lp-token',
    'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.stx-lp-token'
] as ContractId[];

// Initialize Dexterity SDK
Dexterity.configure({ apiKeyRotation: 'loop', maxHops: 5 }).catch(console.error);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Only allow GET requests from Vercel cron
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Verify the request is from Vercel Cron
    if (process.env.VERCEL_ENV === 'production' && !req.headers['x-vercel-cron']) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('Dexterity Balancer Cron Job Running')

    try {
        await Dexterity.discover({ blacklist });
        const tx = await Dexterity.executeSwap(".stx", ".stx", 1000000, { fee: 1000 })
        console.log(tx)
        return res.status(200).json({
            status: 'success',
            tx
        });

    } catch (error) {
        console.error('Arbitrage scan error:', error);

        return res.status(500).json({
            status: 'error',
            error: 'Internal server error during arbitrage scan'
        });
    }
}