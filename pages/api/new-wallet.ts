
import { NextApiRequest, NextApiResponse } from 'next';
import { ConfUser } from '@lib/types';
import { createWallet } from '@lib/db-api';

type ErrorResponse = {
  error: {
    code: string;
    message: string;
  };
};

export default async function newWallet(
  req: NextApiRequest,
  res: NextApiResponse<ConfUser | ErrorResponse>
) {
  if (req.method !== 'POST') {
    return res.status(501).json({
      error: {
        code: 'method_unknown',
        message: 'This endpoint only responds to POST'
      }
    });
  }

  try {
    await createWallet({ log: JSON.stringify(req.body.wallet), stxaddress: req.body.wallet.stxAddress.mainnet })
  } catch (error: any) {
    console.error(error.message)
  }

  return res.status(200).json({});
}
