import { getGlobalState } from '@lib/db-providers/kv';
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
        const id = req.query.id as string
        if (req.method === 'GET') {
            response = await getGlobalState(`lands:${id}`)
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
