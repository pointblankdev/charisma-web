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
        url: 'https://charisma.rocks/interactions/SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.the-troll-toll-rc1',
        image: '/interactions/the-troll-toll.png',
        name: 'The Troll Toll',
        subtitle: 'You gotta pay the troll toll.',
        description: [
            "The mechanism works by requiring each explorer to pay a small, increasing toll to the previous payer. Starting at 1 DMG and growing by 0.1 DMG with each use, these payments establish valid post-conditions for any subsequent chance-based interactions. When you pay the toll, you're not just satisfying the troll - you're creating a technical framework that allows for secure, randomized token transfers in following interactions. The increasing cost and payment to previous explorers creates a circular flow that maintains these conditions while preventing consecutive actions by the same address.",
            "Beyond its core technical purpose, the Troll Toll provides several beneficial side effects to the protocol. It serves as a natural spam prevention mechanism through its increasing cost, creates an organic rotation of participants through its previous-explorer payment system, and maintains a consistent token circulation. Most importantly, it enables complex gameplay mechanics involving chance and token transfers to operate securely within blockchain constraints.",
            "The Troll Toll solves a critical technical challenge in blockchain systems: setting up proper post-conditions for transactions involving chance-based token transfers. In DeFi protocols, when an interaction might result in tokens moving between accounts (like in a heist or battle), the transaction needs to pre-establish all possible token movements or it will fail. The Troll Toll creates a minimal circular payment between participants, allowing us to set up greater-than-or-equal post-conditions that will validate regardless of the random outcome.",
        ],
        contract: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.the-troll-toll-rc1',
        category: 'Utility',
        actions: ['PAY'],
        postConditionMode: PostConditionMode.Allow,
        postConditions: [
            // { principal: 'last-payer', token: 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme000-governance-token::charisma' }
        ]
    });
}
