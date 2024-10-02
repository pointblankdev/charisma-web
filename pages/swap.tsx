import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import { Card } from '@components/ui/card';
import { SetStateAction, ChangeEvent, useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { callReadOnlyFunction, cvToJSON, hexToCV, Pc, PostConditionMode, principalCV, tupleCV, uintCV } from "@stacks/transactions";
import { Button } from "@components/ui/button";
import { Input } from '@components/ui/input';
import Layout from '@components/layout/layout';
import { useAccount, useOpenContractCall } from '@micro-stacks/react';
import { contractPrincipalCV, boolCV } from 'micro-stacks/clarity';
import redPill from '@public/sip9/pills/red-pill-floating.gif';
import redPillNft from '@public/sip9/pills/red-pill-nft.gif';
import bluePillNft from '@public/sip9/pills/blue-pill-nft.gif';
import bluePill from '@public/sip9/pills/blue-pill.gif';
import charismaFloating from '@public/sip9/pills/cha-floating.gif';
import bluePillFloating from '@public/sip9/pills/blue-pill-floating.gif';
import Image, { StaticImageData } from 'next/image';
import charisma from '@public/charisma.png';
import stxLogo from '@public/stx-logo.png';
import welshLogo from '@public/welsh-logo.png';
import chaLogo from '@public/charisma-logo-square.png';
import rooLogo from '@public/roo-logo.png';
import useWallet from '@lib/hooks/wallet-balance-provider';
import numeral from 'numeral';
import { ChevronDown, ArrowUpDown } from 'lucide-react';
import velarApi from '@lib/velar-api';
import { GetStaticProps } from 'next';

type TokenInfo = {
  symbol: string;
  name: string;
  image: StaticImageData;
  tokenName: string;
  contractAddress: string;
};

type PoolInfo = {
  id: number;
  token0: TokenInfo;
  token1: TokenInfo;
  swapFee: { num: number; den: number };
};

type Props = {
  data: {
    prices: any;
    tokens: TokenInfo[];
    pools: PoolInfo[];
  };
};

export const getStaticProps: GetStaticProps<Props> = async () => {
  const prices = await velarApi.tokens('all');

  // Define tokens
  const tokens: TokenInfo[] = [
    { symbol: 'CHA', name: 'Charisma', image: chaLogo, tokenName: 'charisma', contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token' },
    { symbol: 'WELSH', name: 'Welsh', image: welshLogo, tokenName: 'welshcorgicoin', contractAddress: 'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token' },
    { symbol: 'iouWELSH', name: 'Synthetic Welsh', image: welshLogo, tokenName: 'synthetic-welsh', contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-welsh' },
    { symbol: 'ROO', name: 'Roo', image: rooLogo, tokenName: 'kangaroo', contractAddress: 'SP2C1WREHGM75C7TGFAEJPFKTFTEGZKF6DFT6E2GE.kangaroo' },
    { symbol: 'iouROO', name: 'Synthetic Roo', image: rooLogo, tokenName: 'synthetic-roo', contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-roo' },
    // Add other tokens here
  ];

  // Define pools
  const pools: PoolInfo[] = [
    {
      id: 1,
      token0: tokens[1], // WELSH
      token1: tokens[2], // iouWELSH
      swapFee: { num: 995, den: 1000 }, // 0.5% fee
    },
    {
      id: 2,
      token0: tokens[3], // ROO
      token1: tokens[4], // iouROO
      swapFee: { num: 995, den: 1000 }, // 0.5% fee
    },
    {
      id: 3,
      token0: tokens[0], // CHA
      token1: tokens[1], // WELSH
      swapFee: { num: 995, den: 1000 }, // 0.5% fee
    },
    // Add other pools here
  ];

  return {
    props: {
      data: {
        prices,
        tokens,
        pools,
      }
    },
    revalidate: 60
  };
};

export default function SwapPage({ data }: Props) {
  const meta = {
    title: 'Charisma | Swap',
    description: "Swap tokens on the Charisma DEX",
    image: 'https://charisma.rocks/swap-screenshot.png',
  };

  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <div className="sm:container sm:mx-auto sm:pb-10 md:max-w-5xl">
          <div className='my-2 font-light text-center text-muted-foreground/90'>All trading fees go to WELSH & ROO token redemptions</div>
          <SwapInterface data={data} />
        </div>
      </Layout>
    </Page>
  );
}

const SwapInterface = ({ data }: Props) => {
  const [fromToken, setFromToken] = useState(data.tokens[0]);
  const [toToken, setToToken] = useState(data.tokens[1]);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [showFromTokens, setShowFromTokens] = useState(false);
  const [showToTokens, setShowToTokens] = useState(false);
  const [estimatedAmountOut, setEstimatedAmountOut] = useState('0');
  const [isCalculating, setIsCalculating] = useState(false);
  const [slippage, setSlippage] = useState(4); // 4% default slippage
  const [reserves, setReserves] = useState({ reserveA: BigInt(0), reserveB: BigInt(0) });

  const { openContractCall } = useOpenContractCall();
  const { stxAddress } = useAccount();

  const currentPool = useMemo(() => {
    return data.pools.find(pool =>
      (pool.token0.symbol === fromToken.symbol && pool.token1.symbol === toToken.symbol) ||
      (pool.token1.symbol === fromToken.symbol && pool.token0.symbol === toToken.symbol)
    );
  }, [fromToken, toToken, data.pools]);

  const fetchReserves = useCallback(async () => {
    if (!currentPool) return;
    try {
      const result: any = await callReadOnlyFunction({
        contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
        contractName: "univ2-core",
        functionName: "lookup-pool",
        functionArgs: [
          principalCV(currentPool.token0.contractAddress),
          principalCV(currentPool.token1.contractAddress)
        ],
        senderAddress: stxAddress || '',
      });
      if (result.value) {
        const poolInfo = result.value.data.pool;
        const flipped = cvToJSON(result.value.data.flipped).value;
        const reserve0 = BigInt(poolInfo.data.reserve0.value);
        const reserve1 = BigInt(poolInfo.data.reserve1.value);
        setReserves({
          reserveA: flipped ? reserve1 : reserve0,
          reserveB: flipped ? reserve0 : reserve1
        });
      } else {
        console.error("Pool not found");
        setReserves({ reserveA: BigInt(0), reserveB: BigInt(0) });
      }
    } catch (error) {
      console.error("Error fetching reserves:", error);
      setReserves({ reserveA: BigInt(0), reserveB: BigInt(0) });
    }
  }, [currentPool, stxAddress]);

  useEffect(() => {
    if (currentPool) {
      fetchReserves();
    }
  }, [toToken, fromToken, currentPool, fetchReserves]);

  const calculateMinimumAmountOut = useCallback((estimatedAmount: string) => {
    const estimated = parseFloat(estimatedAmount);
    if (isNaN(estimated)) return '0';
    const minAmount = estimated * (1 - slippage / 100);
    return minAmount.toFixed(6);
  }, [slippage]);


  const handleSlippageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and a single decimal point
    if (/^[0-9]*\.?[0-9]*$/.test(value) || value === '') {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
        setSlippage(numValue);
      }
    }
  };

  const calculateEstimatedAmountOut = useCallback(async (amount: string) => {
    if (!amount || isNaN(parseFloat(amount)) || !stxAddress || !currentPool) {
      setEstimatedAmountOut('0');
      return;
    }

    setIsCalculating(true);

    try {
      const amountInMicroTokens = BigInt(Math.floor(parseFloat(amount) * 1000000));

      // Determine if the input token is token0 or token1 in the pool
      const isFromToken0 = fromToken.contractAddress === currentPool.token0.contractAddress;

      // Set the correct reserves based on the swap direction
      const reserveIn = isFromToken0 ? reserves.reserveA : reserves.reserveB;
      const reserveOut = isFromToken0 ? reserves.reserveB : reserves.reserveA;

      console.log('Calculating amount out:', {
        amountIn: amountInMicroTokens,
        reserveIn,
        reserveOut,
        swapFee: currentPool.swapFee
      });

      const result: any = await callReadOnlyFunction({
        contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
        contractName: 'univ2-library',
        functionName: 'get-amount-out',
        functionArgs: [
          uintCV(amountInMicroTokens),
          uintCV(reserveIn),
          uintCV(reserveOut),
          tupleCV({
            num: uintCV(currentPool.swapFee.num),
            den: uintCV(currentPool.swapFee.den)
          })
        ],
        senderAddress: stxAddress,
      });

      if (result.value) {
        const estimatedOut = (Number(result.value.value) / 1000000).toFixed(6);
        setEstimatedAmountOut(estimatedOut);
        console.log('Estimated amount out:', estimatedOut);
      } else {
        setEstimatedAmountOut('0');
      }
    } catch (error) {
      console.error('Error calculating estimated amount out:', error);
      setEstimatedAmountOut('0');
    } finally {
      setIsCalculating(false);
    }
  }, [stxAddress, reserves]);

  useEffect(() => {
    calculateEstimatedAmountOut(fromAmount);
  }, [fromAmount, calculateEstimatedAmountOut]);

  const { getBalanceByKey } = useWallet();
  const cha = getBalanceByKey('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token::charisma');
  const welsh = getBalanceByKey('SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token::welshcorgicoin');
  const roo = getBalanceByKey('SP2C1WREHGM75C7TGFAEJPFKTFTEGZKF6DFT6E2GE.kangaroo::kangaroo');
  const iouWelsh = getBalanceByKey('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-welsh::synthetic-welsh');
  const iouRoo = getBalanceByKey('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-roo::synthetic-roo');

  const getBalance = useMemo(() => {
    return (symbol: any) => {
      switch (symbol) {
        case 'CHA':
          return cha || 0;
        case 'WELSH':
          return welsh || 0;
        case 'ROO':
          return roo || 0;
        case 'iouWELSH':
          return iouWelsh || 0;
        case 'iouROO':
          return iouRoo || 0;
        default:
          return 0;
      }
    };
  }, [welsh, roo, iouWelsh, iouRoo]);

  const getPrice = useMemo(() => {
    return (symbol: any) => {
      switch (symbol) {
        case 'STX':
          return data.prices.find((token: any) => token.symbol === 'STX').price;
        case 'CHA':
          const welshPrice = data.prices.find((token: any) => token.symbol === 'WELSH').price;
          const reserveRatio = reserves.reserveA ? (reserves.reserveB / reserves.reserveA) : 1;
          console.log(reserveRatio)
          return welshPrice * Number(reserveRatio);
        case 'WELSH':
          return data.prices.find((token: any) => token.symbol === 'WELSH').price;
        case 'ROO':
          return data.prices.find((token: any) => token.symbol === '$ROO').price;
        case 'iouWELSH':
          return data.prices.find((token: any) => token.symbol === 'WELSH').price;
        case 'iouROO':
          return data.prices.find((token: any) => token.symbol === '$ROO').price;
        default:
          return 0;
      }
    };
  }, [welsh, roo, iouWelsh, iouRoo, reserves]);

  const handleSwap = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    // setFromAmount(toAmount);
    // setToAmount(fromAmount);
  };

  const isTokenPairValid = useCallback((token1: TokenInfo, token2: TokenInfo) => {
    return data.pools.some(pool =>
      (pool.token0.symbol === token1.symbol && pool.token1.symbol === token2.symbol) ||
      (pool.token1.symbol === token1.symbol && pool.token0.symbol === token2.symbol)
    );
  }, [data.pools]);

  const getFirstValidPair = useCallback((token: TokenInfo) => {
    return data.tokens.find(t => t.symbol !== token.symbol && isTokenPairValid(token, t));
  }, [data.tokens, isTokenPairValid]);

  const selectToken = (token: TokenInfo, isFrom: boolean) => {
    if (isFrom) {
      setFromToken(token);
      setShowFromTokens(false);

      // Check if current 'to' token forms a valid pair with the new 'from' token
      if (!isTokenPairValid(token, toToken)) {
        // If not, find the first valid 'to' token and set it
        const firstValidToToken = getFirstValidPair(token);
        if (firstValidToToken) {
          setToToken(firstValidToToken);
        }
      }
    } else {
      // For 'to' token, only allow selection if it forms a valid pair
      if (isTokenPairValid(fromToken, token)) {
        setToToken(token);
        setShowToTokens(false);
      }
    }
  };

  const formatBalance = (balance: number) => {
    return (balance / 1000000).toFixed(6);
  };

  const handleUseMax = () => {
    const maxBalance = getBalance(fromToken.symbol);
    setFromAmount(formatBalance(maxBalance));
  };

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>, setAmount: { (value: SetStateAction<string>): void; (value: SetStateAction<string>): void; (arg0: any): void; }) => {
    const value = e.target.value;
    // Allow only numbers and a single decimal point
    if (/^[0-9]*\.?[0-9]*$/.test(value) || value === '') {
      setAmount(value);
    }
  };


  const swapTokens = useCallback(() => {
    if (!currentPool) return;

    const amountInMicroTokens = Math.floor(parseFloat(fromAmount) * 1000000);
    const minAmountOutMicroTokens = Math.floor(parseFloat(calculateMinimumAmountOut(estimatedAmountOut)) * 1000000);

    const {
      token0: { contractAddress: token0Address },
      token1: { contractAddress: token1Address }
    } = currentPool;

    const [token0AddressPrincipal, token0AddressContract] = token0Address.split('.');
    const [token1AddressPrincipal, token1AddressContract] = token1Address.split('.');
    const [fromTokenPrincipal, fromTokenContract] = fromToken.contractAddress.split('.');
    const [toTokenPrincipal, toTokenContract] = toToken.contractAddress.split('.');

    openContractCall({
      contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
      contractName: 'univ2-router',
      functionName: "swap-exact-tokens-for-tokens",
      functionArgs: [
        uintCV(currentPool.id),
        contractPrincipalCV(token0AddressPrincipal, token0AddressContract),
        contractPrincipalCV(token1AddressPrincipal, token1AddressContract),
        contractPrincipalCV(fromTokenPrincipal, fromTokenContract),
        contractPrincipalCV(toTokenPrincipal, toTokenContract),
        contractPrincipalCV("SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS", "univ2-share-fee-to"),
        uintCV(amountInMicroTokens),
        uintCV(minAmountOutMicroTokens)
      ],
      postConditionMode: PostConditionMode.Deny,
      postConditions: [
        Pc.principal(stxAddress as string).willSendEq(amountInMicroTokens).ft(fromToken.contractAddress as any, fromToken.tokenName),
        Pc.principal('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.univ2-core').willSendGte(minAmountOutMicroTokens).ft(toToken.contractAddress as any, toToken.tokenName),
      ] as any[],
    });
  }, [fromAmount, estimatedAmountOut, fromToken, toToken, stxAddress, openContractCall, calculateMinimumAmountOut, currentPool]);

  const fromDropdownRef = useRef<HTMLDivElement>(null);
  const toDropdownRef = useRef<HTMLDivElement>(null);

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
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const syntheticPriceDisclaimer = "Synthetic tokens show their base token's price, as they are redeemable 1:1 when using the Charisma Redemption Vault. While 100% of protocol fees are used to provide collateral for redemptions– availability is not guaranteed at any given time, as redemptions are handled on a first-come, first-served basis. Please refer to the Charisma Redemption Vault for more information.";

  return (
    <div className="max-w-screen-sm sm:mx-auto sm:px-4">
      <div className="mt-6">
        <div className="relative px-6 pb-4 pt-2 sm:rounded-lg bg-[var(--sidebar)] overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-white/95">Swap</h1>

            {/* Slippage Tolerance */}
            <div className="p-4">
              <div className="flex items-center justify-between text-md">
                <span className="text-gray-400">Slippage Tolerance</span>
                <div className="flex items-center">
                  <input
                    type="text"
                    className="w-6 text-right text-gray-300 bg-transparent outline-none"
                    value={slippage}
                    onChange={handleSlippageChange}
                    placeholder="0.5"
                  />
                  <span className="ml-1 text-gray-300">%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-2 space-y-4">
            {/* From Section */}
            <div className="p-4 rounded-lg shadow-xl shadow-primary/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">From</span>
                <div className="relative" ref={fromDropdownRef}>
                  <button
                    className="flex items-center px-3 py-1 border rounded-full shadow-lg border-primary/30 shadow-primary/10"
                    onClick={() => setShowFromTokens(!showFromTokens)}
                  >
                    <Image src={fromToken.image} alt={fromToken.symbol} width={24} height={24} className="mr-2 rounded-full" />
                    <span className="mr-1 text-white">{fromToken.symbol}</span>
                    <ChevronDown className="text-gray-400" size={16} />
                  </button>
                  {showFromTokens && (
                    <div className="absolute right-0 z-10 w-full mt-2 overflow-hidden rounded-md shadow-lg bg-[var(--sidebar)] border border-primary/30 min-w-36">
                      {data.tokens.map((token) => (
                        <button
                          key={token.symbol}
                          className="flex items-center w-full px-4 py-2 text-left hover:bg-accent-foreground"
                          onClick={() => selectToken(token, true)}
                        >
                          <Image src={token.image} alt={token.symbol} width={24} height={24} className="mr-2 rounded-full" />
                          <span className="text-white">{token.symbol}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <input
                type="text"
                placeholder="0.00"
                className="w-full text-2xl text-white bg-transparent outline-none"
                value={fromAmount}
                onChange={(e) => handleAmountChange(e, setFromAmount)}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-gray-400">
                  ${(getPrice(fromToken.symbol) * Number(fromAmount)).toFixed(2)}
                  {fromToken.symbol.startsWith('iou') && (
                    <span className="px-1.5 ml-2 text-sm text-white/50 rounded-full cursor-help bg-accent-foreground pb-0.5" title={syntheticPriceDisclaimer}>
                      𝖎
                    </span>
                  )}
                </span>
                <div>
                  <span className="mr-2 text-gray-400">Balance: {formatBalance(getBalance(fromToken.symbol))}</span>
                  <button
                    className="text-sm text-primary hover:text-primary"
                    onClick={handleUseMax}
                  >
                    Use Max
                  </button>
                </div>
              </div>
            </div>

            {/* Swap Direction Button */}
            <div className='flex'>
              <button
                className="p-2 mx-auto rounded-full bg-[var(--sidebar)]"
                onClick={handleSwap}
              >
                <ArrowUpDown className="text-gray-400" size={24} />
              </button>
            </div>

            {/* To Section */}
            <div className="p-4 rounded-lg shadow-xl shadow-primary/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">To</span>
                <div className="relative" ref={toDropdownRef}>
                  <button
                    className="flex items-center px-3 py-1 border rounded-full shadow-lg border-primary/30 shadow-primary/10"
                    onClick={() => setShowToTokens(!showToTokens)}
                  >
                    <Image src={toToken.image} alt={toToken.symbol} width={24} height={24} className="mr-2 rounded-full" />
                    <span className="mr-1 text-white">{toToken.symbol}</span>
                    <ChevronDown className="text-gray-400" size={16} />
                  </button>
                  {showToTokens && (
                    <div className="absolute right-0 z-10 w-full mt-2 overflow-hidden rounded-md shadow-lg bg-[var(--sidebar)] border border-primary/30 min-w-36">
                      {data.tokens.map((token) => {
                        const isDisabled = !isTokenPairValid(fromToken, token);
                        return (
                          <button
                            key={token.symbol}
                            className={`flex items-center w-full px-4 py-2 text-left ${isDisabled
                              ? 'opacity-50 cursor-not-allowed'
                              : 'hover:bg-accent-foreground'
                              }`}
                            onClick={() => !isDisabled && selectToken(token, false)}
                          >
                            <Image src={token.image} alt={token.symbol} width={24} height={24} className="mr-2 rounded-full" />
                            <span className={isDisabled ? 'text-gray-500' : 'text-white'}>{token.symbol}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              <input
                disabled
                type="text"
                placeholder="0.00"
                className="w-full text-2xl text-white bg-transparent outline-none"
                value={isCalculating ? 'Calculating...' : estimatedAmountOut}
                onChange={(e) => handleAmountChange(e, setToAmount)}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-gray-400">
                  ${(getPrice(toToken.symbol) * Number(estimatedAmountOut)).toFixed(2)}
                  {toToken.symbol.startsWith('iou') && (
                    <span className="px-1.5 ml-2 text-sm text-white/50 rounded-full cursor-help bg-accent-foreground pb-0.5" title={syntheticPriceDisclaimer}>
                      𝖎
                    </span>
                  )}
                </span>
                <span className="text-gray-400">Balance: {formatBalance(getBalance(toToken.symbol))}</span>
              </div>
            </div>

            <div className='pt-4 text-muted-foreground'>Minimum received: {calculateMinimumAmountOut(estimatedAmountOut)} {toToken.symbol}</div>

            {/* Swap Button */}
            <Button
              className="w-full px-4 py-3 mt-4 font-bold rounded-lg"
              onClick={swapTokens}
              disabled={isCalculating || estimatedAmountOut === '0' || !fromAmount}
            >
              {isCalculating ? 'Calculating...' : 'Confirm Swap'}
            </Button>

            {/* Exchange Rate */}
            {/* <div className="mt-4 text-center text-gray-400">
              1 {fromToken.symbol} ≈ {Number(reserves.reserveB) / Number(reserves.reserveA)} {toToken.symbol}
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};