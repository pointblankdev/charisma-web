import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { put } from '@vercel/blob';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

interface TokenMetadata {
    name: string;
    description: string;
    image: string;
    identifier: string;
    symbol: string;
    decimals: number;
    properties?: any;
}

interface GenerateMetadataRequest {
    name: string;
    symbol: string;
    decimals: number;
    identifier: string;
    description: string;
    properties?: Record<string, any>;
    imagePrompt?: string;
}

const isValidContractId = (contractId: string) => {
    return /^S[A-Z0-9]+\.[^\/]+$/.test(contractId);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { contractId } = req.query;
    const data = req.body as GenerateMetadataRequest & {
        imagePrompt?: string;
        customImageUrl?: string;
    };

    try {
        if (!isValidContractId(contractId as string)) {
            return res.status(400).json({ error: 'Invalid contract ID format' });
        }

        // If custom image URL provided, use it directly
        if (data.customImageUrl) {
            const metadata: TokenMetadata = {
                ...data,
                image: data.customImageUrl,
                properties: {
                    ...data.properties
                }
            };

            // await kv.set(`sip10:${contractId}`, metadata);
            return res.status(200).json({ success: true, contractId, metadata });
        }

        // Otherwise generate image with AI
        const imagePrompt = data.imagePrompt ||
            `Design a iconic logo for ${data.name}, described by: ${data.description}`;

        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: imagePrompt,
            n: 1,
            size: "1024x1024",
            quality: 'standard',
            response_format: "url"
        });

        const imageUrl = response.data[0].url;

        // Upload the generated image to Vercel Blob
        const imageResponse = await fetch(imageUrl!);
        const imageBuffer = await imageResponse.arrayBuffer();
        const blob = new Blob([imageBuffer]);
        const { url } = await put(`${contractId}-${Date.now()}.png`, blob, {
            access: 'public'
        });

        // Create and store metadata
        const metadata: TokenMetadata = {
            ...data,
            image: url,
            properties: {
                ...data.properties
            }
        };

        // await kv.set(`sip10:${contractId}`, metadata);
        return res.status(200).json({ success: true, contractId, metadata });
    } catch (error) {
        console.error('Failed to generate metadata:', error);
        return res.status(500).json({ error: 'Failed to generate metadata' });
    }
} 