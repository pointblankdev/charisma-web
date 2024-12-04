import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ChevronDown, ArrowUpDown, Coins } from 'lucide-react';
import { Button } from '@components/ui/button';
import { cn } from '@lib/utils';
import { formatBalance } from '@lib/hooks/dex/pool-operations';
import useWallet from '@lib/hooks/wallet-balance-provider';
import { useGlobalState } from '@lib/hooks/global-state-context';
import { useConnect } from '@stacks/connect-react';
import {
  findBestSwapPath,
  createSwapTransaction,
  isValidTokenPair,
  calculateMinimumAmountOut,
  formatUSD,
  calculateEstimatedAmountOutWithCache
} from './swap-helpers';
import { initializeGraph } from './swap-graph';
import dynamic from 'next/dynamic';
import SimpleSwapInterface from './simple-swap-ui';

const AnimatedNumbers = dynamic(() => import('react-animated-numbers'), {
  ssr: false
});

interface TokenSelectProps {
  token: any;
  isFrom: boolean;
  onClick: () => void;
}

const TokenSelect = ({ token, isFrom, onClick }: TokenSelectProps) => (
  <button
    className="flex items-center px-3 py-1 border rounded-full shadow-lg border-primary/30 shadow-primary/10"
    onClick={onClick}
  >
    {(token?.metadata.images?.logo || token?.metadata.image) && (
      <Image
        src={token?.metadata.images?.logo || token?.metadata.image}
        alt={token?.metadata.symbol}
        width={240}
        height={240}
        className="w-6 mr-2 rounded-full"
      />
    )}
    <span className="mr-1 text-white">{token?.metadata.symbol}</span>
    <ChevronDown className="text-gray-400" size={16} />
  </button>
);

interface TokenListProps {
  tokens: any[];
  onSelect: (token: any) => void;
  fromToken?: any;
  hasHighExperience: boolean;
  pools: any[];
}

const TokenList = ({ tokens, onSelect, fromToken, hasHighExperience, pools }: TokenListProps) => (
  <div className="absolute right-0 z-10 w-full mt-2 overflow-hidden rounded-md shadow-lg bg-[var(--sidebar)] border border-primary/30 min-w-[22rem] sm:min-w-[40rem] grid grid-cols-2 sm:grid-cols-4">
    {tokens
      .filter(t => !t.contractId.endsWith('.stx'))
      .map(token => {
        const isDisabled =
          fromToken &&
          (!isValidTokenPair(fromToken, token, pools) ||
            (token.metadata.symbol === 'STX' &&
              !hasHighExperience &&
              fromToken.metadata.symbol !== 'synSTX'));

        const src = token?.metadata.images?.logo || token?.metadata.image;
        return (
          <button
            key={token.metadata.symbol}
            className={cn(
              'flex items-center w-full px-4 py-2 text-left',
              isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-accent-foreground'
            )}
            onClick={() => !isDisabled && onSelect(token)}
            disabled={isDisabled}
          >
            {src ? (
              <Image
                src={src}
                alt={token.metadata.symbol}
                width={240}
                height={240}
                className="w-6 mr-2 rounded-full"
              />
            ) : (
              <Coins className="mr-2" />
            )}
            <span className={cn(isDisabled ? 'text-gray-500' : 'text-white', 'truncate')}>
              {token.metadata.symbol}
              {token.metadata.symbol === 'STX' ? ' ✨' : ''}
            </span>
          </button>
        );
      })}
  </div>
);

interface TokenInputProps {
  token: any;
  amount: string;
  price: number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  onUseMax?: () => void;
  balance?: number;
  isCalculating?: boolean;
  duration?: number;
}

const TokenInput = ({
  token,
  amount,
  price,
  onChange,
  disabled,
  onUseMax,
  balance,
  isCalculating,
  duration = 0.05
}: TokenInputProps) => (
  <>
    <input
      type="text"
      placeholder="0.00"
      className="w-full text-2xl text-white bg-transparent outline-none"
      value={isCalculating ? 'Calculating...' : amount}
      onChange={onChange}
      disabled={disabled}
    />
    <div className="flex items-center justify-between mt-2">
      <span className="text-gray-400">
        {isCalculating ? (
          'Calculating...'
        ) : (
          <div className="flex">
            <div>$</div>
            <AnimatedNumbers
              includeComma
              transitions={index => ({
                type: 'tween',
                duration: index * duration
              })}
              animateToNumber={formatUSD(Number(amount), price)}
            />
            <div>
              {token?.metadata.symbol?.startsWith('iou') && (
                <span
                  className="px-1.5 ml-2 text-sm text-white/50 rounded-full cursor-help bg-accent-foreground pb-0.5"
                  title="Synthetic token price disclaimer"
                >
                  𝖎
                </span>
              )}
            </div>
          </div>
        )}
      </span>
      <div>
        {balance !== undefined && (
          <>
            <span className="mr-2 text-gray-400">
              <span className="mr-1">Balance:</span>
              {formatBalance(balance, token?.metadata.decimals)}
            </span>
            {onUseMax && (
              <button className="text-sm text-primary hover:text-primary" onClick={onUseMax}>
                Use Max
              </button>
            )}
          </>
        )}
      </div>
    </div>
  </>
);

interface SwapDetailsProps {
  swapPath: any[];
  minimumReceived: string;
  toToken: any;
}

const SwapDetails = ({ swapPath, minimumReceived, toToken }: SwapDetailsProps) => (
  <div className="flex justify-between pt-6">
    <div className="text-sm text-gray-400">
      Swap path: {swapPath.map(token => token.metadata.symbol).join(' → ')}
    </div>
    <div className="text-sm text-gray-400">
      Minimum received: {minimumReceived} {toToken?.metadata.symbol}
    </div>
  </div>
);

interface SlippageInputProps {
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SlippageInput = ({ value, onChange }: SlippageInputProps) => (
  <div className="p-4">
    <div className="flex items-center justify-between text-md">
      <span className="text-gray-400">Slippage Tolerance</span>
      <div className="flex items-center">
        <input
          type="text"
          className="w-6 text-right text-gray-300 bg-transparent outline-none"
          value={value}
          onChange={onChange}
          placeholder="0.5"
        />
        <span className="ml-1 text-gray-300">%</span>
      </div>
    </div>
  </div>
);

export const SwapInterface = ({ data }: { data: any }) => {
  const [fromToken, setFromToken] = useState(data.tokens[0]);
  const [toToken, setToToken] = useState(data.tokens[1]);
  const [fromAmount, setFromAmount] = useState('');
  const [showFromTokens, setShowFromTokens] = useState(false);
  const [showToTokens, setShowToTokens] = useState(false);
  const [estimatedAmountOut, setEstimatedAmountOut] = useState('0');
  const [isCalculating, setIsCalculating] = useState(false);
  const [slippage, setSlippage] = useState(10);
  const [swapPath, setSwapPath] = useState<any[]>([]);
  const [isMultiHop, setIsMultiHop] = useState(false);

  const fromDropdownRef = useRef<HTMLDivElement>(null);
  const toDropdownRef = useRef<HTMLDivElement>(null);

  const { doContractCall } = useConnect();
  const { stxAddress } = useGlobalState();
  const { getBalance, wallet } = useWallet();

  const hasHighExperience = wallet.experience.balance >= 0;

  // Initialize graph on component mount
  useEffect(() => {
    initializeGraph(data.tokens, data.pools);
  }, [data.tokens, data.pools]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fromDropdownRef.current && !fromDropdownRef.current.contains(event.target as Node)) {
        setShowFromTokens(false);
      }
      if (toDropdownRef.current && !toDropdownRef.current.contains(event.target as Node)) {
        setShowToTokens(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSlippageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^[0-9]*\.?[0-9]*$/.test(value) || value === '') {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
        setSlippage(numValue);
      }
    }
  };

  const handleEstimateAmount = useCallback(
    async (amount: string) => {
      if (!amount || isNaN(parseFloat(amount)) || !stxAddress || !fromToken || !toToken) {
        setEstimatedAmountOut('0');
        return;
      }

      setIsCalculating(true);
      try {
        const estimated = await calculateEstimatedAmountOutWithCache(
          amount,
          fromToken,
          toToken,
          swapPath,
          stxAddress,
          isMultiHop,
          data.currentPool
        );
        setEstimatedAmountOut(estimated);
      } catch (error) {
        console.error('Error estimating amount:', error);
        setEstimatedAmountOut('0');
      } finally {
        setIsCalculating(false);
      }
    },
    [fromToken, toToken, stxAddress, isMultiHop, swapPath, data.currentPool]
  );

  const handleFromAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^[0-9]*\.?[0-9]*$/.test(value) || value === '') {
      setFromAmount(value);
      handleEstimateAmount(value);
    }
  };

  const handleUseMax = () => {
    const maxBalance = getBalance(fromToken.contractId);
    const formattedBalance = formatBalance(maxBalance, fromToken.metadata.decimals);
    setFromAmount(formattedBalance);
    handleEstimateAmount(formattedBalance);
  };

  const updateSwapPath = useCallback(async () => {
    const path = await findBestSwapPath(
      fromToken,
      toToken,
      fromAmount,
      stxAddress,
      hasHighExperience
    );
    if (path) {
      setIsMultiHop(path.length > 2);
      setSwapPath(path);
    } else {
      setIsMultiHop(false);
      setSwapPath([]);
    }
  }, [fromToken, toToken, fromAmount, stxAddress, hasHighExperience]);

  useEffect(() => {
    updateSwapPath();
  }, [fromToken, toToken, updateSwapPath]);

  useEffect(() => {
    handleEstimateAmount(fromAmount);
  }, [fromAmount, handleEstimateAmount]);

  const handleSwap = () => {
    if (!fromToken || !toToken || !stxAddress) return;

    const minimumAmountOut = calculateMinimumAmountOut(
      estimatedAmountOut,
      slippage,
      toToken.metadata.decimals
    );

    const transaction = createSwapTransaction({
      pool: data.currentPool,
      fromToken,
      toToken,
      fromAmount,
      minimumAmountOut,
      swapPath,
      isMultiHop,
      stxAddress,
      onFinish: (data: any) => {
        console.log('Swap successful:', data);
        setFromAmount('');
        setEstimatedAmountOut('0');
      },
      onCancel: () => {
        console.log('Swap cancelled');
      }
    });

    doContractCall(transaction);
  };

  const handleSwapDirectionToggle = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount('');
    setEstimatedAmountOut('0');
  };

  return hasHighExperience ? (
    <div className="max-w-screen-sm sm:mx-auto sm:px-4">
      <div className="mt-6">
        <div className="relative px-6 pb-4 pt-2 sm:rounded-lg bg-[var(--sidebar)] border border-[var(--accents-7)]">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-white/95">Swap</h1>
            <SlippageInput value={slippage} onChange={handleSlippageChange} />
          </div>

          <div className="mb-2 space-y-4">
            {/* From Section */}
            <div className="p-4 rounded-lg shadow-xl shadow-primary/10 border border-t-0 border-x-0 border-b-[var(--accents-7)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">From</span>
                <div className="relative" ref={fromDropdownRef}>
                  <TokenSelect
                    token={fromToken}
                    isFrom={true}
                    onClick={() => setShowFromTokens(!showFromTokens)}
                  />
                  {showFromTokens && (
                    <TokenList
                      tokens={data.tokens}
                      onSelect={token => {
                        setFromToken(token);
                        setShowFromTokens(false);
                      }}
                      hasHighExperience={hasHighExperience}
                      pools={data.pools}
                    />
                  )}
                </div>
              </div>
              <TokenInput
                token={fromToken}
                amount={fromAmount}
                price={data.prices[fromToken.metadata.symbol] || 0}
                onChange={handleFromAmountChange}
                onUseMax={handleUseMax}
                balance={getBalance(fromToken.contractId)}
                duration={0.01}
              />
            </div>

            {/* Swap Direction Button */}
            <div className="flex">
              <button
                className="p-2 mx-auto rounded-full bg-[var(--sidebar)]"
                onClick={handleSwapDirectionToggle}
                disabled={fromToken.metadata.symbol === 'STX' && !hasHighExperience}
              >
                <ArrowUpDown className="text-gray-400" size={24} />
              </button>
            </div>

            {/* To Section */}
            <div className="p-4 rounded-lg shadow-xl shadow-primary/10 border border-t-0 border-x-0 border-b-[var(--accents-7)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">To</span>
                <div className="relative" ref={toDropdownRef}>
                  <TokenSelect
                    token={toToken}
                    isFrom={false}
                    onClick={() => setShowToTokens(!showToTokens)}
                  />
                  {showToTokens && (
                    <TokenList
                      tokens={data.tokens}
                      onSelect={token => {
                        setToToken(token);
                        setShowToTokens(false);
                      }}
                      fromToken={fromToken}
                      hasHighExperience={hasHighExperience}
                      pools={data.pools}
                    />
                  )}
                </div>
              </div>
              <TokenInput
                token={toToken}
                amount={estimatedAmountOut}
                price={data.prices[toToken?.metadata.symbol] || 0}
                disabled
                isCalculating={isCalculating}
                balance={getBalance(toToken?.contractId)}
              />
            </div>

            <SwapDetails
              swapPath={swapPath}
              minimumReceived={calculateMinimumAmountOut(
                estimatedAmountOut,
                slippage,
                toToken?.metadata.decimals
              )}
              toToken={toToken}
            />

            <Button
              className="w-full px-4 py-3 mt-4 font-bold rounded-lg"
              onClick={handleSwap}
              disabled={isCalculating || estimatedAmountOut === '0' || !fromAmount}
            >
              {isCalculating ? 'Calculating...' : 'Confirm Swap'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <SimpleSwapInterface data={data} />
  );
};
