import { tryCallContractPublicFunction } from '@lib/stacks-api';
import { NextApiRequest, NextApiResponse } from 'next';

type ErrorResponse = {
    error: {
        code: string;
        message: string;
    };
};

const players: any[] = [
    // {
    //     seedPhrase: process.env.STACKS_ORACLE_SECRET_KEY_0,
    //     publicAddress: process.env.STACKS_ORACLE_ADDRESS_0,
    //     password: process.env.STACKS_ORACLE_PASSWORD
    // }
]


export default async function arbitrage(
    req: NextApiRequest,
    res: NextApiResponse<any | ErrorResponse>
) {

    const response: any = {}
    try {
        const transactions: any = []
        for (const player of players) {
            const transaction = await tryCallContractPublicFunction({
                seedPhrase: player.seedPhrase,
                publicAddress: player.publicAddress,
                password: player.password,
                contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.adventure-v0',
                functionName: 'tap',
                args: []
            })
            transactions.push(transaction)
        }
        console.log(transactions)
        response.transactions = transactions

    } catch (error: any) {
        console.error(error.message);
    }

    return res.status(200).json(response);
}
