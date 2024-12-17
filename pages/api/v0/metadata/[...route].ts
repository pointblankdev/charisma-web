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

  // Validate required token properties
  if (!data.properties?.tokenAContract || !data.properties?.tokenBContract) {
    return res.status(400).json({
      error: 'Missing required token contracts'
    });
  }

  function generateTokenDetails(tokenAMeta: any, tokenBMeta: any) {
    // Fallback to basic generation
    return {
      name: `${tokenAMeta.symbol}-${tokenBMeta.symbol} LP Token`,
      symbol: `${tokenAMeta.symbol}-${tokenBMeta.symbol}`,
      description: `Liquidity pool token for the ${tokenAMeta.symbol}-${tokenBMeta.symbol} trading pair`
    };
  }

  try {
    // Fetch metadata for both tokens using Stacks API
    const [tokenAMeta, tokenBMeta] = await Promise.all([
      data.properties.tokenAContract === '.stx'
        ? { symbol: 'STX', name: 'Stacks', decimals: 6 }
        : {
            ...getTokenMetadata(data.properties.tokenAContract),
            symbol: await getSymbol(data.properties.tokenAContract)
          },
      data.properties.tokenBContract === '.stx'
        ? { symbol: 'STX', name: 'Stacks', decimals: 6 }
        : {
            ...getTokenMetadata(data.properties.tokenBContract),
            symbol: await getSymbol(data.properties.tokenBContract)
          }
    ]);

    // Generate token details
    const generatedDetails = generateTokenDetails(tokenAMeta, tokenBMeta);

    // Generate metadata based on tokens
    const generatedMetadata = {
      name: generatedDetails.name,
      symbol: generatedDetails.symbol,
      decimals: data.decimals || 6,
      identifier: data.symbol,
      description: generatedDetails.description
    };

    const charismaTheme =
      data.properties.tokenAContract.includes('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS') ||
      data.properties.tokenBContract.includes('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS') ||
      data.properties.tokenAContract.includes('charisma') ||
      data.properties.tokenBContract.includes('charisma');

    // Generate image using OpenAI
    const imagePrompt =
      `Design a sleek, modern logo for ${data.name}. It's described by: ${data.description}. ` +
      `Create a minimalist, balanced design that subtly represents the fusion of ${tokenAMeta.symbol} and ${tokenBMeta.symbol} through abstract geometric shapes. ` +
      `The logo should feel cool and sophisticated, using clean lines and a bold approach that conveys power and wealth. ` +
      `DO NOT include any text or symbols. NO background elements other than black. Avoid empty space around the edges. ` +
      `Focus on creating a single, cohesive emblem that could work as a financial product icon. ` +
      `${
        charismaTheme ? `Incorporate a deep red as the primary color in a sophisticated way. ` : ``
      }` +
      `The design should be iconic and instantly recognizable at small sizes, similar to a premium brand mark or currency symbol.`;

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: imagePrompt,
      n: 1,
      size: '1024x1024'
    });

    // Download and upload image (same as before)
    const imageUrl = response.data[0].url as string;
    const imageResponse = await fetch(imageUrl);
    const imageBlob = await imageResponse.blob();

    const filename = `${contractId}-${Date.now()}.png`;
    const blob = await put(filename, imageBlob, {
      access: 'public',
      contentType: 'image/png'
    });

    // Construct final metadata
    const metadata: TokenMetadata = {
      ...generatedMetadata,
      image: blob.url,
      properties: {
        ...data.properties,
        generated: {
          date: new Date().toISOString(),
          imagePrompt,
          imagePathname: blob.pathname,
          aiGeneratedDetails: generatedDetails
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
    const oldKeyFormatted = getKvKey(oldKey);
    const newKeyFormatted = getKvKey(newKey);

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
