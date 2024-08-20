import { getNftMetadata, setNftMetadata } from '@lib/db-providers/kv';
import { NextApiRequest, NextApiResponse } from 'next';

type ErrorResponse = {
    error: {
        code: string;
        message: string;
    };
};

export default async function emblemsApi(
    req: NextApiRequest,
    res: NextApiResponse<any | ErrorResponse>
) {

    let response, code = 200
    try {
        let id = req.query.id as string
        const ca = req.query.ca as string
        if (req.method === 'POST') {
            console.log(req.body)
            response = await setNftMetadata(ca, id, req.body)
        } else if (req.method === 'GET') {
            // if id ends with .json, remove it
            if (id.endsWith('.json')) { id = id.slice(0, -5) }
            response = await getNftMetadata(ca, id)
        } else {
            code = 501
            response = new Object({
                code: 'method_unknown',
                message: 'This endpoint only responds to GET and POST'
            })
        }
    } catch (error: any) {
        console.error(error)
        response = new Object(error)
        code = error.response.status
    }

    return res.status(code).json(response);
}
