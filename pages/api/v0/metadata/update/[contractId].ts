import { kv } from '@vercel/kv';
import { NextApiRequest, NextApiResponse } from 'next';

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

const isValidContractId = (contractId: string) => {
    return /^SP[A-Z0-9]+\.[^\/]+$/.test(contractId);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { contractId } = req.query;
    const updates = req.body as TokenMetadata;

    try {
        if (!isValidContractId(contractId as string)) {
            return res.status(400).json({ error: 'Invalid contract ID format' });
        }

        // Get existing metadata
        const currentMetadata = await kv.get<TokenMetadata>(`sip10:${contractId}`);

        // Merge existing and new metadata
        const newMetadata = {
            ...currentMetadata,
            ...updates,
            properties: {
                ...currentMetadata?.properties,
                ...updates.properties
            }
        };

        await kv.set(`sip10:${contractId}`, newMetadata);

        return res.status(200).json({
            success: true,
            contractId,
            metadata: newMetadata
        });
    } catch (error) {
        console.error('Failed to update metadata:', error);
        return res.status(500).json({ error: 'Failed to update metadata' });
    }
} 