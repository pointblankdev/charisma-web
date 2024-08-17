import { getMob } from '@lib/db-providers/kv';
import { tryCallContractPublicFunction } from '@lib/stacks-api';
import { principalCV, uintCV } from '@stacks/transactions';
import { NextApiRequest, NextApiResponse } from 'next';

type ErrorResponse = {
    error: {
        code: string;
        message: string;
    };
};

const players: any[] = [
    {
        seedPhrase: process.env.STACKS_ORACLE_SECRET_KEY_0,
        publicAddress: process.env.STACKS_ORACLE_ADDRESS_0,
    },
    {
        seedPhrase: process.env.STACKS_ORACLE_SECRET_KEY_1,
        publicAddress: process.env.STACKS_ORACLE_ADDRESS_1,
    },
    {
        seedPhrase: process.env.STACKS_ORACLE_SECRET_KEY_2,
        publicAddress: process.env.STACKS_ORACLE_ADDRESS_2,
    },
    {
        seedPhrase: process.env.STACKS_ORACLE_SECRET_KEY_3,
        publicAddress: process.env.STACKS_ORACLE_ADDRESS_3,
    },
    {
        seedPhrase: process.env.STACKS_ORACLE_SECRET_KEY_4,
        publicAddress: process.env.STACKS_ORACLE_ADDRESS_4,
    },
    {
        seedPhrase: process.env.STACKS_ORACLE_SECRET_KEY_5,
        publicAddress: process.env.STACKS_ORACLE_ADDRESS_5,
    },
    {
        seedPhrase: process.env.STACKS_ORACLE_SECRET_KEY_6,
        publicAddress: process.env.STACKS_ORACLE_ADDRESS_6,
    },
    {
        seedPhrase: process.env.STACKS_ORACLE_SECRET_KEY_7,
        publicAddress: process.env.STACKS_ORACLE_ADDRESS_7,
    },
    {
        seedPhrase: process.env.STACKS_ORACLE_SECRET_KEY_8,
        publicAddress: process.env.STACKS_ORACLE_ADDRESS_8,
    },
    {
        seedPhrase: process.env.STACKS_ORACLE_SECRET_KEY_9,
        publicAddress: process.env.STACKS_ORACLE_ADDRESS_9,
    },
]


export default async function playersApi(
    req: NextApiRequest,
    res: NextApiResponse<any | ErrorResponse>
) {


    const mob = await getMob('hogger');

    const response: any = {}
    try {
        const transactions: any = []
        for (const player of players) {
            try {
                let targetContractAddress;

                // if hogger is alive, fight him
                if (mob.health > 0) {
                    targetContractAddress = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wanted-hogger-v2'
                }

                // otherwise, try to farm experience
                else {
                    targetContractAddress = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.adventure-v0'
                }

                const transaction = await tryCallContractPublicFunction({
                    seedPhrase: player.seedPhrase,
                    publicAddress: player.publicAddress,
                    password: process.env.STACKS_ORACLE_PASSWORD,
                    contractAddress: targetContractAddress,
                    functionName: 'tap',
                    args: [uintCV(1), principalCV('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.land-helper-v1')],
                })
                transactions.push(transaction)
            } catch (error) {
                console.error(error)
            }
        }
        console.log(transactions)
        response.transactions = transactions

    } catch (error: any) {
        console.error(error.message);
    }

    return res.status(200).json(response);
}
