
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
import { getCraftingRewards, getFenrirBalance, getFenrirTotalSupply, getNameFromAddress, getTitleBeltHoldeBalance, getTitleBeltHolder, getTokenPrices, getTotalSupply } from '@lib/stacks-api';
import { GetStaticProps } from 'next';
import { useEffect, useLayoutEffect, useState } from 'react';
import { cn } from '@lib/utils';
import charismaToken from '@public/charisma.png'
import Link from 'next/link';
import Typewriter from 'typewriter-effect';
import { motion } from "framer-motion"
import aeUSDC from '@public/aeUSDC-logo.svg'
import liquidStakedCharisma from '@public/liquid-staked-charisma.png'
import fffLogo from '@public/feather-fall-fund-logo.png'
import SalvageFenrir from '@components/salvage/salvage-fenrir';
import norse from '@public/norse.gif'
import fenrir from '@public/feather-fall-fund-card.png'
import millify from 'millify';
import CraftIndex from '@components/craft/fff';
import SalvageIndex from '@components/salvage/salvage-fff';

export default function Fenrir({ data }: Props) {
  const meta = {
    title: 'Charisma | Feather Fall Fund',
    description: META_DESCRIPTION,
    image: '/feather-fall-fund-card.png'
  };


  const [objectivesVisible, setObjectivesVisible] = useState(true)
  const [descriptionVisible, setDescriptionVisible] = useState(false)

  useLayoutEffect(() => {
    try {
      setDescriptionVisible(true)
      getTokenPrices().then((response: any) => {
        console.log(response)
      })

    } catch (error) {
      console.error(error)
    }

  }, [])

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const craftAmount = 100
  const salvageAmount = 100
  const welshCost = 100000000
  const odinCost = 100000000

  const tvl = data.totalSupply / 1000000

  return (
    <Page meta={meta} fullViewport>
      {/* <Image
        src={norse}
        alt="norse-background-image"
        layout="fill"
        objectFit="cover"
        className='grayscale-[0.7] fixed inset-0'
        priority
        quality={10}
      /> */}
      <SkipNavContent />
      <Layout>
        <motion.div initial="hidden" animate="visible" variants={fadeIn} className="m-2 sm:container sm:mx-auto sm:py-10 md:max-w-2xl">

          <Card className='bg-black text-primary-foreground border-accent-foreground p-0 relative overflow-hidden rounded-md group/card w-full max-w-2xl opacity-[0.99] shadow-black shadow-2xl'>
            <CardHeader className='z-20 p-4'>
              <div className='flex items-center justify-between'>
                <CardTitle className='z-30 text-lg sm:text-xl font-semibold'>Index: FFF</CardTitle>
                <div className='flex space-x-4'>
                  <div className='text-lg'>
                    ${millify(tvl)} TVL
                  </div>
                  <ActiveRecipeIndicator active={true} />
                </div>
              </div>
              <CardDescription className='z-30 text-sm sm:text-md font-fine text-foreground'>An index fund of aeUSDC and sCHA at a fixed 1:1 ratio</CardDescription>

              <div className='z-20'>
                <CardTitle className='z-30 mt-2 text-xl font-semibold'>Mintable Token</CardTitle>
                <CardDescription className='z-30 mb-4 text-sm font-fine text-foreground'>Feather Fall Fund</CardDescription>
                <div className='grid grid-cols-4 gap-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10'>
                  <div className='relative'>
                    <Image alt='Fenrir' src={fffLogo} quality={10} className='z-30 w-full border rounded-full' />
                    <div className='absolute px-1 font-bold rounded-full -top-1 -right-3 text-md md:text-base lg:text-xs bg-accent text-accent-foreground'>{millify(craftAmount)}</div>
                  </div>


                </div>
              </div>
            </CardHeader>
            <CardContent className='z-20 p-0'>
              <div className='z-30 p-4'>
                <div className='z-20 min-h-[136px]'>
                  {objectivesVisible && <div className='z-30 text-xl font-semibold'>Staked Base Tokens</div>}
                  {objectivesVisible && <CardDescription className='z-30 mb-4 text-sm font-fine text-foreground'>These tokens will be staked to mint FFF Index tokens:</CardDescription>}
                  {objectivesVisible &&
                    <div className='z-20 grid grid-cols-4 gap-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10'>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <div className='z-20 relative'>
                              <Image alt='Liquid Staked Welshcorgicoin' src={aeUSDC} className='z-30 w-full border rounded-full' />
                              <div className='absolute px-1 font-bold rounded-full -top-1 -right-3 text-md md:text-base lg:text-xs bg-accent text-accent-foreground'>{millify(welshCost / 1000000)}</div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side='bottom' className={`text-md max-h-[80vh] overflow-scroll bg-black text-white border-primary leading-tight shadow-2xl max-w-prose`}>
                            {welshCost / 1000000} aeUSDC
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <div className='z-20 relative'>
                              <Image alt='Liquid Staked Odin' src={liquidStakedCharisma} className='z-30 w-full border rounded-full' />
                              <div className='absolute px-1 font-bold rounded-full -top-1 -right-3 text-md md:text-base lg:text-xs bg-accent text-accent-foreground'>{millify(odinCost / 1000000)}</div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side='bottom' className={`text-md max-h-[80vh] overflow-scroll bg-black text-white border-primary leading-tight shadow-2xl max-w-prose`}>
                            {odinCost / 1000000} sCHA
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>}
                </div>
              </div>
            </CardContent>

            <CardFooter className="z-20 flex justify-between p-4">
              <Link href='/crafting'><Button variant="ghost" className='z-30'>Back</Button></Link>

              {descriptionVisible && <div className='z-20 flex items-center space-x-1'>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger><CraftIndex amount={craftAmount} /></TooltipTrigger>
                    <TooltipContent className={`max-w-[99vw] max-h-[80vh] overflow-scroll bg-black text-white border-primary leading-tight shadow-2xl`}>
                      Minting FFF requires {millify(welshCost / 1000000)} aeUSDC and {millify(odinCost / 1000000)} sCHA.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger><SalvageIndex amount={salvageAmount} /></TooltipTrigger>
                    <TooltipContent className={`max-w-[99vw] max-h-[80vh] overflow-scroll bg-black text-white border-primary leading-tight shadow-2xl`}>
                      Burning FFF returns {millify(welshCost / 1000000)} aeUSDC and {millify(odinCost / 1000000)} sCHA back to you.
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


export const getStaticProps: GetStaticProps<Props> = async () => {

  try {

    const fff = await getTotalSupply('feather-fall-fund-v1')

    return {
      props: {
        data: {
          totalSupply: Number(fff.value.value)
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
          {active ? 'Index fund is live' : 'Fund goes live on May 8th'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
