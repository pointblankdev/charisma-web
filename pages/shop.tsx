import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import { Card } from '@components/ui/card';
import { useState } from 'react';
import { Pc, PostConditionMode } from '@stacks/transactions';
import { Button } from '@components/ui/button';
import Layout from '@components/layout/layout';
import Image from 'next/image';
import stxLogo from '@public/stx-logo.png';
import redPillNft from '@public/sip9/pills/red-pill-nft.gif';
import bluePillNft from '@public/sip9/pills/blue-pill-nft.gif';
import { useGlobalState } from '@lib/hooks/global-state-context';
import { fetchCallReadOnlyFunction, cvToValue } from '@stacks/transactions';
import { useConnect } from '@stacks/connect-react';
import { network } from '@components/stacks-session/connect';

export async function getStaticProps() {
  const redPillPrice = await fetchCallReadOnlyFunction({
    contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
    contractName: 'red-pill-nft',
    functionName: 'get-price',
    functionArgs: [],
    senderAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS'
  });

  const bluePillPrice = await fetchCallReadOnlyFunction({
    contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
    contractName: 'blue-pill-nft',
    functionName: 'get-price',
    functionArgs: [],
    senderAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS'
  });

  return {
    props: {
      redPillPrice: cvToValue(redPillPrice).value,
      bluePillPrice: cvToValue(bluePillPrice).value
    },
    revalidate: 60
  };
}

interface ShopPageProps {
  redPillPrice: number;
  bluePillPrice: number;
}

export default function ShopPage({ redPillPrice, bluePillPrice }: ShopPageProps) {
  const meta = {
    title: 'Charisma | Shop',
    description: 'The Charisma Shop'
  };

  const { charismaClaims, stxAddress } = useGlobalState();
  const { doContractCall } = useConnect();

  function makeChoice(choice: boolean) {
    if (stxAddress) {
      const postConditions: any = [];
      if (!charismaClaims.hasFreeClaim) {
        const price = choice ? redPillPrice : bluePillPrice;
        postConditions.push(Pc.principal(stxAddress).willSendEq(price).ustx());
      }
      doContractCall({
        network: network,
        contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
        contractName: choice ? 'red-pill-nft' : 'blue-pill-nft',
        functionName: 'claim',
        functionArgs: [],
        postConditionMode: PostConditionMode.Deny,
        postConditions
      });
    }
  }

  const buyRedPill = () => {
    makeChoice(true);
  };

  const buyBluePill = () => {
    makeChoice(false);
  };

  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <div className="m-2 sm:container sm:mx-auto sm:pb-10 md:max-w-5xl">
          <div className="mt-2 mb-4 font-light text-center text-muted-foreground/90">
            All sales go to WELSH & ROO token redemptions
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
            <div className="relative flex flex-col w-full overflow-hidden rounded-lg h-60 sm:h-60 bg-gray-900/80">
              <div className="z-10 flex justify-between px-2 py-1">
                <div className="text-lg font-bold">Red Pill NFT</div>
                <div className="flex items-center space-x-1 font-semibold">
                  <div>{redPillPrice / 1000000}</div>
                  <div>
                    <Image
                      src={stxLogo}
                      className="rounded-full"
                      alt="STX logo"
                      width={16}
                      height={16}
                    />
                  </div>
                </div>
              </div>
              <div className="grow"></div>
              <Button
                disabled={charismaClaims.hasClaimed}
                onClick={buyRedPill}
                className="h-8 text-md w-14 absolute bottom-2 right-2 z-10 hover:bg-[#ffffffee] hover:text-primary"
              >
                <div>Claim</div>
              </Button>
              <Image
                src={redPillNft}
                className="absolute inset-0 opacity-80 h-60 hover:opacity-100"
                alt="Red Pill"
                width={300}
                height={300}
              />
            </div>

            <div className="relative flex flex-col w-full overflow-hidden rounded-lg h-60 sm:h-60 bg-gray-900/80">
              <div className="z-10 flex justify-between px-2 py-1">
                <div className="text-lg font-bold">Blue Pill NFT</div>
                <div className="flex items-center space-x-1 font-semibold">
                  <div>{bluePillPrice / 1000000}</div>
                  <div>
                    <Image
                      src={stxLogo}
                      className="rounded-full"
                      alt="STX logo"
                      width={16}
                      height={16}
                    />
                  </div>
                </div>
              </div>
              <div className="grow"></div>
              <Button
                disabled={charismaClaims.hasClaimed}
                onClick={buyBluePill}
                className="h-8 text-md w-14 absolute bottom-2 right-2 z-10 hover:bg-[#ffffffee] hover:text-primary"
              >
                <div>Claim</div>
              </Button>
              <Image
                src={bluePillNft}
                className="absolute inset-0 opacity-80 h-60 hover:opacity-100"
                alt="Blue Pill"
                width={300}
                height={300}
              />
            </div>
          </div>
        </div>
      </Layout>
    </Page>
  );
}
