import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import Layout from '@components/layout';
import Image from 'next/image';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@components/ui/tooltip"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@components/ui/card';
import { GetStaticProps } from 'next';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { cn } from '@lib/utils';
import { motion } from "framer-motion"
import WelshIcon from '@public/welsh-logo.png'
import stxIcon from '@public/stacks-stx-logo.png'
import swap from '@public/quests/a2.png'
import { Input } from '@components/ui/input';
import millify from 'millify';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/swap/select';
import MultiSwap from '@components/swap/multi';
import velarApi from '@lib/velar-api';
import { StepConfig, SwapConfig, SwapContext, SwapContextType, Ticker, Token, processStep, reverseSwapConfig } from '@lib/hooks/use-swap-context';
import { Avatar } from '@components/ui/avatar';
import { BsBackspaceReverse } from 'react-icons/bs';
import { FlipVertical, Rotate3D, Undo } from 'lucide-react';
import AddLP from '@components/swap/add-lp';

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
      revalidate: 60
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
      { fromToken: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wrapped-charisma', fromAmount: 0, action: 'SWAP', toToken: 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.wstx', toAmount: 0 },
      { fromToken: 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.wstx', fromAmount: 0, action: 'SWAP', toToken: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-charisma', toAmount: 0 },
      { fromToken: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-charisma', fromAmount: 0, action: 'UNSTAKE', toToken: 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme000-governance-token', toAmount: 0 },
      { fromToken: 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme000-governance-token', fromAmount: 0, action: 'STAKE', toToken: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wrapped-charisma', toAmount: 0 },
    ],
    options: {
      communityRoyality: 200000000,
      creatorRoyality: 800000000
    }
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
          </SwapContext.Provider>
          {/* <div className='text-center font-thin m-2 text-xs sm:text-sm'>*Swaps use Velar liquidity pools and are set to a maximum of 2.5% slippage.</div> */}
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
          <Rotate3D className='w-8 h-8 mx-4 hover:text-primary/50 cursor-pointer' onClick={() => setSwapConfig({ ...swapConfig, ...reverseSwapConfig(swapConfig) })} />
        </div>
      </CardHeader>
      <CardContent className='z-20 p-4'>

        <FirstTokenAction config={swapConfig?.steps?.[0]} />
        {swapConfig?.steps.slice(1).map((step: StepConfig, k: number) => <TokenAction config={step} stepNumber={k + 1} />)}

      </CardContent>

      <CardFooter className="z-20 flex justify-between p-4 mt-24">
        <div className='font-fine flex space-x-3 items-baseline'>
          <div className='text-lg'>Estimated Profit:</div>
          <div className='text-xl text-white'>{`${arbitrageProfit.toFixed(0)} ${arbitrageToken?.symbol}`}</div>
          <div>≅</div>
          <div className='text-lg text-green-300'>{`$${arbitrageProfitInUSD.toFixed(2)} USD`}</div>
        </div>
        <AddLP lpConfig={lpConfig} />
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

const FirstTokenAction = ({ config }: { config: StepConfig }) => {
  const { setSwapConfig } = useContext(SwapContext);

  const handleFromTokenChange = (newToken: string) => {
    setSwapConfig((prevConfig: any) => {
      prevConfig.steps[0].fromToken = newToken
      return { ...prevConfig, steps: prevConfig.steps };
    });
  };

  const handleFromTokenAmountChange = (newAmount: number) => {
    setSwapConfig((prevConfig: any) => {
      prevConfig.steps[0].fromAmount = newAmount
      return { ...prevConfig, steps: prevConfig.steps };
    });
  };

  const handleToTokenChange = (newToken: string) => {
    setSwapConfig((prevConfig: any) => {
      prevConfig.steps[0].toToken = newToken
      return { ...prevConfig, steps: prevConfig.steps };
    });
  };

  return (
    <div>
      <div className='flex flex-col sm:relative'>
        {/* <TokenSelect token={config.fromToken} setToken={handleFromTokenChange} /> */}
        <TokenSelect token={config.fromToken} />
        <Input value={config.fromAmount} onChange={(v) => handleFromTokenAmountChange(Number(v.target.value))} placeholder="Enter an amount" className="ring-offset-0 ring-transparent ring-inset focus-visible:ring-none sm:border-r-0 border-t border-b sm:rounded-r-none h-20 mb-2 text-2xl text-right sm:absolute sm:w-[20rem]" />
      </div>

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
                {/* <div className='-ml-0.5 text-sm mt-0 flex flex-wrap group-hover/token:text-white'>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger><div className='bg-primary rounded-full w-fit leading-tight px-1 pb-0.5 text-center m-1 pointer-events-auto'>Gas Token</div></TooltipTrigger>
                                            <TooltipContent side='bottom' className={`text-md max-h-[80vh] overflow-scroll bg-black text-white border-primary leading-tight shadow-2xl max-w-prose`}>
                                                <strong>Gas Token:</strong> This token is used to pay for transaction fees on the Stacks blockchain. <br /><br />
                                                It is consumed in the process of executing smart contracts and other operations on the network. <br /><br />
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger><div className='bg-primary rounded-full w-fit leading-tight px-1 pb-0.5 text-center m-1 pointer-events-auto'>Stackable</div></TooltipTrigger>
                                            <TooltipContent side='bottom' className={`text-md max-h-[80vh] overflow-scroll bg-black text-white border-primary leading-tight shadow-2xl max-w-prose`}>
                                                <strong>Stackable:</strong> This token can be used to participate in the Proof-of-Transfer (PoX) consensus mechanism of the Stacks blockchain. <br /><br />
                                                It can be locked up or liquid staked to secure the network and earn rewards. <br /><br />
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div> */}
              </div>
            </div>
          </SelectItem>
        ))}
        {/* <SelectItem value="WELSH" className='group/token'>
                    <div className='flex space-x-2 items-center h-20'>
                        <Image src={WelshIcon} alt='Welshcorgicoin Token' className='z-30 w-12 h-12 border border-white rounded-full' />
                        <div className='text-left'>
                            <div className='flex items-baseline space-x-1'>
                                <div className='text-xl font-medium leading-tight'>WELSH</div>
                                <div className='text-lg font-light -mt-1 leading-normal'>Welshcorgicoin</div>
                            </div>
                            <div className='-ml-0.5 text-xs mt-0 flex flex-wrap group-hover/token:text-white'>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger><div className='bg-primary rounded-full w-fit leading-tight px-1 pb-0.5 text-center m-1 pointer-events-auto'>Community Coin</div></TooltipTrigger>
                                        <TooltipContent side='bottom' className={`text-md max-h-[80vh] overflow-scroll bg-black text-white border-primary leading-tight shadow-2xl max-w-prose`}>
                                            <strong>Community Coin:</strong> A Community Coin is a subset of memecoins characterized by its large and active user base, highly decentralized holdings, and significant incentives for holders. <br /><br />
                                            These coins often thrive on community engagement and participation, providing advantages such as airdrops and other rewards within their ecosystem. <br /><br />
                                            The decentralized nature ensures wide distribution, while the ongoing incentives encourage long-term holding and active involvement in the project's development and governance. <br /><br />
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger><div className='bg-primary rounded-full w-fit leading-tight px-1 pb-0.5 text-center m-1 pointer-events-auto'>Community Takeover</div></TooltipTrigger>
                                        <TooltipContent side='bottom' className={`text-md max-h-[80vh] overflow-scroll bg-black text-white border-primary leading-tight shadow-2xl max-w-prose`}>
                                            <strong>Community Takeover:</strong> Occurs when the original developer "rugs" a project by dumping their tokens and abandoning it, but a grassroots community movement intervenes to revive and sustain the project. <br /><br />
                                            This resurgence is driven by dedicated community members who take control, reestablish trust, and actively contribute to the project's development and growth. <br /><br />
                                            Through their collective efforts, the community ensures the project's continued activity and success, often fostering a stronger and more resilient ecosystem. <br /><br />
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </div>
                    </div>
                </SelectItem> */}
      </SelectContent>
    </Select >
  )
}