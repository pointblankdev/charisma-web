import { kv } from '@vercel/kv';
import { generateWallet } from '@stacks/wallet-sdk';
import { decryptMnemonic, encryptMnemonic } from '@stacks/encryption';

const OWNER_WALLET_PREFIX = 'owner-wallet:';

type Wallet = {
    ownerAddress: string;
    encryptedSeed: string;
    accountIndex: number;
    created: number;
};

export const decryptSeedPhrase = (encryptedSeedB64: string) => {
    return decryptMnemonic(
        new Uint8Array(Buffer.from(encryptedSeedB64, 'base64')),
        String(process.env.ENCRYPTION_KEY)
    );
};

export const encryptSeedPhrase = async (seedPhrase: string) => {
    return Buffer.from(
        await encryptMnemonic(seedPhrase, String(process.env.ENCRYPTION_KEY))
    ).toString('base64');
};

export const getStxPrivateKey = async (ownerAddress: string): Promise<string> => {
    const walletKey = `${OWNER_WALLET_PREFIX}${ownerAddress}`;
    const walletData = (await kv.hgetall(walletKey)) as Wallet;

    if (!walletData) {
        throw new Error('Wallet not found');
    }

    const secretKey = await decryptSeedPhrase(walletData.encryptedSeed);
    const wallet = await generateWallet({
        secretKey: secretKey,
        password: String(process.env.ENCRYPTION_KEY)
    });

    return wallet.accounts[0]?.stxPrivateKey || '';
}