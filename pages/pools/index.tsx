import { GetStaticProps } from 'next';
import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import Layout from '@components/layout/layout';
import { useEffect, useState } from 'react';
import PricesService from '@lib/server/prices/prices-service';
import Link from 'next/link';
import DexterityInterface from '@components/pools/dexterity-interface';
import { ContractId, Dexterity } from 'dexterity-sdk';
import _ from 'lodash';

Dexterity.configure({ apiKeyRotation: 'loop', parallelRequests: 10 }).catch(console.error);

const blacklist = [
  'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.chdollar',
  'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.dmg-runes',
  'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.uahdmg',
  'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.dmg-lp-token',
  'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.stx-lp-token'
] as ContractId[];

const service = PricesService.getInstance();
export const getStaticProps: GetStaticProps<any> = async () => {
  // Get contracts and prices in parallel using cached functions
  const [pools, prices] = await Promise.all([
    Dexterity.discover({ blacklist, serialize: true }),
    service.getAllTokenPrices()
  ]);

  const uniquePools = _.uniqBy(pools, 'contractId');

  return {
    props: {
      data: { prices, pools: uniquePools }
    },
    revalidate: 60
  };
};

export default function DexterityPoolsPage({ data }: any) {
  const meta = {
    title: 'Charisma | Dexterity Pools',
    description: 'View and manage self-listed liquidity pools on the Charisma DEX',
    image: 'https://charisma.rocks/pools-screenshot.png'
  };
  const [poolsWithEvents, setPoolsWithEvents] = useState(data.pools);

  useEffect(() => {
    let mounted = true;

    const fetchPoolEvents = async () => {
      // Initialize pools with empty events
      if (mounted) {
        setPoolsWithEvents(data.pools.map((pool: any) => ({ ...pool, events: [] })));
      }

      // Fetch events for each pool individually
      for (const pool of data.pools) {
        if (!mounted) break;

        try {
          const response = await fetch(`/api/v0/transactions?contractId=${pool.contractId}`);
          if (!response.ok) throw new Error('Failed to fetch events');
          const events = await response.json();

          if (mounted) {
            setPoolsWithEvents((currentPools: any) =>
              currentPools.map((p: any) =>
                p.contractId === pool.contractId ? { ...p, events } : p
              )
            );
          }
        } catch (error) {
          console.error(`Error fetching events for pool ${pool.contractId}:`, error);
        }
      }
    };

    fetchPoolEvents();

    return () => {
      mounted = false;
    };
  }, [data.pools]);

  return (
    <Page meta={meta} fullViewport>
      <Layout>
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

          <DexterityInterface data={{ ...data, pools: poolsWithEvents }} prices={data.prices} />

          <div className="justify-center w-full p-1 m-1 text-center">
            <Link className="w-full text-sm text-center" href="/dexterity">
              Want to create your own liquidity pool and earn trading fees?
            </Link>
          </div>
        </div>
      </Layout>
    </Page>
  );
}
