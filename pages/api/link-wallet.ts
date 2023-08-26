
import { NextApiRequest, NextApiResponse } from 'next';
import { ConfUser } from '@lib/types';
import { createWallet, updateUserWithWallet } from '@lib/db-api';

type ErrorResponse = {
  error: {
    code: string;
    message: string;
  };
};

export default async function linkWallet(
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
    const wallet = await createWallet({ log: JSON.stringify(req.body.wallet) })
    await updateUserWithWallet(req.body.user.id, wallet.id)
  } catch (error) {
    console.error(error)
  }

  return res.status(200).json({});
}
