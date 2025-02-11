import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { address } = req.query;
    //   const nonce = await getNonce(address as string);
    const nonce = 0;
    res.status(200).json({ nonce });
}

