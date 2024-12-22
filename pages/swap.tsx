import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import Layout from '@components/layout/layout';
import { GetStaticProps } from 'next';
import { SwapInterface } from '@components/swap/swap-interface';
import PricesService from '@lib/server/prices/prices-service';
import { Dexterity, LPToken, Token } from 'dexterity-sdk';

export const getStaticProps: GetStaticProps<any> = async () => {
  const service = PricesService.getInstance();

  const prices = await service.getAllTokenPrices();
  const pools = await Dexterity.discoverPools();
  const tokens = Dexterity.getTokens();

  return {
    props: {
      prices,
      tokens: tokens,
      pools: pools
    },
    revalidate: 60
  };
};

export default function SwapPage({
  prices,
  tokens,
  pools
}: {
  prices: any;
  tokens: Token[];
  pools: LPToken[];
}) {
  const meta = {
    title: 'Charisma | Swap',
    description: 'Swap tokens on the Charisma DEX',
    image: 'https://charisma.rocks/swap-screenshot.png'
  };

  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <div className="sm:container sm:mx-auto sm:pb-10 md:max-w-5xl">
          <SwapInterface prices={prices} tokens={tokens} pools={pools} />
        </div>
      </Layout>
    </Page>
  );
}
