import type { NextApiRequest, NextApiResponse } from 'next';
import { kv } from '@vercel/kv';
import { generateBlazeSignature, SIP10_TOKEN, verifyBlazeSignature } from '@lib/blaze/helpers';
import { CONFIG } from '@lib/stackflow/config';
import { generateSignature } from '@lib/stackflow/signature';
import { TRANSFER_QUEUE_KEY } from './xfer';
import { getNonce } from '@components/blaze/action-helpers';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const requestId = crypto.randomUUID();

    console.info({
        requestId,
        message: 'Received coinflip request',
        method: req.method,
        url: req.url,
        headers: {
            'content-type': req.headers['content-type'],
            'content-length': req.headers['content-length'],
            'user-agent': req.headers['user-agent'],
        }
    });

    if (req.method !== 'POST') {
        console.warn({
            requestId,
            message: 'Invalid method',
            method: req.method
        });
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const {
            signature,
            from,
            amount,
            choice,
            nonce,
        }: {
            signature: string;
            from: string;
            amount: number;
            choice: string;
            nonce: number;
        } = req.body;

        console.info({
            requestId,
            message: 'Processing coinflip',
            from,
            amount,
            choice,
            nonce,
            signaturePrefix: signature?.slice(0, 10)
        });

        // Verify signature
        const isValid = await verifyBlazeSignature(
            signature,
            from,
            'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
            BigInt(amount),
            nonce
        );

        console.info({
            requestId,
            message: 'Signature verification result',
            isValid,
            from
        });

        if (!isValid) {
            console.warn({
                requestId,
                message: 'Invalid signature',
                from,
                nonce
            });
            return res.status(401).json({ error: 'Invalid signature' });
        }

        // Verify sufficient balance
        const balance = await kv.get<string>(`balance:${from}`) || '0';
        console.info({
            requestId,
            message: 'Current balance',
            from,
            balance,
            requestedAmount: amount
        });

        if (BigInt(balance) < BigInt(amount)) {
            console.warn({
                requestId,
                message: 'Insufficient balance',
                from,
                balance,
                requestedAmount: amount
            });
            return res.status(400).json({ error: 'Insufficient balance' });
        }

        // Generate random result
        const result = Math.random() < 0.5 ? 'heads' : 'tails';
        const won = result === choice;

        console.info({
            requestId,
            message: 'Game result',
            from,
            choice,
            result,
            won
        });

        // Update balances
        const newBalance = won
            ? BigInt(balance) + BigInt(amount)
            : BigInt(balance) - BigInt(amount);

        if (won) {
            // Generate server signature for the winning amount
            const winningAmount = BigInt(amount) * 2n;

            // Order principals lexicographically as required by the contract
            const [principal1, principal2] = [CONFIG.OWNER, from].sort();
            const [balance1, balance2] = principal1 === CONFIG.OWNER
                ? [winningAmount, 0n]
                : [0n, winningAmount];

            const hostNonce = await getNonce(CONFIG.OWNER!);
            const serverSignature = await generateBlazeSignature(
                SIP10_TOKEN,
                from,
                winningAmount,
                hostNonce
            );

            console.info({
                requestId,
                message: 'Generated winning signature',
                from,
                winningAmount: winningAmount.toString(),
                nextNonce: nonce + 1,
                signaturePrefix: serverSignature.slice(0, 10),
                principals: {
                    principal1,
                    principal2,
                    balance1: balance1.toString(),
                    balance2: balance2.toString()
                }
            });

            // Add transfer to queue for on-chain settlement
            const transfer = {
                to: from, // Sending back to the player
                amount: winningAmount.toString(),
                nonce: nonce + 1,
                signature: serverSignature
            };

            await kv.lpush(TRANSFER_QUEUE_KEY, JSON.stringify(transfer));

            // Check queue length and log status
            const queueLength = await kv.llen(TRANSFER_QUEUE_KEY);
            console.info({
                requestId,
                message: 'Added winning transfer to settlement queue',
                from,
                queueLength,
                transfer: {
                    ...transfer,
                    signature: transfer.signature.slice(0, 10) + '...'
                }
            });
        }

        await kv.set(`balance:${from}`, newBalance.toString());

        const response = {
            success: true,
            result,
            won,
            newBalance: newBalance.toString(),
            nextNonce: won ? nonce + 1 : nonce
        };

        console.info({
            requestId,
            message: 'Coinflip complete',
            from,
            response
        });

        return res.status(200).json(response);

    } catch (error) {
        console.error({
            requestId,
            message: 'Coinflip error',
            error: error instanceof Error ? {
                name: error.name,
                message: error.message,
                stack: error.stack
            } : error
        });
        return res.status(500).json({ error: 'Internal server error' });
    }
} 