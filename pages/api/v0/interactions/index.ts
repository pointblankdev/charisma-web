import { NextApiRequest, NextApiResponse } from 'next';

type ErrorResponse = {
  error: {
    code: string;
    message: string;
  };
};

export const interactionIds = ['SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.hooter-farm'];

export default function InteractionsAPI(
  req: NextApiRequest,
  res: NextApiResponse<any | ErrorResponse>
) {
  return res.status(200).json(interactionIds);
}
