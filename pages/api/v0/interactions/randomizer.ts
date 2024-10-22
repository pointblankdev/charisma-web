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
        url: "https://charisma.rocks/interactions/randomizer",
        image: "https://charisma.rocks/interactions/randomizer.png",
        name: "Fate Randomizer",
        description: "Each roll shapes the fate of adventurers.",
        contract: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.randomizer-rc1",
        category: "Utility"
    });
}
