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

type TokenInfo = {
  symbol: string;
  name: string;
  image: string;
  contractAddress: string;
  price: number;
  tokenId?: string
  decimals: number;
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
  ];

  // Fetch token prices
  const tokenPrices = await getTokenPrices();

  // Calculate CHA price
  const chaPrice = await calculateChaPrice(tokenPrices['STX']);
  tokenPrices['CHA'] = chaPrice;

  // Calculate IOU prices
  tokenPrices['iouWELSH'] = tokenPrices['WELSH'];
  tokenPrices['iouROO'] = tokenPrices['$ROO'];

  const { data } = await cmc.getQuotes({ symbol: ['ORDI'] })
  tokenPrices['ORDI'] = data['ORDI'].quote.USD.price;

  // Fetch reserves and calculate TVL for each pool
  const pools: PoolInfo[] = await Promise.all(poolsData.map(async (pool) => {
    const reserves = await getPoolReserves(pool.id, pool.token0.contractAddress, pool.token1.contractAddress);

    const token0Price = tokenPrices[pool.token0.symbol] || 0;
    const token1Price = tokenPrices[pool.token1.symbol] || 0;

    const tvl = (reserves.token0 / 10 ** pool.token0.decimals * token0Price) + (reserves.token1 / 10 ** pool.token1.decimals * token1Price);

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

  // Calculate total TVL
  const totalTVL = data.pools.reduce((sum, pool) => sum + pool.tvl, 0);

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
        <div className="relative px-6 pb-4 pt-5 sm:rounded-lg bg-[var(--sidebar)] overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white/95">Liquidity Pools</h1>
            <span className="px-3 text-lg font-light text-white border rounded-full border-primary bg-accent-foreground ">${numeral(totalTVL).format('0,0.00')}</span>
          </div>

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
                        <Image src={pool.token0.image} alt={pool.token0.symbol} width={240} height={240} className="w-6 mr-2 rounded-full" />
                        <Image src={pool.token1.image} alt={pool.token1.symbol} width={240} height={240} className="w-6 mr-2 rounded-full" />
                        <span className="text-white">{pool.token0.symbol}/{pool.token1.symbol}</span>
                      </div>
                    </td>
                    <td className="py-4 text-white">
                      {numeral(pool.reserves.token0 / 10 ** pool.token0.decimals).format('0,0.00')} {pool.token0.symbol}
                      <br />
                      {numeral(pool.reserves.token1 / 10 ** pool.token1.decimals).format('0,0.00')} {pool.token1.symbol}
                    </td>
                    <td className="py-4 text-white">${numeral(pool.tvl).format('0,0.00')}</td>
                    <td className="py-4 text-white">${numeral(pool.volume24h).format('0,0')}</td>
                    <td className="py-4">
                      <div className="flex space-x-2">
                        <Button size="sm" onClick={() => handleLiquidityAction(pool, true)}>
                          <Plus className="w-4 h-4 mr-1" /> Add
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleLiquidityAction(pool, false)}>
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
  const [sliderValue, setSliderValue] = useState(0);
  const [amount0, setAmount0] = useState('0');
  const [amount1, setAmount1] = useState('0');
  const { openContractCall } = useOpenContractCall();
  const { stxAddress } = useAccount();
  const { getBalanceByKey, balances, getKeyByContractAddress } = useWallet();

  const calculateUsdValue = (amount: string, price: number) => {
    const numericAmount = parseFloat(amount) || 0;
    return Number((numericAmount * price).toFixed(2));
  };

  useEffect(() => {
    if (pool && isAdd) {
      const maxAmount0 = pool.reserves.token0 / 10 ** pool.token0.decimals;
      const maxAmount1 = pool.reserves.token1 / 10 ** pool.token1.decimals;

      const newAmount0 = (maxAmount0 * sliderValue / 100).toFixed(pool.token0.decimals);
      const newAmount1 = (maxAmount1 * sliderValue / 100).toFixed(pool.token1.decimals);

      setAmount0(newAmount0);
      setAmount1(newAmount1);
    }
  }, [sliderValue, pool, isAdd]);

  const checkBalances = () => {
    if (!pool || !stxAddress) return true;

    const getBalance = (token: TokenInfo) => {
      if (token.symbol === 'STX') {
        return Number(balances.stx.balance) / 10 ** token.decimals;
      } else {
        return getBalanceByKey(getKeyByContractAddress(token.contractAddress)) / 10 ** token.decimals;
      }
    };

    const balance0 = getBalance(pool.token0);
    const balance1 = getBalance(pool.token1);
    return parseFloat(amount0) <= balance0 && parseFloat(amount1) <= balance1;
  };

  const handleAddLiquidity = useCallback(() => {
    if (!pool || !stxAddress) return;

    const postConditions: any = []
    if (pool.token0.symbol !== 'STX') {
      const amount0BigInt = BigInt(Math.floor(parseFloat(amount0) * 10 ** pool.token0.decimals));
      postConditions.push(Pc.principal(stxAddress).willSendLte(amount0BigInt).ft(pool.token0.contractAddress as any, pool.token0.tokenId as string) as any);
    } else {
      const amount0BigInt = BigInt(Math.floor(parseFloat(amount0) * 10 ** pool.token0.decimals));
      postConditions.push(Pc.principal(stxAddress).willSendLte(amount0BigInt).ustx() as any);
    }
    if (pool.token1.symbol !== 'STX') {
      const amount1BigInt = BigInt(Math.floor(parseFloat(amount1) * 10 ** pool.token1.decimals));
      postConditions.push(Pc.principal(stxAddress).willSendLte(amount1BigInt).ft(pool.token1.contractAddress as any, pool.token1.tokenId as string) as any);
    } else {
      const amount1BigInt = BigInt(Math.floor(parseFloat(amount1) * 10 ** pool.token1.decimals));
      postConditions.push(Pc.principal(stxAddress).willSendLte(amount1BigInt).ustx() as any);
    }

    openContractCall({
      contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
      contractName: "univ2-router",
      functionName: "add-liquidity",
      functionArgs: [
        uintCV(pool.id),
        contractPrincipalCV(pool.token0.contractAddress.split('.')[0], pool.token0.contractAddress.split('.')[1]),
        contractPrincipalCV(pool.token1.contractAddress.split('.')[0], pool.token1.contractAddress.split('.')[1]),
        contractPrincipalCV(pool.contractAddress.split('.')[0], pool.contractAddress.split('.')[1]),
        uintCV(BigInt(Math.floor(parseFloat(amount0) * 10 ** pool.token0.decimals))),
        uintCV(BigInt(Math.floor(parseFloat(amount1) * 10 ** pool.token1.decimals))),
        uintCV(1),
        uintCV(1)
      ],
      postConditionMode: PostConditionMode.Deny,
      postConditions,
      onFinish: (data) => {
        console.log('Transaction successful', data);
        onClose();
      },
      onCancel: () => {
        console.log('Transaction cancelled');
      }
    });
  }, [pool, amount0, amount1, stxAddress, openContractCall, onClose]);

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

  const hasEnoughBalance = checkBalances();

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
        {isAdd && (
          <div className="grid gap-2">
            <Label>Liquidity to add (%)</Label>
            <Slider
              value={[sliderValue]}
              onValueChange={(value) => setSliderValue(value[0])}
              max={100}
              step={1}
            />
          </div>
        )}
        <div className="grid items-center grid-cols-4 gap-4">
          <div className="flex justify-end">
            <Image
              src={pool.token0.image}
              alt={pool.token0.symbol}
              width={24}
              height={24}
              className="rounded-full"
            />
          </div>
          <div className="col-span-3">
            <div className="flex justify-between">
              <span>{parseFloat(amount0).toFixed(pool.token0.decimals)} {pool.token0.symbol}</span>
              <span className="text-sm text-gray-500">
                ${calculateUsdValue(amount0, pool.token0.price).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
        <div className="grid items-center grid-cols-4 gap-4">
          <div className="flex justify-end">
            <Image
              src={pool.token1.image}
              alt={pool.token1.symbol}
              width={24}
              height={24}
              className="rounded-full"
            />
          </div>
          <div className="col-span-3">
            <div className="flex justify-between">
              <span>{parseFloat(amount1).toFixed(pool.token1.decimals)} {pool.token1.symbol}</span>
              <span className="text-sm text-gray-500">
                ${calculateUsdValue(amount1, pool.token1.price).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
      <DialogFooter className="flex items-center justify-between">
        {isAdd && (
          <span className={`text-sm ${hasEnoughBalance ? 'text-green-500' : 'text-red-500'}`}>
            {hasEnoughBalance ? 'Sufficient balance' : 'Insufficient balance'}
          </span>
        )}
        <Button
          type="submit"
          onClick={isAdd ? handleAddLiquidity : handleRemoveLiquidity}
          disabled={isAdd && !hasEnoughBalance}
        >
          {isAdd ? 'Add Liquidity' : 'Remove Liquidity'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};