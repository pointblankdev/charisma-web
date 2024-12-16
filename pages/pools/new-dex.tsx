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
import { AlertTriangle, CrosshairIcon, Sparkles } from 'lucide-react';
import {
  DEXTERITY_ABI,
  getAllContractsByTrait,
  getContractsByTrait
} from '@lib/server/traits/service';
import { getTokenMetadata } from '@lib/stacks-api';
import DexterityInterface from '@components/pools/dexterity-interface';

// Initialize clients
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
    const [contracts, prices] = await Promise.all([
      getContractsByTrait({ traitAbi: DEXTERITY_ABI, limit: 100 }),
      service.getAllTokenPrices()
    ]);

    // get all token metadata
    for (const contract of contracts) {
      const metadata = await getTokenMetadata(contract.contract_id);
      contract.metadata = metadata;
    }

    const pools = contracts.map((contract: any) => {
      return {
        contractId: contract.contract_id,
        metadata: contract.metadata
      };
    });

    console.log(pools);

    return {
      props: {
        data: {
          pools: pools,
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
              <DexterityInterface data={data} />
              <div className="justify-center w-full p-1 m-1 text-center">
                <Link className="w-full text-sm text-center" href="/dexterity">
                  Want to create your own liquidity pool and earn trading fees?
                </Link>
              </div>
            </PoolsLayout>
          </motion.div>
        )}
      </Layout>
    </Page>
  );
}
