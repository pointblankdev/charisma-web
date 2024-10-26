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
            "This system requires spending energy (default 10 units) for key protocol actions like exploration and transfers. Energy naturally regenerates over time and is managed through the Dungeon Keeper's energy system.",
            "Your energy balance must be sufficient to perform actions, or they will fail. While administrators can adjust energy costs, this core mechanic remains constant. Energy exists separately from token balances and staking, adding strategic depth to gameplay.",
            "Energy serves as both a rate-limiting mechanism and core gameplay element in Charisma's GameFi ecosystem. Unlike traditional DeFi protocols that use fees or time-locks, this system requires strategic management of limited energy reserves to participate effectively."
        ],
        contract: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.fatigue-rc7',
        category: 'Utility',
        actions: ['BURN'],
        postConditions: [
            { principal: 'tx-sender', contractId: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.energy', tokenName: 'energy' }
        ]
    });
}
