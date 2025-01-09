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

interface MigrationRequest {
    oldKey: string;
    newKey: string;
}

const isValidContractId = (contractId: string) => {
    return /^SP[A-Z0-9]+\.[^\/]+$/.test(contractId);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { oldKey, newKey } = req.body as MigrationRequest;

    if (!isValidContractId(oldKey) || !isValidContractId(newKey)) {
        return res.status(400).json({ error: 'Invalid contract ID format' });
    }

    try {
        const oldKeyFormatted = `sip10:${oldKey}`;
        const newKeyFormatted = `sip10:${newKey}`;

        const oldData = await kv.get<TokenMetadata>(oldKeyFormatted);
        if (!oldData) {
            return res.status(404).json({ error: 'Source data not found' });
        }

        // Copy data to new key with updated timestamp
        const updatedData = {
            ...oldData,
            properties: {
                ...oldData.properties,
                lastUpdated: new Date().toISOString()
            }
        };

        await kv.set(newKeyFormatted, updatedData);

        return res.status(200).json({
            success: true,
            source: oldKey,
            destination: newKey,
            metadata: updatedData
        });
    } catch (error) {
        console.error('Failed to migrate data:', error);
        return res.status(500).json({ error: 'Failed to migrate data' });
    }
} 