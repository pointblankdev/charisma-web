import { getLandsBalance, getPlayers } from '@lib/db-providers/kv';
import _ from 'lodash';
import { NextApiRequest, NextApiResponse } from 'next';

type ErrorResponse = {
    error: {
        code: string;
        message: string;
    };
};

export default async function landsApi(
    req: NextApiRequest,
    res: NextApiResponse<any | ErrorResponse>
) {

    let response, code = 200
    try {
        const ca = req.query.ca as string
        if (req.method === 'GET') {
            const players = await getPlayers()
            const balances = []
            for (const player of players) {
                const balance: any = await getLandsBalance(ca, player)
                if (balance > 0) balances.push({ address: player, balance: balance })
            }
            response = _.sortBy(balances, 'balance').reverse()
        } else {
            code = 501
            response = new Object({
                code: 'method_unknown',
                message: 'This endpoint only responds to GET'
            })
        }
    } catch (error: any) {
        // console.error(error)
        response = new Object(error)
        code = error.response.status
    }

    return res.status(code).json(response);
}
