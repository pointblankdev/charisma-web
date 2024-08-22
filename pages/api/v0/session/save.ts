import { sessionOptions } from '@components/stacks-session/session';
import { withIronSessionApiRoute } from 'iron-session/next';
import { NextApiRequest, NextApiResponse } from 'next';

async function saveSessionRoute(req: NextApiRequest, res: NextApiResponse) {

    const { dehydratedState } = await req.body;

    if (!dehydratedState)
        return res.status(500).json({
            message: 'No dehydratedState found is request body',
        });

    try {
        console.log({ dehydratedState })
        req.session.dehydratedState = dehydratedState;
        await req.session.save();
        res.json({ dehydratedState });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
}

export default withIronSessionApiRoute(saveSessionRoute, sessionOptions);