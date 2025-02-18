import { NextApiRequest, NextApiResponse } from 'next';
import { broadcastTransaction, makeContractCall, PostConditionMode } from '@stacks/transactions';
import { generateWallet } from '@stacks/wallet-sdk';

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
        console.log('Dexterity Power-Farmer Cron Job Running')

        const wallet = await generateWallet({
            secretKey: process.env.SEED_PHRASE_2!,
            password: "",
        });

        const tx = await makeContractCall({
            senderKey: wallet.accounts[0].stxPrivateKey,
            network: 'mainnet',
            contractAddress: 'SPGYCP878RYFVT03ZT8TWGPKNYTSQB1578VVXHGE',
            contractName: 'powerful-farmer',
            functionName: 'execute-both',
            functionArgs: [],
            postConditionMode: PostConditionMode.Allow,
            postConditions: [],
            fee: 1100,
        });

        console.log('Farmer transaction created:', tx)

        const broadcastTx = await broadcastTransaction({ transaction: tx });

        return res.status(200).json({ tx: broadcastTx });

    } catch (error) {
        console.error('Farmer execution error:', error);

        return res.status(500).json({
            status: 'error',
            error: 'Internal server error during task'
        });
    }
} 