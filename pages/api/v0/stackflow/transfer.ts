// pages/api/transfer.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { kv } from '@vercel/kv';
import { ACTION, CONFIG, getNetwork } from '@lib/stackflow/config';
import { Channel } from '@lib/stackflow/types';
import { verifySignature, generateSignature } from '@lib/stackflow/signature';
import { identifyBalances } from '@lib/stackflow/utils';

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
        'hashed-secret': hashedSecret,
        signature,
    } = req.body;

    try {
        // Get channels from KV
        const senderChannelKey = `channels:${principal1}:${CONFIG.OWNER}:${token || 'null'}`;
        const recipientChannelKey = `channels:${principal2}:${CONFIG.OWNER}:${token || 'null'}`;
        const senderChannel = await kv.get<Channel>(senderChannelKey);
        const recipientChannel = await kv.get<Channel>(recipientChannelKey);
        if (!senderChannel || !recipientChannel) {
            return res.status(404).json({ error: 'Channel does not exist.' });
        }

        const sender = principal1 === CONFIG.OWNER ? principal2 : principal1;

        // Validate nonce
        if ((nonce) <= (senderChannel.nonce)) {
            return res.status(409).json({ error: 'Nonce conflict.', senderChannel, message: `Nonce: ${nonce} <= ${senderChannel.nonce}` });
        }

        // Validate balances
        if (
            senderChannel.balance_1 - amount !== balance1 ||
            recipientChannel.balance_1 + amount !== balance2
        ) {
            return res.status(409).json({ error: 'Invalid transfer balance.', senderChannel, recipientChannel });
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
            ACTION.TRANSFER,
            sender,
            hashedSecret,
            getNetwork()
        );

        if (!isValid) {
            return res.status(403).json({ error: 'Invalid transfer signature.' });
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
            ACTION.TRANSFER,
            sender,
            hashedSecret,
            getNetwork()
        );

        // Update channel states
        await kv.set(senderChannelKey, {
            ...senderChannel,
            balance_1: balance1,
            nonce: nonce,
        });

        await kv.set(recipientChannelKey, {
            ...recipientChannel,
            balance_1: balance2,
        });

        // Store completed signatures
        await kv.set(`signatures:${senderChannelKey}`, {
            balance_1: balance1,
            balance_2: balance2,
            nonce: nonce,
            action: ACTION.TRANSFER,
            sender,
            ownerSignature,
            signature
        });

        return res.status(200).json({
            signature: ownerSignature,
            message: 'Transfer completed.'
        });

    } catch (error) {
        console.error('Transfer error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}