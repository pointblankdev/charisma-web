/* eslint-disable @typescript-eslint/restrict-plus-operands */
import {
  ExternalLink,
  Verified,
  MoreHorizontal,
  Plus,
  ArrowLeftRight,
  Minus,
  HelpCircle,
  InfoIcon
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@components/ui/dropdown-menu';
import { Button } from '@components/ui/button';
import { useRouter } from 'next/router';
import { AddLiquidityModal } from './modals/add-liquidity-modal';
import { RemoveLiquidityModal } from './modals/remove-liquidity-modal';
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
import { cn } from '@lib/utils';

const VERIFIED_ADDRESSES: Record<string, string> = {
  SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS: 'rozar.btc',
  SP1KMAA7TPZ5AZZ4W67X74MJNFKMN576604CWNBQS: 'mooningshark.btc',
  SPGYCP878RYFVT03ZT8TWGPKNYTSQB1578VVXHGE: 'kraqen.btc'
};

const calculatePoolMetrics = (events: any[], poolData: any) => {
  // Get LP Rebate percentage from metadata (e.g., 5 for 5%)
  const lpRebatePercent = Number(poolData.metadata.properties.lpRebatePercent) || 5;
  const feeRate = lpRebatePercent / 100; // Convert 5 to 0.05 for calculations

  if (!events?.length || !poolData.prices) {
    return {
      apy: 0,
      lpRebate: lpRebatePercent,
      totalFees: 0,
      vaultAge: '0 days',
      volume24h: 0,
      feesLast30Days: 0,
      tvl: 0
    };
  }

  // Helper to convert token amount to USD value
  const getTokenUsdValue = (amount: string, assetId: string): number => {
    const tokenContractId = assetId.split('::')[0];
    const tokenMetadata =
      tokenContractId === poolData.token0.contractId
        ? poolData.token0.metadata
        : tokenContractId === poolData.token1.contractId
        ? poolData.token1.metadata
        : null;

    if (!tokenMetadata) return 0;

    const price = poolData.prices[tokenContractId] || 0;
    const normalizedAmount = parseInt(amount) / Math.pow(10, tokenMetadata.decimals);
    return normalizedAmount * price;
  };

  // Calculate TVL
  const tvl =
    (poolData.poolData.reserve0 / Math.pow(10, poolData.token0.metadata.decimals)) *
      (poolData.prices[poolData.token0.contractId] || 0) +
    (poolData.poolData.reserve1 / Math.pow(10, poolData.token1.metadata.decimals)) *
      (poolData.prices[poolData.token1.contractId] || 0);

  // Calculate pool age
  const sortedEvents = [...events].sort((a, b) => a.block_time - b.block_time);
  const firstEvent = sortedEvents[0];
  const now = Math.floor(Date.now() / 1000);
  const poolAgeInDays = Math.ceil((now - firstEvent.block_time) / (24 * 60 * 60));

  // Calculate 24h volume
  const last24hTimestamp = now - 24 * 60 * 60;
  const volume24h = events
    .filter(event => event.block_time >= last24hTimestamp)
    .reduce((total, event) => {
      const transferEvents = event.events.filter(
        (e: { event_type: string; asset: { asset_event_type: string } }) =>
          e.event_type === 'fungible_token_asset' && e.asset.asset_event_type === 'transfer'
      );

      const eventVolume = transferEvents.reduce(
        (sum: number, e: { asset: { amount: string; asset_id: string } }) => {
          const usdValue = getTokenUsdValue(e.asset.amount, e.asset.asset_id);
          return sum + usdValue;
        },
        0
      );

      return total + eventVolume;
    }, 0);

  // Calculate 30-day fees
  const last30DaysTimestamp = now - 30 * 24 * 60 * 60;
  const feesLast30Days = events
    .filter(event => event.block_time >= last30DaysTimestamp)
    .reduce((total, event) => {
      const transferEvents = event.events.filter(
        (e: { event_type: string; asset: { asset_event_type: string } }) =>
          e.event_type === 'fungible_token_asset' && e.asset.asset_event_type === 'transfer'
      );

      const eventFees = transferEvents.reduce(
        (sum: number, e: { asset: { amount: string; asset_id: string } }) => {
          const usdValue = getTokenUsdValue(e.asset.amount, e.asset.asset_id);
          return sum + usdValue * feeRate;
        },
        0
      );

      return total + eventFees;
    }, 0);

  // Calculate total historical fees
  const totalFees = events.reduce((total, event) => {
    const transferEvents = event.events.filter(
      (e: { event_type: string; asset: { asset_event_type: string } }) =>
        e.event_type === 'fungible_token_asset' && e.asset.asset_event_type === 'transfer'
    );

    const eventFees = transferEvents.reduce(
      (sum: number, e: { asset: { amount: string; asset_id: string } }) => {
        const usdValue = getTokenUsdValue(e.asset.amount, e.asset.asset_id);
        return sum + usdValue * feeRate;
      },
      0
    );

    return total + eventFees;
  }, 0);

  // Calculate APY based on 30-day fee rate
  const annualizedFees = (feesLast30Days / 30) * 365;
  const apy = tvl > 0 ? (annualizedFees / tvl) * 100 : 0;

  return {
    apy: parseFloat(apy.toFixed(2)),
    lpRebate: lpRebatePercent,
    totalFees,
    vaultAge: `${poolAgeInDays} days`,
    volume24h,
    feesLast30Days,
    tvl
  };
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
      <div
        className={cn(
          'z-10 rounded-full border-background',
          token0.metadata.symbol === 'DMG' ? 'border-0' : 'border-2'
        )}
      >
        <Image
          src={token0.metadata.image}
          alt={token0.metadata.symbol}
          width={24}
          height={24}
          className="rounded-full"
        />
      </div>
      <div
        className={cn(
          'rounded-full border-background',
          token1.metadata.symbol === 'DMG' ? 'border-0' : 'border-2'
        )}
      >
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

  // Helper function to create post condition based on token type
  const createPostCondition = (token: any, amount: number, sender = stxAddress) => {
    if (token.contractId === '.stx') {
      return Pc.principal(sender).willSendEq(amount).ustx();
    } else {
      return Pc.principal(sender)
        .willSendEq(amount)
        .ft(token.contractId, token.metadata.identifier);
    }
  };

  // Helper function to get quote for transaction
  const getQuote = async (pool: any, amount: number, operationType: '02' | '03') => {
    const response = await fetchCallReadOnlyFunction({
      contractAddress: pool.contractId.split('.')[0],
      contractName: pool.contractId.split('.')[1],
      functionName: 'quote',
      functionArgs: [uintCV(amount), optionalCVOf(bufferCV(hexToBytes(operationType)))],
      senderAddress: stxAddress
    });
    return cvToValue(response).value;
  };

  // Helper function to execute contract call
  const executePoolOperation = ({
    pool,
    amount,
    operationType,
    postConditions,
    operationName
  }: {
    pool: any;
    amount: number;
    operationType: '02' | '03';
    postConditions: any[];
    operationName: string;
  }) => {
    doContractCall({
      network: network,
      contractAddress: pool.contractId.split('.')[0],
      contractName: pool.contractId.split('.')[1],
      functionName: 'execute',
      postConditionMode: PostConditionMode.Deny,
      postConditions,
      functionArgs: [uintCV(amount), optionalCVOf(bufferCV(hexToBytes(operationType)))],
      onFinish: data => {
        console.log(`${operationName} transaction successful`, data);
      },
      onCancel: () => {
        console.log(`${operationName} transaction cancelled`);
      }
    });
  };

  const handleRemoveLiquidityClick = async (pool: any, amount: number) => {
    const amountIn = Math.floor(amount);
    const quote = await getQuote(pool, amountIn, '03');

    // Create post conditions for the tokens being received and the LP token being burned
    const postConditions = [
      createPostCondition(pool, amountIn), // LP token
      createPostCondition(pool.token0, quote.dx.value, pool.contractId),
      createPostCondition(pool.token1, quote.dy.value, pool.contractId)
    ];

    executePoolOperation({
      pool,
      amount: amountIn,
      operationType: '03',
      postConditions,
      operationName: 'Remove liquidity'
    });
  };

  const handleAddLiquidityClick = async (pool: any, amount: number) => {
    const amountIn = Math.floor(amount);
    const quote = await getQuote(pool, amountIn, '02');

    // Create post conditions for both tokens being added
    const postConditions = [
      createPostCondition(pool.token0, quote.dx.value),
      createPostCondition(pool.token1, quote.dy.value)
    ];

    executePoolOperation({
      pool,
      amount: amountIn,
      operationType: '02',
      postConditions,
      operationName: 'Add liquidity'
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
            <DropdownMenuItem onSelect={e => e.preventDefault()} className="cursor-pointer">
              <Plus className="w-4 h-4 mr-2" />
              Start Earning (Deposit)
            </DropdownMenuItem>
          }
        />
        <RemoveLiquidityModal
          pool={pool}
          tokenPrices={prices}
          onRemoveLiquidity={handleRemoveLiquidityClick}
          trigger={
            <DropdownMenuItem onSelect={e => e.preventDefault()} className="cursor-pointer">
              <Minus className="w-4 h-4 mr-2" />
              Stop Earning (Withdraw)
            </DropdownMenuItem>
          }
        />
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push(`/swap`)} className="cursor-pointer">
          <ArrowLeftRight className="w-4 h-4 mr-2" /> Swap Tokens
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const APYDisplay = ({ pool, prices }: { pool: any; prices: Record<string, number> }) => {
  const poolWithPrices = { ...pool, prices };
  const metrics = calculatePoolMetrics(pool.events, poolWithPrices);

  console.log(metrics);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="w-full">
          <div className="mt-1 leading-snug">
            <div className="text-lg font-medium text-green-400 whitespace-nowrap">
              {metrics.apy}% APY
            </div>
            <div className="text-xs text-gray-400">
              30d fees: ${numeral(metrics.feesLast30Days).format('0,0.00')}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="w-80">
          <div className="p-1 space-y-3">
            <div className="font-medium">APY Breakdown</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>LP Fee Rate:</span>
                <span className="font-medium">{metrics.lpRebate}%</span>
              </div>
              <div className="flex justify-between">
                <span>24h Volume:</span>
                <span className="font-medium">${numeral(metrics.volume24h).format('0,0')}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Fees Earned:</span>
                <span className="font-medium">${numeral(metrics.totalFees).format('0,0.00')}</span>
              </div>
              <div className="flex justify-between">
                <span>30-day Fees:</span>
                <span className="font-medium">
                  ${numeral(metrics.feesLast30Days).format('0,0.00')}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Vault Age:</span>
                <span className="font-medium">{metrics.vaultAge}</span>
              </div>
              <div className="mt-2 text-xs text-gray-400">
                APY is calculated based on recent trading volume, fees collected, and total
                liquidity. Past performance does not guarantee future returns.
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
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
          width={44}
          height={44}
          className="object-cover mt-0.5 mr-3 rounded-md"
        />
        <div>
          <div className="flex items-center space-x-1 leading-snug">
            <div className="text-lg leading-snug">{pool.metadata.name}</div>
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
        <APYDisplay pool={pool} prices={prices} />
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
                <h1 className="text-2xl font-bold text-white/95">Liquidity Vaults</h1>
                <div className="text-sm text-muted-foreground">
                  Decentralized Liquidity Vaults (DLV) are a more secure form of liquidity pools.
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
                  <th className="px-4 py-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="flex items-center">
                          Vault <HelpCircle className="ml-1 size-4" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-64">
                            The liquidity vault name, description, and identity. Each vault is a
                            unique smart contract that manages a specific token pair.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </th>
                  <th className="px-4 py-2" style={{ justifyItems: 'center' }}>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="flex items-center">
                          Yield <HelpCircle className="ml-1 size-4" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-64">
                            Estimated annual percentage yield for liquidity providers. Hover over
                            the APY value to see a detailed breakdown of factors including trading
                            volume, fees, and vault history.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </th>
                  <th className="px-4 py-2 text-center" style={{ justifyItems: 'center' }}>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="flex items-center justify-center">
                          Pair <HelpCircle className="ml-1 size-4" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-64">
                            The two tokens that can be exchanged in this vault. You can provide
                            liquidity for this token pair to earn fees from trades.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </th>
                  <th className="px-4 py-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="flex items-center">
                          Liquidity <HelpCircle className="ml-1 size-4" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-64">
                            The total value locked (TVL) in this vault, calculated from the current
                            market prices of both tokens. Shows the total amount of liquidity
                            available for trading.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </th>
                  <th className="px-4 py-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="flex items-center">
                          Deployer <HelpCircle className="ml-1 size-4" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-64">
                            The address that deployed this vault contract. Verified deployers are
                            marked with a blue checkmark.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </th>
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
