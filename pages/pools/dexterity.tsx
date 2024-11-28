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
import TokenRegistryClient, { charismaNames } from '@lib/server/registry/registry.client';
import PricesService from '@lib/server/prices/prices-service';
import { getContractMetadata, getIndexContracts } from '@lib/db-providers/kv';
import { getDexterityReserves, getTotalSupply } from '@lib/stacks-api';
import Link from 'next/link';

// Initialize clients
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

export async function buildDexterityPools(tokens: any[]) {
  const dexterityPools = [];
  const dexterityContracts = await getIndexContracts();
  for (const contract of dexterityContracts) {
    const dflt = { contractId: '', metadata: {} };
    const contractMetadata = await getContractMetadata(contract);
    const reserves = await getDexterityReserves(contract);
    const totalSupply = await getTotalSupply(contract);
    dexterityPools.push({
      contractId: contract,
      metadata: { decimals: 6, ...contractMetadata },
      lpInfo: {
        dex: 'DEXTERITY',
        token0: contractMetadata?.tokenA || '',
        token1: contractMetadata?.tokenB || ''
      },
      poolData: {
        token0: contractMetadata?.tokenA || '',
        token1: contractMetadata?.tokenB || '',
        reserve0: reserves.token0,
        reserve1: reserves.token1,
        lpToken: contract,
        totalSupply: totalSupply,
        swapFee: { numerator: 996, denominator: 1000 },
        protocolFee: { numerator: 0, denominator: 1000 },
        shareFee: { numerator: 0, denominator: 1000 }
      },
      token0: tokens.find((t: any) => t.contractId === contractMetadata?.tokenA || '') || dflt,
      token1: tokens.find((t: any) => t.contractId === contractMetadata?.tokenB || '') || dflt
    });
  }
  return dexterityPools;
}

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
