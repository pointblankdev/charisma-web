import { kv } from '@vercel/kv';
import { NextApiRequest, NextApiResponse } from 'next';
import {
    generateWallet,
    generateSecretKey,
    getStxAddress,
    generateNewAccount,
    restoreWalletAccounts
} from '@stacks/wallet-sdk';
import { z } from 'zod';
import { encryptSeedPhrase, decryptSeedPhrase } from '@lib/wallets/wallets.service';
import { STACKS_MAINNET } from '@stacks/network';

// Define schema for Wallet data
const WalletSchema = z.object({
    ownerAddress: z.string(),
    encryptedSeed: z.any(),
    created: z.number(),
    // Store minimal account metadata using account index as key
    accounts: z.record(
        z.number(),
        z.object({
            schedule: z.enum(['hourly', 'daily', 'weekly']),
            interactions: z.array(z.string()),
            active: z.boolean(),
            archived: z.boolean(),
            archivedAt: z.number().optional(),
            created: z.number(),
            lastRun: z.number().optional()
        })
    )
});
type Wallet = z.infer<typeof WalletSchema>;

const OWNER_WALLET_PREFIX = 'owner-wallet:';

async function getOrCreateWallet(ownerAddress: string) {
    const walletKey = `${OWNER_WALLET_PREFIX}${ownerAddress}`;
    const existingWallet = (await kv.hgetall(walletKey)) as Wallet;

    if (existingWallet) {
        const decryptedSeed = await decryptSeedPhrase(existingWallet.encryptedSeed);

        const baseWallet = await generateWallet({
            secretKey: decryptedSeed,
            password: String(process.env.WALLET_PASSWORD)
        });

        // Restore accounts from Gaia
        const restoredWallet = await restoreWalletAccounts({
            wallet: baseWallet,
            gaiaHubUrl: 'https://hub.blockstack.org',
            network: STACKS_MAINNET
        });

        return restoredWallet;
    } else {
        // Create new wallet
        const secretKey = generateSecretKey();
        const wallet = await generateWallet({
            secretKey,
            password: String(process.env.WALLET_PASSWORD)
        });

        const encryptedSeed = await encryptSeedPhrase(secretKey);

        // Store minimal wallet info
        const walletData: Wallet = {
            ownerAddress,
            encryptedSeed,
            created: Date.now(),
            accounts: {}
        };

        await kv.hset(walletKey, walletData);
        return wallet;
    }
}

async function handleCreateAccount(req: NextApiRequest, res: NextApiResponse) {
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
                error: 'Account limit reached'
            });
        }

        // Generate new account
        const newAccount = generateNewAccount(wallet) as any;

        const accountAddress = getStxAddress({
            account: newAccount.accounts[1],
            network: STACKS_MAINNET
        });

        res.status(201).json({
            ownerAddress,
            accountAddress,
            schedule,
            interactions,
            active: false
        });
    } catch (error) {
        console.error('Error creating account:', error);
        res.status(500).json({ error: 'Failed to create account' });
    }
}

async function handleGetAccounts(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { address, includeArchived } = req.query;

        if (!address || typeof address !== 'string') {
            return res.status(400).json({ error: 'Address is required' });
        }

        const walletKey = `${OWNER_WALLET_PREFIX}${address}`;
        const wallet = (await kv.hgetall(walletKey)) as Wallet;

        if (!wallet) {
            return res.status(200).json([]);
        }

        let decryptedSeed, encryptedSeed;
        if ((wallet as any).encryptedSeed) {
            // Decrypt seed and regenerate wallet
            decryptedSeed = await decryptSeedPhrase(wallet.encryptedSeed);
            encryptedSeed = wallet.encryptedSeed;
        } else {
            decryptedSeed = (wallet as any).secretKey;
            encryptedSeed = await encryptSeedPhrase((wallet as any).secretKey);
        }

        // Regenerate wallet to get addresses
        const regeneratedWallet = await generateWallet({
            secretKey: decryptedSeed,
            password: String(process.env.WALLET_PASSWORD)
        });

        // Restore accounts from Gaia
        const restoredWallet = await restoreWalletAccounts({
            wallet: regeneratedWallet,
            gaiaHubUrl: 'https://hub.blockstack.org',
            network: STACKS_MAINNET
        });

        // Map wallet accounts to account data
        const accounts = restoredWallet.accounts.map(account => {
            return {
                accountAddress: getStxAddress({
                    account: restoredWallet.accounts[account.index],
                    network: STACKS_MAINNET
                }),
                ...wallet.accounts[account.index]
            };
        });

        // Store minimal wallet info
        const walletData: Wallet = {
            ownerAddress: address,
            encryptedSeed,
            created: Date.now(),
            accounts
        };

        // remove up data we don't want to store
        await kv.hdel(walletKey, 'secretKey', 'accountIndex');

        await kv.hset(walletKey, walletData);

        // Filter archived if needed
        const filteredAccounts =
            includeArchived === 'true' ? accounts : accounts.filter(c => !c.archived);

        res.status(200).json(filteredAccounts);
    } catch (error) {
        console.error('Error fetching accounts:', error);
        res.status(500).json({ error: 'Failed to fetch accounts' });
    }
}

async function handleArchiveAccount(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { ownerAddress, index } = req.query;

        if (!ownerAddress || !index || typeof ownerAddress !== 'string' || typeof index !== 'string') {
            return res.status(400).json({ error: 'Owner address and index are required' });
        }

        const walletKey = `${OWNER_WALLET_PREFIX}${ownerAddress}`;
        const wallet = (await kv.hgetall(walletKey)) as Wallet;

        if (!wallet?.accounts[parseInt(index)]) {
            return res.status(404).json({ error: 'Account not found' });
        }

        // Update account metadata
        wallet.accounts[parseInt(index)] = {
            ...wallet.accounts[parseInt(index)],
            active: false,
            archived: true,
            archivedAt: Date.now()
        };

        await kv.hset(walletKey, wallet);

        res.status(200).json({ message: 'Account archived successfully' });
    } catch (error) {
        console.error('Error archiving account:', error);
        res.status(500).json({ error: 'Failed to archive account' });
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case 'POST':
            return handleCreateAccount(req, res);
        case 'GET':
            return handleGetAccounts(req, res);
        case 'DELETE':
            return handleArchiveAccount(req, res);
        default:
            res.setHeader('Allow', ['POST', 'GET', 'DELETE']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}