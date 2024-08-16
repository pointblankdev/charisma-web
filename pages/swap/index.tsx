import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import Layout from '@components/layout/layout';
import { GetStaticProps } from 'next';
import { getToken, getTokens } from '@lib/db-providers/kv';
import Image from 'next/image';
import energyIcon from '@public/creatures/img/energy.png';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@components/ui/card';
import { cn } from '@lib/utils';
import charismaCard from '@public/liquid-charisma-21.png'

export const getStaticProps: GetStaticProps<Props> = () => {
  // get all quests from db
  // const tokenContractAddresses = getTokens()

  const tokens = [
    {
      name: "Liquid Staked Charisma",
      description: "The rebase token of Charisma",
      ca: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-charisma",
      image: "/liquid-staked-charisma.png",
      cardImage: charismaCard,
      ticker: 'sCHA'
    }
  ]

  // for (const ca of tokenContractAddresses) {
  //   const metadata = getToken(ca)
  //   tokens.push(metadata)
  // }

  return {
    props: {
      tokens
    },
    revalidate: 60000
  };
};

type Props = {
  tokens: any[];
};


export default function SwapIndex({ tokens }: Props) {
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
              <h2 className="flex items-end text-4xl font-semibold tracking-tight text-secondary">Tokens</h2>
              <p className="flex items-center text-base text-muted-foreground">
                Swap, stake, and wrap tokens right here on Charisma.
              </p>
            </div>
            {/* <Link passHref href={'/quest-deployer'}>
              <Button className='bg-primary-foreground/5'>Create New Quest</Button>
            </Link> */}
          </div>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {/* <Card
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
            </Card> */}
            {tokens.map((token: any, i: number) => {
              return (
                <div
                  key={i}
                  className={cn(
                    'bg-black text-primary-foreground border-accent-foreground p-0 flex relative overflow-hidden rounded-md group/card border bg-accent-foreground'
                  )}
                >
                  <Link href={`/swap/${token.ca}`} className="w-full">
                    <div className="w-full p-0">
                      <div className="z-20 p-2 h-min backdrop-blur-sm group-hover/card:backdrop-blur-3xl">
                        <div className="flex justify-between align-top">
                          <div className="flex gap-2">
                            <div className="min-w-max">
                              {token.image ? (
                                <Image
                                  src={token.image}
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
                              <div className="leading-none text-secondary">
                                {token.name}
                              </div>
                              <div className="mt-1 text-xs leading-tight font-fine text-muted-foreground">
                                {token.description}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end leading-[1.1]">
                            <div className="text-primary-foreground/80 text-sm">{token.ticker}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>

                </div>
              );
            })}

          </div>
        </div>
      </Layout>
    </Page>
  );
}
