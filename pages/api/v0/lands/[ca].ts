import { addLand, getLand, setLand } from '@lib/db-providers/kv';
import { NextApiRequest, NextApiResponse } from 'next';

type ErrorResponse = {
    error: {
        code: string;
        message: string;
    };
};

export default async function getMetadata(
    req: NextApiRequest,
    res: NextApiResponse<any | ErrorResponse>
) {

    let response, code = 200
    try {
        const ca = req.query.ca as string
        if (req.method === 'POST') {
            console.log(req.body)
            response = await setLand(ca, req.body)
            await addLand(ca)
        } else if (req.method === 'GET') {
            response = await getLand(ca)
        } else {
            code = 501
            response = new Object({
                code: 'method_unknown',
                message: 'This endpoint only responds to GET'
            })
        }
    } catch (error: any) {
        console.error(error)
        response = new Object(error)
        code = error.response.status
    }

    return res.status(code).json(response);
}
