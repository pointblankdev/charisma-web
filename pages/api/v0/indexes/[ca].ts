import { addIndexContract, getContractMetadata, setContractMetadata } from '@lib/redis/kv';
import { getTokenMetadata } from '@lib/hiro/stacks-api';
import { NextApiRequest, NextApiResponse } from 'next';

type ErrorResponse = {
  error: {
    code: string;
    message: string;
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
  }
}

async function auditContract(contract: string) {
  try {
    const response = await fetch('https://explore.charisma.rocks/api/v0/audit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ contractId: contract })
    });

    if (!response.ok) {
      throw new Error(`Audit request failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Failed to audit contract ${contract}:`, error);
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

      // Notify dexterity service and audit main contract
      await Promise.all([notifyDexterity(ca)]);

      // Add to index and set metadata
      await addIndexContract(ca);
      response = await setContractMetadata(ca, req.body);

      // Process tokenA
      if (req.body.tokenA) {
        await Promise.all([
          notifyDexterity(req.body.tokenA),
          auditContract(req.body.tokenA),
          (async () => {
            const metadataA = await getTokenMetadata(req.body.tokenA);
            await setContractMetadata(req.body.tokenA, metadataA);
          })()
        ]);
      }

      // Process tokenB
      if (req.body.tokenB) {
        await Promise.all([
          notifyDexterity(req.body.tokenB),
          auditContract(req.body.tokenB),
          (async () => {
            const metadataB = await getTokenMetadata(req.body.tokenB);
            await setContractMetadata(req.body.tokenB, metadataB);
          })()
        ]);
      }
    } else if (req.method === 'GET') {
      if (ca.endsWith('.json')) {
        ca = ca.slice(0, -5);
      }
      response = await getContractMetadata(ca);
    } else {
      code = 501;
      response = {
        error: {
          code: 'method_unknown',
          message: 'This endpoint only responds to GET and POST'
        }
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
