import PricesService from '@lib/server/prices/prices-service';
import { NextApiRequest, NextApiResponse } from 'next';

type ErrorResponse = {
  error: {
    code: string;
    message: string;
  };
};

const service = PricesService.getInstance();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any[] | ErrorResponse>
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
    // Get all pools
    const [pools] = await Promise.all([service.getAllPools()]);

    res.status(200).json(pools);
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
