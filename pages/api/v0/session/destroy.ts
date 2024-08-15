import { sessionOptions } from '@components/stacks-session/session';
import { withIronSessionApiRoute } from 'iron-session/next';
import { NextApiRequest, NextApiResponse } from 'next';

function destorySessionRoute(req: NextApiRequest, res: NextApiResponse) {
    req.session.destroy();
    res.json(null);
}

export default withIronSessionApiRoute(destorySessionRoute, sessionOptions);