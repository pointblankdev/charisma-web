
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
    " News of Fenrir's true nature spread throughout Asgard, and the gods were left in awe of the unlikely duo. The prophecy of Ragnarok was averted, not through force or violence, but through the power of friendship. And so, the mighty Fenrir, the feared harbinger of doom, was revealed to be nothing more than a massive Welsh Corgi, forever changing the course of Norse mythology."
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
        className='grayscale-[0.7]'
        priority
      />
      <SkipNavContent />
      <Layout>
        <motion.div initial="hidden" animate="visible" variants={fadeIn} className="m-2 sm:container sm:mx-auto sm:py-10 md:max-w-2xl">

          <Card className='bg-black text-primary-foreground border-accent-foreground p-0 relative overflow-hidden rounded-md group/card w-full max-w-2xl opacity-[0.99] shadow-black shadow-2xl'>
            <CardHeader className='p-4 z-20'>
              <div className='flex justify-between items-center'>
                <CardTitle className='text-xl font-semibold z-30'>{'Fenrir, Corgi of Ragnarok'}</CardTitle>
                <ActiveRecipeIndicator active={false} />
              </div>
              <CardDescription className='text-md font-fine text-foreground z-30 pb-12'>{'...and the end of the world'}</CardDescription>
              <div className='z-20'>
                <CardTitle className='text-xl font-semibold mt-2 z-30'>Rewards</CardTitle>
                <CardDescription className='text-sm font-fine text-foreground mb-4 z-30'>You will recieve:</CardDescription>
                <div className='grid gap-4 grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10'>
                  <div className='relative'>
                    <Image alt='Fenrir' src={fenrirIcon} className='border-white rounded-full border w-full z-30' />
                    <div className='absolute -top-1 -right-3 text-md md:text-base lg:text-xs font-bold bg-accent text-accent-foreground rounded-full px-1'>10B</div>
                  </div>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>{
                        <motion.div initial="hidden" animate="visible" variants={fadeIn} className='relative'>
                          <Image src={charismaToken} alt='charisma-token' className='border-white rounded-full border w-full z-30' />
                          <div className='absolute -top-1 -right-3 text-md md:text-base lg:text-xs font-bold bg-accent text-accent-foreground rounded-full px-1'>100</div>
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
            <CardContent className='p-0 z-20'>
              <div className='p-4 z-30'>
                <CardTitle className='text-xl font-semibold z-30'>Description</CardTitle>
                <p className='text-base z-30'>
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
                <div className='z-20 mt-12 sm:mt-18 md:mt-24 lg:mt-36 xl:mt-64 min-h-[122px]'>
                  {objectivesVisible && <motion.div initial="hidden" animate="visible" variants={fadeIn} className='text-xl font-semibold mt-4 z-30'>Requirements</motion.div>}
                  {objectivesVisible && <CardDescription className='text-sm font-fine text-foreground mb-4 z-30'>These tokens will be liquid staked to craft Fenrir tokens:</CardDescription>}
                  {objectivesVisible &&
                    <div className='grid gap-4 grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10'>
                      <div className='relative'>
                        <Image alt='Liquid Staked Welshcorgicoin' src={liquidStakedWelsh} className='border-white rounded-full border w-full z-30' />
                        <div className='absolute -top-1 -right-3 text-md md:text-base lg:text-xs font-bold bg-accent text-accent-foreground rounded-full px-1'>10K</div>
                      </div>
                      <div className='relative'>
                        <Image alt='Liquid Staked Odin' src={liquidStakedOdin} className='border-white rounded-full border w-full z-30' />
                        <div className='absolute -top-1 -right-3 text-md md:text-base lg:text-xs font-bold bg-accent text-accent-foreground rounded-full px-1'>10K</div>
                      </div>
                    </div>}
                </div>
              </div>
            </CardContent>

            <CardFooter className="p-4 flex justify-between z-20">
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
            <div className='absolute inset-0 bg-gradient-to-b from-white to-black opacity-10 z-0 pointer-events-none' />
          </Card>




        </motion.div>
      </Layout>
    </Page>
  );
}

type Props = {
  data: any;
};


export const getStaticProps: GetStaticProps<Props> = async () => {

  try {
    const holder = await getTitleBeltHolder()
    const balance = await getTitleBeltHoldeBalance()
    const bns = await getNameFromAddress(holder.value)

    return {
      props: {
        data: {
          titleBeltHolder: holder.value,
          bns: bns.names[0],
          woooRecord: balance.value
        }
      },
      revalidate: 60
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
