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
import redPill from '@public/sip9/pills/red-pill.gif';
import bluePill from '@public/sip9/pills/blue-pill.gif';
import charismaFloating from '@public/sip9/pills/cha-floating.gif';
import bluePillFloating from '@public/sip9/pills/blue-pill-floating.gif';
import Image from 'next/image';




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
          <p className='sm:p-8 mx-auto my-[50vh] text-lg sm:text-2xl font-light text-center max-w-prose'>
            The Charisma token limits how many tokens can be wrapped per transaction, and how many wrapping transactions can occur in a set of blocks.
            This ensures fair access for all users and prevents sudden token surges from flooding the market.
          </p>
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
            <div className='py-4 text-6xl sm:py-0'>Charisma</div><div className='text-lg text-primary'>CHA</div>
          </div>
          <div className='mt-4 text-lg grow text-secondary/80'>Introducing the new Charisma token– safe, unified and unruggable.</div>
          <div className='mt-8 text-md text-secondary/80'>
            You can wrap your governance tokens into the new Charisma token only if you hold a Red Pill NFT.
            Once wrapped, you can swap tokens on any compatible DEX or exchange.
          </div>
        </div>
      </div>
    </div>
  );
};