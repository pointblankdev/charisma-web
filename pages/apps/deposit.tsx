
import { SkipNavContent } from '@reach/skip-nav';

import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import Layout from '@components/layout';
import { Card } from '@components/ui/card';
import MicroDeposit from '@components/micro-deposit';

export default function App() {
  const meta = {
    title: 'Charisma | Micro Deposit',
    description: META_DESCRIPTION,
  };

  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <div className="m-2 sm:container sm:mx-auto sm:py-10 md:max-w-2xl">

          <Card className='p-0 overflow-hidden bg-black text-primary-foreground border-accent-foreground rounded-xl'>
            <div className='m-2'>
              <div className='space-y-1'>
                <MicroDeposit />
              </div>
            </div>
          </Card>
        </div>
      </Layout>
    </Page>
  );
}
