
import { GetStaticProps } from 'next';
import { SkipNavContent } from '@reach/skip-nav';

import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import Layout from '@components/layout';
import { cn } from '@lib/utils';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@components/ui/card"
import velarApi from '@lib/velar-api';

type Props = {
  data: any;
};

export const getStaticProps: GetStaticProps<Props> = async () => {

  const tickers = await velarApi.tickers()
  const tokens = await velarApi.tokens()

  const data = { tickers, tokens }

  return {
    props: {
      data: data
    },
    revalidate: 6000
  };
};

export default function ArbitrageInsights({ data }: Props) {

  const meta = {
    title: 'Charisma | Arbitrage Insights',
    description: META_DESCRIPTION,
    image: '/liquid-charisma.png'
  };

  console.log(data.tickers)

  console.log(data.tickers.filter((t: any) => t.ticker_id.includes('wrapped-charisma')
    || t.ticker_id.includes('liquid-staked-charisma')
    || t.ticker_id.includes('liquid-staked-welsh-v2')
    || t.ticker_id.includes('charismatic-corgi')
  ))

  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <div className="m-2 sm:container sm:mx-auto sm:py-10">
          <div className='grid gap-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'>
            <Card className={cn('bg-black text-primary-foreground border-accent-foreground p-0 flex relative overflow-hidden rounded-md group/card')}>
              <div className="relative flex flex-col items-start text-md p-4 space-y-4 shadow-md rounded-lg">
                <h3 className="font-bold text-lg">Arbitrage Insights</h3>
              </div>
            </Card>
          </div>
        </div>
      </Layout>
    </Page>
  );
}