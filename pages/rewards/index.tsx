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
          Under Development...
        </div>
      </Layout>
    </Page>
  );
}
