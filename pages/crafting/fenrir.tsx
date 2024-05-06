
import { SkipNavContent } from '@reach/skip-nav';

import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import Layout from '@components/layout';
import Image from 'next/image';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@components/ui/tooltip"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@components/ui/card';
import CraftFenrir from '@components/craft/fenrir';
import { Button } from '@components/ui/button';
import { getNameFromAddress, getTitleBeltHoldeBalance, getTitleBeltHolder } from '@lib/stacks-api';
import { GetStaticProps } from 'next';
import { useEffect, useLayoutEffect, useState } from 'react';
import { cn } from '@lib/utils';
import charismaToken from '@public/charisma.png'
import Link from 'next/link';
import Typewriter from 'typewriter-effect';
import { motion } from "framer-motion"
import liquidStakedWelsh from '@public/liquid-staked-welshcorgicoin.png'
import liquidStakedOdin from '@public/liquid-staked-odin.png'
import fenrirIcon from '@public/fenrir-icon-2.png'
import SalvageFenrir from '@components/salvage/salvage-fenrir';
import norse from '@public/norse.gif'
import fenrir from '@public/fenrir-12.png'

export default function Fenrir({ data }: Props) {
  const meta = {
    title: 'Charisma | Fenrir, Corgi of Ragnarok',
    description: META_DESCRIPTION,
    image: '/fenrir-21.png'
  };

  const [objectivesVisible, setObjectivesVisible] = useState(false)
  const [descriptionVisible, setDescriptionVisible] = useState(false)

  useLayoutEffect(() => {
    try {
      setDescriptionVisible(true)

    } catch (error) {
      console.error(error)
    }

  }, [])

  const description = [
    "In the mystical realm of Asgard, there lived a colossal creature named Fenrir, feared by the gods and prophesied to bring about the end of the world. However, Fenrir was not a fearsome wolf but a massive Welsh Corgi with an insatiable appetite for adventure and mischief. This unexpected revelation came to light when Odin, the All-Father, embarked on a quest to find and confront Fenrir. Instead of a terrifying beast, he discovered a playful and mischievous Corgi eager to join his adventure.",
    " News of Fenrir's true nature spread throughout Asgard, and the gods were left in awe of the unlikely duo. The prophecy of Ragnarok was averted, not through force or violence, but through the power of friendship. ",
    " And so, the mighty Fenrir, the feared harbinger of doom, was revealed to be nothing more than a massive Welsh Corgi, forever changing the course of Norse mythology."
  ]

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  return (
    <Page meta={meta} fullViewport>
      <Image
        src={norse}
        alt="norse-background-image"
        layout="fill"
        objectFit="cover"
        className='grayscale-[0.7] fixed inset-0'
        priority
      />
      <SkipNavContent />
      <Layout>
        <motion.div initial="hidden" animate="visible" variants={fadeIn} className="m-2 sm:container sm:mx-auto sm:py-10 md:max-w-2xl">

          <Card className='bg-black text-primary-foreground border-accent-foreground p-0 relative overflow-hidden rounded-md group/card w-full max-w-2xl opacity-[0.99] shadow-black shadow-2xl'>
            <CardHeader className='z-20 p-4'>
              <div className='flex items-center justify-between'>
                <CardTitle className='z-30 text-xl font-semibold'>{'Fenrir, Corgi of Ragnarok'}</CardTitle>
                <ActiveRecipeIndicator active={false} />
              </div>
              <CardDescription className='z-30 pb-6 text-md font-fine text-foreground'>{'...and the end of the world'}</CardDescription>
              <div className='z-20'>
                <CardTitle className='z-30 mt-2 text-xl font-semibold'>Rewards</CardTitle>
                <CardDescription className='z-30 mb-4 text-sm font-fine text-foreground'>You will recieve:</CardDescription>
                <div className='grid grid-cols-4 gap-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10'>
                  <div className='relative'>
                    <Image alt='Fenrir' src={fenrirIcon} className='z-30 w-full border border-white rounded-full' />
                    <div className='absolute px-1 font-bold rounded-full -top-1 -right-3 text-md md:text-base lg:text-xs bg-accent text-accent-foreground'>10B</div>
                  </div>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>{
                        <motion.div initial="hidden" animate="visible" variants={fadeIn} className='relative'>
                          <Image src={charismaToken} alt='charisma-token' className='z-30 w-full border border-white rounded-full' />
                          <div className='absolute px-1 font-bold rounded-full -top-1 -right-3 text-md md:text-base lg:text-xs bg-accent text-accent-foreground'>100</div>
                        </motion.div>
                      }</TooltipTrigger>
                      <TooltipContent className={`max-w-[99vw] max-h-[80vh] overflow-scroll bg-black text-white border-primary leading-tight shadow-2xl`}>
                        Charisma tokens can be used to propose and vote on changes to the fees and rewards of Fenrir.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                </div>
              </div>
            </CardHeader>
            <CardContent className='z-20 p-0'>
              <div className='z-30 p-4'>
                <CardTitle className='z-30 text-xl font-semibold'>Description</CardTitle>
                <p className='z-30 text-base h-[300px]'>
                  {descriptionVisible && <Typewriter
                    options={{
                      delay: 25,
                    }}
                    onInit={(typewriter) => {
                      typewriter.pauseFor(1500)
                      description?.forEach((s: string) => typewriter.typeString(s).pauseFor(1000))

                      typewriter.start().callFunction(() => setObjectivesVisible(true))
                    }}
                  />}
                </p>
                <div className='z-20 h-[136px]'>
                  {objectivesVisible && <div className='z-30 text-xl font-semibold'>Requirements</div>}
                  {objectivesVisible && <CardDescription className='z-30 mb-4 text-sm font-fine text-foreground'>These tokens will be liquid staked to craft Fenrir tokens:</CardDescription>}
                  {objectivesVisible &&
                    <div className='grid grid-cols-4 gap-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10'>
                      <div className='relative'>
                        <Image alt='Liquid Staked Welshcorgicoin' src={liquidStakedWelsh} className='z-30 w-full border border-white rounded-full' />
                        <div className='absolute px-1 font-bold rounded-full -top-1 -right-3 text-md md:text-base lg:text-xs bg-accent text-accent-foreground'>10K</div>
                      </div>
                      <div className='relative'>
                        <Image alt='Liquid Staked Odin' src={liquidStakedOdin} className='z-30 w-full border border-white rounded-full' />
                        <div className='absolute px-1 font-bold rounded-full -top-1 -right-3 text-md md:text-base lg:text-xs bg-accent text-accent-foreground'>10K</div>
                      </div>
                    </div>}
                </div>
              </div>
            </CardContent>

            <CardFooter className="z-20 flex justify-between p-4">
              <Link href='/crafting'><Button variant="ghost" className='z-30'>Back</Button></Link>

              {descriptionVisible && <div className='flex items-center space-x-1'>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger><CraftFenrir amount={10000000000} /></TooltipTrigger>
                    <TooltipContent className={`max-w-[99vw] max-h-[80vh] overflow-scroll bg-black text-white border-primary leading-tight shadow-2xl`}>
                      Crafting Fenrir requires 10k sWELSH and 10k sODIN.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>


                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger><SalvageFenrir amount={10000000000} /></TooltipTrigger>
                    <TooltipContent className={`max-w-[99vw] max-h-[80vh] overflow-scroll bg-black text-white border-primary leading-tight shadow-2xl`}>
                      Salvaging Fenrir returns 10k sWELSH and 10k sODIN back to you.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>}


            </CardFooter>
            <Image
              src={fenrir}
              width={800}
              height={1600}
              alt={'quest-background-image'}
              className={cn("object-cover", "sm:aspect-[1/2]", 'aspect-[1/3]', 'opacity-10', 'flex', 'z-10', 'absolute', 'inset-0', 'pointer-events-none')}
            />
            <div className='absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-white to-black opacity-10' />
          </Card>




        </motion.div>
      </Layout>
    </Page>
  );
}

type Props = {
  data: any;
};


export const getStaticProps: GetStaticProps<Props> = () => {

  try {

    return {
      props: {
        data: {}
      },
      revalidate: 6000
    };

  } catch (error) {
    return {
      props: {
        data: {}
      },
    }
  }
};

const ActiveRecipeIndicator = ({ active }: { active: boolean }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className='relative w-4 h-4'>
            <div className={`absolute top-0 left-0 w-4 h-4 rounded-full ${active ? 'bg-green-500 animate-ping' : 'bg-yellow-500'}`} />
            <div className={`absolute top-0 left-0 w-4 h-4 rounded-full ${active ? 'bg-green-500' : 'bg-yellow-500 animate-ping'}`} />
          </div>
        </TooltipTrigger>
        <TooltipContent className={`max-w-[99vw] max-h-[80vh] overflow-scroll bg-black text-white border-primary leading-tight shadow-2xl`}>
          {active ? 'Crafting is live' : 'Crafting goes live on May 7th'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
