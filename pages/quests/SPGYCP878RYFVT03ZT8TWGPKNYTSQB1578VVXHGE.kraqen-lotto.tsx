import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import Layout from '@components/layout/layout';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@components/ui/card';
import { Button } from '@components/ui/button';
import { GetServerSidePropsContext, GetStaticProps } from 'next';
import { useEffect, useState } from 'react';
import { cn } from '@lib/utils';
import Link from 'next/link';
import Typewriter from 'typewriter-effect';
import { motion } from 'framer-motion';
import journeyOfDiscovery from '@public/quests/journey-of-discovery.png'
import experience from '@public/experience.png'
import schaImg from '@public/liquid-staked-charisma.png'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@components/ui/dialog';
import { AlertDialogHeader } from '@components/ui/alert-dialog';
import { getLand, getLands, getNftCollectionMetadata } from '@lib/db-providers/kv';
import { useAccount, useOpenContractCall } from '@micro-stacks/react';
import { uintCV, contractPrincipalCV } from 'micro-stacks/clarity';
import { FungibleConditionCode, makeStandardFungiblePostCondition, makeStandardSTXPostCondition } from '@stacks/transactions';
import { getDehydratedStateFromSession } from '@components/stacks-session/session-helpers';
import { getTokenBalance } from '@lib/stacks-api';
import KrakenLottoIcon from '@public/quests/raven-raffle/ticket.png'
import KrakenLottoCard from '@public/quests/raven-raffle/kraken-lotto.png'
import stxIcon from '@public/stx-logo.png'
import energyIcon from '@public/lands/img/energy.png'
import { useGlobalState } from '@lib/hooks/global-state-context';
import numeral from 'numeral';
import { useToast } from "@components/ui/use-toast"
import TokenSelectDialog from '@components/quest/token-select-dialog';

function parseAddress(str: string) {
  // Parse the string into a JavaScript object
  const parsedData = JSON.parse(str);

  // Navigate through the nested structure to find the address
  const addressObj = parsedData[1][1][0];

  // Return the address
  return addressObj.address;
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  // get all lands from db
  const landContractAddresses = await getLands()

  const lands = []
  for (const ca of landContractAddresses) {
    const metadata = await getLand(ca)
    lands.push(metadata)
  }

  const nftCollectionMetadata = await getNftCollectionMetadata('SPGYCP878RYFVT03ZT8TWGPKNYTSQB1578VVXHGE.kraqen-lotto')

  // const state = await getDehydratedStateFromSession(ctx) as string

  // const exp = await getTokenBalance('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.experience', parseAddress(state))
  // const burnAmount = (exp / Math.pow(10, 9)).toFixed(6)

  return {
    props: {
      lands,
      nftCollectionMetadata,
      // burnAmount,
      // dehydratedState: await getDehydratedStateFromSession(ctx),
    }
  };
};

type Props = {
  lands: any[];
  nftCollectionMetadata: any;
  // burnAmount: string
};

export default function KrakenLotto({ lands, nftCollectionMetadata }: Props) {
  const meta = {
    title: "Charisma | Mint a Kraken Lottery Ticket",
    description: META_DESCRIPTION,
    image: '/quests/raven-raffle/kraken-lotto.png'
  };

  const title = "Mint a Kraken Lottery Ticket";
  const subtitle = 'Mint lottery tickets for your chance to win.';

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const isMintedOut = nftCollectionMetadata.properties.minted === nftCollectionMetadata.properties.total_supply

  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="m-2 sm:container sm:mx-auto sm:py-10 md:max-w-3xl"
        >
          <Card className="min-h-[600px] flex flex-col bg-black text-primary-foreground border-accent-foreground p-0 relative overflow-hidden rounded-md group/card w-full max-w-3xl opacity-[0.99] shadow-black shadow-2xl">
            <CardHeader className="z-20 p-4 space-y-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="z-30 text-xl font-semibold">{title}</CardTitle>
                  <CardDescription className="z-30 text-sm sm:text-md font-fine text-muted-foreground">
                    {subtitle}
                  </CardDescription>
                </div>
                <div className='leading-snug sm:mr-4'>
                  <div className={`font-medium text-md whitespace-nowrap ${!isMintedOut ? `animate-pulse` : `text-primary`}`}>{isMintedOut ? `Minted Out` : `Minting Now`}</div>
                  <div className='font-medium text-sm text-center text-primary-foreground/80'>{nftCollectionMetadata.properties.minted} / {nftCollectionMetadata.properties.total_supply}</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="z-20 flex-grow p-4 space-y-4">
              <section className='grid grid-cols-1 sm:grid-cols-2'>
                <div className="z-20">
                  <div className="z-30 text-xl font-semibold">Rewards</div>
                  <div className="z-30 mb-4 text-sm font-fine text-foreground">
                    You will receive:
                  </div>
                  <div className="grid grid-cols-5 gap-4">
                    <div className="relative">
                      <Image
                        alt="NFT Icon"
                        src={KrakenLottoIcon}
                        quality={10}
                        className="z-30 w-full rounded-md border shadow-lg"
                      />
                      <div className="absolute px-1 font-bold rounded-full -top-1 -right-3 text-sm md:text-xs bg-accent text-accent-foreground">
                        NFT
                      </div>
                    </div>
                  </div>
                </div>
                <div className="z-20 row-span-2 mt-8 sm:mt-0">
                  <div className="z-30 text-xl font-semibold">Quest Details</div>
                  <div className="z-30 mb-4 text-md font-fine text-foreground leading-snug">
                    <p>
                      Join the Kraken Casino's weekly giveaway for a chance to win CHA tokens!
                    </p>
                    <p className="mt-2">
                      <strong>Prizes:</strong>
                      <br />🥇 First: 4,000 CHA
                      <br />🥈 Second: 3,000 CHA
                      <br />🥉 Third: 2,000 CHA
                    </p>
                    <p className="mt-2">
                      <strong>How to Enter:</strong> Mint your lottery ticket before August 28, 2024.
                    </p>
                    <p className="mt-2">
                      Any unminted tickets will be minted by the casino before the draw. All tickets have a chance to win!
                    </p>
                    <p className="mt-2">
                      Don't miss out on your chance to be one of our three lucky winners. Good luck!
                    </p>
                  </div>
                </div>
              </section>

              <section className='grid grid-cols-1 sm:grid-cols-2'>
                <div className="z-20">
                  <div className="z-30 text-xl font-semibold">Requirements</div>
                  <ul className="list-disc list-inside text-sm leading-snug mb-4">
                    <li>1 STX mint cost per NFT</li>
                    <li>1000 energy cost per NFT</li>
                    <li>sCHA protocol burn per mint</li>
                    <li>Max of 4 NFTs per mint</li>
                  </ul>
                  <div className="grid grid-cols-6 gap-4 mt-4">
                    <div className="relative">
                      <Image
                        alt="STX token"
                        src={stxIcon}
                        quality={10}
                        className="z-30 w-full rounded-full border shadow-lg"
                      />
                      <div className="absolute text-center px-1 min-w-6 font-bold rounded-full -top-1 -right-2 text-sm md:text-xs bg-accent text-accent-foreground">
                        1
                      </div>
                    </div>
                    <div className="relative">
                      <Image
                        alt="energy"
                        src={energyIcon}
                        quality={10}
                        className="z-30 w-full rounded-full border shadow-lg"
                      />
                      <div className="absolute text-center px-1 min-w-6 font-bold rounded-full -top-1 -right-2 text-sm md:text-xs bg-accent text-accent-foreground">
                        1k
                      </div>
                    </div>
                    <div className="relative">
                      <Image
                        alt="sCHA token"
                        src={schaImg}
                        quality={10}
                        className="z-30 w-full rounded-full border shadow-lg"
                      />
                    </div>
                  </div>
                </div>
                <div className="z-20 mt-8 sm:mt-0">
                  <div className="z-30 text-xl font-semibold">Key Information</div>
                  <div className='z-30 mb-4 text-sm font-fine text-foreground'>
                    <ul className="list-disc list-inside text-sm leading-snug">
                      <li>Fixed Supply: Only 1000 NFTs will be minted</li>
                      <li>Utility: More tickets, better chance to win</li>
                      <li>Mint Limit: Only 4 NFTs can be minted per tx</li>
                      <li>Tap Limit: Only 1 mint tx per block / per token type</li>
                    </ul>
                  </div>
                </div>
              </section>
            </CardContent>

            <CardFooter className="z-20 flex justify-between p-4 items-end">
              <Link href="/quests">
                <Button variant="ghost" className="z-30">
                  Back
                </Button>
              </Link>

              {!isMintedOut && <TokenSelectDialog lands={lands} contractId={'SPGYCP878RYFVT03ZT8TWGPKNYTSQB1578VVXHGE.kraqen-lotto'} />}
            </CardFooter>
            <Image
              src={KrakenLottoCard}
              width={800}
              height={1600}
              alt={'quest-background-image'}
              className={cn(
                'object-cover',
                'opacity-10',
                'aspect-[2/5]',
                'sm:aspect-[4/5]',
                'flex',
                'z-10',
                'absolute',
                'inset-0',
                'pointer-events-none'
              )}
            />
            <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-white to-black opacity-10" />
          </Card>
        </motion.div>
      </Layout>
    </Page>
  );
}