import { getDexterityQuote } from '@lib/dexterity';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { contract, forwardSwap, amountIn } = req.query;

  if (!contract || typeof forwardSwap === 'undefined' || !amountIn) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const quote = await getDexterityQuote(
      contract as string,
      forwardSwap === 'true',
      parseInt(amountIn as string),
      true // Always apply fee for now
    );

    return res.status(200).json({ quote });
  } catch (error) {
    console.error('Error fetching quote:', error);
    return res.status(500).json({ error: 'Failed to fetch quote' });
  }
}
