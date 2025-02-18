// get the status of the subnet

import { Subnet } from 'blaze-sdk';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { contract } = req.query;
    const subnet = new Subnet(contract as string);
    const status = subnet.getStatus();
    res.status(200).json(status);
}
