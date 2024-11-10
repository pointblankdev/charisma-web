import { NextApiRequest, NextApiResponse } from 'next';
import { kv } from '@vercel/kv';
import PricesService from '@lib/server/prices/prices-service';

const CACHE_KEY = 'token-prices';
const CACHE_DURATION = 60; // 1 minute cache

type PricesResponse = {
  success: boolean;
  data?: { [key: string]: number };
  cached?: boolean;
};

type ErrorResponse = {
  error: {
    code: string;
    message: string;
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PricesResponse | ErrorResponse>
) {
  // Method validation
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: {
        code: 'method_not_allowed',
        message: 'Only GET method is allowed'
      }
    });
  }

  try {
    // Rate limiting
    const ip = req.headers['x-forwarded-for'] || 'anonymous';
    const rateLimitKey = `rate-limit:prices:${ip}`;
    const limit = 100; // 100 requests per minute

    const current = (await kv.get<number>(rateLimitKey)) || 0;
    if (current >= limit) {
      return res.status(429).json({
        error: {
          code: 'rate_limit_exceeded',
          message: 'Too many requests'
        }
      });
    }

    await kv.incr(rateLimitKey);
    await kv.expire(rateLimitKey, 60);

    // Check cache
    const cached = await kv.get<{ [key: string]: number }>(CACHE_KEY);
    if (cached) {
      res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=30');
      return res.status(200).json({
        success: true,
        data: cached,
        cached: true
      });
    }

    const tokens: any[] = [
      {
        symbol: 'CHA-UPDOG',
        contractAddress: 'SP3ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.cha-updog',
        decimals: 6,
        isLpToken: true,
        poolId: '9'
      },
      {
        symbol: 'UPDOG',
        contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.up-dog',
        decimals: 6,
        isLpToken: true,
        poolId: '8'
      },
      {
        symbol: 'CHA',
        contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token',
        decimals: 6,
        isLpToken: false
      },
      {
        symbol: 'WELSH',
        contractAddress: 'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token',
        decimals: 6,
        isLpToken: false
      },
      {
        symbol: 'DOG',
        contractAddress: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.runes-dog',
        decimals: 8,
        isLpToken: false
      }
    ];

    // Initialize token data
    PricesService.setTokenData(tokens);

    // Get all prices including LP tokens
    const prices = await PricesService.getAllTokenPrices();

    // Cache the results
    await kv.set(CACHE_KEY, prices, {
      ex: CACHE_DURATION
    });

    // Set cache headers
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=30');

    // Return response
    return res.status(200).json({
      success: true,
      data: prices,
      cached: false
    });
  } catch (error) {
    console.error('Error fetching token prices:', error);

    return res.status(500).json({
      error: {
        code: 'internal_server_error',
        message: error instanceof Error ? error.message : 'Failed to fetch prices'
      }
    });
  }
}
