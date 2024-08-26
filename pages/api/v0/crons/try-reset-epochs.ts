import { tryResetEpochs } from '@lib/try-reset-epochs';
import { checkIfEpochIsEnding } from '@lib/stacks-api';
import { NextApiRequest, NextApiResponse } from 'next';
import Logger from '@lib/logger';

type ErrorResponse = {
    error: {
        code: string;
        message: string;
    };
};

export default async function tryResetEpochsApi(
    req: NextApiRequest,
    res: NextApiResponse<any | ErrorResponse>
) {

    Logger.oracle("Hogger Reset is running")
    const response: any = {}
    try {
        const contractJobs = []
        const isEnding = await checkIfEpochIsEnding('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wanted-hogger-v2')

        if (isEnding.canStartNewEpoch) {
            contractJobs.push({
                address: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wanted-hogger-v2",
                function: "start-new-epoch",
                args: []
            })
        }

        let transactions: any = []
        if (contractJobs.length > 0) {
            transactions = await tryResetEpochs(contractJobs)
        }

        console.log(transactions)
        response.transactions = transactions

    } catch (error: any) {
        console.error(error.message);
    }

    return res.status(200).json(response);
}
