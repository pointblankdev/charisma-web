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
import StakeRooButton from '@components/stake/stake-roo';
import UnstakeRooButton from '@components/stake/unstake-roo';
import liquidRoo from '@public/liquid-roo.png'
import { GetStaticProps } from 'next';
import { callReadOnlyFunction } from '@stacks/transactions';
import { StacksMainnet } from "@stacks/network";
import { useState } from 'react';
import { Input } from '@components/ui/input';

export default function Stake({ data }: Props) {
  const [tokenAmount, setTokenAmount] = useState('');

  const meta = {
    title: 'Charisma | Staking',
    description: META_DESCRIPTION,
    image: '/liquid-welsh.png'
  };

  const handleTokenAmountChange = (event: any) => {
    const { value } = event.target;
    // Limit input to only allow numbers and to 6 decimal places
    if (/^\d*\.?\d{0,6}$/.test(value)) {
      setTokenAmount(value);
    }
  };

  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <div className="m-2 text-2xl text-center sm:container sm:mx-auto sm:py-10 md:max-w-2xl">

          Coming Soon!
        </div>
      </Layout>
    </Page>
  );
}

type Props = {
  data: any;
};

export const getStaticProps: GetStaticProps<Props> = () => {

  try {
    // const lc: any = await callReadOnlyFunction({
    //   network: new StacksMainnet(),
    //   contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
    //   contractName: "liquid-staked-roo",
    //   functionName: "get-exchange-rate",
    //   functionArgs: [],
    //   senderAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS'
    // })

    // const data = {
    //   exchangeRate: Number(lc.value),
    // }

    return {
      props: { data: {} },
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

export const getStaticPaths = () => {
  return {
    paths: [
      { params: { slug: 'welsh' } },
    ],
    fallback: true
  };
}