
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
import { getAllQuests } from '@lib/cms-providers/dato';
import { FaCheck } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { checkQuestComplete, checkQuestStxRewards, getQuestRewards } from '@lib/stacks-api';
import { userSession } from '@components/stacks-session/connect';
import charismaToken from '@public/charisma.png'
import stxToken from '@public/stacks-stx-logo.png'



type Props = {
  quests: any[];
};

export const getStaticProps: GetStaticProps<Props> = () => {

  const quests = [
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
      slug: 'stake'
    },
    {
      guild: {
        logo: {
          url: '/liquid-staked-roo.png'
        }
      },
      title: 'Kangaroo',
      subtitle: 'Liquid Staked Roo',
      cardImage: {
        url: '/liquid-roo-21.png'
      },
      slug: 'stake-roo'
    }
  ]

  return {
    props: {
      quests
    },
    // revalidate: 60
  };
};

export default function Quests({ quests }: Props) {

  const meta = {
    title: 'Charisma | Quest to Earn',
    description: META_DESCRIPTION
  };

  const [data, setData] = useState(quests);

  const [loading, setLoading] = useState(true);
  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <div className="m-2 sm:container sm:mx-auto sm:py-10">
          <div className='grid gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {data.map((quest) => {
              const isCompleted = quest.completed; // Assuming there's a 'completed' property on the quest. Adjust as needed.
              const charismaRewards = quest?.rewardCharisma || 0
              const showCommunityRewards = charismaRewards > 0 || quest.rewardSTX > 0
              return (
                <Card key={quest.id} className={cn('bg-black text-primary-foreground border-accent-foreground p-0 flex relative overflow-hidden rounded-md group/card', isCompleted && 'opacity-75 hover:opacity-90')}>
                  <Link href={`${quest.slug}`} className='w-full'>
                    <CardContent className='w-full p-0'>
                      <CardHeader className="absolute inset-0 z-20 p-2 h-min backdrop-blur-sm group-hover/card:backdrop-blur-3xl">
                        <div className='flex gap-2'>
                          <div className='min-w-max'>
                            {quest.guild.logo.url ?
                              <Image src={quest.guild.logo.url} width={40} height={40} alt='guild-logo' className='w-10 h-10 border border-white rounded-full grow' />
                              : <div className='w-10 h-10 bg-white border border-white rounded-full' />
                            }
                          </div>
                          <div className=''>
                            <div className='text-sm font-semibold leading-none text-secondary'>
                              {quest.title}
                            </div>
                            <div className='mt-1 text-xs leading-tight font-fine text-secondary'>
                              {quest.subtitle}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <Image
                        src={quest.cardImage.url}
                        height={1200}
                        width={600}
                        alt='quest-featured-image'
                        className={cn("w-full object-cover transition-all group-hover/card:scale-105", "aspect-[1/2]", 'opacity-80', 'group-hover/card:opacity-100', 'flex', 'z-10', 'relative')}
                      />
                      <div className='absolute inset-0 z-0 bg-gradient-to-b from-white/50 to-transparent opacity-30' />
                      {showCommunityRewards && <div className='absolute inset-0 bg-gradient-to-b from-transparent from-0% to-black/90 to-69% opacity-90 z-20' />}
                      <CardFooter className={cn('z-20 absolute inset-0 top-auto flex p-0 mb-1 opacity-100 transition-all', loading && 'opacity-0')}>
                        {!isCompleted ? <div className='z-20 p-2'>
                          <CardTitle className='z-30 mt-2 text-lg font-semibold leading-none text-white'>Rewards</CardTitle>
                          {showCommunityRewards && <CardDescription className='z-30 mb-4 text-sm text-white font-fine'>You will recieve:</CardDescription>}
                          {showCommunityRewards ? <div className='z-30 grid grid-cols-5 gap-4'>
                            <div className='relative z-30'>
                              <Image src={charismaToken} alt='charisma-token' className='z-30 w-full border border-white rounded-full' />
                              <div className='absolute px-1 font-bold rounded-full -top-1 -right-3 text-md md:text-base lg:text-xs bg-accent text-accent-foreground'>{charismaRewards}</div>
                            </div>
                            {quest.rewardSTX > 0 && <div className='relative'>
                              <Image src={stxToken} alt='stx-token' className='z-30 w-full border border-white rounded-full ' />
                              <div className='absolute px-1 font-bold rounded-full -top-1 -right-3 text-md md:text-base lg:text-xs bg-accent text-accent-foreground'>{quest.rewardSTX}</div>
                            </div>}
                          </div> : <div className='z-30 text-sm font-fine text-white/90'>No rewards have been set for this quest yet</div>}
                        </div> : <div className='flex items-center justify-center w-full'><div className='z-20 p-2 text-lg text-white/90'>Quest Completed</div><div className='z-30'><FaCheck size={16} className="text-green-500" /></div></div>}
                      </CardFooter>
                    </CardContent>
                  </Link>
                </Card>
              )
            })}
          </div>
        </div>
      </Layout>
    </Page>
  );
}