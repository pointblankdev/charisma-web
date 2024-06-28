import { SkipNavContent } from '@reach/skip-nav';

import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import Layout from '@components/layout';
import Image from 'next/image';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@components/ui/card';
import CraftFenrir from '@components/craft/fenrir';
import { Button } from '@components/ui/button';
import {
  getCraftingRewards,
  getFenrirBalance,
  getFenrirTotalSupply,
  getNameFromAddress,
  getTitleBeltHoldeBalance,
  getTitleBeltHolder,
  getTokenPrices
} from '@lib/stacks-api';
import { GetStaticProps } from 'next';
import { useEffect, useLayoutEffect, useState } from 'react';
import { cn } from '@lib/utils';
import charismaToken from '@public/charisma.png';
import Link from 'next/link';
import Typewriter from 'typewriter-effect';
import { motion } from 'framer-motion';
import liquidStakedWelsh from '@public/liquid-staked-welshcorgicoin.png';
import liquidStakedOdin from '@public/liquid-staked-odin.png';
import fenrirIcon from '@public/fenrir-icon-2.png';
import SalvageFenrir from '@components/salvage/salvage-fenrir';
import norse from '@public/norse.gif';
import fenrir from '@public/fenrir-12.png';
import millify from 'millify';
import useWallet from '@lib/hooks/use-wallet-balances';

export default function Fenrir({ data }: Props) {
  const meta = {
    title: 'Charisma | Fenrir, Corgi of Ragnarok',
    description: META_DESCRIPTION,
    image: '/fenrir-21.png'
  };

  const [objectivesVisible, setObjectivesVisible] = useState(true);
  const [descriptionVisible, setDescriptionVisible] = useState(false);
  const [skipAnimation, setSkipAnimation] = useState(false);
  const [stakedWelshPrice, setStakedWelshPrice] = useState(0);
  const [stakedOdinPrice, setStakedOdinPrice] = useState(0);

  const handleDescriptionClick = () => {
    setSkipAnimation(true);
    setObjectivesVisible(true);
  };

  useLayoutEffect(() => {
    try {
      setDescriptionVisible(true);
      getTokenPrices().then(response => {
        setStakedWelshPrice(response[14].price);
        setStakedOdinPrice(response[16].price);
      });
    } catch (error) {
      console.error(error);
    }
  }, []);

  const description = [
    'In the mystical realm of Asgard, there lived a colossal creature named Fenrir, feared by the gods and prophesied to bring about the end of the world. However, Fenrir was not a fearsome wolf but a massive Welsh Corgi with an insatiable appetite for adventure and mischief. This unexpected revelation came to light when Odin, the All-Father, embarked on a quest to find and confront Fenrir. Instead of a terrifying beast, he discovered a playful and mischievous Corgi eager to join his adventure.',
    " News of Fenrir's true nature spread throughout Asgard, and the gods were left in awe of the unlikely duo. The prophecy of Ragnarok was averted, not through force or violence, but through the power of friendship. ",
    ' And so, the mighty Fenrir, the feared harbinger of doom, was revealed to be nothing more than a massive Welsh Corgi, forever changing the course of Norse mythology.'
  ];

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const { balances } = useWallet();
  const fenrirBalance = (balances?.fungible_tokens?.[
    'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.fenrir-corgi-of-ragnarok::fenrir'
  ] as any)?.balance;

  const craftAmount = fenrirBalance;
  const salvageAmount = fenrirBalance;
  const welshCost = Math.floor((craftAmount * data.welshStaked) / data.totalFenrirSupply);
  const odinCost = Math.floor((craftAmount * data.odinStaked) / data.totalFenrirSupply);
  const craftingRewards = (craftAmount / 1000000) * data.craftingRewardFactor;

  const tvl =
    (data.welshStaked / 1000000) * stakedWelshPrice + (data.odinStaked / 1000000) * stakedOdinPrice;

  return (
    <Page meta={meta} fullViewport>
      <Image
        src={norse}
        alt="norse-background-image"
        layout="fill"
        objectFit="cover"
        className="grayscale-[0.7] fixed inset-0"
        priority
        quality={10}
      />
      <SkipNavContent />
      <Layout>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="m-2 sm:container sm:mx-auto sm:py-10 md:max-w-2xl"
        >
          <Card className="bg-black text-primary-foreground border-accent-foreground p-0 relative overflow-hidden rounded-md group/card w-full max-w-2xl opacity-[0.99] shadow-black shadow-2xl">
            <CardHeader className="z-20 p-4">
              <div className="flex items-center justify-between">
                <CardTitle className="z-30 text-lg sm:text-xl font-semibold">
                  Index: FENRIR
                </CardTitle>
                <div className="flex space-x-4">
                  <div className="text-lg">${millify(tvl)} TVL</div>
                  <ActiveRecipeIndicator active={false} />
                </div>
              </div>
              <CardDescription className="z-30 text-sm sm:text-md font-fine text-foreground">
                sWELSH and sODIN at a fixed 1:10 ratio
              </CardDescription>

              {/* <div className='-ml-0.5 text-sm mt-0 flex flex-wrap pb-6'>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger><div className='bg-primary rounded-full w-fit leading-tight px-1 pb-0.5 text-center m-1 pointer-events-auto'>Deflationary</div></TooltipTrigger>
                    <TooltipContent side='bottom' className={`text-md max-h-[80vh] overflow-scroll bg-black text-white border-primary leading-tight shadow-2xl max-w-prose`}>
                      <strong>Deflationary:</strong> This token automatically burns a small percentage of each transaction, channeling these funds directly into its own rebasing pool. <br /><br />
                      This mechanism continuously reduces the total supply relative to it's base token, increasing the token's value over time. <br /><br />
                      The self-burning feature, coupled with the rebase pool, ensures a dynamic adjustment of the token's supply in response to transactional activity, promoting stability and encouraging long-term holding. <br /><br />
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger><div className='bg-primary rounded-full w-fit leading-tight px-1 pb-0.5 text-center m-1 pointer-events-auto'>Compound Rebase</div></TooltipTrigger>
                    <TooltipContent side='bottom' className={`text-md max-h-[80vh] overflow-scroll bg-black text-white border-primary leading-tight shadow-2xl max-w-prose`}>
                      <strong>Compound Rebase:</strong> This token type leverages the rebase mechanisms of multiple underlying tokens. <br /><br />
                      This advanced structure allows for synchronized adjustments in value, closely tracking the collective performance of diverse assets. <br /><br />
                      It's supported by a robust ecosystem of apps and protocols, each contributing to the vitality and growth of multiple rebasing pools. <br /><br />
                      This interconnected framework not only enhances potential returns but also fosters a dynamic environment for investment and financial strategy. <br /><br />
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger><div className='bg-primary rounded-full w-fit leading-tight px-1 pb-0.5 text-center m-1 pointer-events-auto'>Craftable</div></TooltipTrigger>
                    <TooltipContent side='bottom' className={`text-md max-h-[80vh] overflow-scroll bg-black text-white border-primary leading-tight shadow-2xl max-w-prose`}>
                      <strong>Craftable Token:</strong> A craftable token is a type of compound token that requires one or more base tokens to create. <br /><br />
                      It is crafted through a rebasing process that aligns its value with both coins simultaneously, offering holders a representative share in each of the coin's pools at a fixed weight. <br /><br />
                      This mechanism ensures that the craftable token maintains a balanced exposure to both assets, providing a unique investment opportunity that diversifies risk and potential rewards. <br /><br />
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div> */}
              <div className="z-20">
                <CardTitle className="z-30 mt-2 text-xl font-semibold">Mintable Token</CardTitle>
                <CardDescription className="z-30 mb-4 text-sm font-fine text-foreground">
                  Fenrir, Corgi of Ragnarok
                </CardDescription>
                <div className="grid grid-cols-4 gap-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
                  <div className="relative">
                    <Image
                      alt="Fenrir"
                      src={fenrirIcon}
                      quality={10}
                      className="z-30 w-full border border-white rounded-full"
                    />
                    <div className="absolute px-1 font-bold rounded-full -top-1 -right-3 text-md md:text-base lg:text-xs bg-accent text-accent-foreground">
                      {millify(craftAmount)}
                    </div>
                  </div>

                  {/* <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>{
                        <motion.div initial="hidden" animate="visible" variants={fadeIn} className='relative'>
                          <Image src={charismaToken} alt='charisma-token' className='z-30 w-full border border-white rounded-full' />
                          <div className='absolute px-1 font-bold rounded-full -top-1 -right-3 text-md md:text-base lg:text-xs bg-accent text-accent-foreground min-w-[24px]'>{millify(craftingRewards)}</div>
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
            <CardContent className="z-20 p-0">
              <div className="z-30 p-4">
                {/* <CardTitle className='z-30 text-xl font-semibold'>Description</CardTitle> */}
                {/* <div className='z-30 text-base min-h-[300px]' onClick={handleDescriptionClick}>
                  {!skipAnimation && descriptionVisible && <Typewriter
                    options={{
                      delay: 25,
                    }}
                    onInit={(typewriter) => {
                      typewriter.pauseFor(1500)
                      description?.forEach((s: string) => typewriter.typeString(s).pauseFor(1000))

                      typewriter.start().callFunction(() => setObjectivesVisible(true))
                    }}
                  />}
                  {skipAnimation && descriptionVisible && description?.map((s: string, index: number) => <p key={index}>{s}</p>)}
                </div> */}
                <div className="z-20 min-h-[136px]">
                  {objectivesVisible && (
                    <div className="z-30 text-xl font-semibold">Staked Base Tokens</div>
                  )}
                  {objectivesVisible && (
                    <CardDescription className="z-30 mb-4 text-sm font-fine text-foreground">
                      These tokens will be staked to mint FENRIR Index tokens:
                    </CardDescription>
                  )}
                  {objectivesVisible && (
                    <div className="grid grid-cols-4 gap-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="relative">
                              <Image
                                alt="Liquid Staked Welshcorgicoin"
                                src={liquidStakedWelsh}
                                className="z-30 w-full border border-white rounded-full"
                              />
                              <div className="absolute px-1 font-bold rounded-full -top-1 -right-3 text-md md:text-base lg:text-xs bg-accent text-accent-foreground">
                                {millify(welshCost / 1000000)}
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent
                            side="bottom"
                            className={`text-md max-h-[80vh] overflow-scroll bg-black text-white border-primary leading-tight shadow-2xl max-w-prose`}
                          >
                            {welshCost / 1000000} sWELSH
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="relative">
                              <Image
                                alt="Liquid Staked Odin"
                                src={liquidStakedOdin}
                                className="z-30 w-full border border-white rounded-full"
                              />
                              <div className="absolute px-1 font-bold rounded-full -top-1 -right-3 text-md md:text-base lg:text-xs bg-accent text-accent-foreground">
                                {millify(odinCost / 1000000)}
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent
                            side="bottom"
                            className={`text-md max-h-[80vh] overflow-scroll bg-black text-white border-primary leading-tight shadow-2xl max-w-prose`}
                          >
                            {odinCost / 1000000} sODIN
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>

            <CardFooter className="z-20 flex justify-between p-4">
              <Link href="/crafting">
                <Button variant="ghost" className="z-30">
                  Back
                </Button>
              </Link>

              {descriptionVisible && (
                <div className="flex items-center space-x-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <CraftFenrir
                          amount={craftAmount}
                          welshCost={welshCost}
                          odinCost={odinCost}
                        />
                      </TooltipTrigger>
                      <TooltipContent
                        className={`max-w-[99vw] max-h-[80vh] overflow-scroll bg-black text-white border-primary leading-tight shadow-2xl`}
                      >
                        Minting FENRIR requires {millify(welshCost / 1000000)} sWELSH and{' '}
                        {millify(odinCost / 1000000)} sODIN.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <SalvageFenrir amount={salvageAmount} />
                      </TooltipTrigger>
                      <TooltipContent
                        className={`max-w-[99vw] max-h-[80vh] overflow-scroll bg-black text-white border-primary leading-tight shadow-2xl`}
                      >
                        Burning FENRIR returns {millify(welshCost / 1000000)} sWELSH and{' '}
                        {millify(odinCost / 1000000)} sODIN back to you.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </CardFooter>
            <Image
              src={fenrir}
              width={800}
              height={1600}
              alt={'quest-background-image'}
              className={cn(
                'object-cover',
                'sm:aspect-[1/2]',
                'aspect-[1/3]',
                'opacity-10',
                'flex',
                'z-10',
                'absolute',
                'inset-0',
                'pointer-events-none'
              )}
            />
            <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-white to-black opacity-10" />
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
    const fenrir = await getFenrirTotalSupply();
    const welsh = await getFenrirBalance('liquid-staked-welsh-v2');
    const odin = await getFenrirBalance('liquid-staked-odin');
    const craftingRewardFactor = await getCraftingRewards('fenrir-corgi-of-ragnarok');

    return {
      props: {
        data: {
          totalFenrirSupply: Number(fenrir.value.value),
          welshStaked: Number(welsh.value.value),
          odinStaked: Number(odin.value.value),
          craftingRewardFactor: Number(craftingRewardFactor.value.value)
        }
      },
      revalidate: 60
    };
  } catch (error) {
    return {
      props: {
        data: {}
      }
    };
  }
};

const ActiveRecipeIndicator = ({ active }: { active: boolean }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className="relative w-4 h-4">
            <div
              className={`absolute top-0 left-0 w-4 h-4 rounded-full ${
                active ? 'bg-green-500 animate-ping' : 'bg-red-500'
              }`}
            />
            <div
              className={`absolute top-0 left-0 w-4 h-4 rounded-full ${
                active ? 'bg-green-500' : 'bg-red-500 animate-ping'
              }`}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent
          className={`overflow-scroll bg-black text-white border-primary leading-tight shadow-2xl max-w-prose`}
        >
          {active
            ? 'Crafting is live'
            : 'Crafting is disabled. Non-standard SIP10 tokens have proven difficult to list on DEXs, so the plan is to simplify the tokenomics and relaunch with a new token. Fees have all been disabled so you can withdraw your deposit at no cost.'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
