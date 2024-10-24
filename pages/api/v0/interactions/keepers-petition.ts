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
            "Participating in the Keepers' Petition requires spending energy to request Charisma Governance (DMG) tokens. The process is straightforward but introduces GameFi mechanics to DeFi interactions. First, you'll need to make sure you have sufficient energy - this acts as a rate-limiting mechanism and prevents abuse. When you petition, the interaction will verify your energy levels and, if sufficient, burn some energy and transfer DMG tokens to you from the currently configured source address. The contract handles all verification, energy management, and transfer logic automatically. If you lack the required energy, the petition will fail gracefully with a clear message.",
            "While the reward amount and source address are variable by design, the core mechanics remain transparent and predictable. The current reward amount can be checked through the contract's read functions, and the source address is public information. Multiple administrators (Keepers) oversee this system to ensure its sustainable operation within the broader Charisma ecosystem. Successful petitions are guaranteed if you meet the energy requirements - there's no randomness or hidden conditions. This creates a reliable and secure way to earn DMG tokens through active participation in the protocol.",
            "The Keepers' Petition introduces a novel mechanism for token distribution in DeFi, moving beyond traditional liquidity mining or staking rewards. Charisma implements a dynamic reward system where the source of tokens can be configured to serve different economic objectives - from simple treasury distributions to complex redistribution mechanisms. This flexibility allows the protocol to direct token flow strategically in response to market conditions and user behavior. For example, the token source could be set to the treasury for basic rewards, configured to redistribute from large holders, or even set up to create interesting game theory scenarios where trading actions have direct consequences on token flow.",
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