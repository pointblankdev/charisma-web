
import { SkipNavContent } from '@reach/skip-nav';

import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import Layout from '@components/layout';
import ClaimFaucetButton from '@components/faucet/claim';
import Image from 'next/image';
import { StacksMainnet } from "@stacks/network";
import { callReadOnlyFunction } from '@stacks/transactions';
import { blocksApi, getTotalSupply } from '@lib/stacks-api';
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
import { getExperienceHolders } from '@lib/user-api';

export const getStaticProps: GetStaticProps<Props> = async () => {
    const experienceHolders = await getExperienceHolders()
    // const charismaTotalSupply = await getTotalSupply('SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme000-governance-token')
    const experienceTotalSupply = await getTotalSupply('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.experience')

    // console.log(experienceTotalSupply)

    return {
        props: {
            holders: experienceHolders,
            expTotalSupply: Number(experienceTotalSupply),
        },
        revalidate: 60000
    };
};

type Props = {
    holders: any[];
    expTotalSupply: number;
};
export default function LeaderboardPage({ holders, expTotalSupply }: Props) {
    const meta = {
        title: 'Charisma | Leaderboard',
        description: META_DESCRIPTION
    };

    return (
        <Page meta={meta} fullViewport>
            <SkipNavContent />
            <Layout>
                <div className="m-2 sm:container sm:mx-auto sm:py-10 md:max-w-5xl">
                    <Leaderboard holders={holders} expTotalSupply={expTotalSupply} />
                </div>
            </Layout>
        </Page >
    );
}