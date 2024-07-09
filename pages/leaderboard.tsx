import { SkipNavContent } from '@reach/skip-nav';

import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import Layout from '@components/layout';

export default function Faucet() {
  const meta = {
    title: 'Charisma | Profile',
    description: META_DESCRIPTION
  };

  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <div className="m-2 sm:container sm:mx-auto sm:py-10 md:max-w-2xl">
          Under contruction 🚧
        </div>
      </Layout>
    </Page>
  );
}
