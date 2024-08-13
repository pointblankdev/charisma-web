import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import Layout from '@components/layout';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@components/ui/card';
import MintRaven from '@components/mint/raven';
import { Button } from '@components/ui/button';
import {
  blocksApi,
} from '@lib/stacks-api';
import { GetStaticProps } from 'next';
import { useEffect, useLayoutEffect, useState } from 'react';
import { cn } from '@lib/utils';
import Link from 'next/link';
import Typewriter from 'typewriter-effect';
import { motion } from 'framer-motion';
import odinsRaven from '@public/odins-raven/img/4.gif';
import fenrirIcon from '@public/fenrir-icon-2.png';
import goldEmbers from '@public/quests/gold-embers.gif'
import journeyOfDiscovery from '@public/quests/journey-of-discovery.png'
import experience from '@public/experience.png'
import { userSession } from '@components/stacks-session/connect';
import { useConnect } from '@stacks/connect-react';
import { AnchorMode, callReadOnlyFunction, cvToJSON, Pc, PostConditionMode, principalCV, uintCV } from '@stacks/transactions';
import { StacksMainnet } from "@stacks/network";
import numeral from 'numeral';
import schaImg from '@public/liquid-staked-charisma.png'
import welshImg from '@public/welsh-logo.png'
import chaIcon from '@public/charisma.png'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@components/ui/dialog';
import { AlertDialogHeader } from '@components/ui/alert-dialog';
import experienceIcon from '@public/experience.png'
import { getLand, getLands } from '@lib/db-providers/kv';
import wantedHogger from '@public/quests/wanted-hogger/hogger.png'
import hugeKnollClaw from '@public/quests/wanted-hogger/huge-knoll-claw.png'

export const getStaticProps: GetStaticProps<Props> = async () => {
  // get all lands from db
  const landContractAddresses = await getLands()

  const lands = []
  for (const ca of landContractAddresses) {
    const metadata = await getLand(ca)
    lands.push(metadata)
  }

  return {
    props: {
      lands
    },
    revalidate: 60000
  };
};

type Props = {
  lands: any[];
};

export default function WantedHogger({ lands }: Props) {
  const meta = {
    title: `Charisma | WANTED: "Hogger"`,
    description: META_DESCRIPTION,
    image: '/quests/wanted-hogger/hogger.png'
  };

  const title = `WANTED: "Hogger"`;
  const subtitle = 'Slay the huge gnoll Hogger.';


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
                    {/* <div className="relative">
                      <Image
                        alt="Huge Knoll Claw"
                        src={hugeKnollClaw}
                        quality={10}
                        className="z-30 w-full rounded-md border shadow-lg"
                      />
                      <div className="absolute px-1 font-bold rounded-full -top-1 -right-3 text-md md:text-base lg:text-sm bg-accent text-accent-foreground">
                        NFT
                      </div>
                    </div> */}
                    <div className="relative">
                      <Image
                        alt="Charisma"
                        src={chaIcon}
                        quality={10}
                        className="z-30 w-full rounded-md border shadow-lg"
                      />
                      <div className="absolute px-1 font-bold rounded-full -top-1 -right-3 text-md md:text-base lg:text-xs bg-accent text-accent-foreground">
                        1000
                      </div>
                    </div>
                    <div className="relative">
                      <Image
                        alt="Experience"
                        src={experience}
                        quality={10}
                        className="z-30 w-full rounded-full border shadow-lg"
                      />
                      <div className="absolute px-1 font-bold rounded-full -top-1 -right-3 text-md md:text-base lg:text-xs bg-accent text-accent-foreground">
                        1000
                      </div>
                    </div>
                  </div>
                </div>
                <div className="z-20 row-span-2">
                  <div className="z-30 text-xl font-semibold">Quest Details</div>
                  <div className="z-30 mb-4 text-sm font-fine text-foreground">
                    Hogger is an on-chain monster terrorizing the Stacks ecosystem. Attacking him deals damage based on your energy spent and experience level. You must have at least 0.1% of the total supply of EXP for your attacks to deal any damage.
                  </div>
                  <div className="z-30 mb-4 text-sm font-fine text-foreground">
                    Hogger regenerates health over time, respawns each 14 blocks if slain, and returns with more health and faster regeneration each time.
                  </div>
                  <div className="z-30 mb-4 text-sm font-fine text-foreground">
                    If Hogger is defeated, all participants receive rewards: equal experience points and proportional CHA tokens based on damage dealt.
                  </div>
                </div>
                <div className="z-20 mt-4">
                  <div className="z-30 text-xl font-semibold">Requirements</div>
                  <div className="z-30 mb-4 text-sm font-fine text-foreground">
                    Burn 1 sCHA to complete:
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="relative">
                      <Image
                        alt="protocol-fee-token-image"
                        src={schaImg}
                        quality={10}
                        className="z-30 w-full rounded-full border shadow-lg"
                      />
                      <div className="absolute px-1 font-bold rounded-full -top-1 -right-3 text-md md:text-base lg:text-sm bg-accent text-accent-foreground min-w-6 text-center">
                        1
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </CardContent>

            <CardFooter className="z-20 flex justify-between p-4 items-end">

              <Link href="/crafting">
                <Button variant="ghost" className="z-30">
                  Back
                </Button>
              </Link>

              <SelectCreatureDialog lands={lands} />
            </CardFooter>
            <Image
              src={wantedHogger}
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

  const { doContractCall } = useConnect();

  const sender = userSession.isUserSignedIn() && userSession.loadUserData().profile.stxAddress.mainnet

  function journey(creatureId: number) {
    // const response = await callReadOnlyFunction({
    //   network: new StacksMainnet(),
    //   contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
    //   contractName: 'journey-of-discovery-v2',
    //   functionName: "get-claimable-amount",
    //   functionArgs: [uintCV(creatureId)],
    //   senderAddress: sender
    // })
    // const claimableTokens = Number(cvToJSON(response).value)

    const burnTokenContract = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-charisma'
    const burnTokenAsset = 'liquid-staked-token'

    doContractCall({
      network: new StacksMainnet(),
      anchorMode: AnchorMode.Any,
      contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
      contractName: 'adventure-v0',
      functionName: "tap",
      functionArgs: [uintCV(creatureId), principalCV('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.land-helper-v0')],
      postConditionMode: PostConditionMode.Deny,
      postConditions: [Pc.principal(sender).willSendEq(1000000).ft(burnTokenContract, burnTokenAsset)],
      onFinish: (data) => {
        console.log("onFinish:", data);
      },
      onCancel: () => {
        console.log("onCancel:", "Transaction was canceled");
      },
    });
  }


  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button disabled size={'sm'} className={`z-30`}>Fight Hogger</Button>
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