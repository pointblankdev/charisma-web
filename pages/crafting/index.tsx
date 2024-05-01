
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
import { StaticImport } from 'next/dist/shared/lib/get-img-props';
import { UrlObject } from 'url';
import { useRouter } from 'next/navigation';
import liquidStakedWelsh from '@public/liquid-staked-welshcorgicoin.png'
import liquidStakedRoo from '@public/liquid-staked-roo.png'
import liquidStakedOdin from '@public/liquid-staked-odin.png'

type Props = {
  pools: any[];
};

export const getStaticProps: GetStaticProps<Props> = () => {

  const pools = [
    {
      guild: {
        logo: {
          url: '/woooooo.webp'
        }
      },
      title: 'Wooo!',
      subtitle: 'sWELSH + sROO = WOOO',
      cardImage: {
        url: '/wooo-title-belt.gif'
      },
      slug: 'crafting/wooo',
      wip: false,
      apps: [
        { slug: '/stake/welsh', img: liquidStakedWelsh },
        { slug: '/stake/roo', img: liquidStakedRoo },
      ]
    }
  ]

  return {
    props: {
      pools
    },
    // revalidate: 60
  };
};

export default function LiquidStaking({ pools }: Props) {

  const meta = {
    title: 'Charisma | Liquid Staking',
    description: META_DESCRIPTION,
    image: '/liquid-welsh.png'
  };

  const router = useRouter()
  const [loading, setLoading] = useState(false);

  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <div className="m-2 sm:container sm:mx-auto sm:py-10">
          <div className='grid gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {pools.map((pool) => {
              return (
                <Card key={pool.id} className={cn('bg-black text-primary-foreground border-accent-foreground p-0 flex relative overflow-hidden rounded-md group/card', pool.wip && 'opacity-25 hover:opacity-60')}>
                  <Link href={`${pool.slug}`} className='w-full'>
                    <CardContent className='w-full p-0'>
                      <CardHeader className="absolute inset-0 z-20 p-2 h-min backdrop-blur-sm group-hover/card:backdrop-blur-3xl">
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