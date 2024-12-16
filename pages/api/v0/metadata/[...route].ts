import { kv } from '@vercel/kv';
import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { put } from '@vercel/blob';

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

// Helper to construct KV key
const getKvKey = (contractId: string) => `sip10:${contractId}`;

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

    const metadata = await kv.get<TokenMetadata>(getKvKey(contractId));
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
  const data = req.body as GenerateMetadataRequest;

  // Validate required fields
  const requiredFields = ['name', 'symbol', 'decimals', 'identifier', 'description'];
  const missingFields = requiredFields.filter(field => !(field in data));
  if (missingFields.length > 0) {
    return res.status(400).json({
      error: `Missing required fields: ${missingFields.join(', ')}`
    });
  }

  try {
    // Generate image using OpenAI
    const imagePrompt =
      (data.imagePrompt ||
        `A cryptocurrency token logo for ${data.name} (${data.symbol}). ${data.description}.`) +
      `. No empty space around the edges. Simple and elegent with a single focal point. Do not include any text in the logo.` +
      `In the style of a Magic the Gathering set symbol.`;

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: imagePrompt,
      n: 1,
      size: '1024x1024'
    });

    // Download the image from OpenAI
    const imageUrl = response.data[0].url as string;
    const imageResponse = await fetch(imageUrl);
    const imageBlob = await imageResponse.blob();

    // Upload to Vercel Blob
    const filename = `${contractId}-${Date.now()}.png`;
    const blob = await put(filename, imageBlob, {
      access: 'public',
      contentType: 'image/png'
    });

    // Construct metadata
    const metadata: TokenMetadata = {
      name: data.name,
      symbol: data.symbol,
      decimals: data.decimals,
      identifier: data.identifier,
      description: data.description,
      image: blob.url,
      properties: {
        ...data.properties,
        generated: {
          date: new Date().toISOString(),
          imagePrompt,
          imagePathname: blob.pathname
        }
      }
    };

    // Store metadata in KV
    await kv.set(getKvKey(contractId), metadata);

    return res.status(200).json({
      success: true,
      contractId,
      metadata
    });
  } catch (error) {
    console.error('Failed to generate metadata:', error);
    return res.status(500).json({ error: 'Failed to generate metadata' });
  }
}

async function handleUpdate(
  req: NextApiRequest,
  res: NextApiResponse,
  contractId: string,
  isPartial = false
) {
  const updates = req.body as Partial<TokenMetadata>;

  if (!isPartial) {
    // Validate required fields for full update
    const requiredFields = ['name', 'description', 'image', 'identifier', 'symbol', 'decimals'];
    const missingFields = requiredFields.filter(field => !(field in updates));
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
    }
  }

  try {
    const key = getKvKey(contractId);
    let newMetadata: TokenMetadata;

    if (isPartial) {
      // Get existing metadata for partial update
      const currentMetadata = await kv.get<TokenMetadata>(key);
      if (!currentMetadata && isPartial) {
        return res.status(404).json({ error: 'Metadata not found' });
      }
      newMetadata = {
        ...currentMetadata,
        ...updates,
        properties: {
          ...currentMetadata?.properties,
          ...updates.properties,
          lastUpdated: new Date().toISOString()
        }
      };
    } else {
      newMetadata = {
        ...updates,
        properties: {
          ...updates.properties,
          lastUpdated: new Date().toISOString()
        }
      };
    }

    await kv.set(key, newMetadata);

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { route } = req.query;
  const paths = route as string[];

  if (!Array.isArray(paths)) {
    return res.status(400).json({ error: 'Invalid route' });
  }

  // Handle different route patterns
  if (paths.length === 1) {
    // GET /api/token-metadata/{contractId}
    if (req.method === 'GET') {
      return handleGet(req, res, paths[0]);
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
      if (req.method === 'POST') {
        return handleUpdate(req, res, contractId, false);
      }
      if (req.method === 'PATCH') {
        return handleUpdate(req, res, contractId, true);
      }
    }
  }

  return res.status(404).json({ error: 'Route not found' });
}
