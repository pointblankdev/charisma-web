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
        url: "https://charisma.rocks/interactions/welsh-arbitrage",
        image: "https://charisma.rocks/interactions/welsh-arbitrage.png",
        name: "Welsh Arbitrage",
        description: "Search the dungeon for profitable paths through the pools.",
        contract: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.welsh-arbitrage-rc1",
        category: "Reward",
        actions: ["FORWARD", "REVERSE"]
    });
}
