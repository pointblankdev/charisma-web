import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@components/ui/button';
import { Plus, Minus, ShoppingCart, Coins, ExternalLink } from 'lucide-react';
import numeral from 'numeral';
import Link from 'next/link';
import { Dialog } from '@components/ui/dialog';
import { cn } from '@lib/utils';
import { useConnect } from '@stacks/connect-react';
import { useGlobalState } from '@lib/hooks/global-state-context';
import { network } from '@components/stacks-session/connect';
import { boolCV, PostConditionMode, uintCV } from '@stacks/transactions';

export interface Pool {
  contractId: string;
  audit: any;
  metadata: {
    name: string;
    symbol: string;
    image?: string;
    images?: any;
    decimals: number;
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
      tokenPrices[pool.token0.metadata.symbol] || 0;

  const token1Value =
    (pool.poolData.reserve1 / 10 ** pool.token1.metadata.decimals) *
      tokenPrices[pool.token1.metadata.symbol] || 0;

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
            tokenPrices[pool.token0.metadata.symbol]
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
            tokenPrices[pool.token1.metadata.symbol]
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

  const handleBuyToken0Click = (pool: Pool) => {
    const token1Price = tokenPrices[pool.token1.metadata.symbol];
    const tenUsdInToken1 = Math.floor((10 / token1Price) * 10 ** pool.token1.metadata.decimals);
    console.log();
    doContractCall({
      network,
      contractAddress: pool.contractId.split('.')[0],
      contractName: pool.contractId.split('.')[1],
      functionName: 'swap',
      postConditionMode: PostConditionMode.Allow,
      functionArgs: [boolCV(false), uintCV(tenUsdInToken1)],
      onFinish: data => {
        console.log('Transaction successful', data);
      },
      onCancel: () => {
        console.log('Transaction cancelled');
      }
    });
  };

  const handleBuyToken1Click = (pool: Pool) => {
    const token0Price = tokenPrices[pool.token0.metadata.symbol];
    const tenUsdInToken0 = Math.floor((10 / token0Price) * 10 ** pool.token0.metadata.decimals);
    doContractCall({
      network,
      contractAddress: pool.contractId.split('.')[0],
      contractName: pool.contractId.split('.')[1],
      functionName: 'swap',
      postConditionMode: PostConditionMode.Allow,
      functionArgs: [boolCV(true), uintCV(tenUsdInToken0)],
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

  return (
    <div className="flex items-center justify-between space-x-1">
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
      {pool.lpInfo.dex === 'DEXTERITY' ? (
        <div className="flex align-middle rounded-md h-[40px]">
          <span className="px-4 py-1 text-sm font-medium leading-7 border border-r-0 rounded-l-md border-gray-700/80 bg-background">
            Buy $10
          </span>
          <button
            type="button"
            className="relative inline-flex items-center px-2 py-2 overflow-hidden text-sm font-medium border bg-background hover:bg-accent/90 hover:text-accent-foreground border-gray-700/80 focus:z-10 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accentring-accent"
            onClick={() => handleBuyToken0Click(pool)}
          >
            {imgSrc0 ? (
              <Image
                src={imgSrc0}
                alt={pool.token0.metadata.symbol || 'Base Token 0'}
                width={240}
                height={240}
                className={cn('w-6 mx-1 scale-[2]', img0Fail ? 'blur' : '')}
                blurDataURL="/dmg-logo.png" // Shows while loading and on error
                placeholder="blur"
                onError={() => {
                  handleImg0Error();
                }}
              />
            ) : (
              <Coins className="w-8 h-8 mr-2" />
            )}
          </button>
          <button
            type="button"
            className="relative inline-flex items-center px-2 py-2 -ml-px overflow-hidden text-sm font-medium border bg-background hover:bg-accent/90 hover:text-accent-foreground border-gray-700/80 rounded-r-md focus:z-10 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accentring-accent"
            onClick={() => handleBuyToken1Click(pool)}
          >
            {imgSrc1 ? (
              <Image
                src={imgSrc1}
                alt={pool.token1.metadata.symbol || 'Base Token 1'}
                width={240}
                height={240}
                className={cn('w-6 mx-1 scale-[2]', img1Fail ? 'blur' : '')}
                blurDataURL="/dmg-logo.png" // Shows while loading and on error
                placeholder="blur"
                onError={() => {
                  handleImg1Error();
                }}
              />
            ) : (
              <Coins className="w-8 h-8 mr-2" />
            )}
          </button>
        </div>
      ) : null}
      {isStxChaPool(pool) && (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onQuickBuy(pool)}
          className="whitespace-nowrap"
        >
          <ShoppingCart className="w-4 h-4 mr-1" /> Quick Buy
        </Button>
      )}
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
