import { GetStaticProps } from 'next';
import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import Layout from '@components/layout/layout';
import { Card } from '@components/ui/card';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { ArrowUpDown, Minus, Plus, RefreshCw, Scale, ShoppingCart } from 'lucide-react';
import numeral from 'numeral';
import { contractPrincipalCV, boolCV } from 'micro-stacks/clarity';
import { callReadOnlyFunction, cvToJSON, Pc, PostConditionMode, principalCV, uintCV } from "@stacks/transactions";
import { useOpenContractCall } from '@micro-stacks/react';
import velarApi from '@lib/velar-api';
import { Button } from '@components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@components/ui/dialog';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { Slider } from "@components/ui/slider";
import { useAccount } from '@micro-stacks/react';
import useWallet from '@lib/hooks/wallet-balance-provider';
import cmc from '@lib/cmc-api';
import RebalanceDialog from '@components/pools/rebalance-dialog';
import EqualizeDialog from '@components/pools/equalize-dialog';
import QuickBuyDialog from '@components/pools/quick-buy-dialog';
import LiquidityDialog from '@components/pools/add-liquidity';
import Link from 'next/link';
import { getPoolData } from '@lib/db-providers/kv';
import { motion } from 'framer-motion';

export type TokenInfo = {
  symbol: string;
  name: string;
  image: string;
  contractAddress: string;
  price: number;
  tokenId?: string
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
};

type Props = {
  data: {
    pools: PoolInfo[];
    tokenPrices: { [key: string]: number };
  };
};

async function getPoolReserves(poolId: number, token0Address: string, token1Address: string): Promise<{ token0: number; token1: number }> {
  try {
    const result: any = await callReadOnlyFunction({
      contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
      contractName: "univ2-core",
      functionName: "lookup-pool",
      functionArgs: [
        principalCV(token0Address),
        principalCV(token1Address)
      ],
      senderAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
    });

    if (result.value) {
      const poolInfo = result.value.data.pool;
      const reserve0 = Number(poolInfo.data.reserve0.value);
      const reserve1 = Number(poolInfo.data.reserve1.value);
      return { token0: reserve0, token1: reserve1 };
    } else {
      console.error("Pool not found");
      return { token0: 0, token1: 0 };
    }
  } catch (error) {
    console.error("Error fetching reserves:", error);
    return { token0: 0, token1: 0 };
  }
}

async function getTokenPrices(): Promise<{ [key: string]: number }> {
  const prices = await velarApi.tokens('all');
  return prices.reduce((acc: { [key: string]: number }, token: any) => {
    acc[token.symbol] = token.price;
    return acc;
  }, {});
}

async function calculateChaPrice(stxPrice: number): Promise<number> {
  const stxChaReserves = await getPoolReserves(
    4,
    "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wstx",
    "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token"
  );

  // Calculate CHA price based on STX-CHA pool reserves
  const chaPrice = (stxPrice * stxChaReserves.token0) / stxChaReserves.token1;
  return chaPrice || 0.30;
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  // Define pools
  const poolsData = [
    {
      id: 1,
      token0: { symbol: 'WELSH', name: 'Welsh', image: '/welsh-logo.png', contractAddress: 'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token', tokenId: 'welshcorgicoin', decimals: 6 },
      token1: { symbol: 'iouWELSH', name: 'Synthetic Welsh', image: '/welsh-logo.png', contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-welsh', tokenId: 'synthetic-welsh', decimals: 6 },
      volume24h: 0,
      contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.welsh-iouwelsh',
    },
    {
      id: 2,
      token0: { symbol: '$ROO', name: 'Roo', image: '/roo-logo.png', contractAddress: 'SP2C1WREHGM75C7TGFAEJPFKTFTEGZKF6DFT6E2GE.kangaroo', tokenId: 'kangaroo', decimals: 6 },
      token1: { symbol: 'iouROO', name: 'Synthetic Roo', image: '/roo-logo.png', contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-roo', tokenId: 'synthetic-roo', decimals: 6 },
      volume24h: 0,
      contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.roo-iouroo',
    },
    {
      id: 3,
      token0: { symbol: 'CHA', name: 'Charisma', image: '/charisma-logo-square.png', contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token', tokenId: 'charisma', decimals: 6 },
      token1: { symbol: 'WELSH', name: 'Welsh', image: '/welsh-logo.png', contractAddress: 'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token', tokenId: 'welshcorgicoin', decimals: 6 },
      volume24h: 0,
      contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.cha-welsh',
    },
    {
      id: 4,
      token0: { symbol: 'STX', name: 'Stacks', image: '/stx-logo.png', contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wstx', decimals: 6 },
      token1: { symbol: 'CHA', name: 'Charisma', image: '/charisma-logo-square.png', contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token', tokenId: 'charisma', decimals: 6 },
      volume24h: 0,
      contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wstx-cha',
    },
    {
      id: 5,
      token0: { symbol: 'CHA', name: 'Charisma', image: '/charisma-logo-square.png', contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token', tokenId: 'charisma', decimals: 6 },
      token1: { symbol: 'iouWELSH', name: 'Synthetic Welsh', image: '/welsh-logo.png', contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-welsh', tokenId: 'synthetic-welsh', decimals: 6 },
      volume24h: 0,
      contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.cha-iouwelsh',
    },
    {
      id: 6,
      token0: { symbol: 'CHA', name: 'Charisma', image: '/charisma-logo-square.png', contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token', tokenId: 'charisma', decimals: 6 },
      token1: { symbol: 'ORDI', name: 'Ordi', image: '/ordi-logo.png', contractAddress: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.brc20-ordi', tokenId: 'brc20-ordi', decimals: 8 },
      volume24h: 0,
      contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.cha-ordi',
    },
    {
      id: 7,
      token0: { symbol: 'CHA', name: 'Charisma', image: '/charisma-logo-square.png', contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token', tokenId: 'charisma', decimals: 6 },
      token1: { symbol: '$ROO', name: 'Roo', image: '/roo-logo.png', contractAddress: 'SP2C1WREHGM75C7TGFAEJPFKTFTEGZKF6DFT6E2GE.kangaroo', tokenId: 'kangaroo', decimals: 6 },
      volume24h: 0,
      contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.cha-roo',
    },
    {
      id: 8,
      token0: { symbol: 'WELSH', name: 'Welsh', image: '/welsh-logo.png', contractAddress: 'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token', tokenId: 'welshcorgicoin', decimals: 6 },
      token1: { symbol: 'DOG', name: 'DOG-GO-TO-THE-MOON', image: '/sip10/dogLogo.webp', contractAddress: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.runes-dog', tokenId: 'runes-dog', decimals: 8 },
      volume24h: 0,
      contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.up-dog',
    },
  ];

  // Fetch token prices
  const tokenPrices = await getTokenPrices();
  const cmcPriceData = await cmc.getQuotes({ symbol: ['STX', 'ORDI', 'WELSH', 'DOG'] })

  // Calculate CHA price
  const chaPrice = await calculateChaPrice(cmcPriceData.data['STX'].quote.USD.price);
  tokenPrices['CHA'] = chaPrice;

  // Calculate IOU prices
  tokenPrices['iouWELSH'] = cmcPriceData.data['WELSH'].quote.USD.price;
  tokenPrices['iouROO'] = tokenPrices['$ROO'];

  tokenPrices['ORDI'] = cmcPriceData.data['ORDI'].quote.USD.price
  tokenPrices['DOG'] = cmcPriceData.data['DOG'].quote.USD.price

  // Fetch reserves and calculate TVL for each pool
  const pools: PoolInfo[] = await Promise.all(poolsData.map(async (pool) => {
    const reserves = await getPoolReserves(pool.id, pool.token0.contractAddress, pool.token1.contractAddress);

    const token0Price = tokenPrices[pool.token0.symbol] || 0;
    const token1Price = tokenPrices[pool.token1.symbol] || 0;

    const tvl = (reserves.token0 / 10 ** pool.token0.decimals * token0Price) + (reserves.token1 / 10 ** pool.token1.decimals * token1Price);

    // Fetch swap events for volume calculation
    const poolData = await getPoolData(pool.id.toString())

    // calculate all transaction volume 
    const volume = poolData.swaps.reduce((sum: any, swap: any) => {
      sum.token0 += swap['token-in'] === swap.pool.token0 ? swap['amt-in'] : swap['amt-out']
      sum.token1 += swap['token-in'] === swap.pool.token1 ? swap['amt-in'] : swap['amt-out']
      return sum
    }, { token0: 0, token1: 0 })

    return {
      ...pool,
      token0: { ...pool.token0, price: token0Price },
      token1: { ...pool.token1, price: token1Price },
      reserves,
      tvl,
      volume
    };
  }));


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
    description: "View and manage liquidity pools on the Charisma DEX",
    image: 'https://charisma.rocks/pools-screenshot.png',
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
        {!loading && <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="sm:max-w-[2400px] sm:mx-auto sm:pb-10">
          {isAuthorized ? (
            <>
              <div className='my-2 font-light text-center text-muted-foreground/90'>View and manage liquidity pools on the Charisma DEX</div>
              <PoolsInterface data={data} wallet={wallet} />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
              <Card className="w-full max-w-lg p-6 text-center">
                <h2 className="mb-4 text-2xl font-bold">Access Restricted</h2>
                <p className="mb-4">
                  To view and manage liquidity pools, you need either:
                </p>
                <ul className="mb-4 text-left list-disc list-inside">
                  <li className={wallet.experience.balance >= 1000 ? "text-green-500" : "text-red-500"}>
                    At least 1000 Experience {wallet.experience.balance >= 1000 ? "✓" : "✗"}
                  </li>
                  <li className={wallet.redPilled ? "text-green-500" : "text-red-500"}>
                    Own the Red Pill NFT {wallet.redPilled ? "✓" : "✗"}
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground">
                  Continue using Charisma to gain more experience and unlock this feature.
                </p>
              </Card>
            </div>
          )}
        </motion.div>}
      </Layout>
    </Page>
  );
}

const PoolsInterface = ({ data, wallet }: any) => {
  const [sortBy, setSortBy] = useState<'tvl' | 'volume' | 'priceAlignment'>('tvl');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedPool, setSelectedPool] = useState<PoolInfo | null>(null);
  const [isAddLiquidity, setIsAddLiquidity] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRebalanceDialogOpen, setIsRebalanceDialogOpen] = useState(false);
  const [selectedPoolForRebalance, setSelectedPoolForRebalance] = useState<PoolInfo | null>(null);
  const [isEqualizeDialogOpen, setIsEqualizeDialogOpen] = useState(false);
  const [selectedPoolForEqualize, setSelectedPoolForEqualize] = useState<PoolInfo | null>(null);
  const [isQuickBuyDialogOpen, setIsQuickBuyDialogOpen] = useState(false);
  const [selectedPoolForQuickBuy, setSelectedPoolForQuickBuy] = useState<PoolInfo | null>(null);

  const calculatePriceAlignment = (pool: PoolInfo) => {
    if (pool.token0.symbol === 'STX' && pool.token1.symbol === 'CHA') {
      return 100; // STX-CHA pool is always 100% aligned
    }

    if (pool.token0.symbol === 'CHA' || pool.token1.symbol === 'CHA') {
      const chaToken = pool.token0.symbol === 'CHA' ? pool.token0 : pool.token1;
      const otherToken = pool.token0.symbol === 'CHA' ? pool.token1 : pool.token0;
      const chaReserve = pool.token0.symbol === 'CHA' ? pool.reserves.token0 : pool.reserves.token1;
      const otherReserve = pool.token0.symbol === 'CHA' ? pool.reserves.token1 : pool.reserves.token0;

      const chaAmount = chaReserve / 10 ** chaToken.decimals;
      const otherAmount = otherReserve / 10 ** otherToken.decimals;

      const poolChaPrice = (otherToken.price * otherAmount) / chaAmount;
      return (poolChaPrice / data.tokenPrices['CHA']) * 100;
    }
    return null;
  };

  const filteredPools = data.pools.filter((pool: any) =>
    !(pool.token0.symbol === 'STX' && pool.token1.symbol === 'CHA') || wallet.experience.balance >= 4000
  );

  const getAlignmentColor = (alignment: number) => {
    const hue = Math.max(0, Math.min(120, 120 * (1 - Math.abs(alignment - 100) / 15)));
    return `hsl(${hue}, 100%, 40%, 90%)`;
  };

  const sortedPools = [...filteredPools].sort((a, b) => {
    if (sortBy === 'priceAlignment') {
      const alignmentA = calculatePriceAlignment(a) || 0;
      const alignmentB = calculatePriceAlignment(b) || 0;
      return sortOrder === 'asc' ? alignmentA - alignmentB : alignmentB - alignmentA;
    }
    const valueA = sortBy === 'tvl' ? a.tvl : ((a.volume.token0 / (10 ** a.token0.decimals)) * a.token0.price) + ((a.volume.token1 / (10 ** a.token1.decimals)) * a.token1.price);
    const valueB = sortBy === 'tvl' ? b.tvl : ((b.volume.token0 / (10 ** b.token0.decimals)) * b.token0.price) + ((b.volume.token1 / (10 ** b.token1.decimals)) * b.token1.price);
    return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
  });

  // Calculate total TVL
  const totalTVL = data.pools.reduce((sum: any, pool: any) => Number(sum) + Number(pool.tvl), 0);

  const handleSort = (newSortBy: 'tvl' | 'volume' | 'priceAlignment') => {
    if (newSortBy === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  const handleLiquidityAction = (pool: PoolInfo, isAdd: boolean) => {
    setSelectedPool(pool);
    setIsAddLiquidity(isAdd);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedPool(null);
  };

  const handleRebalance = (pool: PoolInfo) => {
    setSelectedPoolForRebalance(pool);
    setIsRebalanceDialogOpen(true);
  };

  const handleCloseRebalanceDialog = () => {
    setIsRebalanceDialogOpen(false);
    setSelectedPoolForRebalance(null);
  };

  const handleEqualize = (pool: PoolInfo) => {
    setSelectedPoolForEqualize(pool);
    setIsEqualizeDialogOpen(true);
  };

  const handleCloseEqualizeDialog = () => {
    setIsEqualizeDialogOpen(false);
    setSelectedPoolForEqualize(null);
  };

  const canEqualize = (pool: PoolInfo) => {
    if (
      (pool.token0.symbol === 'WELSH' && pool.token1.symbol === 'iouWELSH') ||
      (pool.token0.symbol === '$ROO' && pool.token1.symbol === 'iouROO')
    ) {
      const token0Reserve = pool.reserves.token0 / 10 ** pool.token0.decimals;
      const token1Reserve = pool.reserves.token1 / 10 ** pool.token1.decimals;
      const priceRatio = token0Reserve / token1Reserve;

      // Check if the price ratio is outside the 90-110% range
      return priceRatio < 0.95 || priceRatio > 1;
    }
    return false;
  };

  const handleQuickBuy = (pool: PoolInfo) => {
    setSelectedPoolForQuickBuy(pool);
    setIsQuickBuyDialogOpen(true);
  };

  const handleCloseQuickBuyDialog = () => {
    setIsQuickBuyDialogOpen(false);
    setSelectedPoolForQuickBuy(null);
  };

  const isStxChaPool = (pool: PoolInfo) => {
    return pool.token0.symbol === 'STX' && pool.token1.symbol === 'CHA';
  };

  const needsRebalance = (pool: PoolInfo, alignment: number | null) => {
    if (isStxChaPool(pool)) {
      return false;
    }
    return alignment !== null && Math.abs(alignment - 100) > 1; // 1% threshold
  };

  return (
    <div className="sm:mx-auto sm:px-4">
      <div className="mt-6">
        <div className="relative sm:px-6 pb-4 pt-5 sm:rounded-lg bg-[var(--sidebar)] border border-[var(--accents-7)] overflow-hidden">
          <div className="flex items-center justify-between px-4 mb-4 sm:px-0">
            <h1 className="text-2xl font-bold text-white/95">Liquidity Pools</h1>
            <span className="px-3 text-lg font-light text-white border rounded-full border-primary bg-accent-foreground">
              ${numeral(totalTVL).format('0,0.00')}
            </span>
          </div>

          <div className="px-4 overflow-x-auto sm:px-0">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400">
                  <th className="py-2">Pool</th>
                  <th className="py-2">Reserves</th>
                  <th className="py-2 cursor-pointer" onClick={() => handleSort('tvl')}>
                    TVL {sortBy === 'tvl' && <ArrowUpDown className="inline ml-1" size={16} />}
                  </th>
                  <th className="py-2 cursor-pointer" onClick={() => handleSort('volume')}>
                    Trading Volume (Total) {sortBy === 'volume' && <ArrowUpDown className="inline ml-1" size={16} />}
                  </th>
                  <th className="items-center hidden py-2 cursor-pointer sm:flex" onClick={() => handleSort('priceAlignment')}>
                    Price Alignment {sortBy === 'priceAlignment' && <ArrowUpDown className="inline ml-1" size={16} />}
                  </th>
                  <th className="py-2 sr-only">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedPools.map((pool) => {
                  const priceAlignment = calculatePriceAlignment(pool);
                  const poolNeedsRebalance = needsRebalance(pool, priceAlignment);
                  const canEqualizePool = canEqualize(pool);
                  const isStxCha = isStxChaPool(pool);

                  const PriceAlignment = ({ pool }: any) => {
                    const alignment = calculatePriceAlignment(pool);
                    if (alignment !== null) {
                      const color = getAlignmentColor(alignment);
                      return (
                        <span style={{ color }}>
                          {alignment.toPrecision(3)}%
                        </span>
                      );
                    }
                    return <>-</>;
                  }

                  return (
                    <tr key={pool.id} className="border-t border-gray-700/50">
                      <td className="py-4 min-w-60">
                        <div className="flex items-center">
                          <Image src={pool.token0.image} alt={pool.token0.symbol} width={240} height={240} className="w-6 mr-2 rounded-full" />
                          <Image src={pool.token1.image} alt={pool.token1.symbol} width={240} height={240} className="w-6 mr-2 rounded-full" />
                          <span className="text-white">{pool.token0.symbol}-{pool.token1.symbol}</span>
                        </div>
                      </td>
                      <td className="py-4 text-white min-w-48">
                        {numeral(pool.reserves.token0 / 10 ** pool.token0.decimals).format('0,0.00')} {pool.token0.symbol}
                        <br />
                        {numeral(pool.reserves.token1 / 10 ** pool.token1.decimals).format('0,0.00')} {pool.token1.symbol}
                      </td>
                      <td className="py-4 text-white min-w-24">${numeral(pool.tvl).format('0,0.00')}</td>
                      <td className="py-4 text-white min-w-64">
                        <div className='flex justify-between'>
                          <div>{numeral(pool.volume.token0 / 10 ** pool.token0.decimals).format('0,0')} {pool.token0.symbol}</div>
                          <div>{numeral(pool.volume.token0 / 10 ** pool.token0.decimals * pool.token0.price).format('$0,0.00')}</div>
                        </div>
                        <div className='flex justify-between'>
                          <div>{numeral(pool.volume.token1 / 10 ** pool.token1.decimals).format('0,0')} {pool.token1.symbol}</div>
                          <div>{numeral(pool.volume.token1 / 10 ** pool.token1.decimals * pool.token1.price).format('$0,0.00')}</div>
                        </div>
                      </td>
                      <td className="py-4 text-center text-white min-w-24 sm:min-w-36">
                        <PriceAlignment pool={pool} />
                      </td>
                      <td className="py-4 min-w-64">
                        <div className="flex justify-between space-x-6">
                          <div className="flex rounded-md">
                            <span className="px-4 py-1 text-sm font-medium leading-7 border border-r-0 rounded-l-md border-gray-700/80 bg-background">
                              Liquidity
                            </span>
                            <button
                              type="button"
                              className="relative inline-flex items-center px-2 py-2 text-sm font-medium border bg-background hover:bg-accent/90 hover:text-accent-foreground border-gray-700/80 focus:z-10 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accentring-accent"
                              onClick={() => handleLiquidityAction(pool, true)}
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              className="relative inline-flex items-center px-2 py-2 -ml-px text-sm font-medium border bg-background hover:bg-accent/90 hover:text-accent-foreground border-gray-700/80 rounded-r-md focus:z-10 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accentring-accent"
                              onClick={() => handleLiquidityAction(pool, false)}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                          </div>
                          {poolNeedsRebalance && (
                            <Button size="sm" onClick={() => handleRebalance(pool)}>
                              <RefreshCw className="w-4 h-4 mr-1" /> Rebalance
                            </Button>
                          )}
                          {canEqualizePool && (
                            <Button size="sm" variant="secondary" onClick={() => handleEqualize(pool)}>
                              <Scale className="w-4 h-4 mr-1" /> Equalize
                            </Button>
                          )}
                          {isStxCha && (
                            <Button size="sm" variant="secondary" onClick={() => handleQuickBuy(pool)} className='whitespace-nowrap'>
                              <ShoppingCart className="w-4 h-4 mr-1" /> Quick Buy
                            </Button>
                          )}

                          <Link href={`/pools/${pool.id}`} passHref>
                            <Button variant="link" className='whitespace-nowrap'>View Chart</Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <LiquidityDialog pool={selectedPool} isAdd={isAddLiquidity} onClose={handleCloseDialog} />
      </Dialog>

      <Dialog open={isRebalanceDialogOpen} onOpenChange={setIsRebalanceDialogOpen}>
        <RebalanceDialog
          pool={selectedPoolForRebalance}
          referenceChaPrice={data.pools.find((p: any) => p.token0.symbol === 'STX' && p.token1.symbol === 'CHA')?.token1.price || 0}
          onClose={handleCloseRebalanceDialog}
        />
      </Dialog>

      <Dialog open={isEqualizeDialogOpen} onOpenChange={setIsEqualizeDialogOpen}>
        <EqualizeDialog
          pool={selectedPoolForEqualize}
          onClose={handleCloseEqualizeDialog}
        />
      </Dialog>

      <Dialog open={isQuickBuyDialogOpen} onOpenChange={setIsQuickBuyDialogOpen}>
        <QuickBuyDialog
          pool={selectedPoolForQuickBuy}
          onClose={handleCloseQuickBuyDialog}
        />
      </Dialog>
    </div>
  );
};