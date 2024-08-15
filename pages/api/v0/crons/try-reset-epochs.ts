import { tryResetEpochs } from '@lib/try-reset-epochs';
import { checkIfEpochIsEnding } from '@lib/stacks-api';
import { NextApiRequest, NextApiResponse } from 'next';

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

    const response: any = {}
    try {
        const contractJobs = []
        const isEnding = await checkIfEpochIsEnding('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wanted-hogger-v1')

        console.log("Try Reset Epochs: ", isEnding)

        if (isEnding) {
            contractJobs.push({
                address: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wanted-hogger-v1",
                function: "try-reset-epoch",
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
