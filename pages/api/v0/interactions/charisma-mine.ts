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
        url: 'https://charisma.rocks/interactions/SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-mine-rc3',
        image: 'https://charisma.rocks/interactions/charisma-mine.png',
        name: 'Charisma Mine',
        subtitle: 'Mint Charisma tokens by wrapping governance tokens.',
        description: [
            "The interaction supports two primary operations: MINT, which wraps governance tokens into CHA tokens, and BURN, which unwraps CHA back into governance tokens. Both operations require energy expenditure through the Fatigue system and are governed by liquidity flow limits to maintain market stability. The process is automated once initiated - the contract checks your energy levels, verifies your eligibility (including red pill status), and executes the wrap/unwrap operation according to current protocol parameters.",
            "Several important factors influence the success of these operations. The maximum amount of tokens that can be minted or burned is determined by the protocol's liquidity flow limits, which adapt to market conditions. You must be 'red-pilled' (having completed specific protocol requirements) to participate, and operations may be temporarily locked during periods of high market volatility. While the energy cost remains constant, the actual token flow amounts can vary based on protocol conditions. Failed attempts still consume energy, so it's important to verify your eligibility and current market conditions before attempting operations.",
            "The Charisma Mine represents a novel approach to token minting and burning mechanics. Unlike traditional DeFi protocols where tokens are minted through staking or farming, Charisma implements a dynamic system where governance tokens can be transformed into CHA tokens through an energy-gated process. This creates an interesting economic loop where participation requires both capital (governance tokens) and active engagement (energy expenditure), helping to ensure that token creation and destruction align with actual protocol usage.",
        ],
        contract: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-mine-rc3',
        category: 'Rewards',
        actions: ['MINT', 'BURN']
    });
}
