import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@components/ui/button';
import {
  Plus,
  Minus,
  ShoppingCart,
  Coins,
  ExternalLink,
  Info,
  ArrowRightLeftIcon,
  HandCoinsIcon,
  ZapIcon,
  Zap
} from 'lucide-react';
import numeral from 'numeral';
import Link from 'next/link';
import { Dialog } from '@components/ui/dialog';
import { cn } from '@lib/utils';
import { useConnect } from '@stacks/connect-react';
import { useGlobalState } from '@lib/hooks/global-state-context';
import { network } from '@components/stacks-session/connect';
import { boolCV, Pc, PostConditionMode, standardPrincipalCV, uintCV } from '@stacks/transactions';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip';
import useWallet from '@lib/hooks/wallet-balance-provider';
import DexterityControls from './dexterity-controls';

export interface Pool {
  contractId: string;
  audit: any;
  metadata: {
    name: string;
    symbol: string;
    image?: string;
    images?: any;
    decimals: number;
    verified: boolean;
  };
  lpInfo: {
    dex: string;
    token0: string;
    token1: string;
  };
  token0: {
    symbol: string;
    isLpToken?: boolean;
    contractId: string;
    audit: any;
    metadata: {
      symbol: string;
      image?: string;
      images?: any;
      decimals: number;
    };
  };
  token1: {
    symbol: string;
    isLpToken?: boolean;
    contractId: string;
    audit: any;
    metadata: {
      symbol: string;
      image?: string;
      images?: any;
      decimals: number;
    };
  };
  reserves: {
    token0: number;
    token1: number;
  };
  poolData: {
    id: number;
    reserve0: number;
    reserve1: number;
    totalSupply: number;
  };
  tvl: number;
}

// Updated TVL calculation functions
export const calculatePoolTVL = (pool: Pool, tokenPrices: { [key: string]: number }) => {
  const token0Value =
    (pool.poolData.reserve0 / 10 ** pool.token0.metadata.decimals) *
      tokenPrices[pool.token0.contractId] || 0;

  const token1Value =
    (pool.poolData.reserve1 / 10 ** pool.token1.metadata.decimals) *
      tokenPrices[pool.token1.contractId] || 0;

  return token0Value + token1Value;
};

export const calculateTotalTVL = (pools: Pool[], tokenPrices: { [key: string]: number }) => {
  return pools.reduce((sum, pool) => {
    const poolTVL = calculatePoolTVL(pool, tokenPrices);
    return sum + poolTVL;
  }, 0);
};

// Updated formatting functions
export const formatUSD = (value: number) => {
  if (value >= 1_000_000) {
    return numeral(value).format('$0.00a');
  }
  return numeral(value).format('$0,0.00');
};

export const formatPoolTVL = (pool: Pool, tokenPrices: { [key: string]: number }) => {
  const tvl = calculatePoolTVL(pool, tokenPrices);
  return formatUSD(tvl);
};

export const formatReserveAmount = (amount: number, decimals: number) => {
  return numeral(amount / 10 ** decimals).format('0');
};

export const formatReserveValue = (amount: number, decimals: number, price: number) => {
  return numeral((amount / 10 ** decimals) * price).format('$0,0.0a');
};

export const isStxChaPool = (pool: Pool) => {
  return pool.token0.symbol === 'STX' && pool.token1.symbol === 'CHA';
};

const isCommunityPool = (pool: Pool) => {
  return pool.metadata.name.includes('Community') || pool.lpInfo.dex === 'DEXTERITY';
};

// Component: Pool Definition Cell
export const PoolDefinition = ({ pool }: { pool: Pool }) => {
  const handleImgError = () => {
    setImgFail(true);
    setImgSrc('/dmg-logo.png');
  };
  const [imgFail, setImgFail] = useState(false);
  const [imgSrc, setImgSrc] = useState(pool.metadata?.images?.logo || pool.metadata?.image);
  return (
    <div className="flex items-center mr-4">
      {imgSrc ? (
        <Image
          src={imgSrc}
          alt={pool.token1.metadata.symbol || 'Base Token 0'}
          width={240}
          height={240}
          className={cn(
            'w-8 mr-2',
            isCommunityPool(pool) ? 'rounded-md' : 'rounded-full',
            imgFail ? 'blur' : ''
          )}
          blurDataURL="/dmg-logo.png" // Shows while loading and on error
          placeholder="blur"
          onError={() => {
            handleImgError();
          }}
        />
      ) : (
        <Coins className="w-8 h-8 mr-2" />
      )}
      <div className="leading-none">
        <div className="flex space-x-0.5 items-center">
          <span className="text-lg text-white truncate" style={{ overflow: 'visible' }}>
            {pool.metadata?.name}
          </span>
          <a
            href={`https://explorer.hiro.so/txid/${pool.contractId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center p-1 transition-colors text-muted-foreground hover:text-white"
          >
            <ExternalLink className="w-4 h-4 pt-0.5" />
          </a>
        </div>
        <div className="text-sm text-muted-foreground">{pool.metadata?.symbol}</div>
      </div>
    </div>
  );
};

// Component: Pool Composition
export const PoolComposition = ({ pool }: { pool: Pool }) => (
  <div className="flex items-center mr-4">
    <div className="space-y-1 leading-none">
      <div className="flex items-center">
        {pool.token0.metadata.image ? (
          <Image
            src={pool.token0.metadata.image}
            alt={pool.token0.metadata.symbol || 'Base Token 0'}
            width={240}
            height={240}
            className="w-6 mr-2 rounded-full"
            blurDataURL="/dmg-logo.png" // Shows while loading and on error
            placeholder="blur"
          />
        ) : (
          <Coins className="mr-2" />
        )}
        <span className="mr-0.5">{pool.token0.metadata.symbol}</span>
        <a
          href={`https://explorer.hiro.so/txid/${pool.token0.contractId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center p-1 transition-colors text-muted-foreground hover:text-white"
        >
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
      <div className="flex items-center">
        {pool.token1.metadata.image ? (
          <Image
            src={pool.token1.metadata.image}
            alt={pool.token1.metadata.symbol || 'Base Token 1'}
            width={240}
            height={240}
            className="w-6 mr-2 rounded-full"
          />
        ) : (
          <Coins className="mr-2" />
        )}
        <span>{pool.token1.metadata.symbol}</span>
        <a
          href={`https://explorer.hiro.so/txid/${pool.token1.contractId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center p-1 transition-colors text-muted-foreground hover:text-white"
        >
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  </div>
);

export const PoolFees = ({ pool }: any) => {
  const poolData = pool.poolData;
  // Calculate swap fee percentage (e.g., 0.5% for 995/1000)
  const calculateSwapFeePercent = (fee: any) => {
    if (!fee || !fee.numerator || !fee.denominator) return 0;
    return ((1 - fee.numerator / fee.denominator) * 100).toFixed(2);
  };

  // Calculate protocol and share fees as percentage of swap fee
  const calculateSecondaryFee = (swapFeePercent: any, fee: any) => {
    if (!fee || !fee.numerator || !fee.denominator) return 0;
    const portion = fee.numerator / fee.denominator;
    return (swapFeePercent * portion).toFixed(2);
  };

  const swapFeePercent = calculateSwapFeePercent(poolData.swapFee);
  const protocolFeePercent = calculateSecondaryFee(swapFeePercent, poolData.protocolFee);
  const shareFeePercent = calculateSecondaryFee(swapFeePercent, poolData.shareFee);
  const lpFeePercent = (
    Number(swapFeePercent) -
    Number(protocolFeePercent) -
    Number(shareFeePercent)
  ).toFixed(2);

  return (
    <div className="flex flex-col space-y-1">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="flex items-center space-x-1">
            <span className="text-md text-muted-foreground">{swapFeePercent}%</span>
            <HandCoinsIcon className="w-4 h-4 mt-0.5 text-muted-foreground/70" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <div className="space-y-2">
              <p className="text-sm">Fee Breakdown:</p>
              <div className="space-y-1 text-xs">
                <p>Total Swap Fee: {swapFeePercent}%</p>
                <div className="pl-2 border-l border-primary">
                  <p>LP Rebate: {lpFeePercent}%</p>
                  {Number(protocolFeePercent) > 0 && <p>Protocol Fee: {protocolFeePercent}%</p>}
                  {Number(shareFeePercent) > 0 && <p>Share Fee: {shareFeePercent}%</p>}
                </div>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

// Component: Pool Reserves
interface PoolReservesProps {
  pool: Pool;
  tokenPrices: { [key: string]: number };
}

export const PoolReserves = ({ pool, tokenPrices }: PoolReservesProps) => (
  <div className="space-y-1">
    <div className="grid grid-cols-2">
      <div className="text-right">
        {formatReserveAmount(pool.poolData.reserve0, pool.token0.metadata.decimals)}{' '}
      </div>
      <div className="text-right text-muted-foreground">
        {formatUSD(
          (pool.poolData.reserve0 / 10 ** pool.token0.metadata.decimals) *
            tokenPrices[pool.token0.contractId]
        )}
      </div>
    </div>
    <div className="grid grid-cols-2">
      <div className="text-right">
        {formatReserveAmount(pool.poolData.reserve1, pool.token1.metadata.decimals)}{' '}
      </div>
      <div className="text-right text-muted-foreground">
        {formatUSD(
          (pool.poolData.reserve1 / 10 ** pool.token1.metadata.decimals) *
            tokenPrices[pool.token1.contractId]
        )}
      </div>
    </div>
  </div>
);

// Component: Pool Actions
interface PoolActionsProps {
  pool: Pool;
  onLiquidityAction: (pool: Pool, isAdd: boolean) => void;
  onQuickBuy: (pool: Pool) => void;
  tokenPrices: { [key: string]: number };
}

export const PoolActions = ({
  pool,
  onLiquidityAction,
  onQuickBuy,
  tokenPrices
}: PoolActionsProps) => {
  const { doContractCall } = useConnect();
  const { stxAddress } = useGlobalState();

  const handleAddLiquidityClick = (pool: Pool, amount: number) => {
    doContractCall({
      network,
      contractAddress: pool.contractId.split('.')[0],
      contractName: pool.contractId.split('.')[1],
      functionName: 'mint',
      postConditionMode: PostConditionMode.Allow,
      functionArgs: [standardPrincipalCV(stxAddress), uintCV(Math.floor(amount))],
      onFinish: data => {
        console.log('Add liquidity transaction successful', data);
      },
      onCancel: () => {
        console.log('Add liquidity transaction cancelled');
      }
    });
  };

  const handleRemoveLiquidityClick = (pool: Pool, amount: number) => {
    doContractCall({
      network,
      contractAddress: pool.contractId.split('.')[0],
      contractName: pool.contractId.split('.')[1],
      functionName: 'burn',
      postConditionMode: PostConditionMode.Allow,
      functionArgs: [standardPrincipalCV(stxAddress), uintCV(Math.floor(amount))],
      onFinish: data => {
        console.log('Remove liquidity transaction successful', data);
      },
      onCancel: () => {
        console.log('Remove liquidity transaction cancelled');
      }
    });
  };

  const handleBuyToken0Click = (pool: Pool, amount: number) => {
    doContractCall({
      network,
      contractAddress: pool.contractId.split('.')[0],
      contractName: pool.contractId.split('.')[1],
      functionName: 'swap',
      postConditionMode: PostConditionMode.Allow,
      functionArgs: [boolCV(false), uintCV(Math.floor(amount))],
      onFinish: data => {
        console.log('Transaction successful', data);
      },
      onCancel: () => {
        console.log('Transaction cancelled');
      }
    });
  };

  const handleBuyToken1Click = (pool: Pool, amount: number) => {
    doContractCall({
      network,
      contractAddress: pool.contractId.split('.')[0],
      contractName: pool.contractId.split('.')[1],
      functionName: 'swap',
      postConditionMode: PostConditionMode.Allow,
      functionArgs: [boolCV(true), uintCV(Math.floor(amount))],
      onFinish: data => {
        console.log('Transaction successful', data);
      },
      onCancel: () => {
        console.log('Transaction cancelled');
      }
    });
  };

  const handleImg0Error = () => {
    setImg0Fail(true);
    setImgSrc0('/dmg-logo.png');
  };
  const handleImg1Error = () => {
    setImg1Fail(true);
    setImgSrc1('/dmg-logo.png');
  };
  const [img0Fail, setImg0Fail] = useState(false);
  const [img1Fail, setImg1Fail] = useState(false);
  const [imgSrc0, setImgSrc0] = useState(
    pool.token0.metadata?.images?.logo || pool.token0.metadata?.image
  );
  const [imgSrc1, setImgSrc1] = useState(
    pool.token1.metadata?.images?.logo || pool.token1.metadata?.image
  );

  const claimEnergy = async (pool: Pool) => {
    doContractCall({
      network,
      contractAddress: pool.contractId.split('.')[0],
      contractName: pool.contractId.split('.')[1],
      functionName: 'tap',
      postConditionMode: PostConditionMode.Deny,
      functionArgs: [],
      onFinish: data => {
        console.log('Transaction successful', data);
      },
      onCancel: () => {
        console.log('Transaction cancelled');
      }
    });
  };

  return (
    <div className="flex items-center justify-start space-x-2">
      {pool.lpInfo.dex === 'DEXTERITY' ? (
        <DexterityControls
          pool={pool}
          tokenPrices={tokenPrices}
          onAddLiquidity={handleAddLiquidityClick}
          onRemoveLiquidity={handleRemoveLiquidityClick}
          onSwap={(isToken0, amount) =>
            isToken0 ? handleBuyToken0Click(pool, amount) : handleBuyToken1Click(pool, amount)
          }
        />
      ) : (
        <div className="flex align-middle rounded-md h-[40px]">
          <span className="px-4 py-1 text-sm font-medium leading-7 border border-r-0 rounded-l-md border-gray-700/80 bg-background">
            Liquidity
          </span>
          <button
            type="button"
            className="relative inline-flex items-center px-2 py-2 text-sm font-medium border bg-primary hover:bg-accent/90 hover:text-accent-foreground border-gray-700/80 focus:z-10 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accentring-accent"
            onClick={() => onLiquidityAction(pool, true)}
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="relative inline-flex items-center px-2 py-2 -ml-px text-sm font-medium border bg-background hover:bg-accent/90 hover:text-accent-foreground border-gray-700/80 rounded-r-md focus:z-10 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accentring-accent"
            onClick={() => onLiquidityAction(pool, false)}
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      )}
      {pool.lpInfo.dex === 'DEXTERITY' ? (
        <div className="flex align-left rounded-md h-[40px]">
          {pool.metadata.verified ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    variant="ghost"
                    className="px-4 ml-2 text-sm font-medium leading-7"
                    onClick={() => claimEnergy(pool)}
                  >
                    <ZapIcon className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <div className="space-y-2">
                    <p className="text-sm">
                      If you hold LP tokens, you can "tap" them for Energy tokens, which can be
                      burned to reduce or eliminate trading fees. The more LP tokens you hold and
                      the longer you hold them, the more energy you can claim every fast block.
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : null}
        </div>
      ) : null}
      {/* <Link href={`/pools/${pool.poolData.id}`} passHref>
      <Button variant="link" className="whitespace-nowrap">
        View Chart
      </Button>
    </Link> */}
    </div>
  );
};

// Dialogs Components
interface DialogContainerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export const DialogContainer = ({ open, onOpenChange, children }: DialogContainerProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    {children}
  </Dialog>
);
