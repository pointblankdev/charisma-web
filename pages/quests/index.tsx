
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
import { Button } from '@components/ui/button';
import { FaCheck } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { checkQuestComplete, checkQuestStxRewards, getQuestRewards } from '@lib/stacks-api';
import { userSession } from '@components/stacks-session/connect';
import charismaToken from '@public/charisma.png'
import stxToken from '@public/stacks-stx-logo.png'


type Props = {
  quests: any[];
};

export const getStaticProps: GetStaticProps<Props> = async () => {

  const quests = await getAllQuests()

  // loop through all quests and get rewards
  for (const quest of quests) {
    const result = await getQuestRewards(quest.questid)
    quest.rewardCharisma = Number(result.value.value)
  }

  return {
    props: {
      quests
    },
    revalidate: 60
  };
};

export default function Quests({ quests }: Props) {
  const meta = {
    title: 'Charisma | Quest to Earn',
    description: META_DESCRIPTION
  };

  const [data, setData] = useState(quests);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const address = userSession.loadUserData().profile.stxAddress.mainnet;

    const checkQuests = async () => {
      // Deep clone the quests array to prevent mutations on the original data
      const updatedQuests = JSON.parse(JSON.stringify(quests));

      for (const quest of updatedQuests) {
        const response = await checkQuestComplete(address, quest.questid);
        quest.completed = response.type === 3;

        const profile = userSession.loadUserData().profile
        const stxRewardResponse = await checkQuestStxRewards(profile.stxAddress.mainnet, Number(quest.questid || 0))
        if (!stxRewardResponse.success) {
          console.warn(stxRewardResponse.value.value)
        } else {
          console.log(stxRewardResponse.value.value)
          quest.rewardSTX = stxRewardResponse.value.value / 1000000
        }
      }

      // Functional update form of setState
      setData(() => updatedQuests);
    }

    checkQuests().then(() => setLoading(false));
  }, [quests]);

  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <div className="m-2 sm:container sm:mx-auto sm:py-10">
          <div className='grid gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {data.map((quest) => {
              // const randomIndex = Math.floor(Math.random() * quest.images.length);
              const randomImage = quest.images[2] || quest.images[1] || quest.images[0];
              // const randomImage = quest.images[randomIndex];
              const isCompleted = quest.completed; // Assuming there's a 'completed' property on the quest. Adjust as needed.
              const charismaRewards = quest?.rewardCharisma || 0
              const showCommunityRewards = charismaRewards > 0 || quest.rewardSTX > 0
              return (
                <Card key={quest.id} className={cn('bg-black text-primary-foreground border-accent-foreground p-0 flex relative overflow-hidden rounded-md group/card', isCompleted && 'opacity-75 hover:opacity-90')}>
                  <Link href={`quests/${quest.slug}`} className='w-full'>
                    <CardContent className='p-0 w-full'>
                      <CardHeader className="z-20 absolute inset-0 h-min backdrop-blur-sm group-hover/card:backdrop-blur-3xl p-2">
                        <div className='flex gap-2'>
                          <div className='min-w-max'>
                            {quest.guild.logo.url ?
                              <Image src={quest.guild.logo.url} width={40} height={40} alt='guild-logo' className='h-10 w-10 border-white border rounded-full grow' />
                              : <div className='h-10 w-10 bg-white rounded-full border border-white' />
                            }
                          </div>
                          <div className=''>
                            <div className='text-sm font-semibold text-secondary leading-none'>
                              {quest.title}
                            </div>
                            <div className='text-xs font-fine text-secondary leading-tight mt-1'>
                              {quest.subtitle}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <Image
                        src={randomImage.url}
                        height={1200}
                        width={600}
                        alt='quest-featured-image'
                        className={cn("w-full object-cover transition-all group-hover/card:scale-105", "aspect-[1/2]", 'opacity-80', 'group-hover/card:opacity-100', 'flex', 'z-10', 'relative')}
                      />
                      <div className='absolute inset-0 bg-gradient-to-b from-white/50 to-transparent opacity-30 z-0' />
                      {showCommunityRewards && <div className='absolute inset-0 bg-gradient-to-b from-transparent from-0% to-black/90 to-69% opacity-90 z-20' />}
                      <CardFooter className={cn('z-20 absolute inset-0 top-auto flex p-0 mb-1 opacity-100 transition-all', loading && 'opacity-0')}>
                        {!isCompleted ? <div className='z-20 p-2'>
                          <CardTitle className='text-lg font-semibold mt-2 z-30 text-white leading-none'>Rewards</CardTitle>
                          {showCommunityRewards && <CardDescription className='text-sm font-fine text-white mb-4 z-30'>You will recieve:</CardDescription>}
                          {showCommunityRewards ? <div className='grid gap-4 grid-cols-5 z-30'>
                            <div className='relative z-30'>
                              <Image src={charismaToken} alt='charisma-token' className='border-white rounded-full border w-full z-30' />
                              <div className='absolute -top-1 -right-3 text-md md:text-base lg:text-xs font-bold bg-accent text-accent-foreground rounded-full px-1'>{charismaRewards}</div>
                            </div>
                            {quest.rewardSTX > 0 && <div className='relative'>
                              <Image src={stxToken} alt='stx-token' className='border-white rounded-full border w-full z-30 ' />
                              <div className='absolute -top-1 -right-3 text-md md:text-base lg:text-xs font-bold bg-accent text-accent-foreground rounded-full px-1'>{quest.rewardSTX}</div>
                            </div>}
                          </div> : <div className='text-sm font-fine text-white/90 z-30'>No rewards have been set for this quest yet</div>}
                        </div> : <div className='flex items-center justify-center w-full'><div className='z-20 p-2 text-white/90 text-lg'>Quest Completed</div><div className='z-30'><FaCheck size={16} className="text-green-500" /></div></div>}
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