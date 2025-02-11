import type { NextApiRequest, NextApiResponse } from 'next';
import { kv } from '@vercel/kv';
import { ACTION, CONFIG, getNetwork } from '@lib/stackflow/config';
import { verifySignature, generateSignature } from '@lib/stackflow/signature';
import { identifyBalances, getChannelKey } from '@lib/stackflow/utils';
import { Channel } from '@lib/stackflow/types';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const {
        amount,
        token,
        'principal-1': principal1,
        'principal-2': principal2,
        'balance-1': balance1,
        'balance-2': balance2,
        nonce,
        signature,
    } = req.body;

    try {
        const channelKey = getChannelKey(principal1, principal2, token);
        const channel = await kv.get<Channel>(channelKey);

        if (!channel) {
            return res.status(404).json({ error: 'Channel does not exist.' });
        }

        const sender = principal1 === CONFIG.OWNER ? principal2 : principal1;

        if (BigInt(nonce) <= BigInt(channel.nonce)) {
            return res.status(409).json({ error: 'Nonce conflict.' });
        }

        // Verify deposit balances
        const { myBalance, theirBalance, myPrevBalance, theirPrevBalance } =
            identifyBalances(principal1, CONFIG.OWNER!, balance1, balance2, channel);

        if (
            myPrevBalance !== myBalance ||
            theirPrevBalance + BigInt(amount) !== theirBalance
        ) {
            return res.status(409).json({ error: 'Invalid deposit balance.', channel });
        }

        // Verify signature
        const isValid = await verifySignature(
            signature,
            sender,
            token,
            principal1,
            principal2,
            balance1,
            balance2,
            nonce,
            ACTION.DEPOSIT,
            sender,
            null,
            getNetwork()
        );

        if (!isValid) {
            return res.status(403).json({ error: 'Invalid deposit signature.' });
        }

        // Generate owner signature
        const ownerSignature = generateSignature(
            CONFIG.PRIVATE_KEY!,
            token,
            principal1,
            principal2,
            balance1,
            balance2,
            nonce,
            ACTION.DEPOSIT,
            sender,
            null,
            getNetwork()
        );

        return res.status(200).json({
            signature: ownerSignature
        });

    } catch (error) {
        console.error('Deposit error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}