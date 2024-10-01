import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import { Card } from '@components/ui/card';
import { useState } from 'react';
import { PostConditionMode } from "@stacks/transactions";
import { Button } from "@components/ui/button";
import { Input } from '@components/ui/input';
import Layout from '@components/layout/layout';
import { useOpenContractCall } from '@micro-stacks/react';
import { contractPrincipalCV, boolCV } from 'micro-stacks/clarity';
import redPill from '@public/sip9/pills/red-pill-floating.gif';
import bluePill from '@public/sip9/pills/blue-pill.gif';
import charismaFloating from '@public/sip9/pills/cha-floating.gif';
import bluePillFloating from '@public/sip9/pills/blue-pill-floating.gif';
import Image from 'next/image';
import charisma from '@public/charisma.png';
import useWallet from '@lib/hooks/wallet-balance-provider';
import numeral from 'numeral';




export default function TokenPage() {
  const meta = {
    title: 'Charisma | Token',
    description: "The New Charisma Token",
  };

  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <div className="m-2 sm:container sm:mx-auto sm:py-10 md:max-w-5xl">
          <HeroSection />
          {/* <FeaturesSection /> */}
          <StatsSection />
          <WrappingSection />
        </div>
      </Layout>
    </Page>
  );
}

const HeroSection = () => {

  return (
    <div className='flex flex-col items-center rounded-full'>
      <Image src={charismaFloating} alt='Red Pill' width={300} height={300} className='transition-all scale-150 translate-y-24 cursor-pointer sm:hidden' />
      <div className='flex w-full pt-24 pb-8 px-8 sm:p-24 sm:pb-0 my-[10vh] bg-gray-900/50 rounded-lg sm:rounded-lg mt-12'>
        <div className='flex-col items-center hidden w-full space-y-4 sm:w-64 sm:flex'>
          <Image src={charismaFloating} alt='Red Pill' width={300} height={300} className='transition-all -translate-x-12 -translate-y-20 cursor-pointer scale-[2]' />
          {/* <Button disabled onClick={() => makeChoice(true)} size={'sm'} className='text-sm w-36 hover:bg-[#ffffffee] hover:text-primary'>Select Red Pill</Button> */}
        </div>
        <div className='flex flex-col items-center justify-center w-full px-4 text-lg text-center -translate-y-16 sm:text-md sm:text-start sm:items-start sm:justify-start sm:px-0'>
          <div className='flex items-baseline justify-center w-full text-center sm:justify-start'>
            <div className='py-4 text-6xl sm:py-0'>Charisma</div><div className='text-lg font-bold text-primary'>CHA</div>
          </div>
          <div className='mt-4 text-lg grow text-secondary/80'>Introducing the new Charisma token– stability, security, swaps.</div>
          <div className='mt-8 text-md text-secondary/80'>
            The token contract limits how many tokens can be wrapped per transaction, and how many wrapping transactions can occur in a set of blocks.
            This ensures fair access for all users and prevents supply inflation.
          </div>
          {/* <div className='mt-8 text-md text-secondary/80'>
            You can wrap your governance tokens into the new Charisma token only if you hold a Red Pill NFT.
            Once wrapped, you can swap tokens on any compatible DEX or exchange.
          </div> */}
        </div>
      </div>
    </div>
  );
};


const FeaturesSection = () => {

  return (
    <div className='flex flex-col w-full font-light text-center sm:flex-row sm:px-36'>
      {/* <div className='m-4'>
        <Image src={redPill} alt='Red Pill' width={400} height={400} className='mx-auto' />
      </div> */}
      <div className='m-4 text-xl leading-tight'>
        The Charisma token limits how many tokens can be wrapped per transaction, and how many wrapping transactions can occur in a set of blocks.
        This ensures fair access for all users and prevents sudden token surges from flooding the market.
      </div>
    </div>
  );
};

const StatsSection = () => {

  return (
    <div>
      <div className='w-full pt-8 text-3xl font-bold text-center uppercase'>TOKEN STATS</div>
      <div className='w-full pb-8 text-center text-md text-muted/90'>View the token contract's wrapping rate-limits.</div>
      <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
        <div className='flex flex-col items-center justify-center p-4 space-y-2 rounded-lg text-md bg-gray-900/50'>
          <div className='text-4xl font-semibold'>100</div>
          <div className='text-muted/80'>Tokens per Transaction</div>
        </div>
        <div className='flex flex-col items-center justify-center p-4 space-y-2 rounded-lg text-md bg-gray-900/50'>
          <div className='text-4xl font-semibold'>10</div>
          <div className='text-muted/80'>Blocks per Transaction</div>
        </div>
        <div className='flex flex-col items-center justify-center p-4 space-y-2 rounded-lg text-md bg-gray-900/50'>
          <div className='text-4xl font-semibold blur'>2</div>
          <div className='text-muted/80'>Transactions Available</div>
        </div>
        <div className='flex flex-col items-center justify-center p-4 space-y-2 rounded-lg text-md bg-gray-900/50'>
          <div className='text-4xl font-semibold blur'>0</div>
          <div className='text-muted/80'>Blocks until Unlocked</div>
        </div>
      </div>
    </div>
  );
};


const WrappingSection = () => {

  const { wallet, balances } = useWallet()

  const redPillBalances: any = balances?.non_fungible_tokens?.['SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.red-pill-nft::red-pill']

  return (
    <div className='mt-20 mb-12'>
      <div className='w-full pt-8 text-3xl font-bold text-center uppercase'>Wrap CHA</div>
      <div className='w-full pb-8 text-center text-md text-muted/90'>Wrap your governance tokens into the new CHA token.</div>
      <div className='container flex h-48 p-6 space-x-2 rounded-2xl max-w-prose bg-gray-900/50 leading-0 blur'>
        <div className='w-full'>
          <div className='font-bold text-muted-foreground'>
            Available
          </div>
          <div className='flex items-center mt-2 space-x-1 font-bold'>
            <div>{numeral(wallet.charisma.balance).format('0.00a')}</div>
            <div className='pb-1'><Image src={charisma} alt='Charisma' width={20} height={20} className='inline' /></div>
          </div>
        </div>
        <div className='w-full'>
          <div className='font-bold text-muted-foreground'>
            CHA Price
          </div>
          <div className='mt-2 font-bold'>
            $0.XX
          </div>
        </div>
        <div className='w-full'>
          <div className='font-bold text-muted-foreground'>
            Total Value
          </div>
          <div className='mt-2 font-bold'>
            $0.XX
          </div>
        </div>
        <div className='w-full'>
          <div className='font-bold text-muted-foreground'>
            Red Pilled
          </div>
          <div className='font-bold'>
            {redPillBalances?.count > 0 ? <Image src={redPill} alt='Red Pill' width={50} height={50} className='inline' /> : <div className='flex mt-2 space-x-2 font-bold'><div>No</div><div className='px-2 font-normal rounded-full cursor-pointer bg-primary'>Mint</div></div>}
          </div>
        </div>
      </div>
      <div className='container flex flex-col p-6 pb-0 -translate-y-20 border blur bg-background rounded-2xl max-w-prose min-h-48'>
        <div className='w-full space-y-2 grow'>
          <div className='flex justify-between py-2'>
            <div>Wrap Amount</div>
            <div className='px-2 rounded-full cursor-pointer bg-primary'>Max</div>
          </div>
          <Input disabled className='font-bold bg-white/10' />
          <div className='pt-2 rounded-lg'>
            {/* <div>Conversion Rate</div> */}
            <div className='flex justify-between'>
              <div>Receive</div>
              <div className='flex items-center space-x-1'>
                <div>0</div>
                <div className='pb-1'><Image src={charisma} alt='Charisma' width={20} height={20} className='inline' /></div>
              </div>
            </div>
          </div>
          <Button disabled className='w-full'>Wrap</Button>
        </div>
      </div>
      <div className='text-center text-muted-foreground'>Token wrapping almost ready to go live– stay tuned!</div>
    </div>
  );
};