import { getGlobalState } from '@lib/db-providers/kv';
import { NextApiRequest, NextApiResponse } from 'next';

type ErrorResponse = {
  error: {
    code: string;
    message: string;
  };
};

export default async function getBlocks(
  req: NextApiRequest,
  res: NextApiResponse<any | ErrorResponse>
) {

  let response,
    code = 200;
  try {
    if (req.method === 'GET') {
      response = await getGlobalState(`blocks:latest`);
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
