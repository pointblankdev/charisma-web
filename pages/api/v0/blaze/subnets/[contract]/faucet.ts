import type { NextApiRequest, NextApiResponse } from 'next';
import { getBlazeBalance, getBlazeContractForToken, setBlazeBalance } from '@lib/blaze/helpers';

const FAUCET_AMOUNT = 1000 * 1_000_000; // 1000 WELSH with 6 decimals
const WELSH_TOKEN = 'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { address } = req.body;

        if (!address) {
            return res.status(400).json({ error: 'Address is required' });
        }

        const contract = getBlazeContractForToken(WELSH_TOKEN);
        const currentBalance = await getBlazeBalance(contract, address);

        // Update balance
        const newBalance = currentBalance + FAUCET_AMOUNT;
        await setBlazeBalance(contract, address, newBalance);

        return res.status(200).json({
            success: true,
            amount: FAUCET_AMOUNT,
            newBalance
        });

    } catch (error) {
        console.error('Faucet error:', error);
        return res.status(500).json({
            error: 'Failed to process faucet request'
        });
    }
} 