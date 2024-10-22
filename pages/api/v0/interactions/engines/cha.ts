import { NextApiRequest, NextApiResponse } from 'next';

type ErrorResponse = {
    error: {
        code: string;
        message: string;
    };
};

export default function MemeEngineAPI(
    req: NextApiRequest,
    res: NextApiResponse<any | ErrorResponse>
) {
    return res.status(200).json({
        url: `https://charisma.rocks/interactions/meme-engine-cha`,
        image: `https://charisma.rocks/interactions/engines/cha.png`,
        name: `Meme Engine (CHA)`,
        description: 'Generate energy by holding Charisma tokens.',
        contract: `SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.meme-engine-cha-rc4`,
        category: 'Engines',
        actions: ['TAP']
    });
}
