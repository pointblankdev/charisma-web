
import { SkipNavContent } from '@reach/skip-nav';

import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import Layout from '@components/layout';
import ClaimFaucetButton from '@components/faucet/claim';
import Image from 'next/image';
import { StacksMainnet } from "@stacks/network";
import { callReadOnlyFunction } from '@stacks/transactions';
import { blocksApi } from '@lib/stacks-api';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@components/ui/tooltip"
import { Info } from 'lucide-react';
import { GetStaticProps } from 'next';
import tokenfaucet2 from '@public/token-faucet-2.png'
import { Card } from '@components/ui/card';
import { clamp } from 'framer-motion';
import Leaderboard from '@components/leaderboard.tsx/table';


export default function Faucet() {
    const meta = {
        title: 'Charisma | Profile',
        description: META_DESCRIPTION
    };

    return (
        <Page meta={meta} fullViewport>
            <SkipNavContent />
            <Layout>
                <div className="m-2 sm:container sm:mx-auto sm:py-10 md:max-w-5xl">

                    <Leaderboard />
                </div>
            </Layout>
        </Page >
    );
}