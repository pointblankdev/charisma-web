import { Dexterity } from 'dexterity-sdk';
import { NextApiRequest, NextApiResponse } from 'next';

Dexterity.setConfig({ maxHops: 4 })

type ErrorResponse = {
  error: {
    code: string;
    message: string;
  };
};

export default async function callReadOnly(
  req: NextApiRequest,
  res: NextApiResponse<any | ErrorResponse>
) {
  let response,
    code = 200;
  try {
    if (req.method === 'POST') {
      const body = req.body;
      response = await Dexterity.client.callReadOnly(body.contractId, body.method, body.args);
    } else {
      code = 501;
      response = {
        error: {
          code: 'method_unknown',
          message: 'This endpoint only responds to POST'
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
