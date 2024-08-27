import * as Iron from 'iron-session';
import { cleanDehydratedState } from '@micro-stacks/client';
import { sessionOptions } from './session';

import type { NextPageContext } from 'next';
import type { GetServerSidePropsContext } from 'next/types';
import Logger from '@lib/logger';

export const getIronSession = (req: NextPageContext['req'], res: NextPageContext['res']) => {
    return Iron.getIronSession(req as any, res as any, sessionOptions);
};

export const getDehydratedStateFromSession = async (ctx: GetServerSidePropsContext) => {
    const { dehydratedState } = await getIronSession(ctx.req, ctx.res);
    return dehydratedState ? cleanDehydratedState(dehydratedState) : null;
};

export function parseAddress(str: string) {
    try {
        // Parse the string into a JavaScript object
        const parsedData = JSON.parse(str);

        // Navigate through the nested structure to find the address
        const addressObj = parsedData[1][1][0];

        // Return the address
        return addressObj.address;
    } catch (error: any) {
        Logger.error({ 'Parse Address Error': error?.message });
        return ''
    }
}