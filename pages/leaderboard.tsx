import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import Layout from '@components/layout/layout';
import { getTotalSupply } from '@lib/stacks-api';
import { GetStaticProps } from 'next';
import { getExperienceLeaderboard, getLand, getRewardLeaderboard } from '@lib/db-providers/kv';
import ExperienceLeaderboardTable from '@components/leaderboards/exp-table';
import RewardsLeaderboardTable from '@components/leaderboards/rewards-table';
import { LandsChart } from '@components/leaderboards/lands-chart';
import { TokensDifficultyChart } from '@components/leaderboards/tokens-difficulty-chart';
import { contractFactory } from '@clarigen/core';
import { clarigen } from '@lib/clarigen/client';
import { contracts } from '@lib/clarigen/types';
import { ChartConfig } from '@components/ui/chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs"


export const getStaticProps: GetStaticProps<Props> = async () => {
    const experienceHolders = await getExperienceLeaderboard(0, -1)
    const experienceTotalSupply = await getTotalSupply('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.experience')
    const topRewardedPlayers = await getRewardLeaderboard('SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme000-governance-token::charisma', 0, -1)

    const landsContractId = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.lands';
    const landsContract = contractFactory(contracts.lands as any, landsContractId);
    const uniqueLandTypes: bigint = await clarigen.roOk(landsContract.getLastLandId());
    // loop through all lands

    const chartData = [
    ]

    const chartConfig: ChartConfig = {
        tokens: {
            label: "Total Supply Staked",
        },
    };

    const chartData2 = [
    ]

    const chartConfig2: ChartConfig = {
        score: {
            label: "Tokens Staked / Difficulty",
        },
    };

    for (let i = 1; i <= Number(uniqueLandTypes); i++) {
        const amount = await clarigen.roOk(landsContract.getTotalSupply(i))
        const assetContract: string = await clarigen.ro(landsContract.getLandAssetContract(i))
        if (Number(amount)) {
            const tokenMetadata = await getLand(assetContract)

            chartData.push({ id: tokenMetadata.name, tokens: Number(amount) / tokenMetadata.wraps.totalSupply, fill: `hsl(var(--background))` });
            chartConfig[tokenMetadata.name] = { label: tokenMetadata.name, color: `hsl(var(--secondary))` }

            const landDifficulty: bigint = await clarigen.ro(landsContract.getLandDifficulty(i))
            chartData2.push({ id: tokenMetadata.name, score: Number(amount) / Number(landDifficulty), fill: `hsl(var(--background))` });
            chartConfig2[tokenMetadata.name] = { label: tokenMetadata.name, color: `hsl(var(--secondary))` }
        }
    }

    return {
        props: {
            holders: experienceHolders,
            expTotalSupply: Number(experienceTotalSupply),
            topRewardedPlayers,
            chartData: chartData.sort((a, b) => b.tokens - a.tokens),
            chartConfig,
            chartData2: chartData2.sort((a, b) => b.score - a.score),
            chartConfig2,
        },
        revalidate: 60
    };
};

type Props = {
    holders: any[];
    expTotalSupply: number;
    topRewardedPlayers: any[];
    chartData: any[];
    chartConfig: ChartConfig;
    chartData2: any[];
    chartConfig2: ChartConfig;
};

export default function LeaderboardPage({ holders, expTotalSupply, topRewardedPlayers, chartData, chartConfig, chartData2, chartConfig2 }: Props) {
    const meta = {
        title: 'Charisma | Leaderboard',
        description: META_DESCRIPTION
    };

    return (
        <Page meta={meta} fullViewport>
            <SkipNavContent />
            <Layout>
                <div className="m-2 space-y-6 sm:container sm:mx-auto sm:py-10">
                    <div className='flex justify-between'>
                        <div className="space-y-1">
                            <h2 className="flex items-end text-4xl font-semibold tracking-tight text-secondary">Leaderboards</h2>
                            <p className="flex items-center text-base text-muted-foreground">
                                Top ranked players and teams in the Charisma ecosystem.
                            </p>
                        </div>
                        {/* button placeholder */}
                    </div>
                    <Tabs defaultValue="1" className="">
                        <TabsList>
                            <TabsTrigger value="1">Experience</TabsTrigger>
                            <TabsTrigger value="2">Rewards</TabsTrigger>
                            <TabsTrigger value="3">Staked Tokens by % of Total Supply</TabsTrigger>
                            {/* <TabsTrigger value="4">Staked Tokens Energy Output</TabsTrigger> */}
                        </TabsList>
                        <TabsContent value="1">
                            <ExperienceLeaderboardTable holders={holders} expTotalSupply={expTotalSupply} />
                        </TabsContent>
                        <TabsContent value="2">
                            <RewardsLeaderboardTable holders={holders} topRewardedPlayers={topRewardedPlayers} />
                        </TabsContent>
                        <TabsContent value="3">
                            <LandsChart chartData={chartData} chartConfig={chartConfig} />
                        </TabsContent>
                        {/* <TabsContent value="4">
                            <TokensDifficultyChart chartData={chartData2} chartConfig={chartConfig2} />
                        </TabsContent> */}
                    </Tabs>
                </div>
            </Layout>
        </Page >
    );
}