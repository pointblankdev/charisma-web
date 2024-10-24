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
        url: 'https://charisma.rocks/interactions/SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-mine-rc3',
        image: 'https://charisma.rocks/interactions/charisma-mine.png',
        name: 'Charisma Mining',
        subtitle: 'Mint Charisma tokens by wrapping governance tokens.',
        description: [
            "Charisma Mining is a critical function: converting GameFi-oriented DMG tokens into DeFi-focused CHA tokens through a token wrapping process. This distinction is crucial - while DMG tokens serve as the volatile gameplay currency subject to various protocol mechanics that can transfer them between wallets, CHA tokens represent your protected DeFi position. By wrapping DMG into CHA, you're effectively moving tokens from the dynamic GameFi environment where they can be won or lost through gameplay, into a secure DeFi position where they're protected from gameplay mechanics and can be used for traditional DeFi activities. This creates a compelling risk-reward dynamic where success in the GameFi side can be secured through strategic wrapping.",
            "The interaction supports two primary operations: MINT, which wraps governance tokens into CHA tokens, and BURN, which unwraps CHA back into governance tokens. Both operations require spending energy and are governed by liquidity flow limits. The process is automated once initiated - the contract checks your energy levels, verifies your eligibility (including red pill status), and executes the wrap/unwrap operation. Importantly, only one wrapping operation can occur per block - if multiple users attempt to wrap tokens in the same block, only one will succeed while others will need to try again in subsequent blocks. While these tokens serve different purposes, they remain deeply interconnected - your achievements in the GameFi realm can earn bonuses for your DeFi activities, and your DeFi positions can unlock new opportunities in gameplay.",
            "Several important factors influence the success of these operations. The maximum amount of tokens that can be minted or burned is determined by the protocol's liquidity flow limits, which adapt to market conditions. You must be 'red-pilled' (having acquired the Red Pill NFT) to participate. The block-based wrapping limitation means you may need to attempt operations multiple times during periods of high activity - each attempt will fail gracefully if another user has already wrapped in that block, but will still consume energy. Therefore, it's important to verify both your eligibility and current market conditions before attempting operations, and be prepared to retry on subsequent blocks if necessary."
        ],
        contract: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-mine-rc3',
        category: 'Rewards',
        actions: ['MINT', 'BURN'],
        postConditionMode: PostConditionMode.Deny,
        postConditions: [
            { principal: 'tx-sender', contractId: 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme000-governance-token', tokenName: 'charisma' }
        ]
    });
}
