import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ChevronDown, ArrowUpDown, Coins, Network, TrendingUp } from 'lucide-react';
import { Button } from '@components/ui/button';
import { cn } from '@lib/utils';
import dynamic from 'next/dynamic';
import { Dexterity, LPToken, Quote, Token } from 'dexterity-sdk';
import { Vault } from 'dexterity-sdk/dist/core/vault';
import { SwapGraphVisualizer } from './swap-graph-visualizer';
import _ from 'lodash';
import { useGlobal } from '@lib/hooks/global-context';

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
    {token?.image && (
      <Image
        src={token.image}
        alt={token.symbol}
        width={240}
        height={240}
        className="w-6 mr-2 rounded-full"
      />
    )}
    <span className="mr-1 text-white">{token?.symbol}</span>
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
  exploringPaths?: number;
  duration?: number;
  isArbitrage?: boolean;
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
  exploringPaths = 0,
  duration = 0.05,
  isArbitrage = false
}: TokenInputProps) => (
  <>
    <div className="flex items-center gap-2">
      <input
        type="text"
        placeholder="0.00"
        className={cn(`w-full text-2xl text-white bg-transparent outline-none`, isCalculating ? 'animate-pulse' : '')}
        value={isCalculating ? 'Calculating...' : amount}
        onChange={onChange}
        disabled={disabled}
      />
      {isArbitrage && (
        <div className="flex items-center gap-1 px-2 py-1 text-sm font-medium text-green-400 bg-green-400/10 rounded-full">
          <TrendingUp size={14} />
          <span>Arbitrage</span>
        </div>
      )}
    </div>
    <div className="flex items-center justify-between mt-2">
      <span className="text-gray-400">
        {isCalculating ? (
          `Exploring ${exploringPaths} possible paths...`
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
          </div>
        )}
      </span>
      <div>
        {balance !== undefined && (
          <>
            <span className="mr-2 text-gray-400">
              <span className="mr-1">Balance:</span>
              {formatBalance(balance, token?.decimals)}
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
  minimumReceived: number;
  toToken: Token;
}

const SwapDetails = ({ swapPath, minimumReceived, toToken }: SwapDetailsProps) => (
  <div className="flex justify-between pt-6">
    <div className="text-sm text-gray-400">
      Swap path: {swapPath.map(token => token?.symbol).join(' → ')}
    </div>
    <div className="text-sm text-gray-400">
      Minimum received: {minimumReceived.toFixed(toToken?.decimals)} {toToken?.symbol}
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
  const [fromAmount, setFromAmount] = useState('1');
  const [showFromTokens, setShowFromTokens] = useState(false);
  const [showToTokens, setShowToTokens] = useState(false);
  const [estimatedAmountOut, setEstimatedAmountOut] = useState('0');
  const [isCalculating, setIsCalculating] = useState(false);
  const [swapPath, setSwapPath] = useState<any[]>([]);
  const { getBalance, wallet, stxAddress, maxHops, setMaxHops, fromToken, setFromToken, toToken, setToToken, slippage, setSlippage } = useGlobal();
  const estimateTimer = useRef<any>();
  const [exploringPaths, setExploringPaths] = useState(0);
  const [showGraph, setShowGraph] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [lastQuote, setLastQuote] = useState<any>(null as Quote | null);

  useEffect(() => {
    if (maxHops && pools.length > 0 && stxAddress) {
      Dexterity.configure({ maxHops }).catch(console.error);
      const vaults = pools.map(pool => new Vault(pool));
      Dexterity.router.loadVaults(vaults);
      console.log('Router initialized:', Dexterity.router.getGraphStats());
      console.log('Vaults:', Dexterity.getVaults());
      handleEstimateAmount(fromAmount);
    }
  }, [pools, stxAddress, maxHops]);

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
    const value = Number(e.target.value);
    const newSlippage = _.clamp(value / 100, 0, 0.99);
    Dexterity.configure({ defaultSlippage: newSlippage }).catch(console.error);
    setSlippage(newSlippage);
  };

  const handleEstimateAmount = useCallback(
    async (amount: string) => {
      // Clear any existing timer
      if (estimateTimer.current) {
        clearTimeout(estimateTimer.current);
      }

      if (!amount || isNaN(parseFloat(amount)) || !fromToken || !toToken) {
        setEstimatedAmountOut('0');
        return;
      }
      // Set new timer
      estimateTimer.current = setTimeout(() => {
        setIsCalculating(true);
        setExploringPaths(Dexterity.router.findAllPaths(fromToken.contractId, toToken.contractId).length);
        Dexterity.getQuote(
          fromToken.contractId,
          toToken.contractId,
          Number(amount) * 10 ** fromToken.decimals
        )
          .then(quote => {
            const amountOut = quote.amountOut;
            setSwapPath(quote.route.path || []);
            setLastQuote(quote);
            setEstimatedAmountOut((amountOut / 10 ** toToken.decimals).toFixed(toToken.decimals));
          })
          .catch(error => {
            console.error('Error estimating amount:', error);
            setEstimatedAmountOut('0');
          })
          .finally(() => {
            setIsCalculating(false);
            setExploringPaths(0);
          });
      }, 200); // Reduced to 200ms for better responsiveness
    },
    [fromToken, toToken, maxHops]
  );

  useEffect(() => {
    return () => {
      if (estimateTimer.current) {
        clearTimeout(estimateTimer.current);
      }
    };
  }, []);

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

  const handleSwap = async () => {
    if (!fromToken || !toToken || !stxAddress || swapPath.length <= 1) return;

    try {
      setIsSwapping(true);
      const amount = Number(fromAmount) * 10 ** fromToken.decimals;
      console.log(Dexterity.config)
      await Dexterity.router.executeSwap(lastQuote.route, amount, {
        // disablePostConditions: true
      });
    } catch (error) {
      console.error('Swap failed:', error);
    } finally {
      setIsSwapping(false);
    }
  };

  const handleSwapDirectionToggle = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount('');
    setEstimatedAmountOut('0');
  };


  const handleMaxHopsChange = (value: string) => {
    const newMaxHops = _.clamp(Number(value), 0, 7);
    Dexterity.configure({ maxHops: newMaxHops }).catch(console.error);
    setMaxHops(newMaxHops);
    if (fromAmount) handleEstimateAmount(fromAmount)
  }

  const isArbitrageTrade = fromToken?.contractId === toToken?.contractId &&
    Number(estimatedAmountOut) > Number(fromAmount);

  const minimumAmountOut = Number(estimatedAmountOut) * (1 - slippage / 100);

  return (
    <div className="max-w-screen-sm sm:mx-auto sm:px-4 mt-0">
      <div className="flex flex-wrap gap-2 mb-4 justify-start">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--sidebar)] border min-w-[8rem] border-[var(--accents-7)]">
          <button
            className="flex items-center gap-2 text-white text-sm"
            onClick={() => setShowGraph(!showGraph)}
          >
            <Network className="w-4 h-4" />
            <span>{showGraph ? 'Hide' : 'Show'} Graph</span>
          </button>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--sidebar)] border min-w-[8rem] border-[var(--accents-7)]">
          <span className="text-sm text-gray-400">Search Depth:</span>
          <input
            type="text"
            className="w-3.5 text-sm text-white bg-transparent outline-none"
            value={maxHops}
            onChange={e => handleMaxHopsChange(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--sidebar)] border min-w-[8rem] border-[var(--accents-7)]">
          <span className="text-sm text-gray-400">Maximum Slippage:</span>
          <input
            type="text"
            className="w-3.5 text-sm text-white bg-transparent outline-none"
            value={slippage * 100}
            onChange={handleSlippageChange}
            placeholder="0"
          />
          <span className="text-sm text-gray-400">%</span>
        </div>
      </div>

      {showGraph && (
        <SwapGraphVisualizer
          fromToken={fromToken}
          toToken={toToken}
          paths={Dexterity.router.findAllPaths(fromToken.contractId, toToken.contractId)}
          currentPath={swapPath}
          setShowGraph={setShowGraph}
        />
      )}

      <div className="relative px-6 pb-4 pt-4 sm:rounded-lg bg-[var(--sidebar)] border border-[var(--accents-7)]">
        <h1 className="text-2xl font-bold text-white/95 mb-4">Swap</h1>

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
              exploringPaths={exploringPaths}
              balance={getBalance(toToken?.contractId)}
              isArbitrage={isArbitrageTrade}
            />
          </div>

          <SwapDetails
            swapPath={swapPath}
            minimumReceived={minimumAmountOut}
            toToken={toToken}
          />

          <Button
            className="w-full px-4 py-3 mt-4 font-bold rounded-lg"
            onClick={handleSwap}
            disabled={isCalculating || estimatedAmountOut === '0' || !fromAmount || isSwapping || swapPath.length <= 1}
          >
            {isCalculating ? <div className="flex items-center justify-center gap-2">
              <span className="animate-pulse">Finding the best rate</span>
              <span className="inline-block">
                <span className="animate-[bounce_1.4s_infinite] inline-block">.</span>
                <span className="animate-[bounce_1.4s_0.2s_infinite] inline-block">.</span>
                <span className="animate-[bounce_1.4s_0.4s_infinite] inline-block">.</span>
              </span>
            </div> : isSwapping ? (
              <div className="flex items-center justify-center gap-2">
                <span className="animate-pulse">Building transaction</span>
                <span className="inline-block">
                  <span className="animate-[bounce_1.4s_infinite] inline-block">.</span>
                  <span className="animate-[bounce_1.4s_0.2s_infinite] inline-block">.</span>
                  <span className="animate-[bounce_1.4s_0.4s_infinite] inline-block">.</span>
                </span>
              </div>
            ) : (
              'Confirm Swap'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
