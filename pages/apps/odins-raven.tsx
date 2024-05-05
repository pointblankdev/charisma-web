
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
import MintRaven from '@components/mint/raven';
import { Button } from '@components/ui/button';
import { getNameFromAddress, getTitleBeltHoldeBalance, getTitleBeltHolder } from '@lib/stacks-api';
import { GetStaticProps } from 'next';
import { useEffect, useState } from 'react';
import { cn } from '@lib/utils';
import charismaToken from '@public/charisma.png'
import Link from 'next/link';
import Typewriter from 'typewriter-effect';
import { motion } from "framer-motion"
import liquidStakedWelsh from '@public/liquid-staked-welshcorgicoin.png'
import liquidStakedOdin from '@public/liquid-staked-odin.png'
import odinsRaven from '@public/odins-raven/img/4.gif'
import SalvageFenrir from '@components/salvage/salvage-fenrir';
import fenrirIcon from '@public/fenrir-icon-2.png'

export default function OdinsRaven({ data }: Props) {
  const meta = {
    title: "Charisma | Odin's Raven",
    description: META_DESCRIPTION,
    image: '/raven-of-odin.png'
  };

  const title = "Odin's Raven"
  const subtitle = "The eyes and ears of the Allfather."

  const [objectivesVisible, setObjectivesVisible] = useState(false)
  const [descriptionVisible, setDescriptionVisible] = useState(false)

  useEffect(() => {
    try {
      setDescriptionVisible(true)

    } catch (error) {
      console.error(error)
    }

  }, [])

  const description = [
    `Odin's raven, often depicted as a pair named Huginn and Muninn, which translate to "thought" and "memory" respectively, are more than mere birds in Norse mythology.`,
    ` These ravens are extensions of Odin himself, serving as his eyes and ears across the Nine Worlds. Each morning, they are dispatched from Odin's shoulders to fly throughout the realms, gathering news and secrets from the earth below. By evening, they return to whisper all they have seen and heard directly into Odin's ear.`,
    ` These creatures are not only symbols of the god's intellectual and psychic powers but also embody the deep connection Odin maintains with his realm and its inhabitants. They are portrayed as sleek and black, mirroring the enigmatic and wise nature of their master.`,
    ` The ravens' daily flights underscore their crucial role in keeping Odin well-informed and several steps ahead of his adversaries, reinforcing his stature as the god of wisdom and knowledge.`,
  ]

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  return (
    <Page meta={meta} fullViewport>
      <div className="absolute inset-0 z-0">
        <Image
          src="/thunder.gif"
          alt="thunder-background-image"
          layout="fill"
          objectFit="cover"
          className='blur-[1002px] grayscale-[0.9]'
        />
        {/* <div className="absolute inset-0 bg-black opacity-[0.8]"></div> */}
      </div>
      <SkipNavContent />
      <Layout >
        <div className="m-2 sm:container sm:mx-auto sm:py-10 md:max-w-2xl">

          <Card className='bg-black text-primary-foreground border-accent-foreground p-0 relative overflow-hidden rounded-md group/card w-full max-w-2xl opacity-[0.99] shadow-black shadow-2xl'>
            <CardHeader className='p-4 z-20'>
              <div className='flex justify-between items-center'>
                <CardTitle className='text-xl font-semibold z-30'>{title}</CardTitle>
                <ActiveRecipeIndicator active={false} />
              </div>
              <CardDescription className='text-md font-fine text-foreground z-30 pb-6'>{subtitle}</CardDescription>
              <div className='z-20'>
                <CardTitle className='text-xl font-semibold mt-2 z-30'>Rewards</CardTitle>
                <CardDescription className='text-sm font-fine text-foreground mb-4 z-30'>You will recieve:</CardDescription>
                <div className='grid gap-4 grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10'>
                  <div className='relative'>
                    <Image alt='Fenrir' src={odinsRaven} className='border-white rounded-full border w-full z-30' />
                    <div className='absolute -top-1 -right-3 text-md md:text-base lg:text-xs font-bold bg-accent text-accent-foreground rounded-full px-1'>NFT</div>
                  </div>

                  {/* <TooltipProvider>
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
                  </TooltipProvider> */}

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
                <div className='z-20 mt-12 sm:mt-36 min-h-[122px]'>
                  {objectivesVisible && <motion.div initial="hidden" animate="visible" variants={fadeIn} className='text-xl font-semibold mt-4 z-30'>Requirements</motion.div>}
                  {objectivesVisible && <CardDescription className='text-sm font-fine text-foreground mb-6 z-30'>
                    <p className="leading-normal">
                      To mint a Raven, you need to hold more than <span className="font-bold">10 billion</span> Fenrir tokens multiplied by its mint ID. For instance, having <span className="font-bold">10 billion</span> Fenrir allows you to mint the first Raven with ID #<span className="font-bold">1</span>. For the 10th Raven with ID #<span className="font-bold">10</span>, you'll need <span className="font-bold">100 billion</span> Fenrir. The final Raven, #<span className="font-bold">100</span>, requires <span className="font-bold">1 trillion</span> Fenrir tokens. These tokens aren't spent during minting; they're simply a requirement.
                    </p>
                  </CardDescription>}
                  {objectivesVisible &&
                    <div className='grid gap-4 grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 items-center'>
                      <div className='relative'>
                        <Image alt='Fenrir, Corgi of Ragnarok' src={fenrirIcon} className='border-white rounded-full border w-full z-30' />
                        <div className='absolute -top-1 -right-3 text-md md:text-base lg:text-xs font-bold bg-accent text-accent-foreground rounded-full px-1'>10B</div>
                      </div>
                      <div className='text-5xl text-center ml-1'>✕</div>
                      <div className='relative'>
                        <Image alt='Fenrir' src={odinsRaven} className='border-white rounded-full border w-full z-30' />
                        <div className='absolute -top-1 -right-3 text-md md:text-base lg:text-xs font-bold bg-accent text-accent-foreground rounded-full px-1'>ID#</div>
                      </div>
                    </div>}
                </div>
              </div>
            </CardContent>

            <CardFooter className="p-4 flex justify-between z-20">
              <Link href='/crafting'><Button variant="ghost" className='z-30'>Back</Button></Link>

              <div className='flex items-center space-x-1'>
                {descriptionVisible && <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger><MintRaven /></TooltipTrigger>
                    <TooltipContent className={`max-w-[99vw] max-h-[80vh] overflow-scroll bg-black text-white border-primary leading-tight shadow-2xl`}>
                      This mint is free, granted you possess the necessary amount of Fenrir tokens.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>}
              </div>


            </CardFooter>
            <Image
              src={'/raven-of-odin.png'}
              width={800}
              height={1600}
              alt={'quest-background-image'}
              className={cn("object-cover", "sm:aspect-[1/2]", 'aspect-[1/3]', 'opacity-10', 'flex', 'z-10', 'absolute', 'inset-0', 'pointer-events-none')}
            />
            <div className='absolute inset-0 bg-gradient-to-b from-white to-black opacity-10 z-0 pointer-events-none' />
          </Card>




        </div>
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
          {active ? 'Minting is live' : 'Minting goes live on May 8th'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
