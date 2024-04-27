import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import Layout from '@components/layout';

export default function Stake({ }: Props) {

  const meta = {
    title: 'Charisma | Staking',
    description: META_DESCRIPTION,
  };

  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <div className="m-2 text-2xl text-center sm:container sm:mx-auto sm:py-10 md:max-w-2xl">

          Coming Soon!
        </div>
      </Layout>
    </Page>
  );
}

type Props = {
  data: any;
};