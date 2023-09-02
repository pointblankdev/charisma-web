import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import Layout from '@components/layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@lib/utils';
import React, { useEffect } from 'react';
import charismaToken from '@public/charisma.png'
import { GetStaticProps } from 'next';
import Typewriter from 'typewriter-effect';
import { motion } from "framer-motion"
import { checkQuestComplete } from '@lib/stacks-api';
import { userSession } from '@components/stacks-session/connect';
import { useConnect } from "@stacks/connect-react";
import { StacksMainnet } from "@stacks/network";
import {
    AnchorMode,
    PostConditionMode,
    callReadOnlyFunction,
    uintCV,
} from "@stacks/transactions";
import { getQuestBySlug } from '@lib/cms-providers/dato';


type Props = any

export default function QuestDetail(props: Props) {
    const meta = {
        title: 'Charisma | Quest-to-Earn',
        description: META_DESCRIPTION
    };

    const quest = props

    const charismaRewards = quest?.charismaRewards || 0
    const showCommunityRewards = charismaRewards > 0
    const randomImage = quest.randomImage;


    console.log({ quest })
    console.log({ randomImage })

    const { doContractCall } = useConnect();
    const [questAccepted, setQuestAccepted] = React.useState(false)
    const [objectivesVisible, setObjectivesVisible] = React.useState(false)
    const [questCompleted, setQuestCompleted] = React.useState(false)


    useEffect(() => {
        const profile = userSession.loadUserData().profile
        checkQuestComplete(profile.stxAddress.mainnet, Number(quest?.questid || 0)).then((res) => {
            if (res.value === 'true') {
                setQuestCompleted(true)
            }
        })
    }, [quest])

    const claimRewards = () => {
        doContractCall({
            network: new StacksMainnet(),
            anchorMode: AnchorMode.Any,
            contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
            contractName: "dme010-quest-reward-helper",
            functionName: "claim-quest-reward",
            functionArgs: [uintCV(Number(quest?.questid))],
            postConditionMode: PostConditionMode.Deny,
            postConditions: [],
            onFinish: (data) => {
                console.log("onFinish:", data);
            },
            onCancel: () => {
                console.log("onCancel:", "Transaction was canceled");
            },
        });
    }

    const fadeIn = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
    };

    return (
        <Page meta={meta} fullViewport>
            <Layout className='m-2 sm:container sm:mx-auto sm:py-10 items-center'>
                {/* text letting user know quests are in preview mode and are non-functional and for demonstration purposes only */}
                <div className='text-center text-sm sm:text-xl font-fine text-yellow-200 mb-4'>
                    Quests are in preview mode, and are for demonstration purposes only. For questions or comments, join Discord.
                </div>
                <Card className='bg-black text-primary-foreground border-accent-foreground p-0 relative overflow-hidden rounded-md group/card w-full max-w-2xl'>
                    <CardHeader className='p-4 z-20'>
                        <CardTitle className='text-xl font-semibold z-30'>{quest?.title}</CardTitle>
                        <CardDescription className='text-md font-fine text-foreground z-30'>{quest?.subtitle}</CardDescription>
                        <div className='z-20'>
                            <CardTitle className='text-xl font-semibold mt-2 z-30'>Rewards</CardTitle>
                            {showCommunityRewards && <CardDescription className='text-sm font-fine text-foreground mb-4 z-30'>You will recieve:</CardDescription>}
                            {showCommunityRewards ? <div className='grid gap-4 grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10'>
                                <div className='relative'>
                                    <Image src={charismaToken} alt='charisma-token' className='border-white rounded-full border w-full z-30 ' />
                                    <div className='absolute -top-1 -right-3 text-md md:text-base lg:text-xs font-bold bg-accent text-accent-foreground rounded-full px-1'>{charismaRewards}</div>
                                </div>
                            </div> : <div className='text-sm font-fine text-foreground z-30'>No rewards have been set for this quest yet</div>}
                        </div>
                    </CardHeader>
                    {!questAccepted && <CardFooter className="p-4 flex justify-between z-20">
                        <Link href='/quests'><Button variant="ghost" className='z-30'>Back</Button></Link>
                        <Button variant="ghost" className='text-primary hover:bg-white hover:text-primary z-30' onClick={() => setQuestAccepted(true)}>Start</Button>
                    </CardFooter>}

                    {questAccepted && <CardContent className='p-0 z-20'>
                        <div className='p-4 z-30'>
                            <CardTitle className='text-xl font-semibold z-30'>Description</CardTitle>
                            <p className='text-base z-30'>
                                <Typewriter
                                    options={{
                                        delay: 25,
                                    }}
                                    onInit={(typewriter) => {
                                        typewriter.pauseFor(1500)
                                        quest?.description?.forEach((s: string) => typewriter.typeString(s).pauseFor(1000))

                                        typewriter.start().callFunction(() => setObjectivesVisible(true))
                                    }}
                                />
                            </p>

                            {objectivesVisible && <motion.div initial="hidden" animate="visible" variants={fadeIn} className='text-xl font-semibold mt-4 z-30'>Objectives</motion.div>}
                            {objectivesVisible && quest?.objectives?.map((o: any, k: any) =>
                                <motion.p key={k} initial="hidden" animate="visible" variants={fadeIn} className={`text-md font-fine text-foreground z-30 duration-200 ease-out transition transform `}>
                                    {o.text}: {o.metric}
                                </motion.p>
                            )}
                        </div>
                    </CardContent>}
                    {questAccepted && <CardFooter className="p-4 flex justify-between z-20">
                        <Link href='/quests'><Button variant="ghost" className='z-30'>Back</Button></Link>
                        <Button variant="ghost" className='text-primary hover:bg-white hover:text-primary z-30' onClick={claimRewards} disabled={!questCompleted}>Claim Rewards</Button>
                    </CardFooter>}
                    <Image
                        src={randomImage?.url}
                        width={800}
                        height={1600}
                        alt={'quest-background-image'}
                        className={cn("object-cover", "sm:aspect-[1/2]", 'aspect-[1/3]', 'opacity-10', 'flex', 'z-10', 'absolute', 'inset-0', 'pointer-events-none')}
                    />
                    <div className='absolute inset-0 bg-gradient-to-b from-white to-black opacity-10 z-0 pointer-events-none' />
                </Card>
            </Layout>

        </Page >
    );
}

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {

    const quest = await getQuestBySlug(String(params?.slug))

    const getCharismaRewards: any = await callReadOnlyFunction({
        network: new StacksMainnet(),
        contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
        contractName: "dme009-charisma-rewards",
        functionName: "get-rewards",
        functionArgs: [uintCV(Number(quest?.questid))],
        senderAddress: 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ'
    })

    // pick a random image
    quest.randomImage = quest.images[Math.floor(Math.random() * quest.images.length)]

    return {
        props: {
            ...quest,
            charismaRewards: Number(getCharismaRewards.value.value)
        },
        revalidate: 60
    };
};

export const getStaticPaths = () => {
    return {
        paths: [
            { params: { slug: 'charismatic-flow' } },
        ],
        fallback: true
    };
}