
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
import { useRouter } from 'next/navigation';
import liquidStakedWelsh from '@public/liquid-staked-welshcorgicoin.png'
import liquidStakedRoo from '@public/liquid-staked-roo.png'
import liquidStakedOdin from '@public/liquid-staked-odin.png'
import { getStakedTokenExchangeRate, getTokenPrices } from '@lib/stacks-api';
import millify from 'millify';

type Props = {
  apps: any[];
};

export const getStaticProps: GetStaticProps<Props> = () => {

  const apps = [
    {
      guild: {
        logo: {
          url: '/woooooo.webp'
        }
      },
      title: 'Wooo!',
      ticker: 'WOOO',
      subtitle: 'sWELSH + sROO = WOOO',
      cardImage: {
        url: '/wooo-title-belt.gif'
      },
      slug: '/crafting/wooo',
      wip: false,
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
      subtitle: '...and the end of the world',
      cardImage: {
        url: '/fenrir-21.png'
      },
      slug: '/crafting/fenrir',
      wip: true,
      apps: [
        { slug: '/stake/welsh', img: liquidStakedWelsh },
        { slug: '/stake/odin', img: liquidStakedOdin },
      ]
    }
  ]

  return {
    props: {
      apps
    },
  };
};

export default function Crafting({ apps }: Props) {

  const meta = {
    title: 'Charisma | Crafting',
    description: META_DESCRIPTION,
    image: '/fenrir-21.png'
  };

  const [loading, setLoading] = useState(false);
  const [welshPrice, setWelshPrice] = useState(0)
  const [odinPrice, setOdinPrice] = useState(0)
  const [rooPrice, setRooPrice] = useState(0)

  const [welshExchangeRate, setWelshExchangeRate] = useState(1)
  const [welshv2ExchangeRate, setWelshv2ExchangeRate] = useState(1)
  const [odinExchangeRate, setOdinExchangeRate] = useState(1)
  const [rooExchangeRate, setRooExchangeRate] = useState(1)


  useEffect(() => {
    getTokenPrices().then((prices) => {
      // find symbol: 'WELSH and 'ODIN' in the message array
      // set the price of each to a state variable
      prices.message.forEach((token: { symbol: string; price: number; }) => {
        if (token.symbol === 'WELSH') {
          setWelshPrice(token.price)
        }
        if (token.symbol === 'ODIN') {
          setOdinPrice(token.price)
        }
        if (token.symbol === '$ROO') {
          setRooPrice(token.price)
        }
      })
      getStakedTokenExchangeRate("liquid-staked-welsh").then((rate) => {
        setWelshExchangeRate(rate.value.value / 1000000)
      })
      getStakedTokenExchangeRate("liquid-staked-welsh-v2").then((rate) => {
        setWelshv2ExchangeRate(rate.value / 1000000)
      })
      getStakedTokenExchangeRate("liquid-staked-odin").then((rate) => {
        setOdinExchangeRate(rate.value / 1000000)
      })
      getStakedTokenExchangeRate("liquid-staked-roo").then((rate) => {
        setRooExchangeRate(rate.value / 1000000)
      })
    })
  }, [])

  // look at the apps field of the apps array and calculate the value of the token
  // here is an example for the wooo app which is /stake/welsh and /stake/roo
  // millify((100 * welshPrice * 1.06) + (0.42 * rooPrice * 1.01), { precision: 6 })

  const woooValue = millify((100 * welshPrice * welshExchangeRate) + (0.42 * rooPrice * rooExchangeRate), { precision: 4 })
  const fenrirValue = millify((10 * welshPrice * welshv2ExchangeRate) + (21 * odinPrice * odinExchangeRate), { precision: 4 })

  apps[0].value = woooValue
  apps[1].value = fenrirValue

  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <div className="m-2 sm:container sm:mx-auto sm:py-10">
          <div className='grid gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {apps.map((pool) => {
              return (
                <Card key={pool.id} className={cn('bg-black text-primary-foreground border-accent-foreground p-0 flex relative overflow-hidden rounded-md group/card', pool.wip && 'opacity-25 hover:opacity-60 pointer-events-none animate-pulse')}>
                  <Link href={`${pool.slug}`} className='w-full'>
                    <CardContent className='w-full p-0'>
                      <CardHeader className="absolute inset-0 z-20 p-2 h-min backdrop-blur-sm group-hover/card:backdrop-blur-3xl">
                        <div className='flex justify-between align-top'>

                          <div className='flex gap-2'>
                            <div className='min-w-max'>
                              {pool.guild.logo.url ?
                                <Image src={pool.guild.logo.url} width={40} height={40} alt='guild-logo' className='w-10 h-10 border border-white rounded-full grow' />
                                : <div className='w-10 h-10 bg-white border border-white rounded-full' />
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
                            <div className='text-white'>${pool.value}</div>
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
                        {pool.apps.map((app: { slug: string | UrlObject; img: string | StaticImport; }) => {
                          return (
                            <div className='relative z-30 none'>
                              <Link href={app.slug}>
                                <Image src={app.img} alt='charisma-token' className='z-30 w-12 h-12 border border-white rounded-full' />
                                {/* <div className='absolute px-1 font-bold rounded-full -top-1 -right-3 text-md md:text-base lg:text-xs bg-accent text-accent-foreground'>{0}</div> */}
                              </Link>
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