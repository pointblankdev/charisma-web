import { ExternalLink, Verified, MoreHorizontal, Plus, ArrowLeftRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@components/ui/dropdown-menu';
import { Button } from '@components/ui/button';
import { useRouter } from 'next/router';
import { AddLiquidityModal } from './modals/add-liquidity-modal';
import { useConnect } from '@stacks/connect-react';
import { useGlobalState } from '@lib/hooks/global-state-context';
import { network } from '@components/stacks-session/connect';
import {
  bufferCV,
  cvToValue,
  fetchCallReadOnlyFunction,
  optionalCVOf,
  Pc,
  PostConditionMode,
  uintCV
} from '@stacks/transactions';
import { hexToBytes } from '@stacks/common';
import numeral from 'numeral';

const VERIFIED_ADDRESSES: Record<string, string> = {
  SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS: 'rozar.btc',
  SP1KMAA7TPZ5AZZ4W67X74MJNFKMN576604CWNBQS: 'mooningshark.btc',
  SPGYCP878RYFVT03ZT8TWGPKNYTSQB1578VVXHGE: 'kraqen.btc'
};

const AddressDisplay = ({ address }: { address: string }) => {
  const displayText =
    VERIFIED_ADDRESSES[address] || `${address.slice(0, 6)}...${address.slice(-4)}`;
  const isVerified = address in VERIFIED_ADDRESSES;

  return (
    <div className="flex items-center space-x-2">
      <div>{displayText}</div>
      {isVerified && <Verified className="mt-1 mb-1 text-blue-500 size-5" />}
    </div>
  );
};

const TokenPairDisplay = ({ token0, token1 }: { token0: any; token1: any }) => (
  <div className="flex flex-col items-center justify-start">
    <div className="flex items-center -space-x-2">
      <div className="z-10 border-2 rounded-full border-background">
        <Image
          src={token0.metadata.image}
          alt={token0.metadata.symbol}
          width={24}
          height={24}
          className="rounded-full"
        />
      </div>
      <div className="border-2 rounded-full border-background">
        <Image
          src={token1.metadata.image}
          alt={token1.metadata.symbol}
          width={24}
          height={24}
          className="rounded-full"
        />
      </div>
    </div>
    <span className="whitespace-nowrap">
      {token0.metadata.symbol}-{token1.metadata.symbol}
    </span>
  </div>
);

const TVLDisplay = ({ pool, prices }: { pool: any; prices: Record<string, number> }) => {
  const tvl = useMemo(() => {
    const token0Value =
      (pool.poolData.reserve0 / 10 ** pool.token0.metadata.decimals) *
      (prices[pool.token0.contractId] || 0);
    const token1Value =
      (pool.poolData.reserve1 / 10 ** pool.token1.metadata.decimals) *
      (prices[pool.token1.contractId] || 0);
    return token0Value + token1Value;
  }, [pool, prices]);

  return (
    <div className="space-y-1">
      <div className="text-lg font-medium">${numeral(tvl).format('0,0.00')}</div>
      <div className="text-xs text-gray-400">
        {numeral(pool.poolData.reserve0 / 10 ** pool.token0.metadata.decimals).format('0,0.00')}{' '}
        {pool.token0.metadata.symbol}
        {' + '}
        {numeral(pool.poolData.reserve1 / 10 ** pool.token1.metadata.decimals).format(
          '0,0.00'
        )}{' '}
        {pool.token1.metadata.symbol}
      </div>
    </div>
  );
};

const ActionMenu = ({ pool, prices }: { pool: any; prices: Record<string, number> }) => {
  const router = useRouter();
  const { doContractCall } = useConnect();
  const { stxAddress } = useGlobalState();

  const handleAddLiquidityClick = async (pool: any, amount: number) => {
    const amountIn = Math.floor(amount);
    const response = await fetchCallReadOnlyFunction({
      contractAddress: pool.contractId.split('.')[0],
      contractName: pool.contractId.split('.')[1],
      functionName: 'quote',
      functionArgs: [uintCV(amountIn), optionalCVOf(bufferCV(hexToBytes('02')))],
      senderAddress: stxAddress
    });
    const result = cvToValue(response).value;

    // Helper function to create post condition based on token type
    const createPostCondition = (token: any, amount: number) => {
      if (token.contractId === '.stx') {
        return Pc.principal(stxAddress).willSendEq(amount).ustx();
      } else {
        return Pc.principal(stxAddress)
          .willSendEq(amount)
          .ft(token.contractId, token.metadata.identifier);
      }
    };

    // Create post conditions for both tokens
    const postConditions = [
      createPostCondition(pool.token0, result.dx.value),
      createPostCondition(pool.token1, result.dy.value)
    ];

    doContractCall({
      network: network,
      contractAddress: pool.contractId.split('.')[0],
      contractName: pool.contractId.split('.')[1],
      functionName: 'execute',
      postConditionMode: PostConditionMode.Deny,
      postConditions,
      functionArgs: [uintCV(amountIn), optionalCVOf(bufferCV(hexToBytes('02')))],
      onFinish: data => {
        console.log('Add liquidity transaction successful', data);
      },
      onCancel: () => {
        console.log('Add liquidity transaction cancelled');
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <AddLiquidityModal
          pool={pool}
          tokenPrices={prices}
          onAddLiquidity={handleAddLiquidityClick}
          trigger={
            <DropdownMenuItem onSelect={e => e.preventDefault()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Liquidity
            </DropdownMenuItem>
          }
        />
        <DropdownMenuItem onClick={() => router.push(`/swap`)}>
          <ArrowLeftRight className="w-4 h-4 mr-2" /> Swap Tokens
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const PoolRow = ({ pool, prices }: { pool: any; prices: Record<string, number> }) => {
  const deployerAddress = pool.contractId.split('.')[0];

  return (
    <tr className="border-t border-gray-700/50">
      <td className="flex items-start px-4 py-4 text-white">
        <Image
          src={pool.metadata.image}
          alt={pool.metadata.name}
          width={48}
          height={48}
          className="object-cover mr-3 rounded-md"
        />
        <div>
          <div className="flex items-center space-x-1 leading-tight">
            <div className="text-xl leading-none">{pool.metadata.name}</div>
            <Link
              href={`https://explorer.stxer.xyz/txid/${pool.contractId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-1"
            >
              <ExternalLink size={14} />
            </Link>
          </div>
          <div className="text-sm text-gray-400">{pool.metadata.description}</div>
        </div>
      </td>
      <td className="px-4 py-4 text-white">
        <TokenPairDisplay token0={pool.token0} token1={pool.token1} />
      </td>
      <td className="px-4 py-4 text-white">
        <TVLDisplay pool={pool} prices={prices} />
      </td>
      <td className="px-4 py-4 space-x-2 text-lg leading-snug text-white">
        <AddressDisplay address={deployerAddress} />
      </td>
      <td className="px-4 py-4 text-right">
        <ActionMenu pool={pool} prices={prices} />
      </td>
    </tr>
  );
};

export const DexterityInterface = ({
  data,
  prices
}: {
  data: any;
  prices: Record<string, number>;
}) => {
  const [sortOrder] = useState<'asc' | 'desc'>('desc');

  const sortedPools = useMemo(() => {
    return [...data.pools].sort((a, b) => {
      const nameA = a.metadata.name.toUpperCase();
      const nameB = b.metadata.name.toUpperCase();
      return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });
  }, [data.pools, sortOrder]);

  const totalTVL = useMemo(() => {
    return sortedPools.reduce((total, pool) => {
      const token0Value =
        (pool.poolData.reserve0 / 10 ** pool.token0.metadata.decimals) *
        (prices[pool.token0.contractId] || 0);
      const token1Value =
        (pool.poolData.reserve1 / 10 ** pool.token1.metadata.decimals) *
        (prices[pool.token1.contractId] || 0);
      return Number(total) + Number(token0Value) + Number(token1Value);
    }, 0);
  }, [sortedPools, prices]);

  return (
    <div className="sm:mx-auto sm:px-4">
      <div className="mt-6">
        <div className="relative sm:px-6 pb-4 pt-5 sm:rounded-lg bg-[var(--sidebar)] border border-[var(--accents-7)] overflow-hidden">
          <div className="px-4 mb-4 sm:px-0">
            <div className="flex items-baseline justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white/95">Dexterity Pools</h1>
                <div className="text-sm text-muted-foreground">
                  Deploy your own liquidity pool and earn trading fees on every swap.
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white/95">
                  ${numeral(totalTVL).format('0,0.00')}
                </div>
                <div className="text-sm text-muted-foreground">Total Value Locked</div>
              </div>
            </div>
          </div>

          <div className="px-4 overflow-x-auto sm:px-0">
            <table className="w-full table-auto">
              <thead>
                <tr className="text-left text-gray-400">
                  <th className="px-4 py-2"></th>
                  <th className="px-4 py-2 text-center">Pair</th>
                  <th className="px-4 py-2">Liquidity</th>
                  <th className="px-4 py-2">Deployer</th>
                  <th className="px-4 py-2 text-right"></th>
                </tr>
              </thead>
              <tbody>
                {sortedPools.map((pool: any, index: number) => (
                  <PoolRow key={index} pool={pool} prices={prices} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DexterityInterface;
