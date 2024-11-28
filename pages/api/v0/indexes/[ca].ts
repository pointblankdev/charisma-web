import { addIndexContract, getContractMetadata, setContractMetadata } from '@lib/db-providers/kv';
import { getTokenMetadata } from '@lib/stacks-api';
import { NextApiRequest, NextApiResponse } from 'next';

type ErrorResponse = {
  error: {
    code: string;
    message: string;
  };
};

export default async function getMetadata(
  req: NextApiRequest,
  res: NextApiResponse<any | ErrorResponse>
) {
  let response,
    code = 200;
  try {
    let ca = req.query.ca as string;
    if (req.method === 'POST') {
      console.log(req.body);
      await addIndexContract(ca);
      const metadataA = await getTokenMetadata(req.body.tokenA);
      await setContractMetadata(req.body.tokenA, metadataA);
      const metadataB = await getTokenMetadata(req.body.tokenB);
      await setContractMetadata(req.body.tokenB, metadataB);
      response = await setContractMetadata(ca, req.body);
    } else if (req.method === 'GET') {
      // if ca ends with .json, remove it
      if (ca.endsWith('.json')) {
        ca = ca.slice(0, -5);
      }
      response = await getContractMetadata(ca);
    } else {
      code = 501;
      response = new Object({
        code: 'method_unknown',
        message: 'This endpoint only responds to GET and POST'
      });
    }
  } catch (error: any) {
    console.error(error);
    response = new Object(error);
    code = error.response.status;
  }

  return res.status(code).json(response);
}
