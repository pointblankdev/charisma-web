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
        url: "https://charisma.rocks/interactions/SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.fate-randomizer-rc1",
        image: "https://charisma.rocks/interactions/fate-randomizer.png",
        name: "Fate Randomizer",
        subtitle: "Each roll shapes the fate of adventurers.",
        contract: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.fate-randomizer-rc1",
        category: "Utility",
        actions: ["CF", "D4", "D6", "D8", "D10", "D12", "D20", "D100"]
    });
}