
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
  CardFooter,
  CardHeader,
} from "@components/ui/card"
import Link from 'next/link';
import { getAllQuests } from '@lib/cms-providers/dato';
import { Button } from '@components/ui/button';
import { FaCheck } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { checkQuestComplete } from '@lib/stacks-api';
import { userSession } from '@components/stacks-session/connect';


type Props = {
  quests: any[];
};

export const getStaticProps: GetStaticProps<Props> = async () => {

  const quests = await getAllQuests()

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

  useEffect(() => {
    const address = userSession.loadUserData().profile.stxAddress.mainnet;

    const checkQuests = async () => {
      // Deep clone the quests array to prevent mutations on the original data
      const updatedQuests = JSON.parse(JSON.stringify(quests));

      for (const quest of updatedQuests) {
        const response = await checkQuestComplete(address, quest.questid);
        quest.completed = response.type === 3;
      }

      // Functional update form of setState
      setData(() => updatedQuests);
    }

    checkQuests();
  }, [quests]);

  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <div className="m-2 sm:container sm:mx-auto sm:py-10">
          <div className='flex justify-between items-end'>
            <div className='text-center text-xs sm:text-xl font-fine text-yellow-200 mb-4'>
              Quests are in closed beta. For questions and comments, join Discord.
            </div>
            <Link href='/quests/create' className='whitespace-nowrap'><Button className='mb-4'>Create a Quest 📜</Button></Link>
          </div>
          <div className='grid gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {data.map((quest) => {
              const randomIndex = Math.floor(Math.random() * quest.images.length);
              const randomImage = quest.images[randomIndex];
              const isCompleted = quest.completed; // Assuming there's a 'completed' property on the quest. Adjust as needed.
              return (
                <Card key={quest.id} className={cn('bg-black text-primary-foreground border-accent-foreground p-0 flex relative overflow-hidden rounded-md group/card', isCompleted && 'opacity-50')}>
                  <Link href={`quests/${quest.slug}`} className='w-full'>
                    <CardContent className='p-0 w-full'>
                      {isCompleted && <div className='absolute top-1 right-2 z-30'><FaCheck size={24} className="text-green-500" /></div>}
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
                        className={cn("w-full object-cover transition-all group-hover/card:scale-105", "aspect-[1/2]", 'opacity-75', 'group-hover/card:opacity-100', 'flex', 'z-10', 'relative')}
                      />
                      <div className='absolute inset-0 bg-gradient-to-b from-white to-transparent opacity-30 z-0' />
                      <CardFooter className='z-20 absolute inset-0 top-auto flex justify-end p-2'>
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