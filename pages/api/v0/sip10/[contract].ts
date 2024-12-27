import { kv } from '@vercel/kv';
import { Dexterity } from 'dexterity-sdk';
import { NextApiRequest, NextApiResponse } from 'next';

type ErrorResponse = {
  error: {
    code: string;
    message: string;
  };
};

// Initialize the cache with both get and set capabilities
Dexterity.cache = new Dexterity.cacheProviders.CustomCache({
  get: async (key: string) => {
    const data = (await kv.get(key)) as any;
    return {
      contractId: data.contractId,
      identifier: data.identifier,
      name: data.name,
      symbol: data.symbol,
      decimals: data.decimals,
      description: data.description || '',
      image: data.image || ''
    };
  },
  set: async (key: string, value: any) => {
    await kv.set(key, value, { ex: 60 * 60 * 24 * 7 });
  }
});

export default async function getTokenMetadata(
  req: NextApiRequest,
  res: NextApiResponse<any | ErrorResponse>
) {
  let response,
    code = 200;
  try {
    const { contract } = req.query;

    if (req.method === 'GET') {
      // getTokenInfo will now automatically use the cache via getOrSet
      response = await Dexterity.getTokenInfo(contract as string);
    } else {
      code = 501;
      response = {
        error: {
          code: 'method_unknown',
          message: 'This endpoint only responds to GET'
        }
      };
    }
  } catch (error: any) {
    console.error('API Error:', error);
    code = error.response?.status || 500;
    response = {
      error: {
        code: 'internal_error',
        message: error.message || 'An unexpected error occurred'
      }
    };
  }

  return res.status(code).json(response);
}
