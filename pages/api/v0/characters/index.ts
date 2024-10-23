import { kv } from '@vercel/kv';
import { NextApiRequest, NextApiResponse } from 'next';
import {
    generateWallet,
    generateSecretKey,
    getStxAddress,
    generateNewAccount,
} from '@stacks/wallet-sdk';
import { z } from 'zod';
import { TransactionVersion } from '@stacks/transactions';

// Define schema for Wallet data
const WalletSchema = z.object({
    ownerAddress: z.string(),
    secretKey: z.string(),
    created: z.number(),
    // Store minimal character metadata using account index as key
    characters: z.record(z.number(), z.object({
        schedule: z.enum(['hourly', 'daily', 'weekly']),
        interactions: z.array(z.string()),
        active: z.boolean(),
        archived: z.boolean(),
        archivedAt: z.number().optional(),
        created: z.number(),
        lastRun: z.number().optional(),
    }))
});
type Wallet = z.infer<typeof WalletSchema>;

const OWNER_WALLET_PREFIX = 'owner-wallet:';

async function getOrCreateWallet(ownerAddress: string) {
    const walletKey = `${OWNER_WALLET_PREFIX}${ownerAddress}`;
    const existingWallet = await kv.hgetall(walletKey) as Wallet;

    if (existingWallet) {
        // Just return the existing wallet data
        return await generateWallet({
            secretKey: existingWallet.secretKey,
            password: String(process.env.ENCRYPTION_KEY),
        });
    } else {
        // Create new wallet
        const secretKey = generateSecretKey();
        const wallet = await generateWallet({
            secretKey,
            password: String(process.env.ENCRYPTION_KEY),
        });

        // Store minimal wallet info
        const walletData: Wallet = {
            ownerAddress,
            secretKey,
            created: Date.now(),
            characters: {}
        };

        await kv.hset(walletKey, walletData);
        return wallet;
    }
}

async function handleCreateCharacter(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const { ownerAddress, schedule, interactions } = req.body;

        if (!ownerAddress || !schedule || !interactions) {
            return res.status(400).json({
                error: 'Missing required fields'
            });
        }

        const wallet = await getOrCreateWallet(ownerAddress);

        // if wallet already has an account, exit and dont make another
        if (wallet.accounts.length >= 1) {
            return res.status(400).json({
                error: 'Character limit reached'
            });
        }

        // Generate new account for this character
        const newAccount = generateNewAccount(wallet) as any;

        const characterAddress = getStxAddress({ account: newAccount.accounts[1], transactionVersion: TransactionVersion.Mainnet });

        res.status(201).json({
            ownerAddress,
            characterAddress,
            schedule,
            interactions,
            active: false
        });
    } catch (error) {
        console.error('Error creating character:', error);
        res.status(500).json({ error: 'Failed to create character' });
    }
}

async function handleGetCharacters(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const { address, includeArchived } = req.query;

        if (!address || typeof address !== 'string') {
            return res.status(400).json({ error: 'Address is required' });
        }

        const walletKey = `${OWNER_WALLET_PREFIX}${address}`;
        const wallet = await kv.hgetall(walletKey) as Wallet;


        if (!wallet) {
            return res.status(200).json([]);
        }

        // Regenerate wallet to get addresses
        const regeneratedWallet = await generateWallet({
            secretKey: wallet.secretKey,
            password: String(process.env.ENCRYPTION_KEY),
        });

        // Map wallet accounts to character data
        const characters = Object.entries(wallet.characters).map(([index, metadata]) => {
            const accountIndex = parseInt(index);
            return {
                characterAddress: getStxAddress({
                    account: regeneratedWallet.accounts[accountIndex],
                    transactionVersion: TransactionVersion.Mainnet
                }),
                ...metadata,
                walletIndex: accountIndex
            };
        });

        // Filter archived if needed
        const filteredCharacters = includeArchived === 'true'
            ? characters
            : characters.filter(c => !c.archived);

        res.status(200).json(filteredCharacters);
    } catch (error) {
        console.error('Error fetching characters:', error);
        res.status(500).json({ error: 'Failed to fetch characters' });
    }
}

async function handleArchiveCharacter(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const { ownerAddress, index } = req.query;

        if (!ownerAddress || !index || typeof ownerAddress !== 'string' || typeof index !== 'string') {
            return res.status(400).json({ error: 'Owner address and index are required' });
        }

        const walletKey = `${OWNER_WALLET_PREFIX}${ownerAddress}`;
        const wallet = await kv.hgetall(walletKey) as Wallet;

        if (!wallet?.characters[parseInt(index)]) {
            return res.status(404).json({ error: 'Character not found' });
        }

        // Update character metadata
        wallet.characters[parseInt(index)] = {
            ...wallet.characters[parseInt(index)],
            active: false,
            archived: true,
            archivedAt: Date.now()
        };

        await kv.hset(walletKey, wallet);

        res.status(200).json({ message: 'Character archived successfully' });
    } catch (error) {
        console.error('Error archiving character:', error);
        res.status(500).json({ error: 'Failed to archive character' });
    }
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    switch (req.method) {
        case 'POST':
            return handleCreateCharacter(req, res);
        case 'GET':
            return handleGetCharacters(req, res);
        case 'DELETE':
            return handleArchiveCharacter(req, res);
        default:
            res.setHeader('Allow', ['POST', 'GET', 'DELETE']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}