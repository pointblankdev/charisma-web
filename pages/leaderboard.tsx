import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import Layout from '@components/layout/layout';
import { getTotalSupply } from '@lib/stacks-api';
import { GetStaticProps } from 'next';
import { getExperienceLeaderboard } from '@lib/db-providers/kv';
import ExperienceLeaderboardTable from '@components/leaderboards/exp-table';
import RewardsLeaderboardTable from '@components/leaderboards/rewards-table';

export const getStaticProps: GetStaticProps<Props> = async () => {
    const experienceHolders = await getExperienceLeaderboard(0, -1)
    const experienceTotalSupply = await getTotalSupply('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.experience')

    return {
        props: {
            holders: experienceHolders,
            expTotalSupply: Number(experienceTotalSupply),
        },
        revalidate: 60
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
                <div className="m-2 space-y-6 sm:container sm:mx-auto sm:py-10">
                    <div className='flex justify-between'>
                        <div className="space-y-1">
                            <h2 className="flex items-end text-4xl font-semibold tracking-tight text-secondary">Leaderboard</h2>
                            <p className="flex items-center text-base text-muted-foreground">
                                Top ranked players and teams in the Charisma ecosystem.
                            </p>
                        </div>
                        {/* button placeholder */}
                    </div>
                    <ExperienceLeaderboardTable holders={holders} expTotalSupply={expTotalSupply} />
                    {/* <RewardsLeaderboardTable holders={holders} /> */}
                </div>
            </Layout>
        </Page >
    );
}