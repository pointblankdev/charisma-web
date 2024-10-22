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
    console.log(symbol);
    return res.status(200).json({
        url: `https://charisma.rocks/interactions/meme-engine-${symbol}`,
        image: `https://charisma.rocks/interactions/meme-engine-${symbol}.png`,
        name: `Meme Engine (${symbol.toUpperCase()})`,
        description: 'Generate energy by holding memecoins.',
        contract: `SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.meme-engine-${symbol}-rc4`,
        category: 'Engines',
        actions: ['TAP']
    });
}
