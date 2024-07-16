import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import Layout from '@components/layout';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@components/ui/card';
import { GetStaticProps } from 'next';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { cn } from '@lib/utils';
import { motion } from "framer-motion"
import swap from '@public/quests/a2.png'
import { Input } from '@components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/swap/select';
import velarApi from '@lib/velar-api';
import { StepConfig, SwapConfig, SwapContext, Token, processStep, reverseSwapConfig } from '@lib/hooks/use-swap-context';
import { FlipVertical, Rotate3D, Undo } from 'lucide-react';
import { useConnect } from "@stacks/connect-react";
import { StacksMainnet } from "@stacks/network";
import {
  AnchorMode,
  PostConditionMode,
  uintCV,
} from "@stacks/transactions";
import ConnectWallet, { userSession } from "@components/stacks-session/connect";
import { Button } from "@components/ui/button";

type Props = {
  data: any;
};

export const getStaticProps: GetStaticProps<Props> = async () => {

  try {

    const tickers = await velarApi.tickers()
    const tokens = await velarApi.tokens()

    return {
      props: {
        data: { tokens, tickers }
      },
      revalidate: 600
    };

  } catch (error) {
    return {
      props: {
        data: {}
      },
    }
  }
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
}

export default function Swap({ data }: Props) {
  const meta = {
    title: 'Charisma | Arbitrage',
    description: META_DESCRIPTION,
    image: '/liquid-charisma.png'
  };

  const [tokenList, setTokenList] = useState<Token[]>([]);
  const [swapConfig, setSwapConfig] = useState<SwapConfig>({
    steps: [
      { fromToken: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wrapped-charisma', fromAmount: 10, action: 'SWAP', toToken: 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.wstx', toAmount: 0 },
      { fromToken: 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.wstx', fromAmount: 0, action: 'SWAP', toToken: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-charisma', toAmount: 0 },
      { fromToken: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-charisma', fromAmount: 0, action: 'UNSTAKE', toToken: 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme000-governance-token', toAmount: 0 },
      { fromToken: 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme000-governance-token', fromAmount: 0, action: 'WRAP', toToken: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wrapped-charisma', toAmount: 0 },
    ],
    options: {}
  });

  useEffect(() => {
    setTokenList([...data.tokens, {
      symbol: 'CHA',
      name: 'Charisma',
      contractAddress: 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme000-governance-token',
      imageUrl: 'https://charisma.rocks/charisma.png',
      price: data.tokens.find((token: Token) => token.symbol === 'sCHA').price
    }])
  }, [setTokenList, data.tokens]);

  const recalculateSwapConfig: SwapConfig = useMemo(() => {

    swapConfig.steps.forEach((step: StepConfig, index: number) => {
      processStep(step, data.tickers);
      // Update the next step
      if (index < swapConfig.steps.length - 1) {
        swapConfig.steps[index + 1].fromToken = step.toToken;
        swapConfig.steps[index + 1].fromAmount = step.toAmount || 0;
      }
    });

    setSwapConfig(swapConfig)

    return swapConfig
  }, [swapConfig, data.tickers])

  console.log(swapConfig)

  const stxwcha = data.tickers.find((ticker: any) => ticker.ticker_id === "SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.wstx_SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wrapped-charisma")

  const amount0Desired = 1000000
  const amount1Desired = Number((amount0Desired * stxwcha.last_price).toFixed(0))
  const amount0Min = Number((amount0Desired * 0.80).toFixed(0))
  const amount1Min = Number((amount1Desired * 0.80).toFixed(0))

  const lpConfig = {
    amount0Desired,
    amount1Desired,
    amount0Min,
    amount1Min,
  }

  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <motion.div initial="hidden" animate="visible" variants={fadeIn} className="m-2 sm:container sm:mx-auto sm:py-10 md:max-w-3xl">
          <SwapContext.Provider value={{ tokenList, setTokenList, swapConfig: recalculateSwapConfig, setSwapConfig }}>
            <SwapDashboard lpConfig={lpConfig} />
            <div className='text-center text-xs m-2 text-secondary/50'>*If your trade is profitable, a portion of earnings are deposited in the Velar STX-wCHA LP. This LP remains yours.</div>
          </SwapContext.Provider>
        </motion.div >
      </Layout >
    </Page >
  );
}

const SwapDashboard = ({ lpConfig }: any) => {

  const { swapConfig, setSwapConfig, tokenList } = useContext(SwapContext);

  const arbitrageProfit = swapConfig.steps[swapConfig.steps.length - 1].toAmount - swapConfig.steps[0].fromAmount
  const arbitrageToken = tokenList.find((token: Token) => token.contractAddress === swapConfig.steps[swapConfig.steps.length - 1].toToken)
  const arbitrageProfitInUSD = arbitrageProfit * arbitrageToken?.price

  return (
    <Card className='bg-black text-primary-foreground border-accent-foreground p-0 relative overflow-hidden rounded-md group/card w-full max-w-3xl opacity-[0.99] shadow-black shadow-2xl'>
      <CardHeader className='z-20 p-4'>
        <div className='flex items-center justify-between'>
          <CardTitle className='z-30 text-xl font-semibold'>
            <div>
              Arbitrage Strategy
            </div>
            <div className='text-sm font-light'>
              Stabilize wCHA to sCHA price relationship, accumulate wCHA and sCHA.
            </div>
          </CardTitle>
          <div className='flex flex-col items-center hover:text-primary/50 cursor-pointer' onClick={() => setSwapConfig({ ...swapConfig, ...reverseSwapConfig(swapConfig) })}>
            <Rotate3D className='w-8 h-8 mx-4' />
            <div className='text-xxs'>Reverse Strategy</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className='z-20 p-4'>

        <UnwrapAction />

      </CardContent>

      <CardFooter className="z-20 flex justify-between p-4 mt-24">
        <div className='font-fine flex space-x-3 items-baseline'>
          <div className='text-lg'>Estimated Profit:</div>
          <div className='text-xl text-white'>{`${arbitrageProfit.toFixed(0)} ${arbitrageToken?.symbol}`}</div>
          <div>≅</div>
          <div className='text-lg text-green-300'>{`$${arbitrageProfitInUSD.toFixed(2)} USD`}</div>
        </div>
        <ExecuteStrategy />
      </CardFooter>
      <Image
        src={swap}
        width={800}
        height={1600}
        alt={'quest-background-image'}
        className={cn("object-cover", "sm:aspect-[1/2]", 'aspect-[1/3]', 'opacity-10', 'flex', 'z-10', 'absolute', 'inset-0', 'pointer-events-none')}
      />
      <div className='absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-white to-black opacity-10' />
    </Card>
  )
}

const UnwrapAction = () => {
  const { swapConfig, setSwapConfig } = useContext(SwapContext);

  const handleFromTokenAmountChange = (newAmount: number) => {
    setSwapConfig((prevConfig: any) => {
      prevConfig.steps[0].fromAmount = newAmount
      return { ...prevConfig, steps: prevConfig.steps };
    });
  };

  return (
    <div>
      <div className='flex flex-col sm:relative'>
        {/* <TokenSelect token={config.fromToken} setToken={handleFromTokenChange} /> */}
        <TokenSelect token={'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charismatic-corgi'} />
        <Input value={swapConfig.steps[0].fromAmount} onChange={(v) => handleFromTokenAmountChange(Number(v.target.value))} placeholder="Enter an amount" className="ring-offset-0 ring-transparent ring-inset focus-visible:ring-none sm:border-r-0 border-t border-b sm:rounded-r-none h-20 mb-2 text-2xl text-right sm:absolute sm:w-[20rem]" />
      </div>

      <div className='relative mt-0 sm:mt-28 mb-6 items-center flex pb-4 justify-center w-full' >
        {/* <div className='cursor-pointer select-none hover:text-accent/80 text-5xl'>↯</div> */}
        <div className='cursor-pointer select-none hover:text-accent/80 text-xl font-bold'>{'UNWRAP'}</div>
      </div>

      <div className='flex justify-between space-x-4'>
        <Pipeline>
          <HalfTokenSelect token={'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-welsh-v2'} />
          <SwapTokenAction />
          <HalfTokenSelect token={'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charismatic-corgi'} />
        </Pipeline>

        <Pipeline>
          <HalfTokenSelect token={'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-charisma'} />
          <SwapTokenAction />
          <HalfTokenSelect token={'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charismatic-corgi'} />
        </Pipeline>
      </div>
    </div>
  )
}

const SwapTokenAction = () => {
  return (

    <div className='relative my-2 items-center flex justify-center w-full' >
      <div className='cursor-pointer select-none hover:text-accent/80 text-xl font-bold'>SWAP</div>
    </div>
  )
}

const Pipeline = ({ children }: any) => {
  return (
    <div className='flex flex-col items-center w-full'>
      {children}
    </div>
  )
}

const TokenAction = ({ config, stepNumber }: { config: StepConfig, stepNumber: number }) => {
  const { setSwapConfig } = useContext(SwapContext);

  const handleToTokenChange = (newToken: string) => {
    setSwapConfig((prevConfig: any) => {
      prevConfig.steps[stepNumber].toToken = newToken
      return { ...prevConfig, steps: prevConfig.steps };
    });
  };

  return (
    <div>
      <div className='relative mt-0 sm:mt-28 mb-6 items-center flex pb-4 justify-center w-full' >
        {/* <div className='cursor-pointer select-none hover:text-accent/80 text-5xl'>↯</div> */}
        <div className='cursor-pointer select-none hover:text-accent/80 text-xl font-bold'>{config.action}</div>
      </div>

      <div className='flex flex-col sm:relative'>
        {/* <TokenSelect token={config.toToken} setToken={handleToTokenChange} /> */}
        <TokenSelect token={config.toToken} />
        <Input value={Number(config.toAmount).toFixed(6)} placeholder="Estimated Amount" className="ring-offset-0 ring-transparent ring-inset focus-visible:ring-none sm:border-r-0 border-t border-b sm:rounded-r-none h-20 mb-2 text-2xl text-right sm:absolute sm:w-[20rem]" />
      </div>
    </div>
  )
}

const TokenSelect = ({ token, setToken }: any) => {

  const { tokenList } = useContext(SwapContext);

  return (
    <Select value={token} onValueChange={setToken}>
      <SelectTrigger className="h-20 mb-2 text-2xl text-right sm:absolute sm:pl-[20rem]" >
        <SelectValue placeholder='Select a token' />
      </SelectTrigger>
      <SelectContent className="max-h-[60vh] max-w-[90vw] overflow-scroll">
        {tokenList.map((token: Token) => (
          <SelectItem key={token.contractAddress} value={token.contractAddress} className='group/token'>
            <div className='flex space-x-2 items-center h-20'>
              <Image src={token.imageUrl} width={48} height={48} alt='Stacks Token' className='z-30 w-12 h-12 border rounded-full' />
              <div className='text-left'>
                <div className='flex items-baseline space-x-1'>
                  <div className='text-xl font-medium leading-tight'>{token.symbol}</div>
                  <div className='text-md font-light -mt-1 leading-normal'>{token.name}</div>
                </div>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select >
  )
}

const HalfTokenSelect = ({ token, setToken }: any) => {

  const { tokenList } = useContext(SwapContext);

  return (
    <Select value={token} onValueChange={setToken}>
      <SelectTrigger className="h-20 mb-2 text-2xl text-right" >
        <SelectValue placeholder='Select a token' />
      </SelectTrigger>
      <SelectContent className="max-h-[60vh] max-w-[90vw] overflow-scroll">
        {tokenList.map((token: Token) => (
          <SelectItem key={token.contractAddress} value={token.contractAddress} className='group/token'>
            <div className='flex space-x-2 items-center h-20'>
              <Image src={token.imageUrl} width={48} height={48} alt='Stacks Token' className='z-30 w-12 h-12 border rounded-full' />
              <div className='text-left'>
                <div className='flex-col items-baseline'>
                  <div className='text-xl font-medium leading-tight'>{token.symbol}</div>
                  <div className='text-sm font-light -mt-1 leading-normal'>{token.name}</div>
                </div>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select >
  )
}

const ExecuteStrategy = () => {

  const { swapConfig } = useContext(SwapContext);
  const { doContractCall } = useConnect();

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true) }, []);

  const amount = 10
  const amountIn = Number(amount * 1000000)
  const amountOutMin = Number((amountIn * 100).toFixed(0))

  console.log({ amountIn, amountOutMin })


  function swap() {
    doContractCall({
      network: new StacksMainnet(),
      anchorMode: AnchorMode.Any,
      contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
      contractName: 'icc-arb-swelsh-bull-trap',
      functionName: "execute-strategy",
      functionArgs: [uintCV(amountIn), uintCV(amountOutMin)],
      postConditionMode: PostConditionMode.Allow,
      postConditions: [
      ],
      onFinish: (data) => {
        console.log("onFinish:", data);
      },
      onCancel: () => {
        console.log("onCancel:", "Transaction was canceled");
      },
    });
  }

  if (!mounted || !userSession.isUserSignedIn()) {
    return <ConnectWallet />;
  }

  return (
    <Button variant="ghost" className='text-primary hover:bg-white hover:text-primary z-30' onClick={swap}>Execute Strategy</Button>
  );
};
