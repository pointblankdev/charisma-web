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
import MintRaven from '@components/mint/raven';
import { Button } from '@components/ui/button';
import { useEffect, useState } from 'react';
import { cn } from '@lib/utils';
import Link from 'next/link';
import { motion } from 'framer-motion';
import tranquilOrchardCard from '@public/stations/apple-orchard.png';
import fujiApplesIcon from '@public/stations/fuji-apples.png';
import bolt from '@public/bolt.gif';

export default function TranquilOrchard() {
  const meta = {
    title: "Charisma | Tranquil Orchard",
    description: META_DESCRIPTION,
    image: '/raven-of-odin.png'
  };

  const title = "Tranquil Orchard";
  const subtitle = 'Your workers will Fuji Apples tokens here in the orchard.';

  const [descriptionVisible, setDescriptionVisible] = useState(false);

  useEffect(() => {
    try {
      setDescriptionVisible(true);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  return (
    <Page meta={meta} fullViewport>
      <Image src={bolt} alt="bolt-background-image" layout="fill" objectFit="cover" priority />
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
                <CardTitle className="z-30 text-xl font-semibold">{title}</CardTitle>
                <ActiveRecipeIndicator active={true} />
              </div>
              <CardDescription className="z-30 pb-6 text-md font-fine text-foreground">
                {subtitle}
              </CardDescription>
              <div className="z-20">
                <CardTitle className="z-30 mt-2 text-xl font-semibold">Rewards</CardTitle>
                <CardDescription className="z-30 mb-4 text-sm font-fine text-foreground">
                  You will recieve:
                </CardDescription>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-6">
                  <div className="relative">
                    <Image
                      alt="Apples"
                      src={fujiApplesIcon}
                      quality={10}
                      className="z-30 w-full border border-white rounded-full"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="z-20 p-0">

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
                        <MintRaven />
                      </TooltipTrigger>
                      <TooltipContent
                        className={`max-w-[99vw] max-h-[80vh] overflow-scroll bg-black text-white border-primary leading-tight shadow-2xl`}
                      >
                        This mint is free, granted you possess the necessary amount of Fenrir
                        tokens.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </CardFooter>
            <Image
              src={tranquilOrchardCard}
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

const ActiveRecipeIndicator = ({ active }: { active: boolean }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className="relative w-4 h-4">
            <div
              className={`absolute top-0 left-0 w-4 h-4 rounded-full ${active ? 'bg-green-500 animate-ping' : 'bg-yellow-500'
                }`}
            />
            <div
              className={`absolute top-0 left-0 w-4 h-4 rounded-full ${active ? 'bg-green-500' : 'bg-yellow-500 animate-ping'
                }`}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent
          className={`max-w-[99vw] max-h-[80vh] overflow-scroll bg-black text-white border-primary leading-tight shadow-2xl`}
        >
          {active ? 'Minting is live' : 'Minting goes live on May 8th'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
