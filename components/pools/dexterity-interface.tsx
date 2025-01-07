/* eslint-disable @typescript-eslint/restrict-plus-operands */
import {
  ExternalLink,
  Verified,
  MoreHorizontal,
  Plus,
  ArrowLeftRight,
  Minus,
  HelpCircle,
  InfoIcon,
  ArrowUpDown,
  Lightbulb,
  ZapIcon,
  Shield,
  ShieldHalf,
  UsersIcon,
  UsersRound,
  WavesIcon,
  Vault
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState, useEffect } from 'react';
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
import { LPToken } from 'dexterity-sdk';

const VERIFIED_ADDRESSES: Record<string, string> = {
  SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS: 'rozar.btc',
  SP1KMAA7TPZ5AZZ4W67X74MJNFKMN576604CWNBQS: 'mooningshark.btc',
  SPGYCP878RYFVT03ZT8TWGPKNYTSQB1578VVXHGE: 'kraqen.btc',
  SP3T1M18J3VX038KSYPP5G450WVWWG9F9G6GAZA4Q: 'vinzomniac.btc'
};

const calculatePoolMetrics = (events: any[], poolData: any) => {
  // Get LP Rebate percentage from metadata (e.g., 5 for 5%)
  const lpRebatePercent = Number(poolData.fee / 10000) || 5;
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
    if (!assetId) return 0;

    const tokenContractId = assetId.split('::')[0];
    const tokenMetadata = poolData.liquidity[0];

    if (!tokenMetadata) return 0;

    const price = poolData.prices[tokenContractId] || 0;
    const normalizedAmount = parseInt(amount) / Math.pow(10, tokenMetadata.decimals);
    return normalizedAmount * price;
  };

  // Calculate TVL
  const tvl =
    (poolData.liquidity[0].reserves / Math.pow(10, poolData.liquidity[0].decimals)) *
    (poolData.prices[poolData.liquidity[0].contractId] || 0) +
    (poolData.liquidity[1].reserves / Math.pow(10, poolData.liquidity[1].decimals)) *
    (poolData.prices[poolData.liquidity[1].contractId] || 0);

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
      const allTransferEvents = event.events.every(
        (e: { event_type: string; asset: { asset_event_type: string } }) =>
          e.event_type === 'stx_asset' || e.event_type === 'fungible_token_asset'
      );

      if (!allTransferEvents) return total;

      const transferEvents = event.events.filter(
        (e: { event_type: string; asset: { asset_event_type: string } }) =>
          e.asset.asset_event_type === 'transfer'
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

const TokenPairDisplay = ({ liquidity }: { liquidity: any[] }) => (
  <div className="flex flex-col items-center justify-start">
    <div className="flex items-center -space-x-2">
      <div
        className={cn(
          'z-10 rounded-full border-background',
          liquidity[0].symbol === 'DMG' ? 'border-0' : 'border-2'
        )}
      >
        <Image
          src={liquidity[0].image}
          alt={liquidity[0].symbol}
          width={24}
          height={24}
          className="rounded-full"
        />
      </div>
      <div
        className={cn(
          'rounded-full border-background',
          liquidity[1].symbol === 'DMG' ? 'border-0' : 'border-2'
        )}
      >
        <Image
          src={liquidity[1].image}
          alt={liquidity[1].symbol}
          width={24}
          height={24}
          className="rounded-full"
        />
      </div>
    </div>
    <span className="whitespace-nowrap">
      {liquidity[0].symbol}-{liquidity[1].symbol}
    </span>
  </div>
);

const TVLDisplay = ({ pool, prices }: { pool: any; prices: Record<string, number> }) => {
  const tvl = useMemo(() => {
    const token0Value =
      (pool.liquidity[0].reserves / 10 ** pool.liquidity[0].decimals) *
      (prices[pool.liquidity[0].contractId] || 0);
    const token1Value =
      (pool.liquidity[1].reserves / 10 ** pool.liquidity[1].decimals) *
      (prices[pool.liquidity[1].contractId] || 0);
    return token0Value + token1Value;
  }, [pool, prices]);

  return (
    <div className="space-y-1">
      <div className="text-lg font-medium">${numeral(tvl).format('0,0.00')}</div>
      <div className="text-xs text-gray-400">
        {numeral(pool.liquidity[0].reserves / 10 ** pool.liquidity[0].decimals).format('0,0.00')}{' '}
        {pool.liquidity[0].symbol}
        {' + '}
        {numeral(pool.liquidity[1].reserves / 10 ** pool.liquidity[1].decimals).format(
          '0,0.00'
        )}{' '}
        {pool.liquidity[1].symbol}
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
      return Pc.principal(sender).willSendEq(amount).ft(token.contractId, token.identifier);
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
      createPostCondition(pool.liquidity[0], quote.dx.value, pool.contractId),
      createPostCondition(pool.liquidity[1], quote.dy.value, pool.contractId)
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
      createPostCondition(pool.liquidity[0], quote.dx.value),
      createPostCondition(pool.liquidity[1], quote.dy.value)
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

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="w-full">
          <div className="mt-1 leading-snug">
            <div className="flex justify-center items-center text-lg font-medium text-green-400 whitespace-nowrap">
              {metrics.apy.toFixed(2)}% APY
            </div>
            <div className="text-xs text-gray-400 whitespace-nowrap">
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
          src={pool.image}
          alt={pool.name}
          width={44}
          height={44}
          className="object-cover mt-0.5 mr-3 rounded-md"
        />
        <div>
          <div className="flex items-center space-x-1 leading-snug">
            <div className="text-lg leading-snug">{pool.name}</div>
            <Link
              href={`https://explorer.stxer.xyz/txid/${pool.contractId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-1"
            >
              <ExternalLink size={14} />
            </Link>
          </div>
          <div className="text-sm text-gray-400">{pool.description}</div>
        </div>
      </td>
      <td className="px-4 py-4 text-white">
        <APYDisplay pool={pool} prices={prices} />
      </td>
      <td className="px-4 py-4 text-white">
        <TokenPairDisplay liquidity={pool.liquidity} />
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

const DexterityInterface = ({ data, prices }: { data: any; prices: Record<string, number> }) => {
  const [sortField, setSortField] = useState('tvl');
  const [sortOrder, setSortOrder] = useState('desc');
  const [mounted, setMounted] = useState(false);

  const sortedPools = useMemo(() => {
    const calculateTVL = (pool: LPToken) => {
      const token0Value =
        (pool.liquidity[0].reserves / 10 ** pool.liquidity[0].decimals) *
        (prices[pool.liquidity[0].contractId] || 0);
      const token1Value =
        (pool.liquidity[1].reserves / 10 ** pool.liquidity[1].decimals) *
        (prices[pool.liquidity[1].contractId] || 0);
      return Number(token0Value) + Number(token1Value);
    };

    return data.pools.sort((a: any, b: any) => {
      if (sortField === 'apy') {
        const metricsA = calculatePoolMetrics(a.events, { ...a, prices });
        const metricsB = calculatePoolMetrics(b.events, { ...b, prices });
        return sortOrder === 'asc' ? metricsA.apy - metricsB.apy : metricsB.apy - metricsA.apy;
      } else if (sortField === 'tvl') {
        const tvlA = calculateTVL(a);
        const tvlB = calculateTVL(b);
        return sortOrder === 'asc' ? tvlA - tvlB : tvlB - tvlA;
      }

      const nameA = a.name.toUpperCase();
      const nameB = b.name.toUpperCase();
      return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });
  }, [data.pools, sortField, sortOrder, prices]);

  const totalTVL = useMemo(() => {
    return sortedPools.reduce((total: any, pool: any) => {
      const token0Value =
        (pool.liquidity[0].reserves / 10 ** pool.liquidity[0].decimals) *
        (prices[pool.liquidity[0].contractId] || 0);
      const token1Value =
        (pool.liquidity[1].reserves / 10 ** pool.liquidity[1].decimals) *
        (prices[pool.liquidity[1].contractId] || 0);
      return Number(total) + Number(token0Value) + Number(token1Value);
    }, 0);
  }, [sortedPools, prices]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc'); // Default to descending when changing fields
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="sm:mx-auto sm:px-4">
      <div className="mt-6">
        <div className="relative sm:px-6 pb-4 pt-5 sm:rounded-lg bg-[var(--sidebar)] border border-[var(--accents-7)] overflow-hidden">
          <div className="px-4 mb-4 sm:px-0">
            <div className="flex items-baseline justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white/95">Liquidity Vaults</h1>
                <div className="flex items-center text-sm text-muted-foreground">
                  Liquidity vaults are a more secure and decentralized form of liquidity pools.
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href="https://github.com/stacksgov/sips/pull/204"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-1"
                        >
                          <InfoIcon className="w-4 h-4 text-gray-400 hover:text-gray-200" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent
                        side="bottom"
                        className="max-w-lg p-4 text-white bg-gray-800 border-none rounded-lg shadow-lg"
                      >
                        <div className="space-y-4 leading-snug">
                          <div className="flex items-center space-x-2">
                            <Vault className="w-5 h-5 text-blue-400" />
                            <p className="text-lg font-semibold">Liquidity Vaults</p>
                          </div>
                          <p className="text-white/80">
                            Liquidity vaults are smart contracts that manage token pairs for
                            trading. They are secure, decentralized, and simple enough that anyone
                            can create one.
                          </p>
                          <div className="flex items-center space-x-2">
                            <ShieldHalf className="w-5 h-5 text-green-400" />
                            <p className="font-semibold">Secure and Decentralized</p>
                          </div>
                          <p className="text-white/80">
                            Each vault is independent, so issues in one vault don't affect others.
                            There are no shared admin keys or upgrade mechanisms.
                          </p>
                          <div className="flex items-center space-x-2">
                            <ZapIcon className="w-5 h-5 text-yellow-400" />
                            <p className="font-semibold">Key Benefits</p>
                          </div>
                          <ul className="space-y-2 list-disc list-inside text-white/80">
                            <li>
                              <span className="font-semibold text-white/90">
                                Anyone Can Create:
                              </span>{' '}
                              Deploy your own vault using the standard interface.
                            </li>
                            <li>
                              <span className="font-semibold text-white/90">Efficient:</span>{' '}
                              Standardized controls with customizable settings and flexible fees.
                            </li>
                            <li>
                              <span className="font-semibold text-white/90">Open-Source:</span>{' '}
                              Easily link pools together and add new types.
                            </li>
                          </ul>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
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
                {mounted ? (
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
                    <th className="px-4 py-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="flex">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSort('apy')}
                              className={`flex self-center items-center space-x-1 ${sortField === 'apy' ? 'text-white' : ''
                                }`}
                            >
                              Yield <ArrowUpDown className="ml-1 size-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="w-64">
                              Estimated annual percentage yield for liquidity providers. Click to
                              sort.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </th>
                    <th className="px-4 py-2 text-center items-center">
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
                          <TooltipTrigger>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSort('tvl')}
                              className={`flex items-center space-x-1 ${sortField === 'tvl' ? 'text-white' : ''
                                }`}
                            >
                              Liquidity <ArrowUpDown className="ml-1 size-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="w-64">
                              The total value locked (TVL) in this vault. Click to sort.
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
                ) : (
                  <tr className="text-left text-gray-400">
                    <th className="px-4 py-2">Vault</th>
                    <th className="px-4 py-2">Yield</th>
                    <th className="px-4 py-2 text-center">Pair</th>
                    <th className="px-4 py-2">Liquidity</th>
                    <th className="px-4 py-2">Deployer</th>
                    <th className="px-4 py-2 text-right"></th>
                  </tr>
                )}
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
