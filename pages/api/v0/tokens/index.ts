// pages/api/v1/tokens.ts
import { TokenService } from '@lib/server/tokens/token-service';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const tokens = await TokenService.getAll();
    res.status(200).json(tokens);
  } catch (error) {
    console.error('Error fetching tokens:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
