import { NextApiRequest, NextApiResponse } from 'next';
import { Dexterity } from 'dexterity-sdk';
import { makeContractCall, PostConditionMode, principalCV, stringAsciiCV } from '@stacks/transactions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    res.writeHead(200, {
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    });

    // Verify the request is from Vercel Cron
    // if (process.env.VERCEL_ENV === 'production' && !req.headers['x-vercel-cron']) {
    //     return res.status(401).json({ error: 'Unauthorized' });
    // }

    try {
        console.log('Dexterity Farmer Cron Job Running')
        // Initialize Dexterity SDK
        await Dexterity.configure({
            apiKeyRotation: 'loop',
            parallelRequests: 10,
            maxHops: 3
        })

        const tx = await makeContractCall({
            senderKey: Dexterity.config.privateKey,
            network: Dexterity.config.network,
            contractAddress: 'SPGYCP878RYFVT03ZT8TWGPKNYTSQB1578VVXHGE',
            contractName: 'farmer',
            functionName: 'execute-1-swap',
            functionArgs: [],
            postConditionMode: PostConditionMode.Allow,
            postConditions: [],
        });

        console.log('Farmer transaction executed:', tx)

        return res.status(200).json({ tx });

    } catch (error) {
        console.error('Farmer execution error:', error);

        return res.status(500).json({
            status: 'error',
            error: 'Internal server error during task'
        });
    }
} 