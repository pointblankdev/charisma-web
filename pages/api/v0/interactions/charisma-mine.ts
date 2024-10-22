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
        url: 'https://charisma.rocks/interactions/charisma-mine',
        image: 'https://charisma.rocks/interactions/charisma-mine.png',
        name: 'Charisma Mine',
        description: 'To the red-pilled, go the spoils.',
        contract: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-mine-rc2',
        category: 'Rewards',
    });
}
