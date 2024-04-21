
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
import liquidStakedWelsh from '@public/liquid-staked-welshcorgicoin.png'
import { Card } from '@components/ui/card';
import StakeWelshButton from '@components/stake/stake';
import UnstakeWelshButton from '@components/stake/unstake';
import liquidWelsh from '@public/liquid-welsh.png'
import { GetStaticProps } from 'next';
import { blocksApi } from '@lib/stacks-api';
import { callReadOnlyFunction } from '@stacks/transactions';
import { StacksMainnet } from "@stacks/network";

export default function Stake({ data }: Props) {
  const meta = {
    title: 'Welshcorgicoin | Stake Welsh Tokens',
    description: META_DESCRIPTION
  };

  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <div className="m-2 sm:container sm:mx-auto sm:py-10 md:max-w-2xl">

          <Card className='bg-black text-primary-foreground border-accent-foreground p-0 rounded-xl overflow-hidden'>
            <Image alt='Dungeon Scene' src={liquidWelsh} width="1080" height="605" className='border-b border-accent-foreground' />
            <div className='m-2'>
              <div className='flex justify-between mb-2'>
                <h1 className="text-md sm:text-2xl font-bold self-center">Liquid Staked Welsh</h1>
                <div className="sm:text-lg text-xs my-1 rounded-full sm:p-0 px-2 sm:px-4 text-center self-center font-light">
                  <div className="sm:text-lg text-xs my-1 bg-primary rounded-full sm:p-0 px-2 sm:px-4 text-center self-center font-light">1 sWELSH = {Number(data.exchangeRate) / 1000000} WELSH</div>
                </div>
              </div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className='flex items-center mb-2 gap-1'>
                      <h1 className="text-md font-bold text-left">How Staking Works</h1>
                      <Info size={16} color='#948f8f' />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className='max-w-2xl bg-black text-white border-primary leading-tight'>
                    <h2 className="text-lg font-bold mb-2">Interacting with the Staking Dashboard:</h2>
                    <ul className="list-disc pl-5 mb-4 text-md space-y-2">
                      <li>
                        <b>Stake Tokens</b>: Stake your Welsh tokens to receive Liquid Staked Welsh (sWELSH). The amount of sWELSH you receive is calculated based on the current inverse exchange rate.
                      </li>
                      <li>
                        <b>Unstake Tokens</b>: Redeem your sWELSH for Welsh tokens based on the current exchange rate.
                      </li>
                    </ul>
                    <p className="mb-4">
                      Staking your Welsh tokens allows you to participate in governance and earn staking rewards generated from network activities. Your staked tokens help secure the network and in return, you earn more tokens over time.
                    </p>
                    <p className="mb-4">
                      The staking interface aims to provide a transparent, user-friendly experience to support your investment decisions.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <p className="mb-8 text-xs sm:text-sm leading-tight font-thin">
                Welshcorgicoin Staking is a crucial part of the network's financial ecosystem, providing a way for token holders to earn passive income while contributing to the token's number-go-up mechanism.
              </p>
              <div className='space-x-1 flex'>
                <StakeWelshButton />
                <UnstakeWelshButton />
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
    const { results } = await blocksApi.getBlockList({ limit: 1 })

    const lc: any = await callReadOnlyFunction({
      network: new StacksMainnet(),
      contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
      contractName: "liquid-staked-welsh",
      functionName: "get-exchange-rate",
      functionArgs: [],
      senderAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS'
    })

    const data = {
      exchangeRate: Number(lc.value.value),
    }

    return {
      props: { data },
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