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
        url: "https://charisma.rocks/interactions/charismatic-corgi",
        image: "https://charisma.rocks/interactions/charismatic-corgi.png",
        name: "Charismatic Corgi",
        description: "Arbitrage swap yielding WELSH and CHA tokens.",
        contract: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charismatic-corgi-rc1",
        category: "Rewards",
        actions: ["FORWARD", "REVERSE"]
    });
}
