import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import { Card } from '@components/ui/card';
import { SetStateAction, ChangeEvent, useMemo, useState, useEffect, useCallback } from 'react';
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
import rooLogo from '@public/roo-logo.png';
import useWallet from '@lib/hooks/wallet-balance-provider';
import numeral from 'numeral';
import { ChevronDown, ArrowUpDown } from 'lucide-react';
import velarApi from '@lib/velar-api';
import { GetStaticProps } from 'next';
import { es } from 'date-fns/locale';


export const getStaticProps: GetStaticProps<Props> = async () => {
  const prices = await velarApi.tokens('all')
  return {
    props: {
      data: {
        prices
      }
    },
    revalidate: 60
  };
};

type Props = {
  data: any;
};

export default function SwapPage({ data }: Props) {
  const meta = {
    title: 'Charisma | Swap',
    description: "The Charisma Swap",
  };

  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <div className="m-2 sm:container sm:mx-auto sm:pb-10 md:max-w-5xl">
          <div className='mt-2 mb-4 font-semibold text-center text-muted/90'>All trading fees go to WELSH & ROO token redemptions</div>
          <SwapInterface data={data} />
        </div>
      </Layout>
    </Page>
  );
}

const tokens = [
  // { symbol: 'STX', name: 'Stacks', image: stxLogo, tokenName: 'wtsx', contractAddress: 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.wstx' },
  { symbol: 'WELSH', name: 'Welsh', image: welshLogo, tokenName: 'welshcorgicoin', contractAddress: 'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token' },
  { symbol: 'iouWELSH', name: 'Synthetic Welsh', image: welshLogo, tokenName: 'synthetic-welsh', contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-welsh' },
  // { symbol: 'ROO', name: 'Roo', image: rooLogo, tokenName: 'kangaroo', contractAddress: 'SP2C1WREHGM75C7TGFAEJPFKTFTEGZKF6DFT6E2GE.kangaroo' },
  // { symbol: 'iouROO', name: 'Synthetic Roo', image: rooLogo, tokenName: 'synthetic-roo', contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-roo' },
];

const SwapInterface = ({ data }: Props) => {
  const [fromToken, setFromToken] = useState(tokens[0]);
  const [toToken, setToToken] = useState(tokens[1]);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [showFromTokens, setShowFromTokens] = useState(false);
  const [showToTokens, setShowToTokens] = useState(false);
  const [estimatedAmountOut, setEstimatedAmountOut] = useState('0');
  const [isCalculating, setIsCalculating] = useState(false);
  const [slippage, setSlippage] = useState(20); // 20% default slippage
  const [reserves, setReserves] = useState({ reserveA: BigInt(0), reserveB: BigInt(0) });

  const { openContractCall } = useOpenContractCall();
  const { stxAddress } = useAccount();

  const fetchReserves = useCallback(async (tokenA: string, tokenB: string) => {
    try {
      console.log({ tokenA, tokenB });
      const result: any = await callReadOnlyFunction({
        contractAddress: "SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1",
        contractName: "univ2-core",
        functionName: "lookup-pool",
        functionArgs: [
          principalCV(tokenA),
          principalCV(tokenB)
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
  }, [stxAddress]);

  useEffect(() => {
    if (fromToken && toToken) {
      fetchReserves(fromToken.contractAddress, toToken.contractAddress);
    }
  }, [fromToken, toToken, fetchReserves]);

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
    if (!amount || isNaN(parseFloat(amount)) || !stxAddress || reserves.reserveA === BigInt(0) || reserves.reserveB === BigInt(0)) {
      setEstimatedAmountOut('0');
      return;
    }

    setIsCalculating(true);

    try {
      const amountInMicroTokens = BigInt(Math.floor(parseFloat(amount) * 1000000));

      console.log('Calculating amount out:', { amountIn: amountInMicroTokens, reserveIn: reserves.reserveA, reserveOut: reserves.reserveB });

      const result: any = await callReadOnlyFunction({
        contractAddress: 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1',
        contractName: 'univ2-library',
        functionName: 'get-amount-out',
        functionArgs: [
          uintCV(amountInMicroTokens),
          uintCV(reserves.reserveA),
          uintCV(reserves.reserveB),
          tupleCV({
            num: uintCV(9500),
            den: uintCV(1000)
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
  const welsh = getBalanceByKey('SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token::welshcorgicoin');
  const roo = getBalanceByKey('SP2C1WREHGM75C7TGFAEJPFKTFTEGZKF6DFT6E2GE.kangaroo::kangaroo');
  const iouWelsh = getBalanceByKey('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-welsh::synthetic-welsh');
  const iouRoo = getBalanceByKey('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-roo::synthetic-roo');

  const getBalance = useMemo(() => {
    return (symbol: any) => {
      switch (symbol) {
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
        case 'WELSH':
          return data.prices.find((token: any) => token.symbol === 'WELSH').price;
        case 'ROO':
          return data.prices.find((token: any) => token.symbol === '$ROO').price;
        case 'iouWELSH':
          return iouWelsh || 0;
        case 'iouROO':
          return iouRoo || 0;
        default:
          return 0;
      }
    };
  }, [welsh, roo, iouWelsh, iouRoo]);

  const handleSwap = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    // setFromAmount(toAmount);
    // setToAmount(fromAmount);
  };

  const selectToken = (token: any, isFrom: boolean) => {
    if (isFrom) {
      setFromToken(token);
      setShowFromTokens(false);
    } else {
      setToToken(token);
      setShowToTokens(false);
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
    const token0Address: any = fromToken.contractAddress
    const token1Address: any = toToken.contractAddress
    const [contractAddress0, contractName0] = token0Address.split('.');
    const [contractAddress1, contractName1] = token1Address.split('.');
    const amountInMicroTokens = Math.floor(parseFloat(fromAmount) * 1000000); // Convert to micro-tokens
    const minAmountOutMicroTokens = Math.floor(parseFloat(calculateMinimumAmountOut(estimatedAmountOut)) * 1000000);

    const id = 0 // placeholder for id, to be set later

    openContractCall({
      contractAddress: "SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1",
      contractName: 'univ2-router',
      functionName: "swap-exact-tokens-for-tokens",
      functionArgs: [
        uintCV(id),
        contractPrincipalCV(contractAddress0, contractName0),
        contractPrincipalCV(contractAddress1, contractName1),
        contractPrincipalCV(contractAddress0, contractName0),
        contractPrincipalCV(contractAddress1, contractName1),
        contractPrincipalCV("SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1", "univ2-router"), // placeholder for shareFeeTo
        uintCV(amountInMicroTokens),
        uintCV(minAmountOutMicroTokens)
      ],
      postConditionMode: PostConditionMode.Deny,
      postConditions: [
        Pc.principal(stxAddress as string).willSendEq(amountInMicroTokens).ft(token0Address, fromToken.tokenName), // amount in
        Pc.principal('SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.univ2-core').willSendGte(minAmountOutMicroTokens).ft(token1Address, toToken.tokenName), // amount out
        Pc.principal('SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.univ2-core').willSendGte(0).ft(token0Address, fromToken.tokenName), // swap fee
      ] as any[],
    });
  }, [fromAmount, estimatedAmountOut, fromToken, toToken, stxAddress, openContractCall, calculateMinimumAmountOut]);



  return (
    <div className="container max-w-screen-sm px-4 mx-auto">
      <div className="mt-12">
        <div className="relative p-6 rounded-lg bg-[var(--sidebar)] overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white">Swap</h1>

            {/* Slippage Tolerance */}
            <div className="p-4">
              <div className="flex items-center justify-between text-md">
                <span className="text-gray-400">Slippage Tolerance</span>
                <div className="flex items-center">
                  <input
                    type="text"
                    className="w-8 text-right text-gray-300 bg-transparent outline-none"
                    value={slippage}
                    onChange={handleSlippageChange}
                    placeholder="0.5"
                  />
                  <span className="ml-1 text-gray-300">%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* From Section */}
            <div className="p-4 rounded-lg shadow-xl shadow-primary/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">From</span>
                <div className="relative">
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
                      {tokens.map((token) => (
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
                <span className="text-gray-400">${(getPrice(fromToken.symbol) * Number(fromAmount)).toFixed(2)}</span>
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
                <div className="relative">
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
                      {tokens.map((token) => (
                        <button
                          key={token.symbol}
                          className="flex items-center w-full px-4 py-2 text-left hover:bg-accent-foreground"
                          onClick={() => selectToken(token, false)}
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
                disabled
                type="text"
                placeholder="0.00"
                className="w-full text-2xl text-white bg-transparent outline-none"
                value={isCalculating ? 'Calculating...' : estimatedAmountOut}
                onChange={(e) => handleAmountChange(e, setToAmount)}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-gray-400">${(getPrice(toToken.symbol) * Number(estimatedAmountOut)).toFixed(2)}</span>
                <span className="text-gray-400">Balance: {formatBalance(getBalance(toToken.symbol))}</span>
              </div>
            </div>

            <div>Minimum received: {calculateMinimumAmountOut(estimatedAmountOut)} {toToken.symbol}</div>

            {/* Swap Button */}
            <Button
              className="w-full px-4 py-3 mt-4 font-bold rounded-lg"
              onClick={swapTokens}
              disabled={isCalculating || estimatedAmountOut === '0' || !fromAmount}
            >
              {isCalculating ? 'Calculating...' : 'Confirm Swap'}
            </Button>

            {/* Exchange Rate */}
            <div className="mt-4 text-center text-gray-400">
              1 {fromToken.symbol} ≈ {Number(reserves.reserveB) / Number(reserves.reserveA)} {toToken.symbol}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};