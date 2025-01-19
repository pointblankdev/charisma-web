import { NextApiRequest, NextApiResponse } from 'next';
import { ContractId } from 'dexterity-sdk';
import { Dexterity } from 'dexterity-sdk';
import _ from 'lodash';
import { Kraxel } from '@lib/kraxel';

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
        console.log('Dexterity Balancer Cron Job Running')
        // Initialize Dexterity SDK
        await Dexterity.configure({
            apiKeyRotation: 'loop',
            parallelRequests: 10,
            maxHops: 4
        })

        const prices = await Kraxel.getAllTokenPrices();
        await Dexterity.discover({ blacklist, reserves: false })

        const tokens = Dexterity.getTokens()
        const txs = []
        const fee = 1100

        try {
            console.log('Buying CHA with STX')
            // Buy CHA with STX
            const cha = tokens.find(token => token.contractId === 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token')!
            const amount = Math.floor(10 ** cha.decimals / prices[cha.contractId] / 5)
            txs.push(await Dexterity.executeSwap('.stx', cha.contractId, amount, { fee }))
        } catch (error) {
            console.error('Error buying CHA:', error);
        }

        console.log('Finished processing all txs')
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