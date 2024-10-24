import { PostConditionMode } from '@stacks/transactions';
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
        url: "https://charisma.rocks/interactions/SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.keepers-petition-rc4",
        image: "https://charisma.rocks/interactions/keepers-petition.png",
        name: "Keepers' Petition",
        subtitle: "Petition the Dungeon Keeper for token rewards.",
        description: [
            "Participating in the Keepers' Petition requires spending energy to request Charisma Governance (DMG) tokens. When you petition, the interaction will verify your energy levels and, if sufficient, burn some energy and transfer DMG tokens to you from the currently configured source address. If you lack the required energy, the petition will fail gracefully with a clear message.",
            "While the reward amount and source address are variable by design, Multiple administrators (Keepers) oversee this system to ensure its sustainable operation within the broader Charisma ecosystem. Successful petitions are guaranteed if you meet the energy requirements - there's no randomness or hidden conditions.",
            "The Keepers' Petition introduces a novel mechanism for token distribution in DeFi, moving beyond traditional liquidity mining or staking rewards. The source of tokens can be configured to serve different economic objectives - from simple treasury distributions to complex redistribution mechanisms.",
        ],
        contract: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.keepers-petition-rc4",
        category: "Rewards",
        actions: ["PETITION"],
        postConditionMode: PostConditionMode.Deny,
        postConditions: [
            { principal: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token', contractId: 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme000-governance-token', tokenName: 'charisma' }
        ]
    });
}