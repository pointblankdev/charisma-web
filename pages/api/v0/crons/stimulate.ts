import Logger from '@lib/logger';
import { tryCallContractPublicFunction } from '@lib/stacks-api';
import { principalCV, uintCV } from '@stacks/transactions';
import { NextApiRequest, NextApiResponse } from 'next';

type ErrorResponse = {
    error: {
        code: string;
        message: string;
    };
};

export default async function stimulateSwapAPI(
    req: NextApiRequest,
    res: NextApiResponse<any | ErrorResponse>
) {

    const response: any = {}
    try {
        const publicAddress = String(process.env.STACKS_ORACLE_ADDRESS);
        const password = String(process.env.STACKS_ORACLE_PASSWORD);
        const seedPhrase = String(process.env.STACKS_ORACLE_SECRET_KEY);
        const transactions = await tryCallContractPublicFunction({
            password,
            seedPhrase,
            publicAddress,
            contractAddress: 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.univ2-path2',
            functionName: 'do-swap',
            args: [
                uintCV(20000000),
                principalCV('SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.wstx'),
                // principalCV('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-charisma'),
                principalCV('SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token'),
                principalCV('SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.univ2-share-fee-to'),
            ],
            fee: 10000
        })
        response.transactions = transactions

    } catch (error: any) {
        await Logger.error({ 'stim-swap-error': error?.message });
    }

    return res.status(200).json(response);
}
