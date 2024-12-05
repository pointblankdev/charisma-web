import { GetStaticProps } from 'next';
import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import Layout from '@components/layout/layout';
import { Card } from '@components/ui/card';
import { useEffect, useState } from 'react';
import useWallet from '@lib/hooks/wallet-balance-provider';
import { motion } from 'framer-motion';
import { PoolsInterface } from '@components/pools/pools-interface';
import PoolsLayout from '@components/pools/layout';
import { DexClient } from '@lib/server/pools/pools.client';
import TokenRegistryClient, { charismaNames } from '@lib/server/registry/registry.client';
import PricesService from '@lib/server/prices/prices-service';
import ConfettiExplosion from 'react-confetti-explosion';
import { delay } from 'lodash';

// Initialize clients
const dexClient = new DexClient();
const registryClient = new TokenRegistryClient();
const service = PricesService.getInstance();

type Props = {
  data: {
    pools: any[];
    tokenPrices: { [key: string]: number };
  };
};

export const getStaticProps: GetStaticProps<Props> = async () => {
  try {
    // Get enhanced token info and prices in parallel
    const [tokenInfo, prices] = await Promise.all([
      registryClient.listAll(),
      service.getAllTokenPrices()
    ]);

    // build pools data
    const tokenList = tokenInfo.tokens;
    const lpTokens = tokenList.filter((t: any) => charismaNames.includes(t.lpInfo?.dex));
    const pools = [];
    for (const lpToken of lpTokens) {
      let poolData = null;
      try {
        poolData = await dexClient.getPool(lpToken.lpInfo.token0, lpToken.lpInfo.token1);
      } catch (error) {
        console.warn('Error fetching pool data:', error);
      }
      const token0 = tokenList.find((t: any) => t.contractId === lpToken.lpInfo.token0) || {};
      const token1 = tokenList.find((t: any) => t.contractId === lpToken.lpInfo.token1) || {};
      pools.push({ ...lpToken, token0: token0, token1: token1, poolData });
    }

    const communityPools = pools
      // filter for community pools with zero protocol fee
      .filter((p: any) => p.poolData.protocolFee.numerator === 0);

    return {
      props: {
        data: {
          pools: communityPools,
          tokenPrices: prices
        }
      },
      revalidate: 60
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return {
      props: {
        data: {
          pools: [],
          tokenPrices: {}
        }
      },
      revalidate: 10
    };
  }
};

export default function CommunityPoolsPage({ data }: Props) {
  const meta = {
    title: 'Charisma | Community Pools',
    description: 'View and manage community liquidity pools on the Charisma DEX',
    image: 'https://charisma.rocks/pools-screenshot.png'
  };

  const { wallet } = useWallet();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (wallet) setLoading(false);
  }, [wallet]);

  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        {!loading && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
            className="sm:max-w-[2400px] sm:mx-auto sm:pb-10"
          >
            <PoolsLayout>
              <PoolsInterface data={data} title={'Community Pools'} />
            </PoolsLayout>
          </motion.div>
        )}
      </Layout>
    </Page>
  );
}
