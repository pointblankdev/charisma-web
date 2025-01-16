import { getBlocks } from '@lib/hiro/stacks-api';
import { NextApiRequest, NextApiResponse } from 'next';

export const dynamic = "force-dynamic";

type ErrorResponse = {
  error: {
    code: string;
    message: string;
  };
};

export default async function getBlockHeight(
  req: NextApiRequest,
  res: NextApiResponse<any | ErrorResponse>
) {
  let response,
    code = 200;
  try {
    if (req.method === 'GET') {
      const blocksResponse = await getBlocks();
      response = blocksResponse?.results[0];
    } else {
      code = 501;
      response = new Object({
        code: 'method_unknown',
        message: 'This endpoint only responds to GET'
      });
    }
  } catch (error: any) {
    console.error(error);
    response = new Object(error);
    code = error.response.status;
  }

  return res.status(code).json(response);
}
