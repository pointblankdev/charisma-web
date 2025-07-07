import { getContractMetadata, setContractMetadata } from '@lib/redis/kv';
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
      response = await setContractMetadata(ca, req.body);
    } else if (req.method === 'GET') {
      // if ca ends with .json, remove it
      if (ca.endsWith('.json')) {
        ca = ca.slice(0, -5);
      }
      // Set cache headers for 1 week
      res.setHeader('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400');
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
