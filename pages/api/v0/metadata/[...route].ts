import { kv } from '@vercel/kv';
import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { put } from '@vercel/blob';
import { getSymbol, getTokenMetadata } from '@lib/stacks-api';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

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

interface GenerateMetadataRequest {
  name: string;
  symbol: string;
  decimals: number;
  identifier: string;
  description: string;
  properties?: Record<string, any>;
  imagePrompt?: string;
}

// Helper to validate contract ID format
const isValidContractId = (contractId: string) => {
  return /^SP[A-Z0-9]+\.[^\/]+$/.test(contractId);
};

// Helper to validate auth token
const validateAuth = (req: NextApiRequest) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return false;
  }
  const token = authHeader.split(' ')[1];
  return token === process.env.API_SECRET_KEY;
};

async function handleGet(req: NextApiRequest, res: NextApiResponse, contractId: string) {
  try {
    if (!isValidContractId(contractId)) {
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

async function handleGenerate(req: NextApiRequest, res: NextApiResponse, contractId: string) {
  const data = req.body as GenerateMetadataRequest & {
    imagePrompt?: string;
    customImageUrl?: string;
  };

  try {
    // If custom image URL provided, use it directly
    if (data.customImageUrl) {
      const metadata: TokenMetadata = {
        ...data,
        image: data.customImageUrl,
        properties: {
          ...data.properties,
          generated: {
            date: new Date().toISOString()
          }
        }
      };

      await kv.set(`sip10:${contractId}`, metadata);
      return res.status(200).json({ success: true, contractId, metadata });
    }

    // Otherwise generate image with AI
    const imagePrompt = data.imagePrompt ||
      `Design a iconic logo for ${data.name}, described by: ${data.description}`;

    console.log('Image prompt:', imagePrompt);

    // Generate image with OpenAI
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
        ...data.properties,
        date: new Date().toISOString()
      }
    };

    await kv.set(`sip10:${contractId}`, metadata);
    return res.status(200).json({ success: true, contractId, metadata });

  } catch (error) {
    console.error('Failed to generate metadata:', (error as Error).message);
    return res.status(500).json({ error: 'Failed to generate metadata' });
  }
}

async function handleUpdate(
  req: NextApiRequest,
  res: NextApiResponse,
  contractId: string
) {
  const updates = req.body as TokenMetadata;

  try {
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

// Add to existing interfaces
interface MigrationRequest {
  oldKey: string;
  newKey: string;
}

// Add migration handler
async function handleMigrate(req: NextApiRequest, res: NextApiResponse) {
  const { oldKey, newKey } = req.body as MigrationRequest;

  if (!isValidContractId(oldKey) || !isValidContractId(newKey)) {
    return res.status(400).json({ error: 'Invalid contract ID format' });
  }

  try {
    // Get old data
    const oldKeyFormatted = `sip10:${oldKey}`
    const newKeyFormatted = `sip10:${newKey}`

    const oldData = await kv.get<TokenMetadata>(oldKeyFormatted);
    if (!oldData) {
      return res.status(404).json({ error: 'Source data not found' });
    }

    // Copy data to new key
    await kv.set(newKeyFormatted, oldData);

    // Optional: Update lastUpdated timestamp
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

// Update the handler function to include the new migrate route
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { route } = req.query;
  const paths = route as string[];

  if (!Array.isArray(paths)) {
    return res.status(400).json({ error: 'Invalid route' });
  }

  // Handle different route patterns
  if (paths.length === 1) {
    // GET /api/v0/metadata/{contractId}
    if (req.method === 'GET') {
      return handleGet(req, res, paths[0]);
    }
    if (req.method === 'POST') {
      return handleMigrate(req, res);
    }
  } else if (paths.length === 2) {
    const [action, contractId] = paths;

    if (!isValidContractId(contractId)) {
      return res.status(400).json({ error: 'Invalid contract ID format' });
    }

    if (action === 'generate' && req.method === 'POST') {
      return handleGenerate(req, res, contractId);
    }

    if (action === 'update') {
      return handleUpdate(req, res, contractId);
    }
  }

  return res.status(404).json({ error: 'Route not found' });
}
