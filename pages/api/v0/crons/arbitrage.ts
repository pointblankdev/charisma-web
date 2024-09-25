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
        // const transactions = await runAll()
        // response.transactions = transactions

    } catch (error: any) {
        await Logger.error({ 'arbitage-error': error?.message });
    }

    return res.status(200).json(response);
}
