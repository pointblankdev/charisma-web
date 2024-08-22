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
import velarApi from '@lib/velar-api';
import { LandsTVLChart } from '@components/leaderboards/lands-tvl-chart';


export const getStaticProps: GetStaticProps<Props> = async () => {
    const experienceHolders = await getExperienceLeaderboard(0, -1)
    const experienceTotalSupply = await getTotalSupply('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.experience')
    const topRewardedPlayers = await getRewardLeaderboard('SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme000-governance-token::charisma', 0, -1)

    const landsContractId = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.lands';
    const landsContract = contractFactory(contracts.lands as any, landsContractId);
    const uniqueLandTypes: bigint = await clarigen.roOk(landsContract.getLastLandId());

    const chartData0 = [
    ]

    const chartConfig0: ChartConfig = {
        tokens: {
            label: "Stake-to-Earn TVL",
        },
    };


    const chartData1 = [
    ]

    const chartConfig1: ChartConfig = {
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

            const [{ price }] = await velarApi.tokens(tokenMetadata.wraps.symbol)

            chartData0.push({ id: tokenMetadata.name, score: Number(amount) / Math.pow(10, 6) * Number(price), fill: `hsl(var(--background))` });
            chartConfig0[tokenMetadata.name] = { label: tokenMetadata.name, color: `hsl(var(--secondary))` }

            chartData1.push({ id: tokenMetadata.name, score: Number(amount) / tokenMetadata.wraps.totalSupply, fill: `hsl(var(--background))` });
            chartConfig1[tokenMetadata.name] = { label: tokenMetadata.name, color: `hsl(var(--secondary))` }

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
            chartData0: chartData0.sort((a, b) => b.score - a.score),
            chartConfig0,
            chartData1: chartData1.sort((a, b) => b.score - a.score),
            chartConfig1,
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
    chartData0: any[];
    chartConfig0: ChartConfig;
    chartData1: any[];
    chartConfig1: ChartConfig;
    chartData2: any[];
    chartConfig2: ChartConfig;
};

export default function LeaderboardPage({ holders, expTotalSupply, topRewardedPlayers, chartData0, chartConfig0, chartData1, chartConfig1, chartData2, chartConfig2 }: Props) {
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
                            <TabsTrigger value="3">Stake-to-Earn TVL</TabsTrigger>
                            <TabsTrigger value="4">Staked Tokens by % of Total Supply</TabsTrigger>
                            <TabsTrigger value="5">Staked Tokens Energy Output</TabsTrigger>
                        </TabsList>
                        <TabsContent value="1">
                            <ExperienceLeaderboardTable holders={holders} expTotalSupply={expTotalSupply} />
                        </TabsContent>
                        <TabsContent value="2">
                            <RewardsLeaderboardTable holders={holders} topRewardedPlayers={topRewardedPlayers} />
                        </TabsContent>
                        <TabsContent value="3">
                            <LandsTVLChart chartData={chartData0} chartConfig={chartConfig0} />
                        </TabsContent>
                        <TabsContent value="4">
                            <LandsChart chartData={chartData1} chartConfig={chartConfig1} />
                        </TabsContent>
                        <TabsContent value="5">
                            <TokensDifficultyChart chartData={chartData2} chartConfig={chartConfig2} />
                        </TabsContent>
                    </Tabs>
                </div>
            </Layout>
        </Page >
    );
}