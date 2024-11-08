import { NextApiRequest, NextApiResponse } from 'next';
import { kv } from '@vercel/kv';
import velarApi from '@lib/velar-api';
import cmc from '@lib/cmc-api';
import { DexClient } from '@lib/server/pools/pools.client';

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

    // Initialize clients
    const dexClient = new DexClient();

    // Fetch all data in parallel
    const [velarPrices, cmcPriceData, stxChaPool] = await Promise.all([
      // Get Velar prices
      velarApi.tokens('all').then(prices =>
        prices.reduce((acc: { [key: string]: number }, token: any) => {
          acc[token.symbol] = token.price;
          return acc;
        }, {})
      ),

      // Get CMC prices
      cmc.getQuotes({
        symbol: ['STX', 'ORDI', 'WELSH', 'DOG']
      }),

      // Get STX/CHA pool data
      dexClient.getPoolById('4')
    ]);

    // Calculate CHA price from pool ratio
    const ratio = Number(stxChaPool.reserve0) / Number(stxChaPool.reserve1);

    // Convert Velar prices to numbers
    const convertedVelarPrices = Object.keys(velarPrices).reduce(
      (acc: { [key: string]: number }, key: string) => {
        acc[key] = Number(velarPrices[key]);
        return acc;
      },
      {}
    );

    // Combine all prices
    const tokenPrices = {
      ...convertedVelarPrices,
      CHA: ratio * cmcPriceData.data['STX'].quote.USD.price,
      STX: cmcPriceData.data['STX'].quote.USD.price,
      wSTX: cmcPriceData.data['STX'].quote.USD.price,
      synSTX: cmcPriceData.data['STX'].quote.USD.price,
      ordi: cmcPriceData.data['ORDI'].quote.USD.price,
      DOG: cmcPriceData.data['DOG'].quote.USD.price,
      WELSH: cmcPriceData.data['WELSH'].quote.USD.price,
      iouWELSH: cmcPriceData.data['WELSH'].quote.USD.price,
      ROO: convertedVelarPrices['$ROO'],
      iouROO: convertedVelarPrices['$ROO']
    };

    // Cache the results
    await kv.set(CACHE_KEY, tokenPrices, {
      ex: CACHE_DURATION
    });

    // Set cache headers
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=30');

    // Return response
    return res.status(200).json({
      success: true,
      data: tokenPrices,
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
