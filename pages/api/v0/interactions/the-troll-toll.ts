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
        url: 'https://charisma.rocks/interactions/SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.the-troll-toll-rc1',
        image: '/interactions/the-troll-toll.png',
        name: 'The Troll Toll',
        subtitle: 'You gotta pay the troll toll.',
        description: [],
        contract: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.the-troll-toll-rc1',
        category: 'Utility',
        actions: ['PAY']
    });
}
