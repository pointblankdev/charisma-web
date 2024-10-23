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
        description: [
            "The interaction provides a complete set of classic polyhedral dice options (D4, D6, D8, D10, D12, D20, D100) plus a coin flip mechanism. Each roll is processed through Charisma's VRF randomizer, ensuring fair and cryptographically secure results. When you execute a roll, the contract not only returns the numerical result but also provides thematic narrative feedback. For instance, a D20 roll might describe a 'critical success' on a natural 20 or a 'challenging number' on lower results, adding flavor to the mechanical outcome.",
            "Understanding the nuances of each die type is important for effective use. The D20 offers the classic range familiar to RPG players, with special messages for critical successes (20) and failures (1). The D100 provides fine-grained probability distributions for complex mechanics, while simpler options like the coin flip (CF) and D6 serve more basic randomization needs. All results are deterministic once generated and can be verified on-chain, combining the transparency expected in DeFi with the excitement of rolling dice in traditional gaming.",
            "The Fate Randomizer brings verifiable randomness to Charisma through a VRF-powered dice rolling system styled after classic tabletop RPGs. While many DeFi protocols rely on price oracles or block hashes for randomization, Charisma implements a more engaging approach with narrative flourishes. This system provides the foundation for various protocol mechanics that require fair and verifiable random number generation, from basic coin flips to complex percentile rolls, all while maintaining the thematic elements of a fantasy adventure.",
        ],
        contract: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.fate-randomizer-rc1",
        category: "Utility",
        actions: ["CF", "D4", "D6", "D8", "D10", "D12", "D20", "D100"]
    });
}