import type { NextApiRequest, NextApiResponse } from 'next';
import { kv } from '@vercel/kv';
import type { Channel } from '@lib/stackflow/types';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { principal, cursor = '0', limit = '10' } = req.query;

    if (!principal) {
        return res.status(400).json({ error: 'Principal address is required' });
    }

    try {
        // Get channel IDs for principal
        const channelIds = await kv.smembers<string[]>(`channels:list:${principal}`);

        if (!channelIds.length) {
            return res.status(200).json({
                channels: [],
                total: 0,
                hasMore: false
            });
        }

        // Paginate results
        const startIndex = parseInt(cursor as string);
        const pageSize = parseInt(limit as string);
        const pageIds = channelIds.slice(startIndex, startIndex + pageSize);

        // Fetch channel details in parallel
        const channels = await Promise.all(
            pageIds.map(async (id) => {
                const channel = await kv.get<Channel>(id);
                if (!channel) return null;

                // Add extra metadata
                return {
                    ...channel,
                    balanceStr: {
                        principal1: channel.balance_1,
                        principal2: channel.balance_2,
                    },
                    lastUpdated: new Date(parseInt(channel.nonce) * 1000).toISOString()
                };
            })
        );

        // Filter out any null values and format response
        const validChannels = channels.filter(Boolean);

        return res.status(200).json({
            channels: validChannels,
            total: channelIds.length,
            hasMore: startIndex + pageSize < channelIds.length,
            nextCursor: startIndex + pageSize
        });

    } catch (error) {
        console.error('Error fetching channels:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}