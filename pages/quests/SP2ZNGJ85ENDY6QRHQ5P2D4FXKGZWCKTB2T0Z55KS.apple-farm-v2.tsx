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
import journeyOfDiscovery from '@public/quests/journey-of-discovery.png';
import experience from '@public/experience.png';
import schaImg from '@public/liquid-staked-charisma.png';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger
} from '@components/ui/dialog';
import { AlertDialogHeader } from '@components/ui/alert-dialog';
import { getLand, getLands, getNftCollectionMetadata } from '@lib/db-providers/kv';
import { useAccount, useOpenContractCall } from '@micro-stacks/react';
import { uintCV, contractPrincipalCV } from 'micro-stacks/clarity';
import {
  FungibleConditionCode,
  makeStandardFungiblePostCondition,
  makeStandardSTXPostCondition
} from '@stacks/transactions';
import {
  getDehydratedStateFromSession,
  parseAddress
} from '@components/stacks-session/session-helpers';
import stxIcon from '@public/stx-logo.png';
import energyIcon from '@public/lands/img/energy.png';
import TokenSelectDialog from '@components/quest/token-select-dialog';
import abundantOrchard from '@public/quests/abundant-orchard/apple-orchard.png';
import charismaIcon from '@public/charisma.png';

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  // get all lands from db
  const landContractAddresses = await getLands();

  const lands = [];
  for (const ca of landContractAddresses) {
    const metadata = await getLand(ca);
    lands.push(metadata);
  }

  const dehydratedState = (await getDehydratedStateFromSession(ctx)) as string;
  const stxAddress = await parseAddress(dehydratedState);

  return {
    props: {
      dehydratedState,
      stxAddress,
      lands
    }
  };
}

type Props = {
  stxAddress: string;
  lands: any[];
};

export default function SpellScrollFireBolt({ lands, stxAddress }: Props) {
  const meta = {
    title: 'Charisma | Harvest the Apple Farm',
    description: 'The more tokens you stake, the greater the harvest.',
    image: '/quests/pixel-rozar/pixel-rozar.png'
  };

  const title = 'Harvest the Apple Farm';
  const subtitle = 'The more tokens you stake, the greater the harvest.';

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

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
                {/* <div className='leading-snug sm:mr-4'>
                  <div className={`font-medium text-md whitespace-nowrap ${!isMintedOut ? `animate-pulse` : `text-primary`}`}>{isMintedOut ? `Minted Out` : `Minting Now`}</div>
                  <div className='font-medium text-sm text-center text-primary-foreground/80'>{nftCollectionMetadata.properties.minted || 0} / {nftCollectionMetadata.properties.total_supply}</div>
                </div> */}
              </div>
            </CardHeader>
            <CardContent className="z-20 flex-grow p-4 space-y-4">
              <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="z-20">
                  <div className="z-30 text-xl font-semibold">Rewards</div>
                  <div className="z-30 mb-4 text-sm font-fine text-foreground">
                    You will receive:
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="relative">
                      <Image
                        alt="Reward Icon"
                        src={charismaIcon}
                        quality={10}
                        className="z-30 w-full rounded-full border shadow-lg"
                      />
                      {/* <div className="absolute px-1 font-bold rounded-full -top-1 -right-3 text-md md:text-base lg:text-sm bg-accent text-accent-foreground">
                        NFT
                      </div> */}
                    </div>
                  </div>
                </div>
                <div className="quest-details z-20 row-span-2 mt-8 sm:mt-0">
                  <h2 className="z-30 text-xl font-semibold mb-4">Quest Description</h2>
                  <div className="z-30 font-fine text-foreground leading-tight">
                    <p className="mb-2 max-w-sm">
                      Welcome to the Apple Farm, where you can harvest tokens by spending energy.
                    </p>

                    <h3 className="font-semibold mt-4 mb-2">Core Mechanics:</h3>
                    <ul className="list-disc list-inside mb-4 text-sm">
                      <li>Stake memecoins to generate energy</li>
                      <li>Spend energy to harvest CHA tokens</li>
                    </ul>

                    <h3 className="font-semibold mt-4 mb-2">Harvest Formula:</h3>

                    <p className="mb-4 text-sm">
                      Tokens = Energy × Staking Bonus × Experience Bonus
                    </p>

                    <h3 className="font-semibold mt-4 mb-2">Strategy Tips:</h3>
                    <ul className="list-disc list-inside mb-4 text-sm">
                      <li>Use Charisma tokens for 10x larger yields</li>
                      <li>Accumulate experience to boost efficiency over time</li>
                      <li>Harvest frequently and restake into sCHA</li>
                    </ul>
                  </div>
                </div>
                <div className="z-20 mt-4">
                  <div className="z-30 text-xl font-semibold">Requirements</div>
                  <ul className="list-disc list-inside text-sm leading-snug mb-4">
                    <li>You must have energy to harvest</li>
                    <li>sCHA protocol burn per mint</li>
                  </ul>
                  <div className="grid grid-cols-4 gap-4 mt-4">
                    <div className="relative">
                      <Image
                        alt="energy"
                        src={energyIcon}
                        quality={10}
                        className="z-30 w-full rounded-full border shadow-lg"
                      />
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
              </section>
            </CardContent>

            <CardFooter className="z-20 flex justify-between p-4 items-end">
              <Link href="/quests">
                <Button variant="ghost" className="z-30">
                  Back
                </Button>
              </Link>

              {stxAddress && (
                <TokenSelectDialog
                  lands={lands}
                  contractId={'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.apple-farm-v2'}
                  buttonText={'Harvest Apples'}
                />
              )}
            </CardFooter>
            <Image
              src={abundantOrchard}
              width={800}
              height={800}
              alt={'quest-background-image'}
              className={cn(
                'object-cover',
                'opacity-10',
                'sm:aspect-square',
                'aspect-[1/3]',
                'scale-100',
                'flex',
                'z-10',
                'absolute',
                'inset-0',
                'pointer-events-none',
                'w-full'
              )}
            />
            <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-white to-black opacity-10" />
          </Card>
        </motion.div>
      </Layout>
    </Page>
  );
}
