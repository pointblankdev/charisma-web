import { GetStaticProps } from 'next';
import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import Layout from '@components/layout/layout';
import { useEffect, useState } from 'react';
import useWallet from '@lib/hooks/wallet-balance-provider';
import { motion } from 'framer-motion';
import PricesService from '@lib/server/prices/prices-service';
import Link from 'next/link';
import { DEXTERITY_ABI, getContractsByTrait } from '@lib/server/traits/service';
import {
  getAccountBalance,
  getAllContractEvents,
  getAllContractTransactions,
  getDecimals,
  getIdentifier,
  getSymbol,
  getTokenMetadata,
  getTotalSupply
} from '@lib/stacks-api';
import DexterityInterface from '@components/pools/dexterity-interface';
import _ from 'lodash';
import { kv } from '@vercel/kv';

// Define default STX token data
const STX_TOKEN = {
  contractId: '.stx',
  metadata: {
    name: 'Stacks',
    symbol: 'STX',
    decimals: 6,
    identifier: '.stx',
    image: '/stx-logo.png',
    description: 'Native Stacks blockchain token'
  }
};

// Helper to get token data
async function getTokenData(contractId: string) {
  if (contractId === '.stx') return STX_TOKEN;

  return {
    contractId,
    metadata: {
      ...(await getTokenMetadata(contractId)),
      symbol: await getSymbol(contractId),
      decimals: await getDecimals(contractId),
      identifier: await getIdentifier(contractId)
    }
  };
}

// Helper to process events data for a pool
async function getPoolEvents(contractId: string) {
  const events = await getAllContractTransactions(contractId);
  return events.map(event => ({
    block_time: event.block_time,
    block_time_iso: event.block_time_iso,
    sender_address: event.sender_address,
    events: event.events || []
  }));
}

async function getPoolData(contract: any) {
  const metadata = await getTokenMetadata(contract.contract_id);
  const [token0, token1] = await Promise.all([
    getTokenData(metadata.properties.tokenAContract),
    getTokenData(metadata.properties.tokenBContract)
  ]);

  const reserves = await getAccountBalance(contract.contract_id);
  const events = await getPoolEvents(contract.contract_id);

  // Helper function to get balance for either STX or FT
  const getTokenBalance = (assetIdentifier: string): number => {
    if (assetIdentifier === '.stx::.stx') {
      return parseInt(reserves.stx?.balance || '0');
    }
    const ftBalance = reserves.fungible_tokens?.[assetIdentifier]?.balance;
    return ftBalance ? parseInt(ftBalance) : 0;
  };

  // Get balances for both tokens
  const reserve0 = getTokenBalance(`${token0.contractId}::${token0.metadata.identifier}`);
  const reserve1 = getTokenBalance(`${token1.contractId}::${token1.metadata.identifier}`);

  // Get total supply
  const totalSupply = await getTotalSupply(contract.contract_id);

  return {
    contractId: contract.contract_id,
    poolData: {
      reserve0,
      reserve1,
      totalSupply
    },
    metadata: {
      ...metadata,
      symbol: await getSymbol(contract.contract_id),
      decimals: await getDecimals(contract.contract_id),
      identifier: await getIdentifier(contract.contract_id)
    },
    token0,
    token1,
    events
  };
}

async function getCachedOrFetchPoolData(contract: any, ttlSeconds = 300) {
  const cacheKey = `pool:data:${contract.contract_id}`;
  const cachedData = await kv.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const poolData = await getPoolData(contract);
  await kv.set(cacheKey, poolData, { ex: ttlSeconds });
  return poolData;
}

async function getCachedOrFetchContracts(ttlSeconds = 300) {
  const cacheKey = 'contracts:dexterity';
  const contracts = await getContractsByTrait({ traitAbi: DEXTERITY_ABI, limit: 100 });
  const uniqueContracts = _.uniqBy(contracts, 'contract_id');
  return uniqueContracts;
}

const service = PricesService.getInstance();
export const getStaticProps: GetStaticProps<any> = async () => {
  try {
    // Get contracts and prices in parallel using cached functions
    const [contracts, prices] = await Promise.all([
      getCachedOrFetchContracts(),
      service.getAllTokenPrices()
    ]);

    // Get pools data with caching
    const pools = await Promise.all(
      contracts.map(async contract => {
        try {
          const pool = await getCachedOrFetchPoolData(contract);
          return pool;
        } catch (error) {
          console.warn('Error fetching pool data:', error);
          return null;
        }
      })
    );

    // Filter out any null pools from failed fetches
    const validPools = pools.filter(Boolean);

    return {
      props: {
        data: { prices, pools: validPools }
      },
      revalidate: 20
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return {
      props: {
        data: { prices: {}, pools: [] }
      },
      revalidate: 20
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
