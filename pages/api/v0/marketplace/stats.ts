// pages/api/v0/marketplace/stats.ts
import { MarketplaceService } from '@lib/data/marketplace/marketplace-service';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function StatsAPI(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).json({
            error: {
                code: 'method_not_allowed',
                message: 'Method not allowed'
            }
        });
    }

    try {
        const stats = await MarketplaceService.getStats();
        return res.status(200).json(stats);
    } catch (error) {
        console.error('Error fetching stats:', error);
        return res.status(500).json({
            error: {
                code: 'internal_error',
                message: 'Failed to fetch marketplace stats'
            }
        });
    }
}