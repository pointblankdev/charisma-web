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
        url: 'https://charisma.rocks/interactions/SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.fatigue-rc7',
        image: 'https://charisma.rocks/interactions/fatigue.png',
        name: 'Fatigue',
        subtitle: 'Without energy- nothing is possible.',
        description: [
            "The system works by requiring a variable amount of energy (default 10 units) to be burned when this interaction is called. When you execute the BURN action, the contract attempts to exhaust the specified amount of energy from your balance. This energy consumption is necessary for many protocol actions, particularly those involving exploration or token transfers. Energy regenerates over time, creating natural cycles of activity and rest within the ecosystem. The contract integrates with the Dungeon Keeper's energy management system to ensure secure and consistent energy tracking.",
            "While the energy burn amount can be adjusted by protocol administrators to balance gameplay mechanics, the fundamental process remains constant - you need sufficient energy to perform actions, and that energy will be consumed upon use. If you lack sufficient energy, the interaction will fail gracefully with a clear message. It's important to note that energy is a separate concept from token balances or staking - it's a gameplay mechanic that adds depth to economic interactions without directly involving asset transfers. Understanding and managing your energy becomes a key strategy for effective participation in the Charisma ecosystem.",
            "Fatigue introduces an essential rate-limiting mechanism to Charisma's GameFi ecosystem through the concept of energy. Unlike traditional DeFi protocols that might use token fees or time-locks to prevent abuse, Charisma implements a more nuanced approach where actions consume energy. This creates a strategic layer where users must carefully consider when and how to spend their limited energy reserves. Energy serves as both a spam prevention mechanism and a core gameplay element, fundamentally shaping how users interact with the protocol.",
        ],
        contract: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.fatigue-rc7',
        category: 'Utility',
        actions: ['BURN'],
        postConditions: [
            { principal: 'tx-sender', contractId: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.energy', tokenName: 'energy' }
        ]
    });
}
