import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import { Card } from '@components/ui/card';
import { SetStateAction, ChangeEvent, useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { callReadOnlyFunction, contractPrincipalCV, cvToJSON, hexToCV, listCV, Pc, PostConditionMode, principalCV, tupleCV, uintCV } from "@stacks/transactions";
import { Button } from "@components/ui/button";
import { Input } from '@components/ui/input';
import Layout from '@components/layout/layout';
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
import ordiLogo from '@public/ordi-logo.png';
import dogLogo from '@public/sip10/dogLogo.webp';
import useWallet from '@lib/hooks/wallet-balance-provider';
import numeral from 'numeral';
import { ChevronDown, ArrowUpDown } from 'lucide-react';
import velarApi from '@lib/velar-api';
import { GetStaticProps } from 'next';
import cmc from '@lib/cmc-api';
import { useGlobalState } from '@lib/hooks/global-state-context';
import { useConnect } from '@stacks/connect-react';
import { network } from '@components/stacks-session/connect';

type TokenInfo = {
  symbol: string;
  name: string;
  image: StaticImageData;
  tokenName?: string;
  contractAddress: string;
  decimals: number;
};

type PoolInfo = {
  id: number;
  token0: TokenInfo;
  token1: TokenInfo;
  swapFee: { num: number; den: number };
};

type Props = {
  data: {
    chaPerStx: number;
    prices: any;
    cmcPriceData: any;
    tokens: TokenInfo[];
    pools: PoolInfo[];
  };
};

export const getStaticProps: GetStaticProps<Props> = async () => {
  const velarPriceData = await velarApi.tokens('all');
  const cmcPriceData = await cmc.getQuotes({ symbol: ['STX', 'ORDI', 'WELSH', 'DOG'] })

  const result: any = await callReadOnlyFunction({
    contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
    contractName: "univ2-core",
    functionName: "lookup-pool",
    functionArgs: [
      principalCV('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wstx'),
      principalCV('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token')
    ],
    senderAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
  });
  const poolInfo = result.value.data.pool;
  const reserve0 = BigInt(poolInfo.data.reserve0.value);
  const reserve1 = BigInt(poolInfo.data.reserve1.value);
  const chaPerStx = Number(reserve1) / Number(reserve0);

  // Define tokens
  const tokens: TokenInfo[] = [
    {
      symbol: 'STX',
      name: 'Stacks',
      image: stxLogo,
      // tokenName: 'wstx',
      contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wstx',
      decimals: 6
    },
    {
      symbol: 'CHA',
      name: 'Charisma',
      image: chaLogo,
      tokenName: 'charisma',
      contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token',
      decimals: 6
    },
    {
      symbol: 'WELSH',
      name: 'Welsh',
      image: welshLogo,
      tokenName: 'welshcorgicoin',
      contractAddress: 'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token',
      decimals: 6
    },
    {
      symbol: 'iouWELSH',
      name: 'Synthetic Welsh',
      image: welshLogo,
      tokenName: 'synthetic-welsh',
      contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-welsh',
      decimals: 6
    },
    {
      symbol: 'ROO',
      name: 'Roo',
      image: rooLogo,
      tokenName: 'kangaroo',
      contractAddress: 'SP2C1WREHGM75C7TGFAEJPFKTFTEGZKF6DFT6E2GE.kangaroo',
      decimals: 6
    },
    {
      symbol: 'iouROO',
      name: 'Synthetic Roo',
      image: rooLogo,
      tokenName: 'synthetic-roo',
      contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-roo',
      decimals: 6
    },
    {
      symbol: 'ORDI',
      name: 'Ordi',
      image: ordiLogo,
      tokenName: 'brc20-ordi',
      contractAddress: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.brc20-ordi',
      decimals: 8
    },
    {
      symbol: 'DOG',
      name: 'DOG-GO-TO-THE-MOON',
      image: dogLogo,
      tokenName: 'runes-dog',
      contractAddress: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.runes-dog',
      decimals: 8
    },
  ];

  // Define pools
  const pools: PoolInfo[] = [
    {
      id: 1,
      token0: tokens.find(token => token.symbol === 'WELSH') as TokenInfo,
      token1: tokens.find(token => token.symbol === 'iouWELSH') as TokenInfo,
      swapFee: { num: 995, den: 1000 }, // 0.5% fee
    },
    {
      id: 2,
      token0: tokens.find(token => token.symbol === 'ROO') as TokenInfo,
      token1: tokens.find(token => token.symbol === 'iouROO') as TokenInfo,
      swapFee: { num: 995, den: 1000 }, // 0.5% fee
    },
    {
      id: 3,
      token0: tokens.find(token => token.symbol === 'CHA') as TokenInfo,
      token1: tokens.find(token => token.symbol === 'WELSH') as TokenInfo,
      swapFee: { num: 995, den: 1000 }, // 0.5% fee
    },
    {
      id: 4,
      token0: tokens[0], // wSTX
      token1: tokens[1], // CHA
      swapFee: { num: 995, den: 1000 }, // 0.5% fee
    },
    {
      id: 5,
      token0: tokens.find(token => token.symbol === 'CHA') as TokenInfo,
      token1: tokens.find(token => token.symbol === 'iouWELSH') as TokenInfo,
      swapFee: { num: 995, den: 1000 }, // 0.5% fee
    },
    {
      id: 6,
      token0: tokens.find(token => token.symbol === 'CHA') as TokenInfo,
      token1: tokens.find(token => token.symbol === 'ORDI') as TokenInfo,
      swapFee: { num: 995, den: 1000 }, // 0.5% fee
    },
    {
      id: 7,
      token0: tokens.find(token => token.symbol === 'CHA') as TokenInfo,
      token1: tokens.find(token => token.symbol === 'ROO') as TokenInfo,
      swapFee: { num: 995, den: 1000 }, // 0.5% fee
    },
    {
      id: 8,
      token0: tokens.find(token => token.symbol === 'WELSH') as TokenInfo,
      token1: tokens.find(token => token.symbol === 'DOG') as TokenInfo,
      swapFee: { num: 995, den: 1000 }, // 0.5% fee
    },
    // Add other pools here
  ];

  return {
    props: {
      data: {
        chaPerStx,
        prices: velarPriceData,
        cmcPriceData,
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

  const { wallet } = useWallet();
  const experienceBalance = wallet.experience.balance;

  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <div className="sm:container sm:mx-auto sm:pb-10 md:max-w-5xl">
          <div className='my-2 font-light text-center text-muted-foreground/90'>All trading fees go to WELSH & ROO token redemptions</div>
          <SwapInterface data={data} experienceBalance={experienceBalance} />
        </div>
      </Layout>
    </Page>
  );
}

const SwapInterface = ({ data, experienceBalance }: { data: Props['data'], experienceBalance: number }) => {
  const [fromToken, setFromToken] = useState(data.tokens[0]);
  const [toToken, setToToken] = useState(data.tokens[1]);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [showFromTokens, setShowFromTokens] = useState(false);
  const [showToTokens, setShowToTokens] = useState(false);
  const [estimatedAmountOut, setEstimatedAmountOut] = useState('0');
  const [isCalculating, setIsCalculating] = useState(false);
  const [slippage, setSlippage] = useState(10); // 10% default slippage
  const [reserves, setReserves] = useState({ reserveA: BigInt(0), reserveB: BigInt(0) });
  const [swapPath, setSwapPath] = useState<TokenInfo[]>([]);
  const [isMultiHop, setIsMultiHop] = useState(false);

  const { doContractCall } = useConnect();
  const { stxAddress } = useGlobalState();

  const hasHighExperience = experienceBalance >= 4000;

  // Remove STX filtering from availableTokens
  const availableTokens = data.tokens;

  // Filter pools
  const availablePools = useMemo(() => {
    return data.pools.filter(pool => {
      if (pool.id === 4) {
        // Allow STX-CHA pool for all users, but only for trading from STX to CHA if low experience
        return hasHighExperience || (fromToken.symbol === 'STX' && toToken.symbol === 'CHA');
      }
      return true;
    });
  }, [data.pools, hasHighExperience, fromToken, toToken]);


  const currentPool = useMemo(() => {
    return availablePools.find(pool =>
      (pool.token0.symbol === fromToken.symbol && pool.token1.symbol === toToken.symbol) ||
      (pool.token1.symbol === fromToken.symbol && pool.token0.symbol === toToken.symbol)
    );
  }, [fromToken, toToken, availablePools]);

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
    return minAmount.toFixed(toToken.decimals);
  }, [slippage, toToken.decimals]);


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
    if (!amount || isNaN(parseFloat(amount)) || !stxAddress || !fromToken || !toToken) {
      console.log('Invalid input:', { amount, stxAddress, fromToken, toToken });
      setEstimatedAmountOut('0');
      return;
    }

    setIsCalculating(true);

    try {
      const amountInMicroTokens = BigInt(Math.floor(parseFloat(amount) * 10 ** fromToken.decimals));
      console.log('Amount in micro tokens:', amountInMicroTokens.toString());

      let result: any;
      const contractAddress = "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS";
      const contractName = 'univ2-path2';

      if (isMultiHop) {
        console.log('Calculating multi-hop swap:', { swapPath });
        const functionName = `get-amount-out-${swapPath.length}`;
        console.log('Using function:', functionName);

        const functionArgs = [
          uintCV(amountInMicroTokens),
          ...swapPath.map(token => contractPrincipalCV(token.contractAddress.split('.')[0], token.contractAddress.split('.')[1])),
        ] as any

        // weird hack due to extra arg in the contract
        if (swapPath.length === 4) functionArgs.push(listCV([]))

        result = await callReadOnlyFunction({
          contractAddress,
          contractName,
          functionName,
          functionArgs,
          senderAddress: stxAddress,
        });
      } else {
        console.log('Calculating single-hop swap');
        if (!currentPool) {
          throw new Error('No current pool found for single-hop swap');
        }
        result = await callReadOnlyFunction({
          contractAddress,
          contractName,
          functionName: 'amount-out',
          functionArgs: [
            uintCV(amountInMicroTokens),
            contractPrincipalCV(fromToken.contractAddress.split('.')[0], fromToken.contractAddress.split('.')[1]),
            contractPrincipalCV(toToken.contractAddress.split('.')[0], toToken.contractAddress.split('.')[1])
          ] as any[],
          senderAddress: stxAddress,
        });
      }

      console.log('Raw result:', result);

      let estimatedOut: string;
      if (isMultiHop) {
        const lastHopResult = result.data[Object.keys(result.data).pop() as string];
        console.log('Last hop result:', lastHopResult);
        estimatedOut = (Number(lastHopResult.value) / 10 ** toToken.decimals).toFixed(toToken.decimals);
      } else {
        estimatedOut = (Number(result.value) / 10 ** toToken.decimals).toFixed(toToken.decimals);
      }
      console.log('Estimated amount out:', estimatedOut);
      setEstimatedAmountOut(estimatedOut);
    } catch (error) {
      console.error('Error calculating estimated amount out:', error);
      setEstimatedAmountOut('0');
    } finally {
      setIsCalculating(false);
    }
  }, [stxAddress, fromToken, toToken, isMultiHop, swapPath, currentPool]);

  const formatBalance = (balance: number, decimals: number) => {
    return (balance / 10 ** decimals).toFixed(decimals);
  };

  const handleUseMax = () => {
    const maxBalance = getBalance(fromToken.symbol);
    setFromAmount(formatBalance(maxBalance, fromToken.decimals));
  };

  useEffect(() => {
    calculateEstimatedAmountOut(fromAmount);
  }, [fromAmount, calculateEstimatedAmountOut]);

  const { getBalanceByKey, balances } = useWallet();
  const stx = balances.stx?.balance;
  const cha = getBalanceByKey('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token::charisma');
  const welsh = getBalanceByKey('SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token::welshcorgicoin');
  const roo = getBalanceByKey('SP2C1WREHGM75C7TGFAEJPFKTFTEGZKF6DFT6E2GE.kangaroo::kangaroo');
  const iouWelsh = getBalanceByKey('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-welsh::synthetic-welsh');
  const iouRoo = getBalanceByKey('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-roo::synthetic-roo');
  const ordi = getBalanceByKey('SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.brc20-ordi::brc20-ordi');
  const dog = getBalanceByKey('SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.runes-dog::runes-dog');

  const getBalance = useMemo(() => {
    return (symbol: any) => {
      switch (symbol) {
        case 'STX':
          return stx || 0;
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
        case 'ORDI':
          return ordi || 0;
        case 'DOG':
          return dog || 0;
        default:
          return 0;
      }
    };
  }, [stx, cha, welsh, roo, iouWelsh, iouRoo, ordi, dog]);

  const getPrice = useMemo(() => {
    return (symbol: any) => {
      switch (symbol) {
        case 'STX':
          return data.cmcPriceData.data['STX'].quote.USD.price;
        case 'CHA':
          const stxPrice = data.prices.find((token: any) => token.symbol === 'STX').price;
          const price = stxPrice / data.chaPerStx
          return price || 0.30;
        case 'WELSH':
          return data.cmcPriceData.data['WELSH'].quote.USD.price;
        case 'ROO':
          return data.prices.find((token: any) => token.symbol === '$ROO').price;
        case 'iouWELSH':
          return data.cmcPriceData.data['WELSH'].quote.USD.price;
        case 'iouROO':
          return data.prices.find((token: any) => token.symbol === '$ROO').price;
        case 'ORDI':
          return data.cmcPriceData.data['ORDI'].quote.USD.price;
        case 'DOG':
          return data.cmcPriceData.data['DOG'].quote.USD.price;
        default:
          return 0;
      }
    };
  }, [data.cmcPriceData.data, data.prices, data.chaPerStx]);

  const handleSwap = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    // setFromAmount(toAmount);
    // setToAmount(fromAmount);
  };

  const isTokenPairValid = useCallback((token1: TokenInfo, token2: TokenInfo, maxHops = 5) => {
    const findPath = (start: TokenInfo, end: TokenInfo, path: TokenInfo[] = []): TokenInfo[] | null => {
      if (path.length > maxHops) return null;

      // Check for direct pool
      const directPool = data.pools.find(pool =>
        (pool.token0.symbol === start.symbol && pool.token1.symbol === end.symbol) ||
        (pool.token1.symbol === start.symbol && pool.token0.symbol === end.symbol)
      );

      if (directPool) return [...path, end];

      // Check for multi-hop path
      for (const pool of data.pools) {
        let nextToken: TokenInfo | undefined;
        if (pool.token0.symbol === start.symbol) nextToken = pool.token1;
        else if (pool.token1.symbol === start.symbol) nextToken = pool.token0;

        if (nextToken && !path.some(t => t.symbol === nextToken!.symbol)) {
          const result = findPath(nextToken, end, [...path, nextToken]);
          if (result) return result;
        }
      }

      return null;
    };

    return findPath(token1, token2) !== null;
  }, [data.pools]);

  const selectToken = (token: TokenInfo, isFrom: boolean) => {
    if (isFrom) {
      setFromToken(token);
      setShowFromTokens(false);

      // Check if current 'to' token forms a valid pair with the new 'from' token
      if (!isTokenPairValid(token, toToken)) {
        // If not, find the first valid 'to' token and set it
        const firstValidToToken = availableTokens.find(t => t.symbol !== token.symbol && isTokenPairValid(token, t));
        if (firstValidToToken) {
          setToToken(firstValidToToken);
        }
      }
    } else {
      // Only allow selecting STX as 'to' token if user has high experience
      if (token.symbol !== 'STX' || hasHighExperience) {
        setToToken(token);
        setShowToTokens(false);
      }
    }
  };

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>, setAmount: { (value: SetStateAction<string>): void; (value: SetStateAction<string>): void; (arg0: any): void; }) => {
    const value = e.target.value;
    // Allow only numbers and a single decimal point
    if (/^[0-9]*\.?[0-9]*$/.test(value) || value === '') {
      setAmount(value);
    }
  };


  const swapTokens = useCallback(() => {
    if (!fromToken || !toToken) return;

    const amountInMicroTokens = Math.floor(parseFloat(fromAmount) * 10 ** fromToken.decimals);
    const minAmountOutMicroTokens = Math.floor(parseFloat(calculateMinimumAmountOut(estimatedAmountOut)) * 10 ** toToken.decimals);

    const contractName = isMultiHop ? `univ2-path2` : "univ2-router";
    const functionName = isMultiHop ? `swap-${swapPath.length}` : "swap-exact-tokens-for-tokens";
    const functionArgs = isMultiHop
      ? [
        uintCV(amountInMicroTokens),
        uintCV(minAmountOutMicroTokens),
        ...swapPath.map(token => contractPrincipalCV(token.contractAddress.split('.')[0], token.contractAddress.split('.')[1])),
        contractPrincipalCV("SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS", "univ2-share-fee-to")
      ]
      : [
        uintCV(currentPool!.id),
        contractPrincipalCV(currentPool!.token0.contractAddress.split('.')[0], currentPool!.token0.contractAddress.split('.')[1]),
        contractPrincipalCV(currentPool!.token1.contractAddress.split('.')[0], currentPool!.token1.contractAddress.split('.')[1]),
        contractPrincipalCV(fromToken.contractAddress.split('.')[0], fromToken.contractAddress.split('.')[1]),
        contractPrincipalCV(toToken.contractAddress.split('.')[0], toToken.contractAddress.split('.')[1]),
        contractPrincipalCV("SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS", "univ2-share-fee-to"),
        uintCV(amountInMicroTokens),
        uintCV(minAmountOutMicroTokens)
      ];

    const postConditions: any[] = [];

    // Add post-condition for the initial token transfer from the user
    if (fromToken.tokenName) {
      postConditions.push(
        Pc.principal(stxAddress)
          .willSendEq(amountInMicroTokens)
          .ft(fromToken.contractAddress as any, fromToken.tokenName)
      );
    } else {
      postConditions.push(
        Pc.principal(stxAddress)
          .willSendEq(amountInMicroTokens)
          .ustx()
      );
    }

    if (isMultiHop) {
      // Add post-conditions for intermediate hops
      for (let i = 1; i < swapPath.length - 1; i++) {
        const intermediateToken = swapPath[i];
        if (intermediateToken.tokenName) {
          // "Out" condition for the previous hop
          postConditions.push(
            Pc.principal("SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.univ2-core")
              .willSendGte(1)
              .ft(intermediateToken.contractAddress as any, intermediateToken.tokenName)
          );
          // "In" condition for the next hop
          postConditions.push(
            Pc.principal(stxAddress)
              .willSendGte(1)
              .ft(intermediateToken.contractAddress as any, intermediateToken.tokenName)
          );
        } else {
          // For STX
          postConditions.push(
            Pc.principal("SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.univ2-core")
              .willSendGte(1)
              .ustx()
          );
          postConditions.push(
            Pc.principal(stxAddress)
              .willSendGte(1)
              .ustx()
          );
        }
      }
    }

    // Add post-condition for the final token transfer to the user
    if (toToken.tokenName) {
      postConditions.push(
        Pc.principal("SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.univ2-core")
          .willSendGte(minAmountOutMicroTokens)
          .ft(toToken.contractAddress as any, toToken.tokenName)
      );
    } else {
      postConditions.push(
        Pc.principal("SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.univ2-core")
          .willSendGte(minAmountOutMicroTokens)
          .ustx()
      );
    }

    doContractCall({
      network: network,
      contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
      contractName,
      functionName,
      functionArgs,
      postConditionMode: PostConditionMode.Deny,
      postConditions,
    });
  }, [fromAmount, estimatedAmountOut, fromToken, toToken, stxAddress, doContractCall, calculateMinimumAmountOut, currentPool, isMultiHop, swapPath]);

  const findBestSwapPath = useCallback(() => {
    const findPath = (start: TokenInfo, end: TokenInfo, maxHops = 5): TokenInfo[] | null => {
      const queue: { path: TokenInfo[], visited: Set<string> }[] = [{ path: [start], visited: new Set([start.symbol]) }];

      while (queue.length > 0) {
        const { path, visited } = queue.shift()!;
        const current = path[path.length - 1];

        if (current.symbol === end.symbol) {
          return path;
        }

        if (path.length > maxHops) continue;

        for (const pool of data.pools) {
          let nextToken: TokenInfo | undefined;
          if (pool.token0.symbol === current.symbol) nextToken = pool.token1;
          else if (pool.token1.symbol === current.symbol) nextToken = pool.token0;

          if (nextToken && !visited.has(nextToken.symbol)) {
            // Check if the path is allowed for low experience users
            if (!hasHighExperience && nextToken.symbol === 'STX') continue;
            const newPath = [...path, nextToken];
            const newVisited = new Set(visited).add(nextToken.symbol);
            queue.push({ path: newPath, visited: newVisited });
          }
        }
      }

      return null;
    };

    const path = findPath(fromToken, toToken);

    if (path) {
      setIsMultiHop(path.length > 2);
      setSwapPath(path);
    } else {
      setIsMultiHop(false);
      setSwapPath([]);
    }
  }, [fromToken, toToken, data.pools, hasHighExperience]);

  useEffect(() => {
    findBestSwapPath();
  }, [fromToken, toToken, findBestSwapPath]);

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
        <div className="relative px-6 pb-4 pt-2 sm:rounded-lg bg-[var(--sidebar)] border border-[var(--accents-7)]">
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
            <div className="p-4 rounded-lg shadow-xl shadow-primary/10 border border-t-0 border-x-0 border-b-[var(--accents-7)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">From</span>
                <div className="relative" ref={fromDropdownRef}>
                  <button
                    className="flex items-center px-3 py-1 border rounded-full shadow-lg border-primary/30 shadow-primary/10"
                    onClick={() => setShowFromTokens(!showFromTokens)}
                  >
                    <Image src={fromToken.image} alt={fromToken.symbol} width={240} height={240} className="w-6 mr-2 rounded-full" />
                    <span className="mr-1 text-white">{fromToken.symbol}</span>
                    <ChevronDown className="text-gray-400" size={16} />
                  </button>
                  {showFromTokens && (
                    <div className="absolute right-0 z-10 w-full mt-2 overflow-hidden rounded-md shadow-lg bg-[var(--sidebar)] border border-primary/30 min-w-36">
                      {availableTokens.map((token) => (
                        <button
                          key={token.symbol}
                          className="flex items-center w-full px-4 py-2 text-left hover:bg-accent-foreground"
                          onClick={() => selectToken(token, true)}
                        >
                          <Image src={token.image} alt={token.symbol} width={240} height={240} className="w-6 mr-2 rounded-full" />
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
                  <span className="mr-2 text-gray-400">Balance: {formatBalance(getBalance(fromToken.symbol), fromToken.decimals)}</span>
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
                disabled={fromToken.symbol === 'STX' && !hasHighExperience}
              >
                <ArrowUpDown className="text-gray-400" size={24} />
              </button>
            </div>

            {/* To Section */}
            <div className="p-4 rounded-lg shadow-xl shadow-primary/10 border border-t-0 border-x-0 border-b-[var(--accents-7)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">To</span>
                <div className="relative" ref={toDropdownRef}>
                  <button
                    className="flex items-center px-3 py-1 border rounded-full shadow-lg border-primary/30 shadow-primary/10"
                    onClick={() => setShowToTokens(!showToTokens)}
                  >
                    <Image src={toToken.image} alt={toToken.symbol} width={240} height={240} className="w-6 mr-2 rounded-full" />
                    <span className="mr-1 text-white">{toToken.symbol}</span>
                    <ChevronDown className="text-gray-400" size={16} />
                  </button>
                  {showToTokens && (
                    <div className="absolute right-0 z-10 w-full mt-2 overflow-hidden rounded-md shadow-lg bg-[var(--sidebar)] border border-primary/30 min-w-36">
                      {availableTokens.map((token) => {
                        const isDisabled = !isTokenPairValid(fromToken, token) || (token.symbol === 'STX' && !hasHighExperience);
                        return (
                          <button
                            key={token.symbol}
                            className={`flex items-center w-full px-4 py-2 text-left ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-accent-foreground'}`}
                            onClick={() => !isDisabled && selectToken(token, false)}
                            disabled={isDisabled}
                            title={token.symbol === 'STX' ? 'STX is available as a swap destination for users with over 4000 experience.' : ''}
                          >
                            <Image src={token.image} alt={token.symbol} width={240} height={240} className="w-6 mr-2 rounded-full" />
                            <span className={isDisabled ? 'text-gray-500' : 'text-white'}>
                              {token.symbol}{token.symbol === 'STX' ? ' ✨' : ''}
                            </span>
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
                <span className="text-gray-400">Balance: {formatBalance(getBalance(toToken.symbol), toToken.decimals)}</span>
              </div>
            </div>

            {/* Display swap path */}

            <div className='flex justify-between pt-6'>
              <div className="text-sm text-gray-400">
                Swap path: {swapPath.map(token => token.symbol).join(' → ')}
              </div>
              <div className='text-sm text-gray-400'>Minimum received: {calculateMinimumAmountOut(estimatedAmountOut)} {toToken.symbol}</div>
            </div>



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