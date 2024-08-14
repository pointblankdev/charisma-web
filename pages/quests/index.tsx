import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import Layout from '@components/layout';
import { GetStaticProps } from 'next';
import { getQuest, getQuests } from '@lib/db-providers/kv';
import Image from 'next/image';
import energyIcon from '@public/creatures/img/energy.png';
import Link from 'next/link';
import { Button } from '@components/ui/button';
import { Card, CardContent, CardHeader } from '@components/ui/card';
import { cn } from '@lib/utils';
import journeyOfDiscovery from '@public/quests/journey-of-discovery.png'
import wantedHogger from '@public/quests/wanted-hogger/hogger.png'
import hugeKnollClaw from '@public/quests/wanted-hogger/huge-knoll-claw.png'

export const getStaticProps: GetStaticProps<Props> = async () => {
  // get all quests from db
  const questContractAddresses = await getQuests()

  const quests = [
    {
      name: "Adventure",
      description: "Spend your energy to gain experience.",
      ca: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.adventure-v0",
      image: "/experience.png",
      cardImage: journeyOfDiscovery,
    },
    {
      name: `WANTED: "Hogger"`,
      description: "Slay the huge gnoll Hogger.",
      ca: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wanted-hogger-v1",
      image: hugeKnollClaw,
      cardImage: wantedHogger,
    }
  ]
  for (const ca of questContractAddresses) {
    const metadata = await getQuest(ca)
    quests.push(metadata)
  }

  return {
    props: {
      quests
    },
    revalidate: 60000
  };
};

type Props = {
  quests: any[];
};


export default function QuestsIndex({ quests }: Props) {
  const meta = {
    title: 'Charisma | Rewards',
    description: META_DESCRIPTION,
    // image: '/creatures/img/farmers.png'
  };


  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <div className="m-2 space-y-6 sm:container sm:mx-auto sm:py-10">
          <div className='flex justify-between'>
            <div className="space-y-1">
              <h2 className="flex items-end text-4xl font-semibold tracking-tight text-secondary"><>Quests</><Image alt='energy-icon' src={energyIcon} className='mx-2 rounded-full w-9 h-9' /></h2>
              <p className="flex items-center text-base text-muted-foreground">
                Spend your accumulated energy to complete quests and claim their token or NFT rewards.
              </p>
            </div>
            {/* <Link passHref href={'/quest-deployer'}>
              <Button className='bg-primary-foreground/5'>Create New Quest</Button>
            </Link> */}
          </div>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <Card
              className={cn(
                'bg-black text-primary-foreground border-accent-foreground p-0 flex relative overflow-hidden rounded-md group/card'
              )}
            >
              <div className="relative flex flex-col items-start text-md p-4 space-y-4 rounded-lg justify-between">
                <div className="space-y-6 text-sm">
                  <h3 className="font-bold text-lg">How to Claim Rewards</h3>
                  <p>
                    You can claim rewards by completing quests in the Charisma ecosystem.
                  </p>
                  <p>
                    To start a quest, click on the card to view more information about it's requirements, and rewards.
                  </p>
                  <p>
                    Quests require spending energy generated through staking to complete.
                  </p>
                </div>
              </div>
            </Card>
            {quests.map((quest: any, i: number) => {
              return (
                <Card
                  key={i}
                  className={cn(
                    'bg-black text-primary-foreground border-accent-foreground p-0 flex relative overflow-hidden rounded-md group/card'
                  )}
                >
                  <Link href={`/quests/${quest.ca}`} className="w-full">
                    <CardContent className="w-full p-0">
                      <CardHeader className="absolute inset-0 z-20 p-2 h-min backdrop-blur-sm group-hover/card:backdrop-blur-3xl">
                        <div className="flex justify-between align-top">
                          <div className="flex gap-2">
                            <div className="min-w-max">
                              {quest.image ? (
                                <Image
                                  src={quest.image}
                                  width={40}
                                  height={40}
                                  alt="guild-logo"
                                  className="w-10 h-10 rounded-md border grow"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-white border rounded-full" />
                              )}
                            </div>
                            <div className="">
                              <div className="text-sm font-semibold leading-none text-secondary">
                                {quest.name}
                              </div>
                              <div className="mt-1 text-xs leading-tight font-fine text-secondary">
                                {quest.description}
                              </div>
                            </div>
                          </div>
                          {/* <div className="flex flex-col items-end leading-[1.1]">
                            <div className="text-white text-sm font-semibold">{quest.ticker}</div>
                          </div> */}
                        </div>
                      </CardHeader>
                      <Image
                        src={quest.cardImage}
                        height={1200}
                        width={1200}
                        alt="quest-featured-image"
                        className={cn(
                          'w-full object-cover transition-all group-hover/card:scale-105',
                          'aspect-[2/3]',
                          'opacity-80',
                          'group-hover/card:opacity-100',
                          'flex',
                          'z-10',
                          'relative'
                        )}
                      />
                      <div className="absolute inset-0 z-0 bg-gradient-to-b from-white/50 to-transparent opacity-30" />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent from-0% to-black/50 to-69% opacity-90 z-20" />
                    </CardContent>
                  </Link>

                </Card>
              );
            })}

          </div>
        </div>
      </Layout>
    </Page>
  );
}
