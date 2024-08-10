import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import Layout from '@components/layout';

type Props = {
  quests: any[];
};


export default function RewardsIndex({ quests }: Props) {
  const meta = {
    title: 'Charisma | Rewards',
    description: META_DESCRIPTION,
    // image: '/creatures/img/farmers.png'
  };


  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <div className="m-2 space-y-6 sm:container sm:mx-auto sm:py-10">
          <div className='flex justify-between'>
            <div className="space-y-1">
              <h2 className="flex items-end text-4xl font-semibold tracking-tight text-secondary"><>Quests</></h2>
              <p className="flex items-center text-base text-muted-foreground">
                Spend your accumulated Energy on Quests to claim unique token and NFT rewards.
              </p>
            </div>
          </div>
          <div className='grid gap-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
            Coming soon...
          </div>
        </div>
      </Layout>
    </Page>
  );
}
