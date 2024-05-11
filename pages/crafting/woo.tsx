
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
import { Button } from '@components/ui/button';
import { getCraftingRewards, getTokenPrices, getWooBalance, getWooTotalSupply } from '@lib/stacks-api';
import { GetStaticProps } from 'next';
import { useLayoutEffect, useRef, useState } from 'react';
import { cn } from '@lib/utils';
import charismaToken from '@public/charisma.png'
import Link from 'next/link';
import Typewriter from 'typewriter-effect';
import { motion } from "framer-motion"
import liquidStakedWelsh from '@public/liquid-staked-welshcorgicoin.png'
import liquidStakedRoo from '@public/liquid-staked-roo.png'
import wooIcon from '@public/woo-icon.png'
import woo from '@public/woo-1.png'
import CraftWoo from '@components/craft/woo';
import SalvageWoo from '@components/salvage/woo';
import millify from 'millify';

export default function Woo({ data }: Props) {
  const meta = {
    title: `Charisma | Roo Flair's Bizarre Adventure`,
    description: META_DESCRIPTION,
    image: '/woo-21.png'
  };

  const [objectivesVisible, setObjectivesVisible] = useState(false)
  const [descriptionVisible, setDescriptionVisible] = useState(false)
  const [skipAnimation, setSkipAnimation] = useState(false);
  const [stakedWelshPrice, setStakedWelshPrice] = useState(0)
  const [stakedRooPrice, setStakedRooPrice] = useState(0)

  const videoRef = useRef<HTMLVideoElement>(null as any);

  const handleDescriptionClick = () => {
    setSkipAnimation(true);
    setObjectivesVisible(true)
  };

  useLayoutEffect(() => {
    try {
      videoRef.current.muted = false
      setDescriptionVisible(true)
      getTokenPrices().then((response) => {
        setStakedWelshPrice(response.message[14].price)
        setStakedRooPrice(response.message[15].price)
      })
    } catch (error) {
      console.error(error)
    }

  }, [])

  const description = [
    `Once a beacon of innovation, now clouded by the shadow of the notorious 'Influencers' and their band of miscreants, the "Spirit of Bitcoin" has fallen victim to a malevolent scheme. No longer a symbol of freedom, it's become the centerpiece of a twisted crypto casino, where integrity is scarce.`,
    ` Roo Flair, empowered by his Stand, "Nakamoto" and accompanied by his faithful corgi companion, venture into this degenerate world. Their acute senses pierce through the veil of deception spun by the larpers, revealing their hollow intentions. These are not revolutionaries but grifters, driven entirely by personal monitary gains.`,
    ` In the final conflict, fueled by the power of autism, Roo and his corgi companion hold their ground for months on end against the Influencers and their minions, dispite soul-crushing delays of his Stand's powers. Will they reclaim the stolen Spirit of Bitcoin, restoring balance to the land and safeguarding its future from ruin?`,
  ]

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const craftAmount = 100000000
  const salvageAmount = 100000000
  const welshCost = Math.floor(craftAmount * data.welshStaked / data.totalWooSupply)
  const rooCost = Math.floor(craftAmount * data.rooStaked / data.totalWooSupply)
  const craftingRewards = (craftAmount / 1000000) * data.craftingRewardFactor

  const tvl = ((data.welshStaked / 1000000) * stakedWelshPrice) + ((data.rooStaked / 1000000) * stakedRooPrice)

  // console.log({ welshCost, rooCost, tvl, craftingRewards })

  return (
    <Page meta={meta} fullViewport>

      <video autoPlay loop muted id='video' onClick={(e: any) => { e.target.muted = !e.target.muted }} ref={videoRef}
        className='opacity-30 absolute inset-0 h-full w-full'>
        <source src={'/roundabout.mp4'} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <motion.div transition={{ delay: 7.5 }} initial="visible" animate="hidden" variants={fadeIn} className='bottom-4 w-full text-center absolute text-secondary text-sm'> ← Click anywhere to mute audio → </motion.div>
      <SkipNavContent />
      <Layout>
        <motion.div initial="hidden" animate="visible" variants={fadeIn} className="m-2 sm:container sm:mx-auto sm:py-10 md:max-w-2xl">

          <Card className='text-primary-foreground border-accent-foreground p-0 relative overflow-hidden rounded-md group/card w-full max-w-2xl opacity-[0.995] shadow-black shadow-2xl'>
            <CardHeader className='z-20 p-4'>
              <div className='flex items-center justify-between'>
                <CardTitle className='z-30 text-xl font-semibold'>Roo Flair's Bizarre Adventure</CardTitle>
                <div className='flex space-x-4'>
                  <div className='text-lg'>
                    ${millify(tvl)} TVL
                  </div>
                  <ActiveRecipeIndicator active={true} />
                </div>
              </div>
              <CardDescription className='z-30 pb-6 text-md font-fine text-foreground'>The fight to save the Spirit of Bitcoin</CardDescription>
              <div className='z-20'>
                <CardTitle className='z-30 mt-2 text-xl font-semibold'>Rewards</CardTitle>
                <CardDescription className='z-30 mb-4 text-sm font-fine text-foreground'>You will recieve:</CardDescription>
                <div className='grid grid-cols-4 gap-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10'>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <motion.div initial="hidden" animate="visible" variants={fadeIn} className='relative'>
                          <Image alt='Woo' src={wooIcon} quality={10} className='z-30 w-full border border-white rounded-full' />
                          <div className='absolute px-1 font-bold rounded-full -top-1 -right-3 text-md md:text-base lg:text-xs bg-accent text-accent-foreground'>{millify(craftAmount)}</div>
                        </motion.div>
                      </TooltipTrigger>
                      <TooltipContent className={`max-w-[99vw] max-h-[80vh] overflow-scroll bg-black text-white border-primary leading-tight shadow-2xl`}>
                        {millify(craftAmount)} WOO tokens
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>{
                        <motion.div initial="hidden" animate="visible" variants={fadeIn} className='relative'>
                          <Image src={charismaToken} alt='charisma-token' className='z-30 w-full border border-white rounded-full' />
                          <div className='absolute px-1 font-bold rounded-full -top-1 -right-3 text-md md:text-base lg:text-xs bg-accent text-accent-foreground min-w-[24px]'>{millify(craftingRewards)}</div>
                        </motion.div>
                      }</TooltipTrigger>
                      <TooltipContent className={`max-w-[99vw] max-h-[80vh] overflow-scroll bg-black text-white border-primary leading-tight shadow-2xl`}>
                        Charisma tokens can be used to propose and vote on changes to the fees and rewards of WOO
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                </div>
              </div>
            </CardHeader>
            <CardContent className='z-20 p-0'>
              <div className='z-30 p-4'>
                <CardTitle className='z-30 text-xl font-semibold'>Description</CardTitle>
                <p className='z-30 text-base min-h-[360px]' onClick={handleDescriptionClick}>
                  {!skipAnimation && descriptionVisible && (
                    <Typewriter
                      options={{
                        delay: 10,
                      }}
                      onInit={(typewriter) => {
                        typewriter.pauseFor(1500);
                        description?.forEach((s: string) => typewriter.typeString(s).pauseFor(1000));

                        typewriter.start().callFunction(() => setObjectivesVisible(true));
                      }}
                    />
                  )}
                  {skipAnimation && descriptionVisible && description?.map((s: string, index: number) => <p key={index}>{s}</p>)}
                </p>
                <div className='z-20 min-h-[136px]'>
                  {objectivesVisible && <div className='z-30 text-xl font-semibold'>Requirements</div>}
                  {objectivesVisible && <CardDescription className='z-30 mb-4 text-sm font-fine text-foreground'>These tokens will be liquid staked to craft WOO tokens:</CardDescription>}
                  {objectivesVisible &&
                    <div className='grid grid-cols-4 gap-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10'>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <div className='relative'>
                              <Image alt='Liquid Staked Welshcorgicoin' src={liquidStakedWelsh} className='z-30 w-full border border-white rounded-full' />
                              <div className='absolute px-1 font-bold rounded-full -top-1 -right-3 text-md md:text-base lg:text-xs bg-accent text-accent-foreground min-w-[24px]'>{millify(welshCost / 1000000)}</div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side='bottom' className={`text-md max-h-[80vh] overflow-scroll bg-black text-white border-primary leading-tight shadow-2xl max-w-prose`}>
                            {welshCost / 1000000} sWELSH
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <div className='relative'>
                              <Image alt='Liquid Staked Roo' src={liquidStakedRoo} className='z-30 w-full border border-white rounded-full' />
                              <div className='absolute px-1 font-bold rounded-full -top-1 -right-3 text-md md:text-base lg:text-xs bg-accent text-accent-foreground min-w-[24px]'>{millify(rooCost / 1000000)}</div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side='bottom' className={`text-md max-h-[80vh] overflow-scroll bg-black text-white border-primary leading-tight shadow-2xl max-w-prose`}>
                            {rooCost / 1000000} sROO
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>}
                </div>
              </div>
            </CardContent>

            <CardFooter className="z-20 flex justify-between p-4">
              <Link href='/crafting'><Button variant="ghost" className='z-30'>Back</Button></Link>

              {descriptionVisible && <div className='flex items-center space-x-1'>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger><CraftWoo amount={craftAmount} welshCost={welshCost} rooCost={rooCost} /></TooltipTrigger>
                    <TooltipContent className={`max-w-[99vw] max-h-[80vh] overflow-scroll bg-black text-white border-primary leading-tight shadow-2xl`}>
                      Crafting Woo requires {millify(welshCost / 1000000)} sWELSH and {millify(rooCost / 1000000)} sROO.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger><SalvageWoo amount={salvageAmount} /></TooltipTrigger>
                    <TooltipContent className={`max-w-[99vw] max-h-[80vh] overflow-scroll bg-black text-white border-primary leading-tight shadow-2xl`}>
                      Salvaging Woo returns {millify(welshCost / 1000000)} sWELSH and {millify(rooCost / 1000000)} sROO back to you.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>}


            </CardFooter>
            <Image
              src={woo}
              width={800}
              height={1600}
              alt={'quest-background-image'}
              className={cn("object-cover", "sm:aspect-[1/2]", 'aspect-[1/3]', 'opacity-10', 'flex', 'z-10', 'absolute', 'inset-0', 'pointer-events-none', 'w-full')}
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

    const woo = await getWooTotalSupply()
    const welsh = await getWooBalance('liquid-staked-welsh-v2')
    const roo = await getWooBalance('liquid-staked-roo-v2')
    const craftingRewardFactor = await getCraftingRewards('woo-meme-world-champion')

    return {
      props: {
        data: {
          totalWooSupply: Number(woo.value.value),
          welshStaked: Number(welsh.value.value),
          rooStaked: Number(roo.value.value),
          craftingRewardFactor: Number(craftingRewardFactor.value.value)
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
          {active ? 'Crafting is live' : 'Crafting goes live on May 10th'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
