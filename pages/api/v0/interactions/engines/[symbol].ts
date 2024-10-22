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
    const symbol = req.query.symbol as string;
    return res.status(200).json({
        url: `https://charisma.rocks/interactions/meme-engine-${symbol}`,
        image: `https://charisma.rocks/interactions/meme-engine-${symbol}.png`,
        name: `Meme Engine (${symbol.toUpperCase()})`,
        description: 'Hold memecoins and tap the engine to collect energy.',
        contract: `SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.meme-engine-${symbol}`,
        category: 'Engines',
        actions: ['TAP']
    });
}
