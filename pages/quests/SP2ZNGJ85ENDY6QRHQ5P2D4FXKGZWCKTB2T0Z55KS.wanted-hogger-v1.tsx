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
import { GetStaticProps } from 'next';
import { useState } from 'react';
import { cn } from '@lib/utils';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import experience from '@public/experience.png'
import { useAccount, useOpenContractCall } from '@micro-stacks/react';
import schaImg from '@public/liquid-staked-charisma.png'
import chaIcon from '@public/charisma.png'
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@components/ui/dialog';
import { AlertDialogHeader } from '@components/ui/alert-dialog';
import { getLand, getLands, getMob } from '@lib/db-providers/kv';
import wantedHogger from '@public/quests/wanted-hogger/hogger.png'
import hoggerIcon from '@public/quests/wanted-hogger/hogger-icon.png'
import { HealthBar } from '@components/ui/health-bar';
import eliteFrame from '@public/quests/wanted-hogger/elite.webp'
import { uintCV, contractPrincipalCV } from 'micro-stacks/clarity';
import { makeStandardFungiblePostCondition, FungibleConditionCode } from '@stacks/transactions';
import { useSearchParams } from 'next/navigation';
import { useNavigation } from 'react-day-picker';
import { useRouter } from 'next/router';

export const getStaticProps: GetStaticProps<Props> = async () => {
  // get all lands from db
  const landContractAddresses = await getLands()
  const mob = await getMob('hogger')

  const lands = []
  for (const ca of landContractAddresses) {
    const metadata = await getLand(ca)
    lands.push(metadata)
  }

  return {
    props: {
      lands,
      mob
    },
    revalidate: 60
  };
};

type Props = {
  lands: any[];
  mob: any
};

export default function WantedHogger({ lands, mob }: Props) {
  const meta = {
    title: `Charisma | WANTED: "Hogger"`,
    description: META_DESCRIPTION,
    image: '/quests/wanted-hogger/hogger.png'
  };

  const title = `WANTED: "Hogger"`;
  const subtitle = 'Slay the huge gnoll Hogger.';

  const healthPercentage = mob.health * 100 / mob.maxHealth

  const router = useRouter();
  const { get } = useSearchParams()

  const handleViewToggle = () => {
    const newView = get('view') === 'quest' ? 'mob' : 'quest';
    router.push(`?view=${newView}`, undefined, { shallow: true });
  }


  const fadeVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };

  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeVariants}
          className="m-2 sm:container sm:mx-auto sm:py-10 md:max-w-2xl"
        >
          <AnimatePresence mode="wait">
            {get('view') === 'quest' ? (
              <motion.div
                key="original-card"
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={fadeVariants}
                transition={{ duration: 0.5 }}
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
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
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
                            <div className="absolute px-1 font-bold rounded-full -top-1 -right-3 text-sm md:text-base lg:text-xs bg-accent text-accent-foreground">
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
                            <div className="absolute px-1 font-bold rounded-full -top-1 -right-3 text-sm md:text-base lg:text-xs bg-accent text-accent-foreground">
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
                          Hogger is tough, and regenerates health over time. If slain, he'll respawn within 14 blocks with greater health and even faster regeneration.
                        </div>
                        <div className="z-30 mb-4 text-sm font-fine text-foreground">
                          If defeated, everyone who contributed to the battle receives a share of the rewards. Experience is divide up evenly, and CHA tokens are split based on damage dealt to Hogger.
                        </div>
                      </div>
                      <div className="z-20 mt-4">
                        <div className="z-30 text-xl font-semibold">Requirements</div>
                        <div className="z-30 mb-4 text-sm font-fine text-foreground">
                          Burns 1 sCHA per attack
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                          <div className="relative">
                            <Image
                              alt="protocol-fee-token-image"
                              src={schaImg}
                              quality={10}
                              className="z-30 w-full rounded-full border shadow-lg"
                            />
                            <div className="absolute px-1 font-bold rounded-full -top-1 -right-3 text-sm md:text-base lg:text-sm bg-accent text-accent-foreground min-w-6 text-center">
                              1
                            </div>
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

                    <Button size={'sm'} className="z-30" onClick={() => handleViewToggle()}> Fight Hogger</Button>
                    {/* <SelectCreatureDialog lands={lands} /> */}
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
              </motion.div>) : (
              <motion.div
                key="hogger-card"
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={fadeVariants}
                transition={{ duration: 0.5 }}
              >
                <Card className="min-h-[900px] flex flex-col bg-black text-primary-foreground border-accent-foreground p-0 relative overflow-hidden rounded-md group/card w-full max-w-2xl opacity-[0.99] shadow-black shadow-2xl">
                  <CardHeader className="z-20 p-4 space-y-0 relative">
                    <Image
                      alt="Elite Monster"
                      src={eliteFrame}

                      className="z-30 h-36 w-36 absolute top-0 left-2 transform scale-x-[-1]"
                    />
                    <Image
                      alt="Hogger Icon"
                      src={hoggerIcon}

                      className="z-10 h-[4.5rem] w-[4.5rem] absolute top-[32px] left-[60px] transform scale-x-[-1] rounded-full"
                    />
                    <div className="z-20 top-[80px] left-[60px] absolute px-1 font-semibold text-center min-w-6 rounded-full text-md md:text-base lg:text-sm bg-transparent text-primary-foreground backdrop-blur-[4px]" >
                      {mob.level}
                    </div>
                    <CardTitle className="z-30 text-xl text-primary-foreground/90 font-semibold text-center pt-[1.4rem] leading-none">Hogger</CardTitle>
                    <CardDescription className="z-30 text-md font-light text-center text-muted/70 pb-4">
                      Chieftain of the Riverpaw gnolls
                    </CardDescription>
                    <HealthBar className='absolute rounded-md h-[3.2rem] w-96 top-[2.4rem] left-[8.2rem]' value={healthPercentage} />
                  </CardHeader>
                  <CardContent className="z-20 flex-grow p-4 space-y-4">
                    {/* Add content for the Hogger fight card */}
                    {/* <p>Hogger is ready to battle. Choose your strategy wisely!</p> */}
                  </CardContent>
                  {/* <CardFooter className="z-20 flex justify-between p-4 items-end">
                    <Button variant="ghost" className="z-30" onClick={() => setShowHoggerCard(false)}>
                      Back
                    </Button>
                    <Button size={'sm'} className="z-30">
                      Attack
                    </Button>
                  </CardFooter> */}

                  <CardFooter className="z-20 flex justify-between p-4 items-end">

                    <Button variant="ghost" size={'lg'} onClick={() => handleViewToggle()} className="z-30">
                      Back
                    </Button>

                    <SelectCreatureDialog lands={lands} />
                  </CardFooter>
                  <Image
                    src={wantedHogger}
                    width={800}
                    height={1600}
                    alt={'quest-background-image'}
                    className={cn(
                      'object-cover',
                      'opacity-50',
                      'aspect-[1/2]',
                      'sm:aspect-[2/3]',
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
            )}
          </AnimatePresence>
        </motion.div>
      </Layout>
    </Page>
  );
}

export function SelectCreatureDialog({ lands }: any) {

  const { openContractCall } = useOpenContractCall();
  const { stxAddress } = useAccount()


  function fight(creatureId: number) {

    const burnTokenContract = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-charisma::liquid-staked-token'

    const postConditions = [
      makeStandardFungiblePostCondition(stxAddress!, FungibleConditionCode.Equal, '1000000', burnTokenContract),
    ];

    openContractCall({
      contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
      contractName: 'wanted-hogger-v1',
      functionName: "tap",
      functionArgs: [uintCV(creatureId), contractPrincipalCV('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS', 'land-helper-v0')],
      postConditions: postConditions as any[]
    });
  }


  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size={'lg'} className={`z-30`}>Attack</Button>
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
                onClick={() => fight(land.id)}
                className={`z-30 border rounded-full h-32 w-32 ${land.whitelisted && 'hover:scale-110 transition-all cursor-pointer'}`}
              />
            </div>
          ))}
        </DialogDescription>
      </DialogContent>
    </Dialog >
  )
}