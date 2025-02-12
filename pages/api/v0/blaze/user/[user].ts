import { getBlazeBalance, getBlazeNonce, TOKEN_CONTRACT_MAP } from '@lib/blaze/helpers';
import { NextApiRequest, NextApiResponse } from 'next';
import { getBalance } from '@components/blaze/action-helpers';

interface BlazeUserInfo {
    address: string;
    blazeBalance: Record<string, {
        credit: number;
        balance: number;
        nonce: number;
        contract: string;
    }>;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { user } = req.query;

    try {
        const userInfo: BlazeUserInfo = {
            address: user as string,
            blazeBalance: {},
        };

        // Get all token balances and nonces
        for (const [token, contract] of Object.entries(TOKEN_CONTRACT_MAP)) {
            try {
                const [credit, balance, nonce] = await Promise.all([
                    getBlazeBalance(contract, user as string),
                    getBalance(user as string, token),
                    getBlazeNonce(contract, user as string),
                ]);

                userInfo.blazeBalance[token] = {
                    credit,
                    balance,
                    nonce,
                    contract,
                };
            } catch (error) {
                console.error(`Error fetching data for token ${token}:`, error);
                userInfo.blazeBalance[token] = {
                    balance: 0,
                    credit: 0,
                    nonce: 0,
                    contract,
                };
            }
        }

        // Add cache control headers
        res.setHeader('Cache-Control', 's-maxage=10');
        res.status(200).json(userInfo);

    } catch (error) {
        console.error('Error fetching user info:', error);
        res.status(500).json({ error: 'Failed to fetch user information' });
    }
}