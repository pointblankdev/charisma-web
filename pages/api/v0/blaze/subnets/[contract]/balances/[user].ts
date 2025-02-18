import { NextApiRequest, NextApiResponse } from 'next';
import { Subnet } from 'blaze-sdk';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { user, contract } = req.query;

    try {
        const subnet = new Subnet(contract as string);
        const balance = await subnet.getBalance(user as string);
        // Add cache control headers
        res.setHeader('Cache-Control', 's-maxage=10');
        res.status(200).json(balance);

    } catch (error) {
        console.error('Error fetching user info:', error);
        res.status(500).json({ error: 'Failed to fetch user information' });
    }
}