import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import Layout from '@components/layout';
import Image from 'next/image';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@components/ui/tooltip"
import { Info } from 'lucide-react';
import { Card } from '@components/ui/card';
import StakeGoatButton from '@components/stake/stake-goat';
import UnstakeGoatButton from '@components/stake/unstake-goat';
import liquidGoat from '@public/liquid-goat.png'
import { GetStaticProps } from 'next';
import { callReadOnlyFunction } from '@stacks/transactions';
import { StacksMainnet } from "@stacks/network";
import { useState } from 'react';
import { Input } from '@components/ui/input';
import millify from 'millify';

export default function Stake({ data }: Props) {
  const [tokenAmount, setTokenAmount] = useState('');

  const meta = {
    title: 'Charisma | Stake Goat Tokens',
    description: META_DESCRIPTION,
    image: '/liquid-goat.png'
  };

  const handleTokenAmountChange = (event: any) => {
    const { value } = event.target;
    // Limit input to only allow numbers and to 6 decimal places
    if (/^\d*\.?\d{0,6}$/.test(value)) {
      setTokenAmount(value);
    }
  };

  const tokensInPool = data.tokensInPool

  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <div className="m-2 sm:container sm:mx-auto sm:py-10 md:max-w-2xl">

          <Card className='p-0 overflow-hidden bg-black text-primary-foreground border-accent-foreground rounded-xl'>
            <Image alt='Liquid Goat' src={liquidGoat} width="1080" height="605" className='border-b border-accent-foreground' />
            <div className='m-2'>
              <div className='flex justify-between mb-2'>
                <h1 className="self-center font-bold text-md sm:text-2xl">Liquid Staked Goat</h1>
                {data.exchangeRate && <div className="self-center px-2 my-1 text-xs font-light text-center rounded-full sm:text-lg sm:p-0 sm:px-4">
                  <div className="self-center px-2 my-1 text-xs font-light text-center rounded-full sm:text-lg bg-primary sm:p-0 sm:px-4">1 sGOAT = {Number(data.exchangeRate) / 1000000} GOAT</div>
                </div>}
              </div>

              <div className='flex justify-between'>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <div className='flex items-center gap-1 mb-2'>
                        <h1 className="font-bold text-left text-md">How Staking Works</h1>
                        <Info size={16} color='#948f8f' />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className='max-w-2xl leading-tight text-white bg-black border-primary'>
                      <h2 className="mb-2 text-lg font-bold">Interacting with the Staking Dashboard:</h2>
                      <ul className="pl-5 mb-4 space-y-2 list-disc text-md">
                        <li>
                          <b>Stake Tokens</b>: Stake your Goat tokens to receive Liquid Staked Goat (sGOAT). The amount of sGOAT you receive is calculated based on the current inverse exchange rate.
                        </li>
                        <li>
                          <b>Unstake Tokens</b>: Redeem your sGOAT for Goat tokens based on the current exchange rate.
                        </li>
                      </ul>
                      <p className="mb-4">
                        Staking your Goat tokens allows you to participate in governance and earn staking rewards generated from network activities. Your staked tokens help secure the network and in return, you earn more tokens over time.
                      </p>
                      <p className="mb-4">
                        The staking interface aims to provide a transparent, user-friendly experience to support your investment decisions.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <div className='px-2 sm:p-0 sm:px-4'>
                  {millify(tokensInPool / 1000000)} GOAT Staked
                </div>
              </div>
              <p className="mb-8 text-xs font-thin leading-tight sm:text-sm">
                Goat Staking is a crucial part of the network's financial ecosystem, providing a way for token holders to earn passive income while contributing to the token's number-go-up mechanism.
              </p>
              <div className='space-y-2'>
                <Input value={tokenAmount} onChange={handleTokenAmountChange} placeholder="Enter token amount" className="text-lg text-center" />
                <div className='flex space-x-1'>
                  <StakeGoatButton tokens={tokenAmount} />
                  <UnstakeGoatButton tokens={tokenAmount} />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </Layout>
    </Page>
  );
}

type Props = {
  data: any;
};

export const getStaticProps: GetStaticProps<Props> = async () => {

  try {
    const lc: any = await callReadOnlyFunction({
      network: new StacksMainnet(),
      contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
      contractName: "liquid-staked-goat",
      functionName: "get-exchange-rate",
      functionArgs: [],
      senderAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS'
    })


    const totalStaked: any = await callReadOnlyFunction({
      network: new StacksMainnet(),
      contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
      contractName: "liquid-staked-goat",
      functionName: "get-total-in-pool",
      functionArgs: [],
      senderAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS'
    })


    const data = {
      exchangeRate: Number(lc.value),
      tokensInPool: Number(totalStaked.value)
    }

    return {
      props: { data },
      revalidate: 60
    };

  } catch (error) {
    console.error(error)
    return {
      props: {
        data: {}
      },
    }
  }
};