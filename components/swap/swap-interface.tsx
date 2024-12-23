import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ChevronDown, ArrowUpDown, Coins } from 'lucide-react';
import { Button } from '@components/ui/button';
import { cn } from '@lib/utils';
import useWallet from '@lib/hooks/wallet-balance-provider';
import { useGlobalState } from '@lib/hooks/global-state-context';
import { useConnect } from '@stacks/connect-react';
import dynamic from 'next/dynamic';
import { Dexterity, LPToken, Token } from 'dexterity-sdk';
import { Vault } from 'dexterity-sdk/dist/core/vault';

const formatUSD = (amount: number, price: number) => {
  const value = amount * price;
  return value;
};

const formatBalance = (balance: number, decimals: number) => {
  return (balance / 10 ** decimals).toFixed(decimals);
};

const AnimatedNumbers = dynamic(() => import('react-animated-numbers'), {
  ssr: false
});

interface TokenSelectProps {
  token: Token;
  isFrom: boolean;
  onClick: () => void;
}

const TokenSelect = ({ token, isFrom, onClick }: TokenSelectProps) => (
  <button
    className="flex items-center px-3 py-1 border rounded-full shadow-lg border-primary/30 shadow-primary/10"
    onClick={onClick}
  >
    {token.image && (
      <Image
        src={token.image}
        alt={token.symbol}
        width={240}
        height={240}
        className="w-6 mr-2 rounded-full"
      />
    )}
    <span className="mr-1 text-white">{token.symbol}</span>
    <ChevronDown className="text-gray-400" size={16} />
  </button>
);

interface TokenListProps {
  tokens: Token[];
  onSelect: (token: Token) => void;
  fromToken?: any;
  hasHighExperience: boolean;
  pools: any[];
}

const TokenList = ({ tokens, onSelect, fromToken, pools }: TokenListProps) => {
  const [validTokens, setValidTokens] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // useEffect(() => {
  //   const validateTokens = async () => {
  //     if (!fromToken) {
  //       setValidTokens(new Set(tokens.map(t => t.contractId)));
  //       setIsLoading(false);
  //       return;
  //     }

  //     setIsLoading(true);
  //     const validSet = new Set<string>();

  //     // Run validations in parallel
  //     const validations = tokens.map(async otherToken => {
  //       try {
  //         const quote = await Dexterity.getQuote(fromToken.contractId, otherToken.contractId, 1000);
  //         if (quote.amountOut > 0) {
  //           validSet.add(otherToken.contractId);
  //         }
  //       } catch (error) {
  //         console.error('Error validating token pair:', error);
  //       }
  //     });

  //     await Promise.all(validations);
  //     setValidTokens(validSet);
  //     setIsLoading(false);
  //   };

  //   validateTokens();
  // }, [fromToken, tokens, pools]);

  if (isLoading) {
    return (
      <div className="absolute right-0 z-10 w-full mt-2 overflow-hidden rounded-md shadow-lg bg-[var(--sidebar)] border border-primary/30 min-w-[22rem] sm:min-w-[40rem] grid grid-cols-2 sm:grid-cols-4">
        <div className="flex items-center justify-center w-full p-4">
          <span className="text-gray-400">Validating pairs...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute right-0 z-10 w-full mt-2 overflow-hidden rounded-md shadow-lg bg-[var(--sidebar)] border border-primary/30 min-w-[22rem] sm:min-w-[40rem] grid grid-cols-2 sm:grid-cols-4">
      {tokens.map(token => {
        const isDisabled = false; //fromToken && !validTokens.has(token.contractId);
        const src = token.image;

        return (
          <button
            key={token.symbol}
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
                alt={token.symbol}
                width={240}
                height={240}
                className="w-6 mr-2 rounded-full"
              />
            ) : (
              <Coins className="mr-2" />
            )}
            <span className={cn(isDisabled ? 'text-gray-500' : 'text-white', 'truncate')}>
              {token.symbol}
            </span>
          </button>
        );
      })}
    </div>
  );
};

interface TokenInputProps {
  token: Token;
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
              {token.symbol?.startsWith('iou') && (
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
              {formatBalance(balance, token.decimals)}
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
  toToken: Token;
}

const SwapDetails = ({ swapPath, minimumReceived, toToken }: SwapDetailsProps) => (
  <div className="flex justify-between pt-6">
    <div className="text-sm text-gray-400">
      Swap path: {swapPath.map(token => token.symbol).join(' → ')}
    </div>
    <div className="text-sm text-gray-400">
      Minimum received: {minimumReceived} {toToken.symbol}
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

export const SwapInterface = ({
  prices,
  tokens,
  pools
}: {
  prices: any;
  tokens: Token[];
  pools: LPToken[];
}) => {
  const [fromToken, setFromToken] = useState(tokens[0]);
  const [toToken, setToToken] = useState(tokens[1]);
  const [fromAmount, setFromAmount] = useState('');
  const [showFromTokens, setShowFromTokens] = useState(false);
  const [showToTokens, setShowToTokens] = useState(false);
  const [estimatedAmountOut, setEstimatedAmountOut] = useState('0');
  const [isCalculating, setIsCalculating] = useState(false);
  const [slippage, setSlippage] = useState(0);
  const [swapPath, setSwapPath] = useState<any[]>([]);
  const [swappableTokens, setSwappableTokens] = useState<any[]>([]);
  const { doContractCall } = useConnect();
  const { stxAddress } = useGlobalState();
  const { getBalance, wallet } = useWallet();

  useEffect(() => {
    const vaults = pools.map(pool => new Vault(pool));
    Dexterity.router.loadVaults(vaults);
    Dexterity.config.stxAddress = stxAddress;
    Dexterity.config.mode = 'client';
    console.log('Loaded vaults:', Dexterity.router.vaults);
  }, [pools, stxAddress]);

  const fromDropdownRef = useRef<HTMLDivElement>(null);
  const toDropdownRef = useRef<HTMLDivElement>(null);

  const hasHighExperience = wallet.experience.balance >= 0;

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
        const quote = await Dexterity.getQuote(
          fromToken.contractId,
          toToken.contractId,
          Number(amount) * 10 ** fromToken.decimals
        );
        const amountOut = quote.amountOut;
        setSwapPath(quote.route.path || []);
        setEstimatedAmountOut((amountOut / 10 ** toToken.decimals).toFixed(toToken.decimals));
      } catch (error) {
        console.error('Error estimating amount:', error);
        setEstimatedAmountOut('0');
      } finally {
        setIsCalculating(false);
      }
    },
    [fromToken, toToken, stxAddress]
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
    const formattedBalance = formatBalance(maxBalance, fromToken.decimals);
    setFromAmount(formattedBalance);
    handleEstimateAmount(formattedBalance);
  };

  useEffect(() => {
    handleEstimateAmount(fromAmount);
  }, [fromAmount, handleEstimateAmount]);

  const handleSwap = async () => {
    if (!fromToken || !toToken || !stxAddress) return;
    console.log('Swapping:', fromToken, toToken, fromAmount);
    const transaction = await Dexterity.buildSwap(
      fromToken.contractId,
      toToken.contractId,
      Number(fromAmount) * 10 ** fromToken.decimals
    );

    doContractCall(transaction);
  };

  const handleSwapDirectionToggle = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount('');
    setEstimatedAmountOut('0');
  };

  return (
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
                      tokens={tokens}
                      onSelect={token => {
                        setFromToken(token);
                        setShowFromTokens(false);
                      }}
                      hasHighExperience={hasHighExperience}
                      pools={pools}
                    />
                  )}
                </div>
              </div>
              <TokenInput
                token={fromToken}
                amount={fromAmount}
                price={prices[fromToken?.contractId] || 0}
                onChange={handleFromAmountChange}
                onUseMax={handleUseMax}
                balance={getBalance(fromToken?.contractId)}
                duration={0.01}
              />
            </div>

            {/* Swap Direction Button */}
            <div className="flex">
              <button
                className="p-2 mx-auto rounded-full bg-[var(--sidebar)]"
                onClick={handleSwapDirectionToggle}
                disabled={fromToken?.symbol === 'STX' && !hasHighExperience}
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
                      tokens={tokens}
                      onSelect={token => {
                        setToToken(token);
                        setShowToTokens(false);
                      }}
                      fromToken={fromToken}
                      hasHighExperience={hasHighExperience}
                      pools={pools}
                    />
                  )}
                </div>
              </div>
              <TokenInput
                token={toToken}
                amount={estimatedAmountOut}
                price={prices[toToken?.contractId] || 0}
                disabled
                isCalculating={isCalculating}
                balance={getBalance(toToken?.contractId)}
              />
            </div>

            <SwapDetails
              swapPath={swapPath}
              minimumReceived={estimatedAmountOut}
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
  );
};
