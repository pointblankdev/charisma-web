import { addIndexContract, getContractMetadata, setContractMetadata } from '@lib/db-providers/kv';
import { getTokenMetadata } from '@lib/stacks-api';
import { NextApiRequest, NextApiResponse } from 'next';

type ErrorResponse = {
  error: {
    code: string;
    message: string;
  };
};

type ContractRequest = {
  contract: string;
  metadata?: {
    tokenA?: string;
    tokenB?: string;
    [key: string]: any;
  };
};

async function notifyDexterity(contract: string) {
  try {
    const response = await fetch('https://api.kraxel.io/v0/dexterity/contracts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ contract })
    });

    if (!response.ok) {
      throw new Error(`Dexterity notification failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to notify dexterity service:', error);
    // Don't throw - we don't want to fail the main operation if notification fails
  }
}

export default async function getMetadata(
  req: NextApiRequest,
  res: NextApiResponse<any | ErrorResponse>
) {
  let response,
    code = 200;
  try {
    let ca = req.query.ca as string;

    if (req.method === 'POST') {
      console.log('Received POST request:', req.body);

      // Add to index and set metadata
      await addIndexContract(ca);
      response = await setContractMetadata(ca, req.body);

      // Process token metadata
      if (req.body.tokenA) {
        const metadataA = await getTokenMetadata(req.body.tokenA);
        await setContractMetadata(req.body.tokenA, metadataA);
      }

      if (req.body.tokenB) {
        const metadataB = await getTokenMetadata(req.body.tokenB);
        await setContractMetadata(req.body.tokenB, metadataB);
      }

      // Notify dexterity service
      await notifyDexterity(ca);
    } else if (req.method === 'GET') {
      if (ca.endsWith('.json')) {
        ca = ca.slice(0, -5);
      }
      response = await getContractMetadata(ca);
    } else {
      code = 501;
      response = {
        code: 'method_unknown',
        message: 'This endpoint only responds to GET and POST'
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
