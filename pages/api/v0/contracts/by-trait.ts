import {
  DEXTERITY_ABI,
  getAllContractsByTrait,
  getContractsByTrait
} from '@lib/server/traits/service';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { limit, offset, trait, all } = req.query;
    let traitAbi = DEXTERITY_ABI;

    // If a custom trait is provided, try to parse it
    if (trait) {
      try {
        traitAbi = typeof trait === 'string' ? JSON.parse(trait) : trait;
      } catch (error) {
        return res.status(400).json({
          error: 'Invalid trait ABI format',
          message: 'The provided trait ABI could not be parsed'
        });
      }
    }

    // If 'all' flag is true, fetch all contracts
    if (all === 'true') {
      const allContracts = await getAllContractsByTrait(traitAbi);
      return res.status(200).json({
        success: true,
        contracts: allContracts,
        total: allContracts.length
      });
    }

    // Otherwise, fetch with pagination
    const parsedLimit = limit ? parseInt(limit as string) : 20;
    const parsedOffset = offset ? parseInt(offset as string) : 0;

    const results = await getContractsByTrait({
      traitAbi,
      limit: parsedLimit,
      offset: parsedOffset
    });

    return res.status(200).json({
      success: true,
      ...results
    });
  } catch (error: any) {
    console.error('Error in contracts/by-trait endpoint:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
