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
      PricesService.getAllTokenPrices()
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

  const [isExploding1, setIsExploding1] = useState(false);
  const [isExploding2, setIsExploding2] = useState(false);

  useEffect(() => {
    if (wallet) setLoading(false);
  }, [wallet]);

  // useEffect(() => {
  //   setIsExploding1(true);
  //   delay(() => setIsExploding2(true), 300);
  //   delay(() => setIsExploding1(false), 2800);
  //   delay(() => setIsExploding2(false), 2800);
  // }, []);

  const isAuthorized = wallet.experience.balance >= 0 || wallet.redPilled;

  return (
    <Page meta={meta} fullViewport>
      <div className="flex justify-around w-full">
        {isExploding1 ? (
          <ConfettiExplosion zIndex={50} particleCount={201} duration={2800} />
        ) : (
          <div />
        )}
        {isExploding2 ? (
          <ConfettiExplosion zIndex={50} particleCount={199} duration={2500} />
        ) : (
          <div />
        )}
      </div>
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
              {isAuthorized || true ? (
                <PoolsInterface data={data} title={'Community Pools'} />
              ) : (
                <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
                  <Card className="w-full max-w-lg p-6 text-center">
                    <h2 className="mb-4 text-2xl font-bold">Access Restricted</h2>
                    <p className="mb-4">To view and manage liquidity pools, you need either:</p>
                    <ul className="mb-4 text-left list-disc list-inside">
                      <li
                        className={
                          wallet.experience.balance >= 1000 ? 'text-green-500' : 'text-red-500'
                        }
                      >
                        At least 1000 Experience {wallet.experience.balance >= 1000 ? '✓' : '✗'}
                      </li>
                      <li className={wallet.redPilled ? 'text-green-500' : 'text-red-500'}>
                        Own the Red Pill NFT {wallet.redPilled ? '✓' : '✗'}
                      </li>
                    </ul>
                    <p className="text-sm text-muted-foreground">
                      Continue using Charisma to gain more experience and unlock this feature.
                    </p>
                  </Card>
                </div>
              )}
            </PoolsLayout>
          </motion.div>
        )}
      </Layout>
    </Page>
  );
}
