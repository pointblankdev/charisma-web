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
            "The Troll Toll is a clever solution to several DeFi challenges, implemented through the lens of fantasy gaming. At its core, it's a token circulation mechanism that ensures proper setup for potential token transfers during exploration while simultaneously preventing consecutive actions by the same user. By requiring each explorer to pay a toll that increases over time and goes to the previous explorer, it creates an organic rotation of participants while maintaining the technical requirements for secure token operations.",
            "The mechanism works through a simple but effective process. When you pay the toll, you're actually sending DMG tokens to the previous explorer who paid before you. The toll starts at 1 DMG and increases by 0.1 DMG with each explorer who passes through, reflecting the troll's growing appetite. This creates an interesting dynamic where early exploration is incentivized (lower toll costs), but later explorers might find more valuable opportunities to offset the higher toll cost. The system ensures you can't pay yourself by preventing consecutive explorations from the same address.",
            "While this interaction appears simple on the surface - just pay the toll to pass - it's important to understand its broader implications. The increasing toll serves as a natural spam prevention mechanism, the payment to previous explorers creates circular token flow, and the entire system ensures proper setup for any token transfers that might occur during exploration. You'll need sufficient DMG tokens to cover the current toll amount, which can be checked through the contract's read functions. It's worth noting that while the toll increases steadily, protocol administrators can reset it to the initial amount if it grows too high, ensuring long-term sustainability of the system."
        ],
        contract: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.the-troll-toll-rc1',
        category: 'Utility',
        actions: ['PAY']
    });
}
