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
        'next-hops': nextHops,
        'next-hop': nextHop,
    } = req.body;

    try {
        // Get channel from KV
        const channelKey = `channels:${principal1}:${principal2}:${token || 'null'}`;
        const channel = await kv.get<Channel>(channelKey);

        if (!channel) {
            return res.status(404).json({ error: 'Channel does not exist.' });
        }

        const sender = principal1 === CONFIG.OWNER ? principal2 : principal1;

        // Validate nonce
        if (BigInt(nonce) <= BigInt(channel.nonce)) {
            return res.status(409).json({ error: 'Nonce conflict.', channel, message: `Nonce: ${nonce} <= ${channel.nonce}` });
        }

        // Validate balances
        const { myBalance, theirBalance, myPrevBalance, theirPrevBalance } =
            identifyBalances(principal1, CONFIG.OWNER!, balance1, balance2, channel);

        if (
            myPrevBalance + BigInt(amount) !== myBalance ||
            theirPrevBalance - BigInt(amount) !== theirBalance
        ) {
            return res.status(409).json({ error: 'Invalid transfer balance.', channel });
        }

        // Verify signature
        const isValid = await verifySignature(
            signature,
            sender,
            token,
            CONFIG.OWNER!,
            sender,
            myBalance,
            theirBalance,
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
            CONFIG.OWNER!,
            sender,
            myBalance,
            theirBalance,
            nonce,
            ACTION.TRANSFER,
            sender,
            hashedSecret,
            getNetwork()
        );

        // Update channel state atomically
        await kv.set(channelKey, {
            ...channel,
            balance_1: balance1,
            balance_2: balance2,
            nonce: nonce,
            state: 'open'
        });

        // Handle next hops if present
        if (nextHops && nextHop !== null) {
            if (!hashedSecret) {
                return res.status(400).json({
                    error: 'Hashed secret required for transfer flow.'
                });
            }

            // Store pending signatures
            await kv.set(`pending:${channelKey}`, {
                balance_1: balance1,
                balance_2: balance2,
                nonce: nonce,
                action: ACTION.TRANSFER,
                sender: sender,
                hashedSecret,
                ownerSignature,
                signature
            });
        } else {
            if (hashedSecret) {
                return res.status(400).json({
                    error: 'Cannot require secret without next hops.'
                });
            }

            // Store completed signatures
            await kv.set(`signatures:${channelKey}`, {
                balance_1: balance1,
                balance_2: balance2,
                nonce: nonce,
                action: ACTION.TRANSFER,
                sender,
                ownerSignature,
                signature
            });
        }

        return res.status(200).json({
            signature: ownerSignature
        });

    } catch (error) {
        console.error('Transfer error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}