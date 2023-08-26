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

  try {
    console.log(req.body)

    if (req.body.type === 1) {
      return res.status(200).json({ type: 1 });
    } else {
      return res.status(200).json({});
    }
  } catch (error: any) {
    console.error(error.message)
    return res.status(500).json({ error: { code: 500, message: 'Internal server error' } });
  }
}
