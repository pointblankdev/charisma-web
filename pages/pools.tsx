import { GetStaticProps } from 'next';
import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import Layout from '@components/layout/layout';
import { Card } from '@components/ui/card';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { ArrowUpDown, Minus, Plus } from 'lucide-react';
import numeral from 'numeral';
import { contractPrincipalCV, boolCV } from 'micro-stacks/clarity';
import { callReadOnlyFunction, cvToJSON, principalCV, uintCV } from "@stacks/transactions";
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
import { result } from 'lodash';

type TokenInfo = {
  symbol: string;
  name: string;
  image: string;
  contractAddress: string;
  price: number;
};

type PoolInfo = {
  id: number;
  token0: TokenInfo;
  token1: TokenInfo;
  reserves: {
    token0: number;
    token1: number;
  };
  tvl: number;
  volume24h: number;
  contractAddress: string;
};

type Props = {
  data: {
    pools: PoolInfo[];
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
  return chaPrice;
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  // Define pools
  const poolsData = [
    {
      id: 1,
      token0: { symbol: 'WELSH', name: 'Welsh', image: '/welsh-logo.png', contractAddress: 'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token' },
      token1: { symbol: 'iouWELSH', name: 'Synthetic Welsh', image: '/welsh-logo.png', contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-welsh' },
      volume24h: 0,
      contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.welsh-iouwelsh',
    },
    {
      id: 2,
      token0: { symbol: '$ROO', name: 'Roo', image: '/roo-logo.png', contractAddress: 'SP2C1WREHGM75C7TGFAEJPFKTFTEGZKF6DFT6E2GE.kangaroo' },
      token1: { symbol: 'iouROO', name: 'Synthetic Roo', image: '/roo-logo.png', contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-roo' },
      volume24h: 0,
      contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.roo-iouroo',
    },
    {
      id: 3,
      token0: { symbol: 'CHA', name: 'Charisma', image: '/charisma-logo-square.png', contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token' },
      token1: { symbol: 'WELSH', name: 'Welsh', image: '/welsh-logo.png', contractAddress: 'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token' },
      volume24h: 0,
      contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.cha-welsh',
    },
    {
      id: 4,
      token0: { symbol: 'STX', name: 'Stacks', image: '/stx-logo.png', contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wstx' },
      token1: { symbol: 'CHA', name: 'Charisma', image: '/charisma-logo-square.png', contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token' },
      volume24h: 0,
      contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.cha-welsh',
    },
    {
      id: 5,
      token0: { symbol: 'CHA', name: 'Charisma', image: '/charisma-logo-square.png', contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token' },
      token1: { symbol: 'iouWELSH', name: 'Synthetic Welsh', image: '/welsh-logo.png', contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-welsh' },
      volume24h: 0,
      contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.cha-iouwelsh',
    },
  ];

  // Fetch token prices
  const tokenPrices = await getTokenPrices();

  // Calculate CHA price
  const chaPrice = await calculateChaPrice(tokenPrices['STX']);
  tokenPrices['CHA'] = chaPrice;

  // Calculate IOU prices
  tokenPrices['iouWELSH'] = tokenPrices['WELSH'];
  tokenPrices['iouROO'] = tokenPrices['$ROO'];

  // Fetch reserves and calculate TVL for each pool
  const pools: PoolInfo[] = await Promise.all(poolsData.map(async (pool) => {
    const reserves = await getPoolReserves(pool.id, pool.token0.contractAddress, pool.token1.contractAddress);

    const token0Price = tokenPrices[pool.token0.symbol] || 0;
    const token1Price = tokenPrices[pool.token1.symbol] || 0;

    const tvl = (reserves.token0 / 1e6 * token0Price) + (reserves.token1 / 1e6 * token1Price);

    return {
      ...pool,
      token0: { ...pool.token0, price: token0Price },
      token1: { ...pool.token1, price: token1Price },
      reserves,
      tvl,
    };
  }));

  return {
    props: {
      data: {
        pools,
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

  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <div className="sm:container sm:mx-auto sm:pb-10 md:max-w-5xl">
          <div className='my-2 font-light text-center text-muted-foreground/90'>View and manage liquidity pools on the Charisma DEX</div>
          <PoolsInterface data={data} />
        </div>
      </Layout>
    </Page>
  );
}

const PoolsInterface = ({ data }: Props) => {
  const [sortBy, setSortBy] = useState<'tvl' | 'volume'>('tvl');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedPool, setSelectedPool] = useState<PoolInfo | null>(null);
  const [isAddLiquidity, setIsAddLiquidity] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const sortedPools = [...data.pools].sort((a, b) => {
    const valueA = sortBy === 'tvl' ? a.tvl : a.volume24h;
    const valueB = sortBy === 'tvl' ? b.tvl : b.volume24h;
    return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
  });

  const handleSort = (newSortBy: 'tvl' | 'volume') => {
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

  return (
    <div className="max-w-screen-lg sm:mx-auto sm:px-4">
      <div className="mt-6">
        <div className="relative px-6 pb-4 pt-2 sm:rounded-lg bg-[var(--sidebar)] overflow-hidden">
          <h1 className="mb-4 text-2xl font-bold text-white/95">Liquidity Pools</h1>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400">
                  <th className="py-2">Pool</th>
                  <th className="py-2">Reserves</th>
                  <th className="py-2 cursor-pointer" onClick={() => handleSort('tvl')}>
                    TVL {sortBy === 'tvl' && <ArrowUpDown className="inline ml-1" size={16} />}
                  </th>
                  <th className="py-2 cursor-pointer" onClick={() => handleSort('volume')}>
                    Volume (24h) {sortBy === 'volume' && <ArrowUpDown className="inline ml-1" size={16} />}
                  </th>
                  <th className="py-2 sr-only">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedPools.map((pool) => (
                  <tr key={pool.id} className="border-t border-gray-700">
                    <td className="py-4">
                      <div className="flex items-center">
                        <Image src={pool.token0.image} alt={pool.token0.symbol} width={24} height={24} className="mr-2 rounded-full" />
                        <Image src={pool.token1.image} alt={pool.token1.symbol} width={24} height={24} className="mr-2 rounded-full" />
                        <span className="text-white">{pool.token0.symbol}/{pool.token1.symbol}</span>
                      </div>
                    </td>
                    <td className="py-4 text-white">
                      {numeral(pool.reserves.token0 / 1000000).format('0,0.00')} {pool.token0.symbol}
                      <br />
                      {numeral(pool.reserves.token1 / 1000000).format('0,0.00')} {pool.token1.symbol}
                    </td>
                    <td className="py-4 text-white">${numeral(pool.tvl).format('0,0.00')}</td>
                    <td className="py-4 text-white">${numeral(pool.volume24h).format('0,0')}</td>
                    <td className="py-4">
                      <div className="flex space-x-2">
                        <Button size="sm" onClick={() => handleLiquidityAction(pool, true)}>
                          <Plus className="w-4 h-4 mr-1" /> Add
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleLiquidityAction(pool, false)}>
                          <Minus className="w-4 h-4 mr-1" /> Remove
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <LiquidityDialog pool={selectedPool} isAdd={isAddLiquidity} onClose={handleCloseDialog} />
      </Dialog>
    </div>
  );
};

const LiquidityDialog = ({ pool, isAdd, onClose }: { pool: PoolInfo | null, isAdd: boolean, onClose: () => void }) => {
  const [amount0, setAmount0] = useState('');
  const [amount1, setAmount1] = useState('');
  const { openContractCall } = useOpenContractCall();

  const calculateUsdValue = (amount: string, price: number) => {
    const numericAmount = parseFloat(amount) || 0;
    return Number((numericAmount * price).toFixed(2));
  };

  const handleInputChange = (value: string, setAmount: React.Dispatch<React.SetStateAction<string>>) => {
    // Only allow numbers and a single decimal point
    if (/^\d*\.?\d*$/.test(value) || value === '') {
      setAmount(value);
    }
  };

  const isBalanced = () => {
    if (!pool || !amount0 || !amount1) return false;
    const usdValue0 = calculateUsdValue(amount0, pool.token0.price);
    const usdValue1 = calculateUsdValue(amount1, pool.token1.price);
    const ratio = Math.max(usdValue0, usdValue1) / Math.min(usdValue0, usdValue1);
    return ratio <= 1.1; // Within 10%
  };

  const handleAddLiquidity = useCallback(() => {
    if (!pool) return;

    openContractCall({
      contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
      contractName: "univ2-router",
      functionName: "add-liquidity",
      functionArgs: [
        uintCV(pool.id),
        contractPrincipalCV(pool.token0.contractAddress.split('.')[0], pool.token0.contractAddress.split('.')[1]),
        contractPrincipalCV(pool.token1.contractAddress.split('.')[0], pool.token1.contractAddress.split('.')[1]),
        contractPrincipalCV(pool.contractAddress.split('.')[0], pool.contractAddress.split('.')[1]),
        uintCV(parseFloat(amount0) * 1000000),
        uintCV(parseFloat(amount1) * 1000000),
        uintCV(0),
        uintCV(0)
      ],
      onFinish: (data) => {
        console.log('Transaction successful', data);
        onClose();
      },
      onCancel: () => {
        console.log('Transaction cancelled');
      }
    });
  }, [pool, amount0, amount1, openContractCall, onClose]);

  const handleRemoveLiquidity = useCallback(() => {
    if (!pool) return;

    openContractCall({
      contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
      contractName: "univ2-router",
      functionName: "remove-liquidity",
      functionArgs: [
        uintCV(pool.id),
        contractPrincipalCV(pool.token0.contractAddress.split('.')[0], pool.token0.contractAddress.split('.')[1]),
        contractPrincipalCV(pool.token1.contractAddress.split('.')[0], pool.token1.contractAddress.split('.')[1]),
        contractPrincipalCV(pool.contractAddress.split('.')[0], pool.contractAddress.split('.')[1]),
        uintCV(parseFloat(amount0) * 1000000),
        uintCV(0),
        uintCV(0)
      ],
      onFinish: (data) => {
        console.log('Transaction successful', data);
        onClose();
      },
      onCancel: () => {
        console.log('Transaction cancelled');
      }
    });
  }, [pool, amount0, openContractCall, onClose]);

  if (!pool) return null;

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{isAdd ? 'Add Liquidity' : 'Remove Liquidity'}</DialogTitle>
        <DialogDescription>
          {isAdd
            ? `Add liquidity to the ${pool.token0.symbol}/${pool.token1.symbol} pool`
            : `Remove liquidity from the ${pool.token0.symbol}/${pool.token1.symbol} pool`}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid items-center grid-cols-4 gap-4">
          <Label htmlFor="token0" className="text-right">
            {pool.token0.symbol}
          </Label>
          <div className="flex items-center col-span-3">
            <Input
              type='number'
              id="token0"
              className="flex-grow"
              value={amount0}
              onChange={(e) => handleInputChange(e.target.value, setAmount0)}
            />
            <span className="ml-2 text-sm text-gray-500">
              ${calculateUsdValue(amount0, pool.token0.price).toFixed(2)}
            </span>
          </div>
        </div>
        <div className="grid items-center grid-cols-4 gap-4">
          <Label htmlFor="token1" className="text-right">
            {pool.token1.symbol}
          </Label>
          <div className="flex items-center col-span-3">
            <Input
              type='number'
              id="token1"
              className="flex-grow"
              value={amount1}
              onChange={(e) => handleInputChange(e.target.value, setAmount1)}
            />
            <span className="ml-2 text-sm text-gray-500">
              ${calculateUsdValue(amount1, pool.token1.price).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
      <DialogFooter className="flex items-center justify-between">
        {isAdd && (
          <span className={`text-sm ${isBalanced() ? 'text-green-500' : 'text-red-500'}`}>
            {isBalanced() ? 'Values are balanced' : 'Values must be < 10% to add liquidity'}
          </span>
        )}
        <Button
          type="submit"
          onClick={isAdd ? handleAddLiquidity : handleRemoveLiquidity}
          disabled={isAdd && !isBalanced()}
        >
          {isAdd ? 'Add Liquidity' : 'Remove Liquidity'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};