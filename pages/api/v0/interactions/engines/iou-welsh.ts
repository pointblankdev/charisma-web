import { NextApiRequest, NextApiResponse } from 'next';

type ErrorResponse = {
    error: {
        code: string;
        message: string;
    };
};

export default function MemeEngineAPI(
    req: NextApiRequest,
    res: NextApiResponse<any | ErrorResponse>
) {
    return res.status(200).json({
        url: `https://charisma.rocks/interactions/SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.meme-engine-iou-welsh-rc2`,
        image: `https://charisma.rocks/interactions/engines/iou-welsh.png`,
        name: `Hold-to-Earn Engine (iouWELSH)`,
        subtitle: 'Generate energy by holding Synthetic Welsh tokens.',
        description: [
            "The Synthetic Welsh Hold-to-Earn Engine works by tracking your token balance across time. When you execute the TAP action, the contract calculates your average balance since your last tap. The resulting energy generation accurately reflects the average monetary value of your held balances, with more points sampled during longer periods for greater accuracy.",
            "Several factors influence your energy generation rate. The length of time since your last tap affects sampling density - longer periods use more sample points for better accuracy. Your token balance throughout the period is crucial - consistent holding generates more energy than fluctuating positions. A quality score and incentive multiplier modify your base generation rate, and everything is normalized against circulating supply to maintain economic balance. ",
            "This engine introduces a revolutionary 'stake-less staking' mechanism that rewards token holders without requiring them to lock up their assets. Unlike traditional staking systems, this engine uses integral calculus to calculate rewards based on your token balance over time- as it remains in your wallet. By considering both the amount of tokens held and the duration of holding, the engine can accurately reward long-term holders while maintaining their financial flexibility - your tokens always remain in your wallet and fully liquid.",
        ],
        contract: `SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.meme-engine-iou-welsh-rc2`,
        category: 'Hold-to-Earn',
        actions: ['TAP']
    });
}
