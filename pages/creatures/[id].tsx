import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import Layout from '@components/layout';
import Image from 'next/image';
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
import {
    blocksApi,
    getCreatureCost,
    getCreaturePower,
} from '@lib/stacks-api';
import { GetServerSideProps, GetStaticPaths, GetStaticProps, GetStaticPropsResult, InferGetStaticPropsType } from 'next';
import { useEffect, useLayoutEffect, useState } from 'react';
import { cn } from '@lib/utils';
import Link from 'next/link';
import Typewriter from 'typewriter-effect';
import { motion } from 'framer-motion';
import odinsRaven from '@public/odins-raven/img/4.gif';
import fenrirIcon from '@public/fenrir-icon-2.png';
import goldEmbers from '@public/quests/gold-embers.gif'
import journeyOfDiscovery from '@public/quests/journey-of-discovery.png'
import experience from '@public/experience.png'
import { userSession } from '@components/stacks-session/connect';
import { useConnect } from '@stacks/connect-react';
import { AnchorMode, callReadOnlyFunction, cvToJSON, Pc, PostConditionMode, principalCV, uintCV } from '@stacks/transactions';
import { StacksMainnet } from "@stacks/network";
import numeral from 'numeral';
import farmersImg from '@public/creatures/img/farmers.png'
import blacksmithsImg from '@public/creatures/img/blacksmiths.png'
import corgiSoldiersImg from '@public/creatures/img/corgi-soldiers.png'
import alchemistsImg from '@public/creatures/img/alchemists.png'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@components/ui/dialog';
import { AlertDialogHeader } from '@components/ui/alert-dialog';
import experienceIcon from '@public/experience.png'
import { CreatureInfoDialog, EnergyInfoDialog } from '.';
import creatureIcon from '@public/creatures/img/creatures.jpg'
import costIcon from '@public/creatures/img/creature-cost.png'
import powerIcon from '@public/creatures/img/power.png'


type Props = {
    creature: Creature
};

type Creature = {
    title: string;
    cost: number;
    power: number;
    cardImage: string;
    requiredToken: string;
    tokenContract: string;
    subtitle: string;
    flavorText: string;
    slug: string;
    poolLink: string;
};

export default function IndexDetailPage({ creature }: InferGetStaticPropsType<typeof getStaticProps>) {
    const meta = {
        title: `Charisma | ${creature?.title}`,
        description: META_DESCRIPTION,
        image: creature?.cardImage
    };

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
            <SkipNavContent />
            <Layout>
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeIn}
                    className="m-2 sm:container sm:mx-auto sm:py-10 md:max-w-2xl"
                >
                    <Card className="min-h-[600px] flex flex-col bg-black text-primary-foreground border-accent-foreground p-0 relative overflow-hidden rounded-md group/card w-full max-w-2xl opacity-[0.99] shadow-black shadow-2xl">
                        <CardHeader className="z-20 p-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="z-30 text-4xl font-semibold">{creature?.title}</CardTitle>
                                    <CardDescription className="z-30 pb-6 text-md font-fine text-foreground">
                                        {creature?.subtitle}
                                    </CardDescription>
                                </div>
                                <Link href={creature?.poolLink} className='mt-2 hover:underline' target='_blank'>
                                    Get {creature?.requiredToken} tokens here
                                </Link>
                            </div>

                        </CardHeader>

                        <CardContent className="z-20 flex-grow p-4">
                            <div className="grid grid-cols-2 gap-4 items-center justify-center mb-16">
                                <div className="flex items-end space-x-3 mr-1 justify-self-end text-lg">
                                    Creature Cost
                                </div>
                                <div className="flex items-end space-x-3 mr-1">
                                    <CostInfoDialog creature={creature} />
                                </div>

                                <div className="flex items-end space-x-3 mr-1 justify-self-end text-lg">
                                    Creature Power
                                </div>
                                <div className="flex items-end space-x-3 mr-1">
                                    <PowerInfoDialog creature={creature} />
                                </div>
                            </div>
                            <div className="flex flex-col items-center justify-center space-y-4">
                                <p className='max-w-lg'>
                                    {descriptionVisible && <Typewriter
                                        options={{ delay: 50, autoStart: true }}
                                        onInit={typewriter => {
                                            typewriter.pauseFor(1000).start().typeString(creature.flavorText)
                                        }}
                                    />}
                                </p>
                            </div>
                        </CardContent>

                        <CardFooter className="z-20 flex justify-between p-4 items-end">

                            <Link href="/creatures">
                                <Button variant="ghost" className="z-30">
                                    Back
                                </Button>
                            </Link>

                            <div className="m-2 text-lg">
                                µP/C Ratio: <strong>{numeral(creature.power * Math.pow(10, 6) / creature.cost).format('0.00')}</strong>
                            </div>

                        </CardFooter>
                        <Image
                            src={creature.cardImage}
                            width={800}
                            height={1600}
                            alt={'quest-background-image'}
                            className={cn(
                                'object-cover',
                                'opacity-10',
                                'aspect-[2/3]',
                                'sm:aspect-square',
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
    )

}


export const getStaticProps: GetStaticProps<Props> = async ({ params }: any): Promise<GetStaticPropsResult<Props>> => {
    const creatures = [
        {
            title: 'Farmers',
            subtitle: 'Honest and humble farmers.',
            slug: '/creatures/farmers',
            cardImage: '/creatures/img/farmers.png',
            requiredToken: 'STX-wCHA LP',
            cost: 0,
            power: 0,
            tokenContract: 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.wstx-wcha',
            poolLink: 'https://app.velar.com/pool/STX-wCHA',
            flavorText: 'Farmers are the backbone of healthy economy. Farmers excel at harvesting FUJI tokens, making them a suitable choice for those looking to maximize profitablity. Their earnings are consistant and predictable.'
        },
        {
            title: 'Blacksmiths',
            subtitle: 'Forgers of crafting materials, weapons and armor.',
            slug: '/creatures/blacksmiths',
            cardImage: '/creatures/img/blacksmiths.png',
            requiredToken: 'STX-sCHA LP',
            cost: 0,
            power: 0,
            tokenContract: 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.wstx-scha',
            poolLink: 'https://app.velar.com/pool/STX-sCHA',
            flavorText: 'Blacksmiths are skilled craftsmen who excel at forging essential materials required for crafting and building.'
        },
        {
            title: 'Corgi Soldiers',
            subtitle: 'Loyal and fierce warriors.',
            slug: '/creatures/corgi-soldiers',
            cardImage: '/creatures/img/corgi-soldiers.png',
            requiredToken: 'STX-iCC LP',
            cost: 0,
            power: 0,
            tokenContract: 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.wstx-icc',
            poolLink: 'https://app.velar.com/pool/STX-iCC',
            flavorText: 'Corgi Soldiers are loyal and fierce warriors who are known to charge head-first into battle. Corgi Soldiers are able to defeat powerful foes with ease. Their high power-to-cost ratio makes them a well rounded choice for any situation.'
        },
        {
            title: 'Alchemists',
            subtitle: 'Masters of potions and elixirs.',
            slug: '/creatures/alchemists',
            cardImage: '/creatures/img/alchemists.png',
            requiredToken: 'STX-iMM LP',
            cost: 0,
            power: 0,
            tokenContract: 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.wstx-imm',
            poolLink: 'https://app.velar.com/pool/STX-iMM',
            flavorText: 'Alchemists are masters of potions and elixirs.'
        },
    ]

    const creatureId = Number(params.id);
    const creature = creatures[creatureId - 1];
    creature.cost = await getCreatureCost(creatureId)
    creature.power = await getCreaturePower(creatureId)

    return {
        props: { creature },
        revalidate: 6000
    };
};

export const getStaticPaths = () => {
    return {
        paths: [
            { params: { id: '1' } },
            { params: { id: '2' } },
            { params: { id: '3' } },
            { params: { id: '4' } },
        ],
        fallback: false, // false or "blocking"
    }
}

export function CostInfoDialog({ creature }: any) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <div className="z-20 relative cursor-pointer">
                    <Image
                        alt={creature.title}
                        src={costIcon}
                        width={100}
                        height={100}
                        className="z-30 border rounded-full h-16 w-16 hover:scale-110 transition-all"
                    />
                    <div className="absolute px-1 font-bold rounded-full -top-1 -right-2 text-base bg-background text-accent min-w-5 text-center">
                        {numeral(creature.cost).format('(0a)')}
                    </div>
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <AlertDialogHeader>
                    <DialogTitle>Creature Cost</DialogTitle>
                    <div className='flex items-center space-x-4'>

                        <Image
                            alt={creature.title}
                            src={costIcon}
                            width={100}
                            height={100}
                            className="z-30 border rounded-full h-16 w-16 hover:scale-110 transition-all"
                        />
                        <DialogDescription className='text-sm py-4 space-y-2'>
                            <p>Each creature type costs a set amount of LP tokens to recruit.</p>
                        </DialogDescription>
                    </div>
                </AlertDialogHeader>

                <DialogFooter>
                    {creature.title} cost {numeral(creature.cost).format('0a')} {creature.requiredToken} tokens each.
                </DialogFooter>
            </DialogContent>
        </Dialog >
    )
}

export function PowerInfoDialog({ creature }: any) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <div className="z-20 relative cursor-pointer">
                    <Image
                        alt={creature.title}
                        src={powerIcon}
                        width={100}
                        height={100}
                        className="z-30 border rounded-full h-16 w-16 hover:scale-110 transition-all"
                    />
                    <div className="absolute px-1 font-bold rounded-full -top-1 -right-2 text-base bg-background text-accent min-w-5 text-center">
                        {numeral(creature.power).format('(0a)')}
                    </div>
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <AlertDialogHeader>
                    <DialogTitle>Creature Power</DialogTitle>
                    <div className='flex items-center space-x-4'>

                        <Image
                            alt={creature.title}
                            src={powerIcon}
                            width={100}
                            height={100}
                            className="z-30 border rounded-full h-16 w-16 hover:scale-110 transition-all"
                        />
                        <DialogDescription className='text-sm py-4 space-y-2'>
                            <p>Each creature type has a power rating that determines how much energy each creature generates per block.</p>
                        </DialogDescription>
                    </div>
                </AlertDialogHeader>

                <DialogFooter>
                    {creature.title} have a power rating of {numeral(creature.power).format('0a')}.
                </DialogFooter>
            </DialogContent>
        </Dialog >
    )
}