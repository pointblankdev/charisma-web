import { PoolInfo, PoolService } from '@lib/server/pools/pool-service';
import { TokenService } from '@lib/server/tokens/token-service';
import PricesService from '@lib/server/prices/prices-service';
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
    // Get all pools, tokens, and prices
    const [pools, tokens, tokenPrices] = await Promise.all([
      PoolService.getAll(),
      TokenService.getAll(),
      PricesService.getAllTokenPrices()
    ]);

    // Transform pool data into PoolInfo with token details and TVL
    const poolsWithTokens = await Promise.all(pools.map(async pool => {
      const token0 = tokens.find(t => t.symbol === pool.token0Symbol);
      const token1 = tokens.find(t => t.symbol === pool.token1Symbol);

      if (!token0 || !token1) {
        throw new Error(`Token not found for pool ${pool.id}`);
      }

      // Get reserves from chain
      const poolData = await PoolService.getPool(pool.id);
      const reserves = {
        token0: Number(poolData.reserve0),
        token1: Number(poolData.reserve1)
      };

      // Calculate TVL
      const token0Price = tokenPrices[token0.symbol] || 0;
      const token1Price = tokenPrices[token1.symbol] || 0;

      const tvl = (reserves.token0 / 10 ** token0.decimals) * token0Price +
        (reserves.token1 / 10 ** token1.decimals) * token1Price;

      return {
        id: pool.id,
        token0: {
          symbol: token0.symbol,
          name: token0.name,
          image: token0.imagePath,
          contractAddress: token0.contractAddress,
          tokenId: token0.tokenName,
          decimals: token0.decimals,
          price: tokenPrices[token0.symbol] || 0,
          isLpToken: token0.isLpToken || false,
        },
        token1: {
          symbol: token1.symbol,
          name: token1.name,
          image: token1.imagePath,
          contractAddress: token1.contractAddress,
          tokenId: token1.tokenName,
          decimals: token1.decimals,
          price: tokenPrices[token1.symbol] || 0,
          isLpToken: token0.isLpToken || false,
        },
        contractAddress: pool.contractAddress,
        reserves,
        tvl,
        totalLpSupply: (await TokenService.getLpTokenTotalSupply(pool.contractAddress)) || 0
      } as any;
    }));

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