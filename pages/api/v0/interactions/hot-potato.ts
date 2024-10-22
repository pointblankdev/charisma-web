import { NextApiRequest, NextApiResponse } from 'next';

type ErrorResponse = {
    error: {
        code: string;
        message: string;
    };
};

export default function InteractionAPI(
    req: NextApiRequest,
    res: NextApiResponse<any | ErrorResponse>
) {
    return res.status(200).json({
        url: 'https://charisma.rocks/interactions/hot-potato',
        image: 'https://charisma.rocks/interactions/hot-potato.png',
        name: 'Hot Potato',
        description: 'Pass the burning potato to prove your worth.',
        contract: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.hot-potato-rc2',
        category: 'Utility',
        actions: ['PASS']
    });
}
