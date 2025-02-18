import type { NextApiRequest, NextApiResponse } from 'next';
import { generateBlazeSignature, getBlazeBalance, getBlazeContractForToken, setBlazeBalance, setBlazeNonce, verifyBlazeSignature } from '@lib/blaze/helpers';
import { getNonce } from '@components/blaze/action-helpers';
import { Subnet } from 'blaze-sdk';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const requestId = crypto.randomUUID();
    const gameHostAddress = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS';
    const subnet = new Subnet('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.blaze-test-2');
    console.info({
        requestId,
        message: 'Received coinflip request',
        gameHostAddress,
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
            token,
            amount,
            choice,
            nonce,
        }: {
            signature: string;
            from: string;
            token: string;
            amount: number;
            choice: string;
            nonce: number;
        } = req.body;

        const contract = getBlazeContractForToken(token);

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
            contract,
            signature,
            from,
            gameHostAddress,
            amount,
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

        // Increment nonce
        await setBlazeNonce(contract, from, nonce + 1);

        // Verify sufficient balance
        const balance = await getBlazeBalance(contract, from);
        console.info({
            requestId,
            message: 'Current balance',
            from,
            balance,
            requestedAmount: amount
        });

        if (balance < amount) {
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
            ? balance + amount
            : balance - amount;

        if (won) {
            // Generate server signature for the winning amount
            const winningAmount = amount * 2;

            // Order principals lexicographically as required by the contract
            const [principal1, principal2] = [gameHostAddress, from].sort();
            const [balance1, balance2] = principal1 === gameHostAddress
                ? [winningAmount, 0]
                : [0, winningAmount];


            const hostNonce = await getNonce(gameHostAddress, contract);
            const serverSignature = await generateBlazeSignature(
                token,
                from,
                winningAmount,
                hostNonce
            );

            console.info({
                requestId,
                message: 'Generated winning signature',
                from,
                winningAmount,
                nextNonce: nonce + 1,
                signaturePrefix: serverSignature.slice(0, 10),
                principals: {
                    principal1,
                    principal2,
                    balance1,
                    balance2
                }
            });

            // Add transfer to queue for on-chain settlement
            const transfer = {
                signer: gameHostAddress,
                to: from, // Sending back to the player
                amount: winningAmount,
                nonce: nonce + 1,
                signature: serverSignature
            };

            subnet.addTransferToQueue(transfer);

            // Check queue length and log status
            const queueLength = subnet.queue.length;
            console.info({
                requestId,
                message: 'Added winning transfer to settlement queue',
                from,
                queueLength,
                transfer: {
                    ...transfer,
                    signature: `${transfer.signature.slice(0, 10)}...`
                }
            });
        }

        await setBlazeBalance(contract, from, newBalance);

        const response = {
            success: true,
            result,
            won,
            newBalance,
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