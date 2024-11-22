import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import Layout from '@components/layout/layout';
import { GetStaticProps } from 'next';
import { SwapInterface } from '@components/swap/swap-interface';
import PricesService from '@lib/server/prices/prices-service';
import { DexClient } from '@lib/server/pools/pools.client';
import TokenRegistryClient, { charismaNames } from '@lib/server/registry/registry.client';

// Initialize client
const dexClient = new DexClient();
const registryClient = new TokenRegistryClient();

export const getStaticProps: GetStaticProps<any> = async () => {
  // Get enhanced token info and prices in parallel
  const [tokenInfo, prices] = await Promise.all([
    registryClient.listAll(),
    PricesService.getAllTokenPrices()
  ]);

  // build pools data
  const tokenList = tokenInfo.tokens;
  const lpTokens = tokenList.filter((t: any) => charismaNames.includes(t.lpInfo?.dex));
  const pools = [];
  for (const lpToken of lpTokens) {
    try {
      const poolData = await dexClient.getPool(lpToken.lpInfo.token0, lpToken.lpInfo.token1);
      const token0 = tokenList.find((t: any) => t.contractId === lpToken.lpInfo.token0) || {};
      const token1 = tokenList.find((t: any) => t.contractId === lpToken.lpInfo.token1) || {};
      pools.push({ ...lpToken, token0: token0, token1: token1, poolData });
    } catch (error) {
      console.warn(error);
    }
  }

  // filter out specific tokens
  const allowedTokens = tokenList
    .filter((t: any) => t.audit)
    .filter((t: any) => t.metadata?.symbol !== 'EXP')
    .filter((t: any) => t.metadata?.symbol)
    .filter(
      (t: any) =>
        t.audit?.fungibleTokens?.[0]?.tokenIdentifier ||
        t.metadata.symbol === 'STX' ||
        t.metadata.symbol === 'wSTX'
    );

  return {
    props: {
      data: {
        prices,
        tokens: allowedTokens,
        pools
      }
    },
    revalidate: 60
  };
};

export default function SwapPage({ data }: any) {
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
          <SwapInterface data={data} />
        </div>
      </Layout>
    </Page>
  );
}
