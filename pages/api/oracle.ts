import { NextApiRequest, NextApiResponse } from 'next';
import {
    makeContractCall,
    broadcastTransaction,
    AnchorMode,
    boolCV,
    uintCV,
    principalCV,
    TxBroadcastResult,
} from "@stacks/transactions";
import { StacksMainnet } from "@stacks/network";
import { generateWallet } from '@stacks/wallet-sdk';

const network = new StacksMainnet();

type ErrorResponse = {
    error: {
        code: number;
        message: string;
    };
};

interface QuestOracleApiRequest extends NextApiRequest {
    body: {
        address: string;
        questId: number;
        complete: boolean;
    }
}

export default async function oracle(
    req: QuestOracleApiRequest,
    res: NextApiResponse<TxBroadcastResult | ErrorResponse>
) {
    let response;

    if (req.method !== 'POST') {
        response = { error: { code: 501, message: 'This endpoint only responds to POST' } }
        return res.status(501).json(response);
    }

    try {
        const address = req.body.address
        const questId = req.body.questId
        const complete = req.body.complete

        if (!address || !questId || !complete) throw new Error('Missing required parameters')

        const password = String(process.env.STACKS_ORACLE_PASSWORD);
        const secretKey = String(process.env.STACKS_ORACLE_SECRET_KEY)

        const wallet = await generateWallet({
            secretKey,
            password,
        });

        const account = wallet.accounts[0];

        const txOptions = {
            contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
            contractName: 'dme007-quest-completion-oracle',
            functionName: 'set-complete',
            functionArgs: [principalCV(address), uintCV(questId), boolCV(complete)],
            senderKey: account.stxPrivateKey,
            validateWithAbi: true,
            network,
            postConditions: [],
            fee: 200, // set a tx fee if you don't want the builder to estimate
            anchorMode: AnchorMode.Any,
        };

        const transaction = await makeContractCall(txOptions);

        const broadcastResponse = await broadcastTransaction(transaction, network);

        response = broadcastResponse

    } catch (error: any) {
        console.error(error.message)
        response = { error: { code: 422, message: error.message } }
        return res.status(422).json(response);
    }

    return res.status(200).json(response);
}