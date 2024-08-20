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
import { getLand, getLands } from '@lib/db-providers/kv';
import { useAccount, useOpenContractCall } from '@micro-stacks/react';
import { uintCV, contractPrincipalCV } from 'micro-stacks/clarity';
import { FungibleConditionCode, makeStandardFungiblePostCondition } from '@stacks/transactions';
import { getDehydratedStateFromSession } from '@components/stacks-session/session-helpers';
import { getTokenBalance } from '@lib/stacks-api';
import useWallet from '@lib/hooks/use-wallet-balances';

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

  // const state = await getDehydratedStateFromSession(ctx) as string

  // const exp = await getTokenBalance('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.experience', parseAddress(state))
  // const burnAmount = (exp / Math.pow(10, 9)).toFixed(6)

  return {
    props: {
      lands,
      // burnAmount,
      // dehydratedState: await getDehydratedStateFromSession(ctx),
    }
  };
};

type Props = {
  lands: any[];
  // burnAmount: string
};

export default function Adventure({ lands }: Props) {
  const meta = {
    title: "Charisma | Adventure",
    description: META_DESCRIPTION,
    image: '/journey-of-discovery.png'
  };

  const title = "Adventure";
  const subtitle = 'Spend your energy to gain experience.';


  const [descriptionVisible, setDescriptionVisible] = useState(false);

  useEffect(() => {
    try {
      setDescriptionVisible(true);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  return (
    <Page meta={meta} fullViewport>
      {/* <Image src={goldEmbers} alt="bolt-background-image" layout="fill" objectFit="cover" priority /> */}
      <SkipNavContent />
      <Layout>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="m-2 sm:container sm:mx-auto sm:py-10 md:max-w-2xl"
        >
          <Card className="min-h-[600px] flex flex-col bg-black text-primary-foreground border-accent-foreground p-0 relative overflow-hidden rounded-md group/card w-full max-w-2xl opacity-[0.99] shadow-black shadow-2xl">
            <CardHeader className="z-20 p-4 space-y-0">
              <div className="flex items-center justify-between">
                <CardTitle className="z-30 text-xl font-semibold">{title}</CardTitle>
              </div>
              <CardDescription className="z-30 text-md font-fine text-muted-foreground">
                {subtitle}
              </CardDescription>
            </CardHeader>
            <CardContent className="z-20 flex-grow p-4 space-y-4">
              <section className='grid grid-cols-2'>
                <div className="z-20">
                  <div className="z-30 text-xl font-semibold">Rewards</div>
                  <div className="z-30 mb-4 text-sm font-fine text-foreground">
                    You will recieve:
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="relative">
                      <Image
                        alt="Experience"
                        src={experience}
                        quality={10}
                        className="z-30 w-full rounded-full"
                      />
                      <div className="absolute px-1 font-bold rounded-full -top-1 -right-3 text-md md:text-base lg:text-sm bg-accent text-accent-foreground">
                        EXP
                      </div>
                    </div>
                  </div>
                </div>
                <div className="z-20">
                  <div className="z-30 text-xl font-semibold">Quest Details</div>
                  <div className="z-30 mb-4 text-sm font-fine text-foreground">
                    On this quest, your energy is spent in exchange for Experience tokens. The conversion rate is log2 squared, so frequent quest completions will yield the most Experience over time.
                  </div>
                </div>
              </section>

              <section className='grid grid-cols-2'>
                <div className="z-20">
                  <div className="z-30 text-xl font-semibold">Requirements</div>
                  <div className="z-30 mb-4 text-sm font-fine text-foreground">
                    Burn sCHA to complete
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="relative">
                      <Image
                        alt="protocol-fee-token-image"
                        src={schaImg}
                        quality={10}
                        className="z-30 w-full rounded-full"
                      />
                      {/* <div className="absolute px-1 font-bold rounded-full -top-1 -right-3 text-md md:text-base lg:text-sm bg-accent text-accent-foreground min-w-6 text-center">
                        {Number(burnAmount) >= 0.1 && Number(burnAmount).toFixed(1)}
                      </div> */}
                    </div>
                  </div>
                </div>
                <div className="z-20">
                  <div className="z-30 text-xl font-semibold">&nbsp;</div>
                  <div className='z-30 mb-4 font-fine max-w-64 text-muted-foreground'>
                    {descriptionVisible && <Typewriter
                      options={{ autoStart: true }}
                      onInit={typewriter => {
                        typewriter.pauseFor(2700).start().typeString('"We shall not cease from exploration, and the end of all our exploring will be to arrive where we started and know the place for the first time."')
                      }}
                    />}
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

              <SelectCreatureDialog lands={lands} />
            </CardFooter>
            <Image
              src={journeyOfDiscovery}
              width={800}
              height={1600}
              alt={'quest-background-image'}
              className={cn(
                'object-cover',
                'opacity-10',
                'aspect-[1/2]',
                'sm:aspect-square',
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

export function SelectCreatureDialog({ lands }: any) {

  const { openContractCall } = useOpenContractCall();

  const { stxAddress } = useAccount()
  const { getBalanceByKey } = useWallet()

  const experience =
    getBalanceByKey('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.experience::experience').balance /
    Math.pow(10, 6);

  function journey(creatureId: number) {

    const burnTokenContract = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-charisma::liquid-staked-token'

    const postConditions = [
      experience >= 0.001 && makeStandardFungiblePostCondition(stxAddress!, FungibleConditionCode.GreaterEqual, '1', burnTokenContract),
    ];

    openContractCall({
      contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
      contractName: 'adventure-v0',
      functionName: "tap",
      functionArgs: [uintCV(creatureId), contractPrincipalCV('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS', 'land-helper-v2')],
      postConditions: postConditions as any[]
    });
  }


  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size={'sm'} className={`z-30`}>Complete Quest</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <AlertDialogHeader>
          <DialogTitle>Which staked token should you use?</DialogTitle>
        </AlertDialogHeader>

        <DialogDescription className='grid gap-2 grid-cols-2 sm:grid-cols-4 space-x-4 py-4'>
          {lands.map((land: any) => (
            <div className={`flex flex-col items-center space-y-2 ${!land.whitelisted && 'opacity-20 grayscale'}`}>
              <Image
                alt={'token-logo'}
                src={land.image}
                width={100}
                height={100}
                onClick={() => journey(land.id)}
                className={`z-30 border rounded-full h-32 w-32 ${land.whitelisted && 'hover:scale-110 transition-all cursor-pointer'}`}
              />
            </div>
          ))}
        </DialogDescription>
      </DialogContent>
    </Dialog >
  )
}