import type { NextApiRequest, NextApiResponse } from 'next';

export function withErrorHandler(
    handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
    return async (req: NextApiRequest, res: NextApiResponse) => {
        try {
            await handler(req, res);
        } catch (error: any) {
            console.error('API Error:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    };
}

export function validateChannelRequest(
    req: NextApiRequest,
    res: NextApiResponse,
    next: () => Promise<void>
) {
    const {
        'principal-1': principal1,
        'principal-2': principal2,
        'balance-1': balance1,
        'balance-2': balance2,
        nonce,
        signature
    } = req.body;

    if (!principal1 || !principal2) {
        return res.status(400).json({ error: 'Missing principal addresses' });
    }

    if (!balance1 || !balance2) {
        return res.status(400).json({ error: 'Missing balance values' });
    }

    if (!nonce) {
        return res.status(400).json({ error: 'Missing nonce' });
    }

    if (!signature) {
        return res.status(400).json({ error: 'Missing signature' });
    }

    return next();
}