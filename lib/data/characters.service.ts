import { kv } from '@vercel/kv';
import {
    makeContractCall,
    broadcastTransaction,
    AnchorMode,
    PostConditionMode,
    contractPrincipalCV,
    stringAsciiCV,
    optionalCVOf,
} from '@stacks/transactions';
import { StacksMainnet } from '@stacks/network';
import { decrypt, generateWallet } from '@stacks/wallet-sdk';

const network = new StacksMainnet();

const CHARACTERS_PREFIX = 'characters:';
const OWNER_WALLET_PREFIX = 'owner-wallet:';

type Character = {
    ownerAddress: string;
    characterAddress: string;
    walletIndex: number;
    schedule: 'hourly' | 'daily' | 'weekly';
    interactions: string[];
    created: number;
    lastRun?: number;
    active: boolean;
};

type Wallet = {
    ownerAddress: string;
    secretKey: string;
    accountIndex: number;
    created: number;
};

export class CharacterTransactionService {

    async executeInteraction(characterAddress: string, interaction: string, action: string) {
        const characterKey = `${CHARACTERS_PREFIX}${characterAddress}`;
        const character = await kv.hgetall(characterKey) as Character;

        if (!character) {
            throw new Error('Character not found');
        }

        const walletKey = `${OWNER_WALLET_PREFIX}${character.ownerAddress}`;
        const walletData = await kv.hgetall(walletKey) as Wallet;

        if (!walletData) {
            throw new Error('Wallet not found');
        }

        // Restore wallet and get correct account
        const wallet = await generateWallet({
            secretKey: walletData.secretKey,
            password: String(process.env.ENCRYPTION_KEY),
        });

        const account = wallet.accounts[character.walletIndex];

        // Prepare and execute the transaction
        const txOptions = {
            contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
            contractName: 'dungeon-crawler-rc7',
            functionName: 'interact',
            functionArgs: [
                contractPrincipalCV(interaction.split('.')[0], interaction.split('.')[1]),
                stringAsciiCV(action),
                // Add remaining optionalCV arguments as needed
            ],
            senderKey: account.stxPrivateKey,
            validateWithAbi: true,
            network,
            anchorMode: AnchorMode.Any,
            postConditionMode: PostConditionMode.Allow,
        };

        const transaction = await makeContractCall(txOptions);
        const broadcastResponse = await broadcastTransaction(transaction, network);

        // Update last run timestamp
        await kv.hset(characterKey, { lastRun: Date.now() });

        return broadcastResponse;
    }

    async deleteCharacter(characterAddress: string): Promise<{
        success: boolean;
        message: string;
        error?: string;
    }> {
        try {
            const response = await fetch(`/api/v0/characters?characterAddress=${characterAddress}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete character');
            }

            return {
                success: true,
                message: 'Character deleted successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to delete character',
                // error: error.message
            };
        }
    }

    async deleteAccount(ownerAddress: string): Promise<{
        success: boolean;
        message: string;
        deletedCharacters?: number;
        error?: string;
    }> {
        try {
            const response = await fetch(
                `/api/characters?ownerAddress=${ownerAddress}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to delete account');
            }

            const data = await response.json();
            return {
                success: true,
                message: 'Account deleted successfully',
                deletedCharacters: data.deletedCharacters
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to delete account',
                // error: error.message
            };
        }
    }

}

export class UpdatedCharacterTransactionService {

}