import { getQuestById } from '@lib/db-providers/dato';
import { NextApiRequest, NextApiResponse } from 'next';

type ErrorResponse = {
    error: {
        code: string;
        message: string;
    };
};

export default async function getQuest(
    req: NextApiRequest,
    res: NextApiResponse<any | ErrorResponse>
) {

    let response, code = 200
    try {
        response = await getQuestById(req.query.id as string)
        console.log(response)
    } catch (error: any) {
        console.error(error)
        response = new Object(error)
        code = error.response.status
    }

    return res.status(code).json(response);
}
