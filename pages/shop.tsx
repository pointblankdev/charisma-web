import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import { Card } from '@components/ui/card';
import { useState } from 'react';
import { Pc, PostConditionMode } from "@stacks/transactions";
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
import Image from 'next/image';
import charisma from '@public/charisma.png';
import stxLogo from '@public/stx-logo.png';
import useWallet from '@lib/hooks/wallet-balance-provider';
import numeral from 'numeral';
import { useGlobalState } from '@lib/hooks/global-state-context';


export default function ShopPage() {
  const meta = {
    title: 'Charisma | Shop',
    description: "The Charisma Shop",
  };

  const { charismaClaims } = useGlobalState();
  const { stxAddress } = useAccount();
  const { openContractCall } = useOpenContractCall();

  function makeChoice(choice: boolean) {
    if (stxAddress) {

      const postConditions: any = []
      if (!charismaClaims.hasFreeClaim) {
        postConditions.push(Pc.principal(stxAddress).willSendEq(1000000).ustx())
      }
      openContractCall({
        contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
        contractName: choice ? 'red-pill-nft' : 'blue-pill-nft',
        functionName: "claim",
        functionArgs: [],
        postConditionMode: PostConditionMode.Deny,
        postConditions,
      });
    }
  }

  const buyRedPill = () => {
    makeChoice(true);
  }

  const buyBluePill = () => {
    makeChoice(false);
  }

  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <div className="m-2 sm:container sm:mx-auto sm:pb-10 md:max-w-5xl">
          <div className='mt-2 mb-4 font-light text-center text-muted-foreground/90'>All sales go to WELSH & ROO token redemptions</div>
          <div className='grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4'>
            <div className='relative flex flex-col w-full overflow-hidden rounded-lg h-60 sm:h-60 bg-gray-900/80'>
              <div className='z-10 flex justify-between px-2 py-1'>
                <div className='text-lg font-bold'>Red Pill NFT</div>
                <div className='flex items-center space-x-1 font-semibold'>
                  <div>100</div><div><Image src={stxLogo} className='rounded-full' alt='STX logo' width={16} height={16} /></div>
                </div>
              </div>
              <div className='grow'></div>
              <Button disabled={charismaClaims.hasClaimed} onClick={buyRedPill} className='h-8 text-md w-14 absolute bottom-2 right-2 z-10 hover:bg-[#ffffffee] hover:text-primary'>
                <div>Claim</div>
              </Button>
              <Image src={redPillNft} className='absolute inset-0 opacity-80 h-60 hover:opacity-100' alt='Red Pill' width={300} height={300} />
            </div>

            <div className='relative flex flex-col w-full overflow-hidden rounded-lg h-60 sm:h-60 bg-gray-900/80'>
              <div className='z-10 flex justify-between px-2 py-1'>
                <div className='text-lg font-bold'>Blue Pill NFT</div>
                <div className='flex items-center space-x-1 font-semibold'>
                  <div>100</div><div><Image src={stxLogo} className='rounded-full' alt='STX logo' width={16} height={16} /></div>
                </div>
              </div>
              <div className='grow'></div>
              <Button disabled={charismaClaims.hasClaimed} onClick={buyBluePill} className='h-8 text-md w-14 absolute bottom-2 right-2 z-10 hover:bg-[#ffffffee] hover:text-primary'>
                <div>Claim</div>
              </Button>
              <Image src={bluePillNft} className='absolute inset-0 opacity-80 h-60 hover:opacity-100' alt='Blue Pill' width={300} height={300} />
            </div>
          </div>
        </div>
      </Layout>
    </Page>
  );
}