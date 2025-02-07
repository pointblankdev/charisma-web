import { NextApiRequest, NextApiResponse } from 'next';
import { ContractId, Dexterity } from 'dexterity-sdk';

// Use same blacklist as swap page
const blacklist = [
    'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.chdollar',
    'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.dmg-runes',
    'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.uahdmg',
    'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.dmg-lp-token',
    'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.stx-lp-token',
    'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.abtc-dog-vault-wrapper-alex'
] as ContractId[];

export const dynamic = "force-dynamic";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Configure Dexterity SDK
        await Dexterity.configure({
            apiKeyRotation: 'loop',
            parallelRequests: 10
        });

        // Get prices and discover vaults in parallel
        const [vaults] = await Promise.all([
            Dexterity.discover({ serialize: true, blacklist }) as Promise<any>
        ]);

        // Get all tokens
        const tokens = Dexterity.getTokens();
        return res.status(200).json({
            success: true,
            data: {
                vaults,
                tokens
            }
        });

    } catch (error) {
        console.error('Error fetching vault data:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch vault data'
        });
    }
} 