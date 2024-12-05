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
import TokenRegistryClient from '@lib/server/registry/registry.client';
import PricesService from '@lib/server/prices/prices-service';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@components/ui/alert';
import { AlertTriangle, CrosshairIcon, RocketIcon, Sparkles } from 'lucide-react';
import { buildDexterityPools } from '@lib/dexterity';

// Initialize clients
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

    // get dexterity contracts
    const dexterityPools = await buildDexterityPools(tokenInfo.tokens);

    return {
      props: {
        data: {
          pools: dexterityPools,
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

export default function DexterityPoolsPage({ data }: Props) {
  const meta = {
    title: 'Charisma | Dexterity Pools',
    description: 'View and manage self-listed liquidity pools on the Charisma DEX',
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
              <DexterityDisclaimer />
              <PoolsInterface data={data} title={'Dexterity Pools'} />
              <div className="justify-center w-full p-1 m-1 text-center">
                <Link className="w-full text-sm text-center" href="/launchpad">
                  Want to create your own memecoin pool and join the fun?
                </Link>
              </div>
            </PoolsLayout>
          </motion.div>
        )}
      </Layout>
    </Page>
  );
}

const DexterityDisclaimer = () => {
  return (
    <div className="mt-4 mb-2">
      <div className="grid grid-cols-2 gap-4 py-4 overflow-hidden sm:px-6 sm:rounded-lg">
        <Alert className="col-span-2 border-primary/20 bg-accent-foreground/5">
          <CrosshairIcon className="w-4 h-4 text-primary" />
          <AlertTitle className="text-white/95">Welcome to Dexterity Pools!</AlertTitle>
          <AlertDescription className="mt-2 text-white/80">
            Dexterity Pools are a self-service DeFi swap protocol where anyone can create custom
            liquidity pools with unique trading logic. These pools often feature high fee rebates
            for LP holders and special bonuses that can waive or reduce trading fees or provide
            other advantages.
          </AlertDescription>
        </Alert>

        <Alert className="border-primary/20 bg-accent-foreground/5">
          <Sparkles className="w-4 h-4 text-primary" />
          <AlertDescription className="mt-1 text-white/80">
            Enjoy a fast-paced trading environment with:
            <ul className="mt-2 ml-4 space-y-1 list-disc marker:text-primary">
              <li>Emerging memecoins and community tokens</li>
              <li>Creative trading mechanics and bonuses</li>
              <li>Fee waivers and special rewards</li>
              <li>Hold-to-Earn energy for verified LPs</li>
            </ul>
          </AlertDescription>
        </Alert>

        <Alert className="border-primary/20 bg-primary/5">
          <AlertTriangle className="w-4 h-4 text-destructive" />
          <AlertTitle className="text-destructive">Exercise Caution</AlertTitle>
          <AlertDescription className="mt-1 text-white/80">
            These pools are community-created and not owned by Charisma. Always:
            <ul className="mt-2 ml-4 space-y-1 list-disc marker:text-primary">
              <li>DYOR (Do Your Own Research)</li>
              <li>Inspect pool contract source code</li>
              <li>Verify pool creators and tokens</li>
              <li>Start with small amounts while learning</li>
            </ul>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};
