import { NextApiRequest, NextApiResponse } from 'next';
import { inngest } from '@lib/ingest';
import { ContractId } from 'dexterity-sdk';
import { Dexterity } from 'dexterity-sdk';
import PricesService from '@lib/server/prices/prices-service';

const blacklist = [
    'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.chdollar',
    'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.dmg-runes',
    'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.uahdmg',
    'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.dmg-lp-token',
    'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.stx-lp-token',
] as ContractId[];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    // Verify the request is from Vercel Cron
    // if (process.env.VERCEL_ENV === 'production' && !req.headers['x-vercel-cron']) {
    //     return res.status(401).json({ error: 'Unauthorized' });
    // }

    try {
        console.log('Dexterity Balancer Cron Job Running')
        // Initialize Dexterity SDK
        await Dexterity.configure({
            apiKeyRotation: 'loop',
            parallelRequests: 10,
            maxHops: 4
        })

        const prices = await PricesService.getInstance().getAllTokenPrices();
        await Dexterity.discover({ blacklist })

        const tokens = Dexterity.getTokens()
        const txs = []
        for (const token of tokens) {
            if (Dexterity.getVaultsForToken(token.contractId).size <= 1) continue
            const amount = Math.floor(10 ** token.decimals / prices[token.contractId])
            const quote = await Dexterity.getQuote(token.contractId, token.contractId, amount)
            if (!quote.route.hops.length) continue
            const tx = await Dexterity.router.executeSwap(quote.route, amount, { fee: 1000 }) as any
            txs.push(tx)
        }
        return res.status(200).json({ txs });

    } catch (error) {
        console.error('Arbitrage scan error:', error);

        return res.status(500).json({
            status: 'error',
            error: 'Internal server error during arbitrage scan'
        });
    }
}