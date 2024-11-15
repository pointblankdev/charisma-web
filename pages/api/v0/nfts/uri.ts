import { getNftURI } from '@lib/stacks-api';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { contractAddress, tokenId } = req.query;

    if (!contractAddress || !tokenId) {
      return res.status(400).json({
        error: 'Missing required parameters: contractAddress and tokenId'
      });
    }

    const metadata = await getNftURI(contractAddress as string, tokenId as string);

    return res.status(200).json(metadata);
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      error: 'Failed to fetch NFT URI',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
