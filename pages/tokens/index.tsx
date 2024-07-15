
import { GetStaticProps } from 'next';
import { SkipNavContent } from '@reach/skip-nav';

import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import Layout from '@components/layout';
import { cn } from '@lib/utils';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@components/ui/card"
import Link from 'next/link';
import { useState } from 'react';
import wishingWell from '@public/wishing-well-1.png'
import kangarooBurrow from '@public/kangaroo-borrow-1.png'
import uppsala from '@public/uppsala-21.png'
import titleFight from '@public/wooo-title-belt-nft.gif'
import woo from '@public/woo-icon.png'
import fenrir from '@public/fenrir-icon-2.png'
import odinsRaven from '@public/odins-raven/img/4.gif'
import { StaticImport } from 'next/dist/shared/lib/get-img-props';
import { UrlObject } from 'url';
import { useRouter } from 'next/navigation';
import featherFallFund from '@public/feather-fall-fund-logo.png'
import liquidStakedWelsh from '@public/liquid-staked-welshcorgicoin.png';
import liquidStakedRoo from '@public/liquid-staked-roo.png';
import liquidStakedOdin from '@public/liquid-staked-odin.png';
import { getDeployedIndexes, getTokenURI } from '@lib/stacks-api';
import { uniq, uniqBy } from 'lodash';
import { Checkbox } from '@components/ui/checkbox';



export const getStaticProps: GetStaticProps<Props> = async () => {

  const pools = [
    {
      guild: {
        logo: {
          url: '/liquid-staked-charisma.png'
        }
      },
      title: 'Charisma',
      subtitle: 'Liquid Staked Charisma',
      cardImage: {
        url: '/liquid-charisma-21.png'
      },
      slug: 'stake/SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-charisma',
      wip: false,
      apps: [
        { slug: '/crafting/SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.feather-fall-fund-v1', img: featherFallFund },
        { slug: '/crafting/SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charismatic-corgi', img: '/indexes/charismatic-corgi-logo.png' },
      ],
      lowTVL: false,
    },
    {
      guild: {
        logo: {
          url: '/liquid-staked-welshcorgicoin.png'
        }
      },
      title: 'Welshcorgicoin',
      subtitle: 'Liquid Staked Welsh',
      cardImage: {
        url: '/liquid-welsh-21.png'
      },
      slug: 'stake/SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-welsh-v2',
      wip: false,
      rewardCharisma: 100,
      rewardSTX: 100,
      apps: [
        { slug: '/wishing-well', img: wishingWell },
        { slug: '/crafting/woo', img: woo },
        // { slug: '/apps/title-fight', img: titleFight },
        { slug: '/crafting/fenrir', img: fenrir }
      ],
      lowTVL: false,
    },
    {
      guild: {
        logo: {
          url: '/liquid-staked-odin.png'
        }
      },
      title: 'Odin, God of Bitcoin',
      subtitle: 'Liquid Staked Odin',
      cardImage: {
        url: '/liquid-odin-21.png'
      },
      slug: 'stake/SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-odin',
      wip: false,
      lowTVL: false,
      apps: [
        { slug: '/apps/uppsala', img: uppsala },
        { slug: '/crafting/fenrir', img: fenrir },
        { slug: '/apps/odins-raven', img: odinsRaven }
      ]
    },
    {
      guild: {
        logo: {
          url: '/liquid-staked-roo.png'
        }
      },
      title: 'Roo the Kangaroo',
      subtitle: 'Liquid Staked Roo',
      cardImage: {
        url: '/liquid-roo-21.png'
      },
      slug: 'stake/SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-roo-v2',
      wip: false,
      lowTVL: false,
      apps: [
        { slug: '/kangaroo-burrow', img: kangarooBurrow },
        { slug: '/crafting/woo', img: woo },
        // { slug: '/apps/title-fight', img: titleFight },
      ]
    },
    {
      guild: {
        logo: {
          url: '/liquid-staked-leo.png'
        }
      },
      title: 'Leopold the Cat',
      subtitle: 'Liquid Staked Leo',
      cardImage: {
        url: '/liquid-leo-21.png'
      },
      slug: 'stake/SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-leo',
      wip: false,
      lowTVL: true,
    },
    {
      guild: {
        logo: {
          url: '/not-logo.png'
        }
      },
      title: 'Nothing',
      subtitle: 'Liquid Staked Nothing',
      cardImage: {
        url: '/liquid-nothing-21.png'
      },
      slug: 'stake/SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-not',
      wip: false,
      lowTVL: true,
    },
    {
      guild: {
        logo: {
          url: '/pepe-logo.png'
        }
      },
      title: 'Pepe the Frog',
      subtitle: 'Liquid Staked Pepe',
      cardImage: {
        url: '/liquid-pepe-21.png'
      },
      slug: 'stake/SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-pepe',
      wip: false,
      lowTVL: true,
    },
    {
      guild: {
        logo: {
          url: '/LONGcoin.png'
        }
      },
      title: 'Long the Dragon',
      subtitle: 'Liquid Staked Long',
      cardImage: {
        url: '/liquid-long-21.png'
      },
      slug: 'stake/SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-long',
      wip: false,
      lowTVL: true,
    },
    {
      guild: {
        logo: {
          url: '/GUS_Logo.svg'
        }
      },
      title: 'Gus the Black Lab',
      subtitle: 'Liquid Staked Gus',
      cardImage: {
        url: '/liquid-gus-21.png'
      },
      slug: 'stake/SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-gus',
      wip: false,
      lowTVL: true
    },
    {
      guild: {
        logo: {
          url: '/play_logo.png'
        }
      },
      title: 'Pete the Penguin',
      subtitle: 'Liquid Staked Play',
      cardImage: {
        url: '/liquid-play-21.png'
      },
      slug: 'stake/SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-play',
      wip: false,
      lowTVL: true
    },
    {
      guild: {
        logo: {
          url: '/babywelsh-logo.jpeg'
        }
      },
      title: 'Baby Welshcorgicoin',
      subtitle: 'Liquid Staked Baby Welsh',
      cardImage: {
        url: '/liquid-babywelsh-21.png'
      },
      slug: 'stake/SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-babywelsh',
      wip: false,
      lowTVL: true
    },
    {
      guild: {
        logo: {
          url: '/MAX_logo.svg'
        }
      },
      title: 'Max the Duck',
      subtitle: 'Liquid Staked Max',
      cardImage: {
        url: '/liquid-max-21.png'
      },
      slug: 'stake/SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-max',
      wip: false,
      lowTVL: true
    },
    {
      guild: {
        logo: {
          url: '/dogwifhat.svg'
        }
      },
      title: 'Dogwifhat',
      subtitle: 'Liquid Staked Wif',
      cardImage: {
        url: '/liquid-wif-21.png'
      },
      slug: 'stake/SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-wif',
      wip: false,
      lowTVL: true
    },
    {
      guild: {
        logo: {
          url: '/memegoat-logo.png'
        }
      },
      title: 'Meme Goat',
      subtitle: 'Liquid Staked Goat',
      cardImage: {
        url: '/liquid-goat-21.png'
      },
      slug: 'stake/SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-goat',
      wip: false,
      lowTVL: true
    },
    {
      guild: {
        logo: {
          url: '/pomboo-logo.jpeg'
        }
      },
      title: 'Pomboo the Pomeranian',
      subtitle: 'Liquid Staked Pomboo',
      cardImage: {
        url: '/liquid-pomboo-12.png'
      },
      slug: 'stake/SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-boo',
      wip: false,
      lowTVL: true
    },
    {
      guild: {
        logo: {
          url: '/hashiko-logo.png'
        }
      },
      title: 'Hashiko the Husky',
      subtitle: 'Liquid Staked Hashiko',
      cardImage: {
        url: '/liquid-hashiko-21.png'
      },
      slug: 'stake/SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-hashiko',
      wip: false,
      lowTVL: true
    }
  ]

  const contracts = await getDeployedIndexes();

  // blacklist ones that are not active
  const blacklist = ['SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.feather-fall-fund'];
  const enabledContracts = uniq(contracts).filter((contract: any) => !blacklist.includes(contract));

  // lookup metadata for each contract
  const tokenMetadataPromises = enabledContracts.map(async (contract: any) => {
    const tokenMetadata = await getTokenURI(contract);
    const unqiueTokens = uniqBy(tokenMetadata.contains, 'address');
    const baseTokens = await Promise.all(
      unqiueTokens.map(async (token: any) => {
        const baseTokenMetadata = await getTokenURI(token.address);
        return baseTokenMetadata;
      })
    );
    tokenMetadata.tokens = baseTokens;
    return tokenMetadata;
  });

  const tokenMetadata = await Promise.all(tokenMetadataPromises);

  const apps = [
    {
      guild: {
        logo: {
          url: '/woo-icon.png'
        }
      },
      title: `Roo Flair's Bizarre Adventure`,
      ticker: 'WOO',
      subtitle: 'sWELSH and sROO at a fixed 25:1 ratio',
      cardImage: {
        url: '/woo-1.png'
      },
      slug: '/crafting/woo',
      inactive: true,
      apps: [
        { slug: '/stake/welsh', img: liquidStakedWelsh },
        { slug: '/stake/roo', img: liquidStakedRoo }
      ]
    },
    {
      guild: {
        logo: {
          url: '/fenrir-icon-2.png'
        }
      },
      title: 'Fenrir, Corgi of Ragnarok',
      ticker: 'FENRIR',
      subtitle: 'sWELSH and sODIN at a fixed 1:10 ratio',
      cardImage: {
        url: '/fenrir-21.png'
      },
      slug: '/crafting/fenrir',
      inactive: true,
      apps: [
        { slug: '/stake/welsh', img: liquidStakedWelsh },
        { slug: '/stake/odin', img: liquidStakedOdin }
      ]
    },
    {
      guild: {
        logo: {
          url: '/woooooo.webp'
        }
      },
      title: 'Wooo! (Deprecated)',
      ticker: 'WOOO',
      subtitle: 'sWELSH + sROO = WOOO',
      cardImage: {
        url: '/wooo-title-belt.gif'
      },
      slug: '/crafting/wooo',
      inactive: true,
      apps: [
        { slug: '/stake/welsh', img: liquidStakedWelsh },
        { slug: '/stake/roo', img: liquidStakedRoo }
      ]
    }
  ];

  const modifiedApps = tokenMetadata.map((metadata: any, k: number) => {
    return {
      guild: {
        logo: {
          url: metadata.image
        }
      },
      title: metadata.name,
      ticker: metadata.symbol,
      subtitle: metadata.description,
      cardImage: {
        url: metadata.background || '/liquid-charisma.png'
      },
      slug: `/crafting/${enabledContracts[k]}`,
      inactive: false,
      apps: metadata.tokens.map((token: any) => {
        return {
          img: token.image
        };
      })
    };
  });

  const finalApps = [...apps, ...modifiedApps];

  return {
    props: {
      pools,
      indexes: finalApps
    },
    // revalidate: 60
  };
};

type Props = {
  pools: any[];
  indexes: any[];
};

export default function Tokens({ pools, indexes }: Props) {

  const meta = {
    title: 'Charisma | Tokens',
    description: META_DESCRIPTION,
    image: '/liquid-welsh.png'
  };

  // checkbox to enable/disable inactive pools
  const [showInactive, setShowInactive] = useState(false);
  const [showLowTVL, setShowLowTVL] = useState(false);

  const activeIndexes = showInactive ? indexes : indexes.filter(index => !index.inactive);
  const activePools = showLowTVL ? pools : pools.filter(index => !index.lowTVL);

  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <div className="sm:container sm:mx-auto sm:py-10 space-y-6 m-2">
          <div className="space-y-1">
            <h2 className="text-4xl font-semibold tracking-tight text-secondary">Liquid Staking Pools</h2>
            <p className="text-muted-foreground text-base">
              Stake your tokens to earn rewards and participate in the Charisma ecosystem.
            </p>
            <label className="flex items-center gap-2">
              <span>Show Low-TVL Pools</span>
              <Checkbox
                className="mt-0.5"
                checked={showLowTVL}
                onCheckedChange={() => setShowLowTVL(!showLowTVL)}
              />
            </label>
          </div>
          <div className='grid gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {activePools.map((pool) => {
              return (
                <Card key={pool.id} className={cn('bg-black text-primary-foreground border-accent-foreground p-0 flex relative overflow-hidden rounded-md group/card', pool.wip && 'opacity-25 hover:opacity-60')}>
                  <Link href={`${pool.slug}`} className='w-full'>
                    <CardContent className='w-full p-0'>
                      <CardHeader className="absolute inset-0 z-20 p-2 h-min backdrop-blur-sm group-hover/card:backdrop-blur-3xl">
                        <div className='flex gap-2'>
                          <div className='min-w-max'>
                            {pool.guild.logo.url ?
                              <Image src={pool.guild.logo.url} width={40} height={40} alt='guild-logo' className='w-10 h-10 border rounded-full grow' />
                              : <div className='w-10 h-10 bg-white border rounded-full' />
                            }
                          </div>
                          <div className=''>
                            <div className='text-sm font-semibold leading-none text-secondary'>
                              {pool.title}
                            </div>
                            <div className='mt-1 text-xs leading-tight font-fine text-secondary'>
                              {pool.subtitle}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <Image
                        src={pool.cardImage.url}
                        height={1200}
                        width={600}
                        alt='pool-featured-image'
                        className={cn("w-full object-cover transition-all group-hover/card:scale-105", "aspect-[1/2]", 'opacity-80', 'group-hover/card:opacity-100', 'flex', 'z-10', 'relative')}
                      />
                      <div className='absolute inset-0 z-0 bg-gradient-to-b from-white/50 to-transparent opacity-30' />
                      <div className='absolute inset-0 bg-gradient-to-b from-transparent from-0% to-black/50 to-69% opacity-90 z-20' />
                    </CardContent>
                  </Link>
                  <CardFooter className={cn('z-20 absolute inset-0 top-auto flex p-0 mb-1 opacity-100 transition-all')}>
                    {/* <div className='z-20 p-2'>
                      <CardTitle className='z-30 mt-2 text-lg font-semibold leading-none text-white'>Staking Rewards</CardTitle>
                      {pool.apps && <CardDescription className='z-30 mb-2 text-sm text-white font-fine'>Apps and indexes that utilize this pool:</CardDescription>}
                      {pool.apps ? <div className='z-30 grid grid-cols-5 gap-2'>
                        {pool.apps.map((app: { slug: string | UrlObject; img: string | StaticImport; }, i: number) => {
                          return (
                            <div className='relative z-30 none' key={i}>
                              <Link href={app.slug}>
                                <Image src={app.img} width={40} height={40} alt='integrated apps' className='z-30 w-12 h-12 border rounded-full' />
                              </Link>
                            </div>
                          )
                        })}
                      </div> : <div className='z-30 text-sm font-fine text-white/90'>No utility has been setup for this pool yet</div>}
                    </div> */}
                  </CardFooter>
                </Card>
              )
            })}
          </div>

          <div className="space-y-1 pt-4">
            <h2 className="text-4xl font-semibold tracking-tight text-secondary">Index Tokens</h2>
            <p className="text-muted-foreground text-base">
              Mint new tokens by leveraging your liquid staked tokens.
            </p>
            <label className="flex items-center gap-2">
              <span>Show Inactive Indexes</span>
              <Checkbox
                className="mt-0.5"
                checked={showInactive}
                onCheckedChange={() => setShowInactive(!showInactive)}
              />
            </label>
          </div>

          <div className="grid gap-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            <Card
              className={cn(
                'bg-black text-primary-foreground border-accent-foreground p-0 flex relative overflow-hidden rounded-md group/card'
              )}
            >
              <div className="relative flex flex-col items-start text-md p-4 space-y-4 rounded-lg justify-between">
                <div className="space-y-4 text-sm">
                  <h3 className="font-bold text-lg">Token Indexes</h3>
                  <p>Use your funds to mint new tokens called Indexes.</p>
                  <p>
                    Indexes allow you to consolidate your tokens into a single, more valuable token,
                    similar to a stock index fund.
                  </p>
                  <p>
                    Indexes maintain a fixed ratio between their base pair tokens, ensuring you
                    never face impermanent loss.
                  </p>
                  <p>
                    The staking process for indexes is completely trustless, keeping your funds safe
                    and available for withdrawal at any time.
                  </p>
                  <p>
                    There are no fees for adding or removing liquidity from indexes. You can use
                    them as often as you like.
                  </p>
                </div>
              </div>
            </Card>
            {activeIndexes.map((pool, i) => {
              return (
                <Card
                  key={i}
                  className={cn(
                    'bg-black text-primary-foreground border-accent-foreground p-0 flex relative overflow-hidden rounded-md group/card',
                    pool.inactive && 'opacity-25 hover:opacity-60'
                  )}
                >
                  <Link href={`${pool.slug}`} className="w-full">
                    <CardContent className="w-full p-0">
                      <CardHeader className="absolute inset-0 z-20 p-2 h-min backdrop-blur-sm group-hover/card:backdrop-blur-3xl">
                        <div className="flex justify-between align-top">
                          <div className="flex gap-2">
                            <div className="min-w-max">
                              {pool.guild.logo.url ? (
                                <Image
                                  src={pool.guild.logo.url}
                                  width={40}
                                  height={40}
                                  alt="guild-logo"
                                  className="w-10 h-10 rounded-full grow"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-white border rounded-full" />
                              )}
                            </div>
                            <div className="">
                              <div className="text-sm font-semibold leading-none text-secondary">
                                {pool.title}
                              </div>
                              <div className="mt-1 text-xs leading-tight font-fine text-secondary">
                                {pool.subtitle}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end leading-[1.1]">
                            <div className="text-white text-sm font-semibold">{pool.ticker}</div>
                            {/* <div className='text-white'>${pool.value}</div> */}
                          </div>
                        </div>
                      </CardHeader>
                      <Image
                        src={pool.cardImage.url}
                        height={1200}
                        width={1200}
                        alt="pool-featured-image"
                        className={cn(
                          'w-full object-cover transition-all group-hover/card:scale-105',
                          'aspect-[1]',
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
                  <CardFooter
                    className={cn('z-20 absolute inset-0 top-auto flex p-0 mb-1 opacity-100 transition-all')}
                  >
                    <div className="z-20 p-2">
                      {/* <CardTitle className='z-30 mt-2 text-lg font-semibold leading-none text-white'>Pool Funding</CardTitle> */}
                      {/* {pool.apps && <CardDescription className='z-30 mb-2 text-sm text-white font-fine'>This app funds the following pool(s):</CardDescription>} */}
                      {pool.apps ? (
                        <div className="z-30 grid grid-cols-5 gap-2">
                          {pool.apps.map(
                            (
                              app: { slug: string | UrlObject; img: string | StaticImport },
                              i: number
                            ) => {
                              return (
                                <div className="relative z-30 none" key={i}>
                                  {/* <Link href={app.slug}> */}
                                  <Image
                                    src={app.img}
                                    width={40}
                                    height={40}
                                    alt="charisma-token"
                                    className="z-30 w-12 h-12 rounded-full"
                                  />
                                  {/* <div className='absolute px-1 font-bold rounded-full -top-1 -right-3 text-md md:text-base lg:text-xs bg-accent text-accent-foreground'>{0}</div> */}
                                  {/* </Link> */}
                                </div>
                              );
                            }
                          )}
                        </div>
                      ) : (
                        <div className="z-30 text-sm font-fine text-white/90">
                          No rewards have been set for this pool yet
                        </div>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>



        </div>



      </Layout>
    </Page>
  );
}