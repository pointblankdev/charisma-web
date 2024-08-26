import { runAll } from '@lib/arbitrage';
import Logger from '@lib/logger';
import { NextApiRequest, NextApiResponse } from 'next';

type ErrorResponse = {
    error: {
        code: string;
        message: string;
    };
};

export default async function arbitrage(
    req: NextApiRequest,
    res: NextApiResponse<any | ErrorResponse>
) {

    const response: any = {}
    try {
        Logger.oracle("Arbitrage Oracle is running")
        const transactions = await runAll()
        console.log(transactions)
        response.transactions = transactions

    } catch (error: any) {
        console.error(error.message);
    }

    return res.status(200).json(response);
}
