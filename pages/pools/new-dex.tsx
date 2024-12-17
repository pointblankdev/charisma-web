import { GetStaticProps } from 'next';
import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import Layout from '@components/layout/layout';
import { useEffect, useState } from 'react';
import useWallet from '@lib/hooks/wallet-balance-provider';
import { motion } from 'framer-motion';
import PoolsLayout from '@components/pools/layout';
import PricesService from '@lib/server/prices/prices-service';
import Link from 'next/link';
import { DEXTERITY_ABI, getContractsByTrait } from '@lib/server/traits/service';
import {
  getAccountBalance,
  getDecimals,
  getIdentifier,
  getSymbol,
  getTokenMetadata,
  getTotalSupply
} from '@lib/stacks-api';
import DexterityInterface from '@components/pools/dexterity-interface';
import _ from 'lodash';

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

async function getPoolData(contract: any) {
  const metadata = await getTokenMetadata(contract.contract_id);
  const [token0, token1] = await Promise.all([
    getTokenData(metadata.properties.tokenAContract),
    getTokenData(metadata.properties.tokenBContract)
  ]);

  const reserves = await getAccountBalance(contract.contract_id);

  // Helper function to get balance for either STX or FT
  const getTokenBalance = (assetIdentifier: string): number => {
    if (assetIdentifier === '.stx::.stx') {
      return parseInt(reserves.stx?.balance || '0');
    }

    // For fungible tokens, parse the balance from the fungible_tokens object
    const ftBalance = reserves.fungible_tokens?.[assetIdentifier]?.balance;
    return ftBalance ? parseInt(ftBalance) : 0;
  };

  // Get balances for both tokens
  const reserve0 = getTokenBalance(`${token0.contractId}::${token0.metadata.identifier}`);
  const reserve1 = getTokenBalance(`${token1.contractId}::${token1.metadata.identifier}`);

  // Get total supply by getting the balance of the LP token from the contract itself
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
    token1
  };
}

export const getStaticProps: GetStaticProps<any> = async () => {
  const service = PricesService.getInstance();

  // Get contracts and prices
  const [contracts, prices] = await Promise.all([
    getContractsByTrait({ traitAbi: DEXTERITY_ABI, limit: 100 }),
    service.getAllTokenPrices()
  ]);

  // Get pools data
  const pools = [];
  for (const contract of contracts) {
    try {
      pools.push(await getPoolData(contract));
    } catch (error) {
      console.warn('Error fetching pool data:', error);
    }
  }

  // Extract unique tokens from pools and add STX
  const tokens = _.uniqBy(
    [STX_TOKEN, ...pools.flatMap(pool => [pool.token0, pool.token1])],
    'contractId'
  );

  return {
    props: {
      data: { prices, tokens, pools }
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
              <DexterityInterface data={data} prices={data.prices} />
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
