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
        url: "https://charisma.rocks/interactions/SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charismatic-corgi-rc4",
        image: "https://charisma.rocks/interactions/charismatic-corgi.png",
        name: "Charismatic Corgi",
        subtitle: "Arbitrage swap yielding WELSH and CHA tokens.",
        description: [
            "Earn profit auto-trading WELSH between different decentralized exchanges. The Charismatic Corgi offers two distinct trading paths: FORWARD (CHA→STX→WELSH→CHA) and REVERSE (CHA→WELSH→STX→CHA). Each attempt requires energy expenditure through the Fatigue interaction, adding a strategic cost to arbitrage hunting. When executed, the contract automatically attempts a series of swaps along the chosen path, checking for profitability at each step. If profitable, the trade executes automatically and a small portion (1 STX worth) of profits is reinvested into CHA tokens to support the ecosystem.",
            "Before using this interaction, it's important to understand several key points. The trade amount is fixed and configurable by administrators (up to 100 CHA) to ensure market stability. The contract tracks profits per user and maintains a total profit counter, but success depends entirely on market conditions at the time of execution. While failed attempts only cost energy, successful trades automatically execute when profit opportunities exist. This creates an interesting risk-reward dynamic where users must weigh energy costs against potential profits, all while contributing to market efficiency.",
            "The interaction introduces an automated arbitrage mechanism that leverages price discrepancies across the WELSH CORGI token markets. Unlike traditional arbitrage bots that require complex setups and monitoring, this interaction provides a simple interface for users to attempt profitable trades through predefined paths. It represents a gamified approach to arbitrage where users spend energy for the chance to profit from market inefficiencies, while simultaneously maintaining healthy token circulation between markets.",
        ],
        contract: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charismatic-corgi-rc4",
        category: "Rewards",
        actions: ["FORWARD", "REVERSE"],
        postConditionMode: PostConditionMode.Allow,
        postConditions: [
            // {}
        ]
    });
}
