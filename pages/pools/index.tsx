import { GetStaticProps } from 'next';
import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import Layout from '@components/layout/layout';
import { Card } from '@components/ui/card';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { ArrowUpDown, Minus, Plus, RefreshCw, Scale, ShoppingCart } from 'lucide-react';
import numeral from 'numeral';
import { Button } from '@components/ui/button';
import { Dialog } from '@components/ui/dialog';
import useWallet from '@lib/hooks/wallet-balance-provider';
import RebalanceDialog from '@components/pools/rebalance-dialog';
import EqualizeDialog from '@components/pools/equalize-dialog';
import QuickBuyDialog from '@components/pools/quick-buy-dialog';
import LiquidityDialog from '@components/pools/add-liquidity';
import Link from 'next/link';
import { getPoolData } from '@lib/db-providers/kv';
import { motion } from 'framer-motion';
import { getTotalSupply } from '@lib/stacks-api';
import PricesService from '@lib/prices-service';
import { PoolsService } from '@lib/data/pools/pools-service';
import { PoolsInterface } from '@components/pools/pools-interface';

export type TokenInfo = {
  symbol: string;
  name: string;
  image: string;
  contractAddress: string;
  price: number;
  tokenId?: string;
  decimals: number;
};

export type PoolInfo = {
  id: number;
  token0: TokenInfo;
  token1: TokenInfo;
  reserves: {
    token0: number;
    token1: number;
  };
  tvl: number;
  volume: {
    token0: number;
    token1: number;
  };
  contractAddress: string;
  totalLpSupply: number;
};

type Props = {
  data: {
    pools: PoolInfo[];
    tokenPrices: { [key: string]: number };
  };
};

export const getStaticProps: GetStaticProps<Props> = async () => {
  // Get pools from pools API
  const poolsData = await PoolsService.getPools();

  // Fetch token prices
  const tokenPrices = await PricesService.getAllTokenPrices();

  // Fetch reserves and calculate TVL for each pool
  const pools: PoolInfo[] = await Promise.all(
    poolsData.map(async pool => {
      // lookup total supply of LP tokens
      const totalLpSupply = await getTotalSupply(pool.contractAddress);

      const reserves = await PricesService.getPoolReserves(pool.id);

      const token0Price = tokenPrices[pool.token0.symbol] || 0;
      const token1Price = tokenPrices[pool.token1.symbol] || 0;

      const tvl =
        (reserves.token0 / 10 ** pool.token0.decimals) * token0Price +
        (reserves.token1 / 10 ** pool.token1.decimals) * token1Price;

      // Fetch swap events for volume calculation
      const poolData = await getPoolData(pool.id.toString());

      // calculate all transaction volume
      const volume = poolData.swaps.reduce(
        (sum: any, swap: any) => {
          sum.token0 += swap['token-in'] === swap.pool.token0 ? swap['amt-in'] : swap['amt-out'];
          sum.token1 += swap['token-in'] === swap.pool.token1 ? swap['amt-in'] : swap['amt-out'];
          return sum;
        },
        { token0: 0, token1: 0 }
      );

      return {
        ...pool,
        token0: { ...pool.token0, price: token0Price },
        token1: { ...pool.token1, price: token1Price },
        reserves,
        tvl,
        volume,
        totalLpSupply
      };
    })
  );

  return {
    props: {
      data: {
        pools,
        tokenPrices
      }
    },
    revalidate: 60
  };
};

export default function PoolsPage({ data }: Props) {
  const meta = {
    title: 'Charisma | Pools',
    description: 'View and manage liquidity pools on the Charisma DEX',
    image: 'https://charisma.rocks/pools-screenshot.png'
  };

  const { wallet } = useWallet();

  // implement loading check
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (wallet) setLoading(false);
  }, [wallet]);

  const isAuthorized = wallet.experience.balance >= 1000 || wallet.redPilled;

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
            {isAuthorized ? (
              <>
                <div className="my-2 font-light text-center text-muted-foreground/90">
                  View and manage liquidity pools on the Charisma DEX
                </div>
                <PoolsInterface data={data} />
              </>
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
          </motion.div>
        )}
      </Layout>
    </Page>
  );
}
