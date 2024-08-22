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
import { cn } from '@lib/utils';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import experienceIcon from '@public/experience.png'
import { useAccount, useOpenContractCall } from '@micro-stacks/react';
import schaImg from '@public/liquid-staked-charisma.png'
import chaIcon from '@public/charisma.png'
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@components/ui/dialog';
import { AlertDialogHeader } from '@components/ui/alert-dialog';
import { getLand, getLands, getMob } from '@lib/db-providers/kv';
import wantedHogger from '@public/quests/wanted-hogger/hogger.png'
import hoggerIcon from '@public/quests/wanted-hogger/hogger-icon.png'
import hoggerDefeated from '@public/quests/wanted-hogger/hogger-defeated-2.png'
import { HealthBar } from '@components/ui/health-bar';
import eliteFrame from '@public/quests/wanted-hogger/elite.webp'
import { uintCV, contractPrincipalCV } from 'micro-stacks/clarity';
import { makeStandardFungiblePostCondition, FungibleConditionCode } from '@stacks/transactions';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';
import wantedPoster from '@public/quests/wanted-hogger/wanted-poster-2.png'
import { GetServerSidePropsContext } from 'next';
import { getDehydratedStateFromSession } from '@components/stacks-session/session-helpers';
import { getTokenBalance } from '@lib/stacks-api';
import { useGlobalState } from '@lib/hooks/global-state-context';
import kingOfTheHillCard from '@public/quests/king-of-the-hill/king-of-the-hill-card.png'
import numeral from 'numeral';
import { useToast } from '@components/ui/use-toast';
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
  const mob = await getMob('hogger')

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
      mob,
      // burnAmount,
      // dehydratedState: await getDehydratedStateFromSession(ctx),
    },
  };
}

type Props = {
  lands: any[];
  mob: any
  // burnAmount: string
};

export default function KingOfTheHill({ lands, mob }: Props) {
  const meta = {
    title: `Charisma | King of the Hill`,
    description: META_DESCRIPTION,
    image: '/quests/king-of-the-hill/king-of-the-hill-card.png'
  };

  const title = `King of the Hill`;
  const subtitle = 'Team up with your community to claim the hill.';

  const healthPercentage = mob.health * 100 / mob.maxHealth

  const router = useRouter();
  const { get } = useSearchParams()

  const handleViewToggle = () => {
    const newView = get('view') === 'quest' ? 'mob' : 'quest';
    router.push(`?view=${newView}`, undefined, { shallow: true });
  }

  const { block } = useGlobalState()

  const fadeVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };

  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeVariants}
          className="m-2 sm:container sm:mx-auto sm:py-10 md:max-w-3xl"
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
                <Card className="min-h-[600px] flex flex-col bg-black text-primary-foreground border-accent-foreground p-0 relative overflow-hidden rounded-md group/card w-full max-w-3xl opacity-[0.99] shadow-black shadow-2xl">
                  <CardHeader className="z-20 p-4 space-y-0">
                    <div className="flex items-center justify-between">
                      <CardTitle className="z-30 text-xl font-semibold">{title}</CardTitle>
                    </div>
                    <CardDescription className="z-30 text-md font-fine text-muted-foreground">
                      {subtitle}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="z-20 flex-grow p-4 space-y-4">
                    <section className='grid grid-cols-1 sm:grid-cols-2'>
                      <div className="z-20">
                        <div className="z-30 text-xl font-semibold">Rewards</div>
                        <div className="z-30 mb-4 text-sm font-fine text-foreground">
                          1st, 2nd, and 3rd place rewards:
                        </div>
                        <div className="grid grid-cols-5 sm:grid-cols-4 gap-4">
                          <div className="relative">
                            <Image
                              alt="Charisma"
                              src={chaIcon}
                              quality={10}
                              className="z-30 w-full rounded-full border shadow-lg"
                            />
                            <div className="absolute px-1 font-bold rounded-full -top-1 -right-3 text-sm md:text-base lg:text-xs bg-accent text-accent-foreground">
                              40k
                            </div>
                          </div>
                          <div className="relative">
                            <Image
                              alt="Charisma"
                              src={chaIcon}
                              quality={10}
                              className="z-30 w-full rounded-full border shadow-lg"
                            />
                            <div className="absolute px-1 font-bold rounded-full -top-1 -right-3 text-sm md:text-base lg:text-xs bg-accent text-accent-foreground">
                              20k
                            </div>
                          </div>
                          <div className="relative">
                            <Image
                              alt="Charisma"
                              src={chaIcon}
                              quality={10}
                              className="z-30 w-full rounded-full border shadow-lg"
                            />
                            <div className="absolute px-1 font-bold rounded-full -top-1 -right-3 text-sm md:text-base lg:text-xs bg-accent text-accent-foreground">
                              10k
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="z-20 row-span-2 mt-8 sm:mt-0">
                        <div className="z-30 text-xl font-semibold">Quest Details</div>
                        <div className="z-30 mb-4 text-sm font-fine text-foreground">
                          King of the Hill is an on-chain competition where teams battle for supremacy atop the Meme Mountain. Teams accumulate points by tapping their staked token's energy and converting it into damage against rival teams. The more energy spent and the higher a player's experience, the more points their team earns.
                        </div>
                        <div className="z-30 mb-4 text-sm font-fine text-foreground">
                          The competition runs in rounds, each lasting 3000 blocks (about 20 days). There's a warmup period at the start of each round where no points can be scored. Once active, teams can attack at will until the round ends.
                        </div>
                        <div className="z-30 mb-4 text-sm font-fine text-foreground">
                          A leaderboard tracks the top three teams throughout the round. When the round concludes, the team captains of the top three teams receive CHA token rewards. The first-place team receives the largest reward, with second and third place receiving progressively smaller amounts.
                        </div>
                        <div className="z-30 mb-4 text-sm font-fine text-foreground">
                          Every attack not only earns points for your team but also grants you personal experience. Coordinate with your team, time your attacks wisely, and climb to the top of Meme Mountain to claim victory and rewards!
                        </div>
                      </div>
                      <div className="z-20 mt-4">
                        <div className="z-30 text-xl font-semibold">Requirements</div>
                        <div className="z-30 mb-4 text-sm font-fine text-foreground">
                          Burns sCHA per attack
                        </div>
                        <div className="grid grid-cols-5 sm:grid-cols-4 gap-4">
                          <div className="relative">
                            <Image
                              alt="protocol-fee-token-image"
                              src={schaImg}
                              quality={10}
                              className="z-30 w-full rounded-full border shadow-lg"
                            />
                            {/* <div className="absolute px-1 font-bold rounded-full -top-1 -right-3 text-sm md:text-base lg:text-sm bg-accent text-accent-foreground min-w-6 text-center">
                              {Number(burnAmount) >= 0.1 && Number(burnAmount).toFixed(1)}
                            </div> */}
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

                    <Button disabled={true} size={'sm'} className="z-30" onClick={() => handleViewToggle()}> Go to Meme Mountain</Button>
                  </CardFooter>
                  <Image
                    src={kingOfTheHillCard}
                    width={800}
                    height={1600}
                    alt={'quest-background-image'}
                    className={cn(
                      'object-cover',
                      'opacity-10',
                      'aspect-[1/3]',
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
              </motion.div>) : (
              <motion.div
                key="hogger-card"
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={fadeVariants}
                transition={{ duration: 0.5 }}
              >
                <Card className="sm:min-h-[900px] min-h-[720px] flex flex-col bg-black text-primary-foreground border-accent-foreground p-0 relative overflow-hidden rounded-md group/card w-full max-w-2xl opacity-[0.99] shadow-black shadow-2xl">
                  <CardHeader className="z-20 p-4 space-y-0 relative">
                    {mob.health > 0 ? <>
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
                      <div className="z-20 top-[79.2px] left-[59.8px] absolute px-1 font-semibold text-center min-w-6 rounded-full text-md md:text-base lg:text-sm bg-transparent text-primary-foreground backdrop-blur-[4px]" >
                        {mob.level}
                      </div>
                    </> : ''}
                    <CardTitle className="z-30 text-xl text-primary-foreground/90 font-semibold text-center pt-[1.4rem] leading-none">Hogger</CardTitle>
                    <CardDescription className="z-30 text-md font-light text-center text-muted/70 pb-4 grow">
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

                    {/* <TokenSelectDialog lands={lands} contractId={'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.king-of-the-hill-v0'} /> */}

                  </CardFooter>
                  <Image
                    src={mob.health > 0 ? wantedHogger : hoggerDefeated}
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
                {mob.health > 0 ? '' : <div className='-mt-1 z-0 p-3 text-sm sm:text-md font-semibold justify-center text-center text-primary-foreground/90 animate-pulse rounded-b-lg border'>
                  {/* Hogger has been defeated. He will respawn in {mob.blocksUntilRespawn} {`block${mob.blocksUntilRespawn !== 1 ? 's' : ''}`}. (~{mob.blocksUntilRespawn * 10} minutes) */}
                  Hogger has been defeated. He will respawn in {Number(mob.hoggerDefeatBlock) + 10 - block.height} blocks.
                </div>}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </Layout>
    </Page>
  );
}