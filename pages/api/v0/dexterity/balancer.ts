import { NextApiRequest, NextApiResponse } from 'next';
import { inngest } from '@lib/ingest';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    // Verify the request is from Vercel Cron
    // if (process.env.VERCEL_ENV === 'production' && !req.headers['x-vercel-cron']) {
    //     return res.status(401).json({ error: 'Unauthorized' });
    // }

    try {
        console.log('Dexterity Balancer Cron Job Running')

        const response = await inngest.send({
            name: "balancer/stx",
            data: {
                from: ".stx",
                to: '.stx',
                amount: 1000000
            },
        });

        return res.status(200).json({
            status: 'success',
            response
            // tx
        });

    } catch (error) {
        console.error('Arbitrage scan error:', error);

        return res.status(500).json({
            status: 'error',
            error: 'Internal server error during arbitrage scan'
        });
    }
}