import { runAll } from '@lib/arbitrage';
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

    try {
        console.log('ARBITRAGE ENDPOINT HIT');
        const response = await runAll()
        console.log(response)

    } catch (error: any) {
        console.error(error.message);
    }

    return res.status(200).json({});
}
