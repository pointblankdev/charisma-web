import { NextApiRequest, NextApiResponse } from 'next';
import { Subnet } from 'blaze-sdk';

const subnet = new Subnet('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.blaze-test-2');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { user } = req.query;

    try {
        const balance = await subnet.getBalance(user as string);
        const nonce = await subnet.getNextNonce(user as string);
        // Add cache control headers
        res.setHeader('Cache-Control', 's-maxage=10');
        res.status(200).json({
            ...balance,
            nonce,
            contract: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.blaze-test-2',
        });

    } catch (error) {
        console.error('Error fetching user info:', error);
        res.status(500).json({ error: 'Failed to fetch user information' });
    }
}