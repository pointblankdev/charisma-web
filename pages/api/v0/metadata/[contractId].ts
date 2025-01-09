import { kv } from '@vercel/kv';
import { NextApiRequest, NextApiResponse } from 'next';

// Helper to validate contract ID format
const isValidContractId = (contractId: string) => {
    return /^SP[A-Z0-9]+\.[^\/]+$/.test(contractId);
};

interface TokenMetadata {
    name?: string;
    symbol?: string;
    decimals?: number;
    identifier?: string;
    description?: string;
    image?: string;
    image_data?: string;
    external_url?: string;
    background_color?: string;
    animation_url?: string;
    youtube_url?: string;
    properties?: Record<string, any>;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { contractId } = req.query;

    try {
        if (!isValidContractId(contractId as string)) {
            return res.status(400).json({ error: 'Invalid contract ID format' });
        }

        const metadata = await kv.get<TokenMetadata>(`sip10:${contractId}`);
        if (!metadata) {
            return res.status(404).json({ error: 'Metadata not found' });
        }

        return res.status(200).json({
            ...metadata,
            contractId,
            lastUpdated: metadata.properties?.generated?.date
        });
    } catch (error) {
        console.error('Failed to get metadata:', error);
        return res.status(500).json({ error: 'Failed to retrieve metadata' });
    }
} 