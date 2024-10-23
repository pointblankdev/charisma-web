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
        url: 'https://charisma.rocks/interactions/SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-mine-rc3',
        image: 'https://charisma.rocks/interactions/charisma-mine.png',
        name: 'Charisma Mine',
        subtitle: 'Mint Charisma tokens by wrapping governance tokens.',
        description: [],
        contract: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-mine-rc3',
        category: 'Rewards',
        actions: ['MINT', 'BURN']
    });
}
