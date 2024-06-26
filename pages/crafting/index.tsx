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
import { useEffect, useState } from 'react';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';
import { UrlObject } from 'url';
import liquidStakedWelsh from '@public/liquid-staked-welshcorgicoin.png'
import liquidStakedRoo from '@public/liquid-staked-roo.png'
import liquidStakedOdin from '@public/liquid-staked-odin.png'
import { getDeployedIndexes, getTokenURI } from '@lib/stacks-api';
import millify from 'millify';
import aeUSDC from '@public/aeUSDC-logo.svg'
import liquidStakedCharisma from '@public/liquid-staked-charisma.png'
import { Switch } from '@components/ui/switch';

type Props = {
  apps: any[];
};

export const getStaticProps: GetStaticProps<Props> = async () => {

  const contracts = await getDeployedIndexes();
  // blacklist ones that are not active
  const blacklist = ['SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.feather-fall-fund']
  const enabledContracts = contracts.filter((contract: any) => !blacklist.includes(contract))

  // lookup metadata for each contract
  const tokenMetadataPromises = enabledContracts.map(async (contract: any) => {
    const tokenMetadata = await getTokenURI(contract);
    const baseTokens = await Promise.all(tokenMetadata.contains.map(async (token: any) => {
      const baseTokenMetadata = await getTokenURI(token.address)
      return baseTokenMetadata;
    }));
    tokenMetadata.tokens = baseTokens;
    return tokenMetadata;
  });

  const tokenMetadata = await Promise.all(tokenMetadataPromises);



  // [
  //   {
  //     name: 'Charismatic Corgi',
  //     description: 'An index fund composed of sWELSH and sCHA at a fixed 100:1 ratio.',
  //     image: 'https://charisma.rocks/indexes/charismatic-corgi-logo.png',
  //     background: 'https://charisma.rocks/indexes/charismatic-corgi-bg.png',
  //     symbol: 'iCC',
  //     ft: 'index-token',
  //     contains: [ [Object], [Object] ]
  //   },
  //   {
  //     name: 'Feather Fall Fund',
  //     description: 'An index fund composed of aeUSDC and sCHA at a fixed 1:1 ratio.',
  //     symbol: 'FFF',
  //     ft: 'fff',
  //     image: 'https://charisma.rocks/feather-fall-fund-logo.png',
  //     contains: [ [Object], [Object] ]
  //   }
  // ]

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
        { slug: '/stake/roo', img: liquidStakedRoo },
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
        { slug: '/stake/odin', img: liquidStakedOdin },
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
        { slug: '/stake/roo', img: liquidStakedRoo },
      ]
    }
  ]

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
        }
      })
    }
  });

  const finalApps = [...apps, ...modifiedApps];

  return {
    props: {
      apps: finalApps
    },
    revalidate: 60
  };
};

export default function Crafting({ apps }: Props) {

  const meta = {
    title: 'Charisma | Indexes',
    description: META_DESCRIPTION,
    image: '/fenrir-21.png'
  };

  const [loading, setLoading] = useState(false);

  // checkbox to enable/disable inactive pools
  const [showInactive, setShowInactive] = useState(false);

  const activeApps = showInactive ? apps : apps.filter((app) => !app.inactive)

  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <div className="m-2 sm:container sm:mx-auto sm:py-10">
          <div className='grid gap-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'>
            <Card className={cn('bg-black text-primary-foreground border-accent-foreground p-0 flex relative overflow-hidden rounded-md group/card')}>
              <div className="relative flex flex-col items-start text-md p-4 space-y-4 rounded-lg justify-between">
                <div className='space-y-4'>
                  <h3 className="font-bold text-lg">Indexes</h3>
                  <p>Use your funds to mint new tokens called Indexes.</p>
                  <p>Indexes allow you to consolidate your tokens into a single, more valuable token, similar to a stock index fund.</p>
                  <p>Indexes maintain a fixed ratio between their base pair tokens, ensuring you never face impermanent loss.</p>
                  <p>The staking process for indexes is completely trustless, keeping your funds safe and available for withdrawal at any time.</p>
                  <p>There are no fees for adding or removing liquidity from indexes. You can use them as often as you like.</p>
                </div>
                <label className='flex items-center gap-2'>
                  <span>Show Inactive Indexes</span>
                  <Switch checked={showInactive} onCheckedChange={() => setShowInactive(!showInactive)} />
                </label>
              </div>
            </Card>
            {activeApps.map((pool, i) => {
              return (
                <Card key={i} className={cn('bg-black text-primary-foreground border-accent-foreground p-0 flex relative overflow-hidden rounded-md group/card', pool.inactive && 'opacity-25 hover:opacity-60')}>
                  <Link href={`${pool.slug}`} className='w-full'>
                    <CardContent className='w-full p-0'>
                      <CardHeader className="absolute inset-0 z-20 p-2 h-min backdrop-blur-sm group-hover/card:backdrop-blur-3xl">
                        <div className='flex justify-between align-top'>

                          <div className='flex gap-2'>
                            <div className='min-w-max'>
                              {pool.guild.logo.url ?
                                <Image src={pool.guild.logo.url} width={40} height={40} alt='guild-logo' className='w-10 h-10 rounded-full grow' />
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
                          <div className='flex flex-col items-end leading-[1.1]'>
                            <div className='text-white text-sm font-semibold'>{pool.ticker}</div>
                            {/* <div className='text-white'>${pool.value}</div> */}
                          </div>
                        </div>
                      </CardHeader>
                      <Image
                        src={pool.cardImage.url}
                        height={1200}
                        width={1200}
                        alt='pool-featured-image'
                        className={cn("w-full object-cover transition-all group-hover/card:scale-105", "aspect-[1]", 'opacity-80', 'group-hover/card:opacity-100', 'flex', 'z-10', 'relative')}
                      />
                      <div className='absolute inset-0 z-0 bg-gradient-to-b from-white/50 to-transparent opacity-30' />
                      <div className='absolute inset-0 bg-gradient-to-b from-transparent from-0% to-black/50 to-69% opacity-90 z-20' />
                    </CardContent>
                  </Link>
                  <CardFooter className={cn('z-20 absolute inset-0 top-auto flex p-0 mb-1 opacity-100 transition-all', loading && 'opacity-0')}>
                    <div className='z-20 p-2'>
                      {/* <CardTitle className='z-30 mt-2 text-lg font-semibold leading-none text-white'>Pool Funding</CardTitle> */}
                      {/* {pool.apps && <CardDescription className='z-30 mb-2 text-sm text-white font-fine'>This app funds the following pool(s):</CardDescription>} */}
                      {pool.apps ? <div className='z-30 grid grid-cols-5 gap-2'>
                        {pool.apps.map((app: { slug: string | UrlObject; img: string | StaticImport; }, i: number) => {
                          return (
                            <div className='relative z-30 none' key={i}>
                              {/* <Link href={app.slug}> */}
                              <Image src={app.img} width={40} height={40} alt='charisma-token' className='z-30 w-12 h-12 rounded-full' />
                              {/* <div className='absolute px-1 font-bold rounded-full -top-1 -right-3 text-md md:text-base lg:text-xs bg-accent text-accent-foreground'>{0}</div> */}
                              {/* </Link> */}
                            </div>
                          )
                        })}
                      </div> : <div className='z-30 text-sm font-fine text-white/90'>No rewards have been set for this pool yet</div>}
                    </div>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </div>
      </Layout>
    </Page>
  );
}