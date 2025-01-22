import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ChevronDown, ArrowUpDown, Coins, Network, TrendingUp, X, Check } from 'lucide-react';
import { Button } from '@components/ui/button';
import { cn } from '@lib/utils';
import dynamic from 'next/dynamic';
import { Dexterity, LPToken, Opcode, Route, Token } from 'dexterity-sdk';
import { Vault } from 'dexterity-sdk/dist/core/vault';
import { SwapGraphVisualizer } from './swap-graph-visualizer';
import _ from 'lodash';
import { useGlobal } from '@lib/hooks/global-context';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@components/ui/alert-dialog";
import numeral from 'numeral';

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
  prices: any;
}

const TokenList = ({ tokens, onSelect, fromToken, pools, prices }: TokenListProps) => {
  const { getBalance } = useGlobal();

  const formatTokenPrice = (price: number) => {
    if (price >= 1000) {
      return numeral(price).format('0,0');
    } else if (price >= 1) {
      return numeral(price).format('0,0.00');
    } else if (price >= 0.01) {
      return numeral(price).format('0.000');
    } else if (price >= 0.0001) {
      return numeral(price).format('0.0000');
    } else {
      return numeral(price).format('0.000000');
    }
  };

  // Filter tokens to only show ones with balance
  const tokensWithBalance = tokens.filter(token => {
    const balance = getBalance(token.contractId);
    return fromToken ? true : balance > 0;
  });

  return (
    <div className="absolute right-0 z-10 w-full mt-2 overflow-hidden rounded-md shadow-lg bg-[var(--sidebar)] border border-primary/30 min-w-[22rem] sm:min-w-[48rem] grid grid-cols-2 sm:grid-cols-4">
      {tokensWithBalance.map(token => {
        const isDisabled = false;
        const src = token.image;
        const balance = getBalance(token.contractId);
        const formattedBalance = formatBalance(balance, token.decimals);
        const usdValue = (balance / 10 ** token.decimals) * (prices[token.contractId] || 0);

        return (
          <button
            key={token.symbol}
            className={cn(
              'flex flex-col w-full px-4 py-2 text-left',
              isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-accent-foreground'
            )}
            onClick={() => !isDisabled && onSelect(token)}
            disabled={isDisabled}
          >
            <div className="flex justify-between w-full items-center">
              <div className="flex items-center">
                {src ? (
                  <Image
                    src={src}
                    alt={token.symbol}
                    width={240}
                    height={240}
                    className="w-6 mr-1.5 rounded-full"
                  />
                ) : (
                  <Coins className="mr-1.5" />
                )}
                <span className={cn(isDisabled ? 'text-gray-500' : 'text-white', 'truncate', 'flex items-center font-semibold')}>
                  {token.symbol}
                </span>
              </div>
              <div className="text-xs text-white/80 font-semibold mt-0.5">
                ${formatTokenPrice(prices[token.contractId])}
              </div>
            </div>
            {!fromToken ? <div className="mt-0.5 text-xs text-gray-400 flex items-center mx-auto">
              {formattedBalance} ≈ ${usdValue.toFixed(2)}
            </div> : null}
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
  swapPath: Token[];
  minimumReceived: number;
  toToken: Token;
}

const SwapDetails = ({ swapPath, minimumReceived, toToken }: SwapDetailsProps) => {
  return (
    <div className="flex justify-between pt-6">
      <div className="text-sm text-gray-400">
        Swap path: {swapPath.map((token) => token.symbol).join(' → ')}
      </div>
      <div className="text-sm text-gray-400">
        Minimum received: {minimumReceived.toFixed(toToken?.decimals)} {toToken?.symbol}
      </div>
    </div>
  )
};

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
  const [swapPath, setSwapPath] = useState<Token[]>([]);
  const { getBalance, wallet, stxAddress, maxHops, setMaxHops, fromToken, setFromToken, toToken, setToToken, slippage, setSlippage } = useGlobal();
  const estimateTimer = useRef<any>();
  const [exploringPaths, setExploringPaths] = useState(0);
  const [showGraph, setShowGraph] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [lastQuote, setLastQuote] = useState<any>(null);
  const [disablePostConditions, setDisablePostConditions] = useState(false);
  const [showPostConditionsModal, setShowPostConditionsModal] = useState(false);

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
        fetch('/api/v0/proxy/quote', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            tokenIn: fromToken.contractId,
            tokenOut: toToken.contractId,
            amount: Number(amount) * 10 ** fromToken.decimals
          })
        })
          .then(response => response.json())
          .then(quote => {
            setSwapPath(quote.route?.path || []);
            setLastQuote(quote);
            setEstimatedAmountOut((quote.amountOut / 10 ** toToken.decimals).toFixed(toToken.decimals));
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
    [fromToken, toToken, Dexterity.config.maxHops]
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

  const handlePostConditionsToggle = () => {
    if (!disablePostConditions) {
      setShowPostConditionsModal(true);
    } else {
      setDisablePostConditions(false);
    }
  };

  const handleConfirmDisablePostConditions = () => {
    setDisablePostConditions(true);
    setShowPostConditionsModal(false);
  };

  const handleSwap = async () => {
    if (!fromToken || !toToken || !stxAddress || !swapPath) return;

    try {
      setIsSwapping(true);
      const amount = Number(fromAmount) * 10 ** fromToken.decimals;
      const hops = [];
      for (const hop of lastQuote.route.hops) {
        const vault = await Vault.build(hop.vault.contractId);
        const opcode = new Opcode(hop.opcode.code);
        hops.push({ ...hop, vault, opcode });
      }
      lastQuote.route.hops = hops;
      await Dexterity.router.executeSwap(lastQuote.route, amount, { disablePostConditions });
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
      <div className="flex flex-wrap gap-2 mb-4 justify-around">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--sidebar)] border min-w-[5.5rem] border-[var(--accents-7)]">
          <button
            className="flex items-center gap-2 text-white text-sm"
            onClick={() => setShowGraph(!showGraph)}
          >
            <Network className="w-4 h-4" />
            <span className="text-sm text-gray-400">{showGraph ? 'Hide' : 'Show'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--sidebar)] border min-w-[8rem] border-[var(--accents-7)]">
          <span className="text-sm text-gray-400">Search Depth:</span>
          <div className="flex items-center">
            <input
              type="text"
              className="w-3.5 text-sm text-white bg-transparent outline-none"
              value={Dexterity.config.maxHops}
              disabled
            />
            <div className="flex flex-col ml-1">
              <button
                className="text-gray-400 hover:text-white"
                onClick={() => handleMaxHopsChange((Dexterity.config.maxHops + 1).toString())}
              >
                <ChevronDown className="w-3 h-3 rotate-180" />
              </button>
              <button
                className="text-gray-400 hover:text-white"
                onClick={() => handleMaxHopsChange((Dexterity.config.maxHops - 1).toString())}
              >
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--sidebar)] border min-w-[8rem] border-[var(--accents-7)]">
          <span className="text-sm text-gray-400">Max Slippage:</span>
          <input
            type="text"
            className="w-3.5 text-sm text-white bg-transparent outline-none"
            value={slippage * 100}
            onChange={handleSlippageChange}
            placeholder="0"
          />
          <span className="text-sm text-gray-400">%</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--sidebar)] border min-w-[8rem] border-[var(--accents-7)]">
          <span className="text-sm text-gray-400">Post Conditions:</span>
          <button
            className={`px-2 py-1 text-sm rounded ${disablePostConditions ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'
              }`}
            onClick={handlePostConditionsToggle}
          >
            {disablePostConditions ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {showGraph && (
        <SwapGraphVisualizer
          fromToken={fromToken}
          toToken={toToken}
          paths={Dexterity.router.findAllPaths(fromToken.contractId, toToken.contractId)}
          currentPath={lastQuote.route}
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
                    prices={prices}
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
                    prices={prices}
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
            disabled={isCalculating || estimatedAmountOut === '0' || !fromAmount || isSwapping || !swapPath}
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

      <AlertDialog open={showPostConditionsModal} onOpenChange={setShowPostConditionsModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disable Post Conditions?</AlertDialogTitle>
            <AlertDialogDescription>
              Post conditions are safety checks that protect you from unexpected outcomes in your transactions.
              Disabling them can be dangerous and should only be done if you fully understand the implications.
              Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDisablePostConditions}>
              Yes, Disable Post Conditions
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
