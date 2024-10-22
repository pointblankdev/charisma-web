import { NextApiRequest, NextApiResponse } from 'next';

type ErrorResponse = {
    error: {
        code: string;
        message: string;
    };
};

export const interactionIds = [
    'fatigue',
    'charisma-mine',
    'the-troll-toll',
    'fate-randomizer',
    'charismatic-corgi',
    'meme-engine-cha'
]

export default function InteractionsAPI(
    req: NextApiRequest,
    res: NextApiResponse<any | ErrorResponse>
) {
    return res.status(200).json(interactionIds);
}
