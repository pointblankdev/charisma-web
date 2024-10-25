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
        url: 'https://charisma.rocks/interactions/SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-mine-rc4',
        image: 'https://charisma.rocks/interactions/charisma-mine.png',
        name: 'Charisma Mining',
        subtitle: 'Mint Charisma tokens by wrapping governance tokens.',
        description: [
            "Charisma Mining converts volatile GameFi DMG tokens into protected DeFi CHA tokens through wrapping. DMG tokens can be won or lost through gameplay, while CHA tokens provide a secure DeFi position protected from game mechanics. This allows players to secure their GameFi success through strategic wrapping.",
            "Two main operations exist: MINT (wraps DMG to CHA) and BURN (unwraps CHA to DMG). Operations require energy and follow liquidity limits. The automated process checks energy and eligibility before execution. Only one wrap per block is allowed, with failed attempts requiring retry in subsequent blocks. Both ecosystems remain interconnected, with achievements in one benefiting the other.",
            "Operation success depends on liquidity flow limits, Red Pill NFT ownership, and block availability. Failed wrapping attempts during high activity still consume energy, so verify conditions before attempting operations."
        ],
        contract: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-mine-rc4',
        category: 'Rewards',
        actions: ['MINT', 'BURN'],
        postConditionMode: PostConditionMode.Deny,
        postConditions: [
            { principal: 'tx-sender', contractId: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.energy', tokenName: 'energy' },
            { principal: 'tx-sender', contractId: 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme000-governance-token', tokenName: 'charisma' }
        ]
    });
}
