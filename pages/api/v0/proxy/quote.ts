import { Dexterity } from 'dexterity-sdk';
import { NextApiRequest, NextApiResponse } from 'next';

type ErrorResponse = {
    error: {
        code: string;
        message: string;
    };
};


export default async function callReadOnly(
    req: NextApiRequest,
    res: NextApiResponse<any | ErrorResponse>
) {
    let response, code = 200;
    try {
        if (req.method === 'POST') {
            const body = req.body;

            // Configure Dexterity with client-provided maxHops if specified
            await Dexterity.configure({ 
                apiKeyRotation: 'loop',
                maxHops: body.maxHops || 3 // Use provided maxHops or default to 3
            });
            
            await Dexterity.discover({ reserves: false });
            
            console.log(`Getting quote with maxHops: ${Dexterity.config.maxHops}`);
            const quote = await Dexterity.getQuote(body.tokenIn, body.tokenOut, body.amount);
            response = quote;
        } else {
            code = 501;
            response = {
                error: {
                    code: 'method_unknown',
                    message: 'This endpoint only responds to POST'
                }
            };
        }
    } catch (error: any) {
        console.error('API Error:', error);
        code = error.response?.status || 500;
        response = {
            error: {
                code: 'internal_error',
                message: error.message || 'An unexpected error occurred'
            }
        };
    }

    return res.status(code).json(response);
}
