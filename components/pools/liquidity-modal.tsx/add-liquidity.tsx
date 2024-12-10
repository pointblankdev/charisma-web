import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import numeral from 'numeral';
import { Button } from '@components/ui/button';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@components/ui/dialog';
import { Label } from '@components/ui/label';
import { Slider } from '@components/ui/slider';
import useWallet from '@lib/hooks/wallet-balance-provider';
import { useGlobalState } from '@lib/hooks/global-state-context';
import { useConnect } from '@stacks/connect-react';
import { Pool } from '../pool-helpers';
import {
  calculateTokenAmounts,
  calculateRemovalAmounts,
  createAddLiquidityTransaction,
  createRemoveLiquidityTransaction,
  calculateUserPoolShare
} from './liquidity-helpers';
import { PostConditionMode, standardPrincipalCV, uintCV } from '@stacks/transactions';
import { network } from '@components/stacks-session/connect';

// Helper Functions
const formatCurrency = (value: number) => {
  if (value >= 1_000_000) {
    return numeral(value).format('0.00a');
  }
  return numeral(value).format('0,0.00');
};

const calculateDexterityLiquidity = (
  pool: Pool,
  sliderValue: number,
  balance0: number,
  balance1: number,
  isAdd: boolean
) => {
  const poolBalance0 = pool.poolData.reserve0;
  const poolBalance1 = pool.poolData.reserve1;

  if (isAdd) {
    // Calculate proportional amounts based on the current pool ratio
    const ratio = poolBalance1 / poolBalance0;
    const maxAmount0 = Math.min(balance0, poolBalance0);
    const maxAmount1 = Math.min(balance1, poolBalance1);

    // Use the smaller of the two proportional amounts
    const amount0 = (maxAmount0 * sliderValue) / 100;
    const amount1 = (maxAmount1 * sliderValue) / 100;

    // Calculate geometric mean for LP tokens
    const lpAmount = Math.floor(amount0 * amount1 * 100);

    return {
      amount0: amount0.toString(),
      amount1: amount1.toString(),
      lpAmount,
      limitingToken: amount0 / poolBalance0 < amount1 / poolBalance1 ? 'token0' : 'token1'
    };
  } else {
    // For removal, calculate proportional amounts based on LP token share
    const lpShare = sliderValue / 100;
    const amount0 = (poolBalance0 * lpShare).toString();
    const amount1 = (poolBalance1 * lpShare).toString();
    const lpAmount = Math.floor(parseFloat(amount0) * parseFloat(amount1) * 100);

    return {
      amount0,
      amount1,
      lpAmount,
      limitingToken: null
    };
  }
};

// Component Interfaces
interface SliderControlProps {
  value: number;
  onChange: (value: number) => void;
  isAdd: boolean;
  onMax: () => void;
}

interface PoolShareDisplayProps {
  currentShare: number;
  pool: Pool;
  isAdd: boolean;
  experienceLevel: number;
}

interface TokenDisplayProps {
  amount: string;
  symbol: string;
  image: string;
  decimals: number;
  price: number;
  isLimiting: boolean;
  animate: boolean;
}

interface LiquidityDialogProps {
  pool: Pool;
  isAdd: boolean;
  onClose: () => void;
  prices: { [key: string]: number };
}

// Sub-Components
const PoolShareDisplay = ({
  currentShare,
  pool,
  isAdd,
  experienceLevel
}: PoolShareDisplayProps) => {
  const formatShare = (share: number) => {
    if (share < 0.01) return '< 0.01';
    return share.toFixed(2);
  };

  return (
    <DialogDescription>
      {experienceLevel > 2000 ? (
        <div
          className="text-sm text-yellow-500"
          title="Experience Bonus Feature: Your share of the pool"
        >
          ✨ Pool share: {formatShare(currentShare)}%
        </div>
      ) : (
        <div className="text-sm">
          {isAdd
            ? `Add liquidity to the ${pool.token0.metadata.symbol} / ${pool.token1.metadata.symbol} pool`
            : `Remove liquidity from the ${pool.token0.metadata.symbol} / ${pool.token1.metadata.symbol} pool`}
        </div>
      )}
    </DialogDescription>
  );
};

const TokenDisplay = ({
  amount,
  symbol,
  image,
  decimals,
  price,
  isLimiting,
  animate
}: TokenDisplayProps) => {
  const numericAmount = parseFloat(amount);
  const usdValue = numericAmount * (price || 0);

  return (
    <div className="grid items-center grid-cols-4 gap-4">
      <div className="flex justify-end">
        <Image
          src={image || '/dmg-logo.gif'}
          alt={symbol}
          width={24}
          height={24}
          className={`rounded-full ${animate && isLimiting ? 'shake' : ''}`}
        />
      </div>
      <div className="col-span-3">
        <div className="flex justify-between">
          <span>
            {formatCurrency(numericAmount)} {symbol}
          </span>
          <span className="text-sm text-gray-500">${formatCurrency(usdValue)}</span>
        </div>
      </div>
    </div>
  );
};

const BalanceDisplay = ({
  isAdd,
  token0Balance,
  token1Balance,
  token0Symbol,
  token1Symbol,
  lpTokenBalance,
  selectedLpAmount
}: any) => (
  <span className="text-sm text-gray-500">
    {isAdd ? (
      <>
        Your balance: {formatCurrency(token0Balance)} {token0Symbol} /{' '}
        {formatCurrency(token1Balance)} {token1Symbol}
      </>
    ) : (
      <>
        Your balance: {formatCurrency(lpTokenBalance)} →{' '}
        {formatCurrency(lpTokenBalance - selectedLpAmount)}
      </>
    )}
  </span>
);

const SliderControl = ({ value, onChange, isAdd, onMax }: SliderControlProps) => (
  <div className="grid gap-2">
    <Label>{isAdd ? 'Liquidity to add (%)' : 'Liquidity to remove (%)'}</Label>
    <Slider
      value={[value]}
      onValueChange={(values: number[]) => {
        onChange(values[0]);
        if (values[0] === 100) {
          onMax();
        }
      }}
      max={100}
      step={0.1}
    />
    <div className="text-sm text-right text-gray-500">{value.toFixed(2)}%</div>
  </div>
);

// Main Component
const LiquidityDialog = ({ pool, isAdd, onClose, prices }: LiquidityDialogProps) => {
  const [sliderValue, setSliderValue] = useState(0);
  const [amount0, setAmount0] = useState('0');
  const [amount1, setAmount1] = useState('0');
  const [selectedLpAmount, setSelectedLpAmount] = useState(0);
  const [limitingToken, setLimitingToken] = useState<'token0' | 'token1' | null>(null);
  const [animate, setAnimate] = useState(false);

  const { doContractCall } = useConnect();
  const { stxAddress } = useGlobalState();
  const { getBalanceByKey, balances, getKeyByContractAddress, wallet } = useWallet();

  const getLpTokenBalance = useCallback(() => {
    if (!pool) return 0;
    return getBalanceByKey(getKeyByContractAddress(pool.contractId)) || 0;
  }, [pool, getBalanceByKey, getKeyByContractAddress]);

  const getTokenBalance = useCallback(
    (token: Pool['token0'] | Pool['token1']) => {
      if (token.metadata.symbol === 'STX') {
        return Number(balances.stx.balance) / 10 ** token.metadata.decimals;
      }
      return (
        getBalanceByKey(getKeyByContractAddress(token.contractId)) / 10 ** token.metadata.decimals
      );
    },
    [balances.stx.balance, getBalanceByKey, getKeyByContractAddress]
  );

  const handleSliderChange = useCallback((value: number) => {
    setSliderValue(value);
  }, []);

  const handleMaxValue = useCallback(() => {
    if (!animate) {
      setAnimate(true);
      setTimeout(() => setAnimate(false), 1000);
    }
  }, [animate]);

  useEffect(() => {
    if (!pool) return;

    const token0Balance = getTokenBalance(pool.token0);
    const token1Balance = getTokenBalance(pool.token1);
    const lpTokenBalance = getLpTokenBalance();

    if (pool.lpInfo.dex === 'DEXTERITY') {
      const result = calculateDexterityLiquidity(
        pool,
        sliderValue,
        token0Balance,
        token1Balance,
        isAdd
      );
      setAmount0(result.amount0);
      setAmount1(result.amount1);
      setSelectedLpAmount(result.lpAmount);
      setLimitingToken(result.limitingToken as any);
    } else {
      const userShareOfPool = lpTokenBalance / pool.poolData.totalSupply;

      if (isAdd) {
        const { amount0, amount1, limitingToken: newLimitingToken } = calculateTokenAmounts(
          pool,
          sliderValue,
          token0Balance,
          token1Balance
        );
        setAmount0(amount0);
        setAmount1(amount1);
        setLimitingToken(newLimitingToken as any);
      } else {
        const { amount0, amount1, selectedLpAmount } = calculateRemovalAmounts(
          pool,
          sliderValue,
          lpTokenBalance,
          userShareOfPool
        );
        setAmount0(amount0);
        setAmount1(amount1);
        setSelectedLpAmount(selectedLpAmount);
        setLimitingToken(null);
      }
    }
  }, [pool, isAdd, sliderValue, getTokenBalance, getLpTokenBalance]);

  const handleDexterityLiquidity = useCallback(() => {
    if (!pool || !stxAddress) return;

    const lpAmount = Math.floor(parseFloat(amount0) * parseFloat(amount1) * 100);

    doContractCall({
      network,
      contractAddress: pool.contractId.split('.')[0],
      contractName: pool.contractId.split('.')[1],
      functionName: isAdd ? 'mint' : 'burn',
      postConditionMode: PostConditionMode.Allow,
      functionArgs: [standardPrincipalCV(stxAddress), uintCV(lpAmount)],
      onFinish: data => {
        console.log('Transaction successful', data);
        onClose();
      },
      onCancel: () => {
        console.log('Transaction cancelled');
      }
    });
  }, [pool, stxAddress, amount0, amount1, isAdd, doContractCall, onClose]);

  const handleStandardLiquidity = useCallback(() => {
    if (!pool || !stxAddress) return;

    if (isAdd) {
      const transaction = createAddLiquidityTransaction({
        pool,
        stxAddress,
        amount0,
        amount1,
        onFinish: data => {
          console.log('Transaction successful', data);
          onClose();
        },
        onCancel: () => {
          console.log('Transaction cancelled');
        }
      });
      doContractCall(transaction);
    } else {
      const lpTokenBalance = getLpTokenBalance();
      const lpTokensToRemove = Math.floor((lpTokenBalance * sliderValue) / 100);

      const transaction = createRemoveLiquidityTransaction({
        pool,
        stxAddress,
        lpTokensToRemove,
        amount0,
        amount1,
        onFinish: data => {
          console.log('Transaction successful', data);
          onClose();
        },
        onCancel: () => {
          console.log('Transaction cancelled');
        }
      });
      doContractCall(transaction);
    }
  }, [
    pool,
    stxAddress,
    isAdd,
    amount0,
    amount1,
    sliderValue,
    getLpTokenBalance,
    doContractCall,
    onClose
  ]);

  const handleAction = useCallback(() => {
    if (pool.lpInfo.dex === 'DEXTERITY') {
      handleDexterityLiquidity();
    } else {
      handleStandardLiquidity();
    }
  }, [pool, handleDexterityLiquidity, handleStandardLiquidity]);

  if (!pool) return null;

  const lpTokenBalance = getLpTokenBalance();
  const currentPoolShare = calculateUserPoolShare(lpTokenBalance, pool.poolData.totalSupply);
  const token0Balance = getTokenBalance(pool.token0);
  const token1Balance = getTokenBalance(pool.token1);

  return (
    <DialogContent className="sm:max-w-xl">
      <DialogHeader>
        <DialogTitle>{isAdd ? 'Add Liquidity' : 'Remove Liquidity'}</DialogTitle>
        <PoolShareDisplay
          currentShare={currentPoolShare}
          pool={pool}
          isAdd={isAdd}
          experienceLevel={wallet.experience.balance}
        />
      </DialogHeader>

      <div className="grid gap-4 py-4">
        <SliderControl
          value={sliderValue}
          onChange={handleSliderChange}
          isAdd={isAdd}
          onMax={handleMaxValue}
        />

        <TokenDisplay
          amount={amount0}
          symbol={pool.token0.metadata.symbol}
          image={pool.token0.metadata.image || '/dmg-logo.gif'}
          decimals={pool.token0.metadata.decimals}
          price={prices[pool.token0.contractId] || 0}
          isLimiting={limitingToken === 'token0'}
          animate={animate}
        />

        <TokenDisplay
          amount={amount1}
          symbol={pool.token1.metadata.symbol}
          image={pool.token1.metadata.image || '/dmg-logo.gif'}
          decimals={pool.token1.metadata.decimals}
          price={prices[pool.token1.contractId] || 0}
          isLimiting={limitingToken === 'token1'}
          animate={animate}
        />
      </div>

      <DialogFooter className="flex items-center justify-between">
        <BalanceDisplay
          isAdd={isAdd}
          token0Balance={token0Balance}
          token1Balance={token1Balance}
          token0Symbol={pool.token0.metadata.symbol}
          token1Symbol={pool.token1.metadata.symbol}
          lpTokenBalance={lpTokenBalance}
          selectedLpAmount={selectedLpAmount}
        />
        <Button type="submit" onClick={handleAction} disabled={sliderValue === 0}>
          {isAdd ? 'Add Liquidity' : 'Remove Liquidity'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default LiquidityDialog;
