import { NextApiRequest, NextApiResponse } from 'next';
import { inngest } from '@lib/ingest';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    // Verify the request is from Vercel Cron
    // if (process.env.VERCEL_ENV === 'production' && !req.headers['x-vercel-cron']) {
    //     return res.status(401).json({ error: 'Unauthorized' });
    // }

    try {
        console.log('Dexterity Balancer Cron Job Running')

        await inngest.send({
            name: "balance",
            data: {},
        });

        await inngest.send({
            name: "swap",
            data: {
                from: ".stx",
                to: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token',
                amount: 100000
            },
        });

        return res.status(200).json({});

    } catch (error) {
        console.error('Arbitrage scan error:', error);

        return res.status(500).json({
            status: 'error',
            error: 'Internal server error during arbitrage scan'
        });
    }
}