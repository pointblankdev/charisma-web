import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import Layout from '@components/layout/layout';
import { GetStaticProps } from 'next';
import { getNftCollectionMetadata, getNftCollections, getNftMetadata, getQuest, getQuests } from '@lib/db-providers/kv';
import Image from 'next/image';
import energyIcon from '@public/creatures/img/energy.png';
import Link from 'next/link';
import { Button } from '@components/ui/button';
import { Card, CardContent, CardHeader } from '@components/ui/card';
import { cn } from '@lib/utils';
import journeyOfDiscovery from '@public/quests/journey-of-discovery.png'
import hugeKnollClaw from '@public/quests/wanted-hogger/hogger-icon.png'
import spellScrollIcon from '@public/quests/spell-scroll/spell-scroll-icon.png'
import spellScrollCard from '@public/quests/spell-scroll/spell-scroll-card.png'
import wantedPoster from '@public/quests/wanted-hogger/wanted-poster-2.png'
import kingOfTheHillIcon from '@public/quests/king-of-the-hill/king-of-the-hill-icon.png'
import kingOfTheHillCard from '@public/quests/king-of-the-hill/king-of-the-hill-card.png'
import mooningSharkIcon from '@public/quests/mooning-shark/mooningshark-icon.jpeg'
import mooningSharkCard from '@public/quests/mooning-shark/mooning-shark-card.png'
import krakenLottoIcon from '@public/quests/raven-raffle/ticket.png'
import krakenLottoCard from '@public/quests/raven-raffle/kraken-lotto.png'
import pixelRozar from '@public/quests/pixel-rozar/pixel-rozar.png'
import abundantOrchard from '@public/quests/abundant-orchard/apple-orchard.png'
import farmersIcon from '@public/creatures/img/farmers.png'
import memobotsCard from '@public/quests/memobots/card-bg2.gif'
import hiddenMemobot from '@public/quests/memobots/hidden-memobot.png'

export const getStaticProps: GetStaticProps<Props> = async () => {
  // get all quests from db
  const questContractAddresses = await getQuests()
  const utilityNftQuestContractAddresses = await getNftCollections()

  const featured = [

  ]

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
      ca: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wanted-hogger-v2?view=quest",
      image: hugeKnollClaw,
      cardImage: wantedPoster,
    },
    {
      name: `Harvest the Apple Farm`,
      description: "Put staked tokens to work harvesting apples.",
      ca: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.apple-farm-v2",
      image: farmersIcon,
      cardImage: abundantOrchard,
    },
    {
      name: `MemoBots`,
      description: "Guardians of the Gigaverse",
      ca: "SP3TMGZ7WTT658PA632A3BA4B1GRXBNNEN8XPZQ5X.memobots-guardians-of-the-gigaverse",
      image: hiddenMemobot,
      cardImage: memobotsCard,
      featured: true,
    },
    {
      name: `President Tremp: 2024`,
      description: "Predict if Trump will win the election.",
      ca: "SP3TMGZ7WTT658PA632A3BA4B1GRXBNNEN8XPZQ5X.tremp-election-2024",
      image: 'https://mlw1rgyfhipx.i.optimole.com/w:auto/h:auto/q:75/ig:avif/https://trempstx.com/wp-content/uploads/2024/07/IMG_20240729_233240_884.jpg',
      cardImage: 'https://i.postimg.cc/pdr6wHmf/D92-DA6-B6-F80-E-49-EC-8851-515079-C9-B10-C.avif',
    },
    {
      name: `Mint a Spell Scroll`,
      description: "Scrolls grant their holder a special ability.",
      ca: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.spell-scrolls-fire-bolt",
      image: spellScrollIcon,
      cardImage: spellScrollCard,
    },
    {
      name: `Mint a Mooning Shark`,
      description: "Claim your OG Mooning Shark NFT with energy.",
      ca: "SP1KMAA7TPZ5AZZ4W67X74MJNFKMN576604CWNBQS.mooning-sharks",
      image: mooningSharkIcon,
      cardImage: mooningSharkCard,
    },
    {
      name: `Mint a Kraken Lottery Ticket`,
      description: "Mint lottery tickets for your chance to win.",
      ca: "SPGYCP878RYFVT03ZT8TWGPKNYTSQB1578VVXHGE.kraqen-lotto",
      image: krakenLottoIcon,
      cardImage: krakenLottoCard,
    },
    {
      name: `Mint a Pixel Rozar`,
      description: "Collect a bunch of completely useless stickers.",
      ca: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.pixel-rozar",
      image: pixelRozar,
      cardImage: 'https://media.tenor.com/qwMy5HS9LIYAAAAM/funny-corgi-lol-moment.gif',
    },
    {
      name: `King of the Hill`,
      description: "Team up with your community to claim the hill.",
      ca: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.king-of-the-hill-v0?view=quest",
      image: kingOfTheHillIcon,
      cardImage: kingOfTheHillCard,
    }
  ]

  for (const ca of questContractAddresses) {
    const metadata = await getQuest(ca)
    quests.push(metadata)
  }

  for (const ca of utilityNftQuestContractAddresses) {
    const metadata = await getNftCollectionMetadata(ca)
    const item = await getNftMetadata(ca, "1")
    quests.push({
      name: metadata.name,
      description: metadata.description.description,
      ca: ca,
      image: item.image,
      cardImage: metadata.properties.collection_image,
    })
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
            <Link passHref href={'/quest-deployer'}>
              <Button className='h-full'><div className='flex flex-col leading-tight'><div>Create Your Own Quest</div><div className='text-primary-foreground text-xs font-semibold'>and Earn Royalities</div></div></Button>
            </Link>
          </div>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <Card
              className={cn(
                'bg-black text-primary-foreground border-accent-foreground p-0 flex relative overflow-hidden rounded-md group/card'
              )}
            >
              <div className="relative flex flex-col items-start text-md p-4 space-y-4 rounded-lg justify-between">
                <div className="space-y-4 text-sm leading-normal">
                  <h3 className="font-bold text-lg">How to Claim Rewards</h3>
                  <p>
                    Complete quests in the Charisma ecosystem to earn rewards. Here's a quick guide:
                  </p>
                  <ol className="list-decimal list-inside space-y-2">
                    <li>
                      <strong>Browse Quests:</strong> Explore available quests and their rewards.
                    </li>
                    <li>
                      <strong>View Details:</strong> Click on a quest card to see requirements and rewards.
                    </li>
                    <li>
                      <strong>Check Energy:</strong> Ensure you have enough staking-generated energy to complete the quest.
                    </li>
                    <li>
                      <strong>Start & Complete:</strong> Initiate the quest and follow the instructions to finish it.
                    </li>
                    <li>
                      <strong>Receive Rewards:</strong> Rewards are automatically sent to your wallet or inventory upon completion.
                    </li>
                  </ol>
                  <p>
                    Note: Some quests may have cooldown periods. Participate often to maximize your rewards and progress in the Charisma ecosystem.
                  </p>
                </div>
              </div>
            </Card>
            {quests.filter(q => q.featured).map((quest: any, i: number) => {
              return (
                <Card
                  key={i}
                  className={cn(
                    'bg-black sm:col-span-3 text-primary-foreground border-accent-foreground p-0 flex relative overflow-hidden rounded-md group/card'
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
                          'sm:aspect-[2/1]',
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
            {quests.filter(q => !q.featured).map((quest: any, i: number) => {
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
