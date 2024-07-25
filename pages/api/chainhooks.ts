import { NextApiRequest, NextApiResponse } from 'next';

type ErrorResponse = {
  error: {
    code: string;
    message: string;
  };
};

export default function chainhooks(
  req: NextApiRequest,
  res: NextApiResponse<any | ErrorResponse>
) {
  if (req.method !== 'POST') {
    return res.status(501).json({
      error: {
        code: 'method_unknown',
        message: 'This endpoint only responds to POST'
      }
    });
  }

  console.log('chainhooks called');

  try {
    for (const a of req.body.apply) {
      for (const tx of a.transactions) {
        const payload = {
          ...tx.metadata.kind.data,
          sender: tx.metadata.sender,
          success: tx.metadata.success,
        };

        console.log(payload)
      }
    }
  } catch (error: any) {
    console.error(error.message);
  }

  return res.status(200).json({});
}
