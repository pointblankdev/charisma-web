// pages/api/v1/pools.ts
import { PoolInfo, PoolService } from '@lib/server/pools/pool-service';
import { TokenService } from '@lib/server/tokens/token-service';
import { NextApiRequest, NextApiResponse } from 'next';

type ErrorResponse = {
  error: {
    code: string;
    message: string;
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PoolInfo[] | ErrorResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: {
        code: 'method_not_allowed',
        message: 'Only GET method is allowed'
      }
    });
  }

  try {
    // Get all pools and tokens
    const [pools, tokens] = await Promise.all([PoolService.getAll(), TokenService.getAll()]);

    // Transform KVPoolData into PoolInfo by looking up token details
    const poolsWithTokens = pools.map(pool => {
      const token0 = tokens.find(t => t.symbol === pool.token0Symbol);
      const token1 = tokens.find(t => t.symbol === pool.token1Symbol);

      if (!token0 || !token1) {
        throw new Error(`Token not found for pool ${pool.id}`);
      }

      return {
        id: pool.id,
        token0: {
          symbol: token0.symbol,
          name: token0.name,
          image: token0.imagePath,
          contractAddress: token0.contractAddress,
          tokenId: token0.tokenName,
          decimals: token0.decimals
        },
        token1: {
          symbol: token1.symbol,
          name: token1.name,
          image: token1.imagePath,
          contractAddress: token1.contractAddress,
          tokenId: token1.tokenName,
          decimals: token1.decimals
        },
        volume24h: pool.volume24h,
        contractAddress: pool.contractAddress
      };
    });

    res.status(200).json(poolsWithTokens);
  } catch (error) {
    console.error('Error fetching pools:', error);
    res.status(500).json({
      error: {
        code: 'internal_server_error',
        message: 'Failed to fetch pools'
      }
    });
  }
}
