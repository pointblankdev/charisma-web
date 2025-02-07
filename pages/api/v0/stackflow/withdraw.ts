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

        // Verify withdrawal balances
        const { myBalance, theirBalance, myPrevBalance, theirPrevBalance } =
            identifyBalances(principal1, CONFIG.OWNER!, balance1, balance2, channel);

        if (
            myPrevBalance !== myBalance ||
            theirPrevBalance - BigInt(amount) !== theirBalance
        ) {
            return res.status(409).json({ error: 'Invalid withdrawal balance.', channel });
        }

        // Verify signature
        const signatureBuffer = new Uint8Array(Buffer.from(signature, 'hex'));
        const isValid = await verifySignature(
            signatureBuffer,
            sender,
            token,
            CONFIG.OWNER!,
            sender,
            myBalance,
            theirBalance,
            nonce,
            ACTION.WITHDRAW,
            sender,
            null,
            getNetwork()
        );

        if (!isValid) {
            return res.status(403).json({ error: 'Invalid withdrawal signature.' });
        }

        // Generate owner signature
        const ownerSignature = generateSignature(
            CONFIG.PRIVATE_KEY!,
            token,
            CONFIG.OWNER!,
            sender,
            myBalance,
            theirBalance,
            nonce,
            ACTION.WITHDRAW,
            sender,
            null,
            getNetwork()
        );

        return res.status(200).json({
            signature: ownerSignature.toString('hex')
        });

    } catch (error) {
        console.error('Withdrawal error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}