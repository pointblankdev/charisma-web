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
        url: 'https://charisma.rocks/interactions/fatigue',
        image: 'https://charisma.rocks/interactions/fatigue.png',
        name: 'Fatigue',
        description: 'With energy anything is possible- and without it nothing is.',
        contract: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.fatigue-rc3',
        category: 'Utility',
    });
}
