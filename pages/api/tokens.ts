import { NextApiRequest, NextApiResponse } from 'next';

type ErrorResponse = {
    error: {
        code: string;
        message: string;
    };
};

export default function tokens(
    req: NextApiRequest,
    res: NextApiResponse<any | ErrorResponse>
) {
    if (req.method !== 'GET') {
        return res.status(501).json({
            error: {
                code: 'method_unknown',
                message: 'This endpoint only responds to GET'
            }
        });
    }



    // console.log(swelshv2.value)


    return res.status(200).json({
        statusCode: 200,
        data: [

        ]
    });
}
