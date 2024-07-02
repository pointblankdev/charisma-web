
import { SkipNavContent } from '@reach/skip-nav';

import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import Layout from '@components/layout';
import ClaimFaucetButton from '@components/faucet/green-room-claim';
import Image from 'next/image';
import { StacksMainnet } from "@stacks/network";
import { callReadOnlyFunction } from '@stacks/transactions';
import { blocksApi, getGuestlist } from '@lib/stacks-api';
import { GetStaticProps } from 'next';
import greenRoom from '@public/green-room-card.png'
import { Card } from '@components/ui/card';
import { clamp } from 'framer-motion';
import millify from 'millify';
import { userSession } from '@components/stacks-session/connect';
import { useEffect, useState } from 'react';


export default function TheGreenRoom({ data }: Props) {
  const meta = {
    title: 'Charisma | The Green Room',
    description: META_DESCRIPTION
  };

  const blockHeight = data.latestBlock
  const lastClaimBlockHeight = data.lastClaim
  const unclaimedBlocks = clamp(0, 999, blockHeight - lastClaimBlockHeight)
  const dripAmount = data.dripAmount / 1000000
  const claimableTokens = millify(unclaimedBlocks * dripAmount)

  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <div className="m-2 sm:container sm:mx-auto sm:py-10 md:max-w-2xl">

          <Card className='bg-black text-primary-foreground border-accent-foreground p-0 rounded-xl overflow-hidden'>
            <Image alt='The Green Room' src={greenRoom} width="1080" height="605" className='border-b border-accent-foreground' />
            <div className='m-2'>
              <div className='flex justify-between mb-2'>
                <h1 className="text-md sm:text-2xl font-bold self-center">The Green Room </h1>
                <div className="sm:text-lg text-xs my-1 bg-primary rounded-full sm:p-0 px-2 sm:px-4 text-center self-center font-light">{claimableTokens} Tokens Unclaimed</div>
              </div>
              <p className="mb-8 text-xs sm:text-sm leading-tight font-thin">
                The Green Room is an exclusive backstage area reserved for those who've volunteered their time for the Charisma project and who keep supporting us every day. It's our special way of saying thanks and ensuring they're recognized and rewarded for their ongoing contributions.
              </p>

              <ClaimFaucetButton tokensToClaim={unclaimedBlocks * dripAmount} />
            </div>
          </Card>
        </div>
      </Layout>
    </Page >
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
      contractName: "green-room",
      functionName: "get-last-claim",
      functionArgs: [],
      senderAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS'
    })


    const d: any = await callReadOnlyFunction({
      network: new StacksMainnet(),
      contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
      contractName: "green-room",
      functionName: "get-drip-amount",
      functionArgs: [],
      senderAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS'
    })

    const data = {
      lastClaim: Number(lc.value.value),
      dripAmount: Number(d.value.value),
      latestBlock: results[0].height
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
