/**
 * Copyright 2020 Vercel Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { SkipNavContent } from '@reach/skip-nav';

import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import Layout from '@components/layout';
import ClaimFaucetButton from '@components/faucet/claim';
import Image from 'next/image';
import { StacksMainnet } from "@stacks/network";
import { callReadOnlyFunction } from '@stacks/transactions';
import { blocksApi } from '@lib/stacks-api';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@components/ui/tooltip"
import { Info } from 'lucide-react';
import { GetStaticProps } from 'next';


export default function Faucet({ data }: Props) {
  const meta = {
    title: 'Charisma | Faucet',
    description: META_DESCRIPTION
  };

  const blockHeight = data.latestBlock
  const lastClaimBlockHeight = data.lastClaim
  const unclaimedBlocks = blockHeight - lastClaimBlockHeight
  const dripAmount = data.dripAmount

  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <div className="mx-auto py-10 max-w-2xl justify-center flex-col text-5xl font-thin flex container text-lg">

          <Image alt='Dungeon Scene' src="/token-faucet-2.png" width="1080" height="605" />
          <div className='flex justify-between'>
            <h1 className="text-md sm:text-2xl font-bold my-4 self-center">Charisma Token Faucet </h1>
            <div className="sm:text-lg text-xs my-4 bg-primary rounded-full p-2 sm:p-0 sm:px-4 sm:py-1 py-0.5 text-center self-center font-light">{unclaimedBlocks * dripAmount} Tokens Unclaimed</div>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger><div className='flex items-center mb-2 gap-1'><h1 className="text-lg font-bold text-left">How It Works </h1><Info size={15} color='#948f8f' /></div></TooltipTrigger>
              <TooltipContent className='max-w-2xl bg-black text-white border-primary leading-tight'>
                <h2 className="text-lg font-bold mb-2">Interacting with the faucet:</h2>
                <ul className="list-disc pl-5 mb-4 text-md space-y-2">
                  <li>
                    <b>Claim Tokens</b>: As a user, you can claim tokens. The amount you'll receive is determined by multiplying the drip amount by the number of blocks that have passed since the last claim was made. For example, if the drip amount is 2 tokens per block, and 10 blocks have passed since the last claim, you could claim 20 tokens. However, this can only happen if there are enough tokens available in the faucet at that moment.
                  </li>
                  <li>
                    <b>Check Availability</b>: You can check the current drip amount (i.e., how many tokens are released per block) and also see when the last claim was made (this is expressed as a 'block height' - a specific block in the blockchain).
                  </li>
                </ul>
                <p className="mb-4">
                  Please note that you can't change the drip amount yourself - this is something only the DAO (Decentralized Autonomous Organization) or authorized extensions can do. This measure is in place to ensure that the faucet isn't misused and that the token issuance process remains under control.
                </p>
                <p className="mb-4">
                  If you try to claim tokens and there aren't any available, you'll see an error message. No fees are charged when the faucet is empty, and you can always try again the next block.
                </p>
                <p className="mb-4">
                  The goal of the Charisma Token Faucet is to maintain a slow, steady and fair issuance of tokens.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <p className="mb-8 text-xs sm:text-sm leading-tight">
            The Charisma Token Faucet is a contract (a piece of blockchain code) that automatically releases ("drips") Charisma tokens over time, a process similar to how a real-world faucet drips water. This process is also known as "token minting". The rate of these drips, i.e., the number of tokens released per Bitcoin block, is called the "drip amount". These tokens are used for governance and voting purposes within the Charisma DAO.
          </p>

          <ClaimFaucetButton />
        </div>
      </Layout>
    </Page>
  );
}

type Props = {
  data: any;
};

export const getStaticProps: GetStaticProps<Props> = async () => {

  const { results } = await blocksApi.getBlockList({ limit: 1 })

  const lc: any = await callReadOnlyFunction({
    network: new StacksMainnet(),
    contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
    contractName: "dme005-token-faucet-v0",
    functionName: "get-last-claim",
    functionArgs: [],
    senderAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS'
  })


  const d: any = await callReadOnlyFunction({
    network: new StacksMainnet(),
    contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
    contractName: "dme005-token-faucet-v0",
    functionName: "get-drip-amount",
    functionArgs: [],
    senderAddress: 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ'
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
};
