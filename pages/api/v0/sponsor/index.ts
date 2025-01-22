import { NextApiRequest, NextApiResponse } from 'next';
import {
    sponsorTransaction,
    broadcastTransaction,
    deserializeTransaction
} from '@stacks/transactions';
import { Dexterity } from 'dexterity-sdk';

type SponsorTransactionRequest = {
    serializedTx: string;
    nonce: number;
};

type SuccessResponse = {
    txid: string;
};

type ErrorResponse = {
    error: {
        code: string;
        message: string;
    };
};

export default async function sponsorAndBroadcast(
    req: NextApiRequest,
    res: NextApiResponse<SuccessResponse | ErrorResponse>
) {
    let response;
    let code = 200;

    try {
        if (req.method !== 'POST') {
            return res.status(501).json({
                error: {
                    code: 'method_not_allowed',
                    message: 'This endpoint only accepts POST requests'
                }
            });
        }

        const body = req.body as SponsorTransactionRequest;

        // Validate required fields
        if (!body.serializedTx) {
            return res.status(400).json({
                error: {
                    code: 'missing_parameters',
                    message: 'Required parameters missing: serializedTx is required'
                }
            });
        }

        await Dexterity.configure()

        // Deserialize the transaction
        const deserializedTx = deserializeTransaction(body.serializedTx);

        // Prepare sponsor options
        const sponsorOptions = {
            transaction: deserializedTx,
            sponsorPrivateKey: Dexterity.config.privateKey,
            fee: 1000,
        };

        // Sponsor the transaction
        const sponsoredTx = await sponsorTransaction(sponsorOptions);

        // Broadcast the sponsored transaction
        const broadcastResponse = await broadcastTransaction({
            transaction: sponsoredTx,
            network: Dexterity.config.network
        });

        response = { txid: broadcastResponse.txid };

    } catch (error: any) {
        console.error('Sponsorship Error:', error);

        code = error.response?.status || 500;
        response = {
            error: {
                code: error.code || 'internal_error',
                message: error.message || 'An unexpected error occurred while processing the transaction'
            }
        };
    }

    return res.status(code).json(response);
}