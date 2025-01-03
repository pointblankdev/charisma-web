import { GetStaticProps } from 'next';
import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import Layout from '@components/layout/layout';
import { useEffect, useState } from 'react';
import useWallet from '@lib/hooks/wallet-balance-provider';
import { motion } from 'framer-motion';
import PricesService from '@lib/server/prices/prices-service';
import Link from 'next/link';
import { getAllContractTransactions } from '@lib/stacks-api';
import DexterityInterface from '@components/pools/dexterity-interface';
import { Dexterity } from 'dexterity-sdk';
import _ from 'lodash';

// Helper to process events data for a pool
async function getPoolEvents(contractId: string) {
  let events = [];
  try {
    events = await getAllContractTransactions(contractId);
  } catch (error) {
    console.error('Error fetching pool events:', error);
  }
  return events.map(event => ({
    block_time: event.block_time,
    block_time_iso: event.block_time_iso,
    sender_address: event.sender_address,
    events: event.events || []
  }));
}

const service = PricesService.getInstance();
export const getStaticProps: GetStaticProps<any> = async () => {
  try {
    // Get contracts and prices in parallel using cached functions
    const [pools, prices] = await Promise.all([
      Dexterity.discoverPools(),
      service.getAllTokenPrices()
    ]);

    const uniquePools = _.uniqBy(pools, 'contractId');

    for (const pool of uniquePools) {
      (pool as any).events = await getPoolEvents(pool.contractId);
    }

    return {
      props: {
        data: { prices, pools: uniquePools }
      },
      revalidate: 60
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return {
      props: {
        data: { prices: {}, pools: [] }
      },
      revalidate: 60
    };
  }
};

export default function DexterityPoolsPage({ data }: any) {
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
            <div className="flex flex-col w-full max-w-[3000px] mx-auto px-4 sm:px-6 lg:px-8">
              {/* Header Section */}
              <div className="flex flex-col items-start justify-between mt-4 sm:flex-row sm:items-center sm:mt-6">
                <div className="w-full">
                  <h1 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">
                    Earn Yield 💰
                  </h1>
                  <p className="text-base sm:text-lg text-muted-foreground/90">
                    Collect swap fees by depositing your tokens into a secure vault.
                  </p>
                </div>

                <div className="flex flex-col items-end w-full mt-4 sm:mt-0">
                  <Link href="/dexterity">
                    <div className="inline-block px-6 py-1.5 mx-1 text-white rounded-lg bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50">
                      Create New Pool
                    </div>
                  </Link>
                  <div className="mt-2 text-sm text-center text-muted-foreground">
                    Earn trading fees by creating your own liquidity pool
                  </div>
                </div>
              </div>

              <DexterityInterface data={data} prices={data.prices} />

              <div className="justify-center w-full p-1 m-1 text-center">
                <Link className="w-full text-sm text-center" href="/dexterity">
                  Want to create your own liquidity pool and earn trading fees?
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </Layout>
    </Page>
  );
}
