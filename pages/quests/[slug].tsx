/**
 * Copyright 2020 Vercel Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useRouter } from 'next/router';

import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import Layout from '@components/layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@lib/utils';
import React from 'react';
import { data } from 'pages/quests/index';
import charismaToken from '@public/charisma.png'
import { GetStaticProps } from 'next';
import { StacksMainnet } from "@stacks/network";
import { callReadOnlyFunction, principalCV, uintCV } from '@stacks/transactions';
import Typewriter from 'typewriter-effect';
import { motion } from "framer-motion"

export default function QuestDetail(props: any) {
    const { query } = useRouter();
    const meta = {
        title: 'Charisma | Quest-to-Earn',
        description: META_DESCRIPTION
    };

    const [questAccepted, setQuestAccepted] = React.useState(false)
    const [objectivesVisible, setObjectivesVisible] = React.useState(false)
    const [questCompleted, setQuestCompleted] = React.useState(false)

    const quest = data.find(p => String(p.id) === query.slug)

    const claimRewards = () => {
        console.log('Claim')
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
                            <CardDescription className='text-sm font-fine text-foreground mb-4 z-30'>You will recieve:</CardDescription>
                            <div className='grid gap-4 grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10'>
                                <div className='relative'>
                                    <Image src={charismaToken} alt='charisma-token' className='bg-white rounded-full border w-full z-30' />
                                    <div className='absolute -top-1 -right-3 text-md md:text-base lg:text-xs font-bold bg-accent text-accent-foreground rounded-full px-1'>{quest?.amount}</div>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    {!questAccepted && <CardFooter className="p-4 flex justify-between z-20">
                        <Link href='/quests'><Button variant="ghost" className='z-30'>Back</Button></Link>
                        <Button variant="ghost" className='text-primary hover:bg-white hover:text-primary z-30' onClick={() => setQuestAccepted(true)}>Start</Button>
                    </CardFooter>}

                    {questAccepted && <CardContent className='p-0 z-20'>
                        <div className='p-4 z-20'>
                            <CardTitle className='text-xl font-semibold z-30'>Description</CardTitle>
                            <p className='text-base z-30'>
                                <Typewriter
                                    options={{
                                        delay: 2,
                                    }}
                                    onInit={(typewriter) => {
                                        typewriter.pauseFor(1500)
                                        quest?.description?.forEach(s => typewriter.typeString(s).pauseFor(1000))

                                        typewriter.start().callFunction(() => setObjectivesVisible(true))
                                    }}
                                />
                            </p>

                            {objectivesVisible && <motion.div initial="hidden" animate="visible" variants={fadeIn} className='text-xl font-semibold mt-4 z-30'>Objectives</motion.div>}
                            {objectivesVisible && quest?.objectives?.map((o, k) =>
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
                        src={quest?.src}
                        alt={'alex-lab-quest'}
                        className={cn("object-cover", "sm:aspect-[1/2]", 'aspect-[1/3]', 'opacity-10', 'flex', 'z-10', 'absolute', 'inset-0', 'pointer-events-none')}
                    />
                    <div className='absolute inset-0 bg-gradient-to-b from-white to-black opacity-10 z-0 pointer-events-none' />
                </Card>
            </Layout>

        </Page >
    );
}


type Props = {
    data: any;
};

export const getStaticProps: GetStaticProps<Props> = async () => {

    const isCompleteResponse: any = await callReadOnlyFunction({
        network: new StacksMainnet(),
        contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
        contractName: "dme006-quest-completion",
        functionName: "is-complete",
        functionArgs: [principalCV('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS'), uintCV(1)],
        senderAddress: 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ'
    })

    const data = {
        completed: isCompleteResponse.value.value === 'true'
    }

    return {
        props: { data },
        revalidate: 60
    };
};

export const getStaticPaths = () => {
    return {
        paths: [
            {
                params: {
                    slug: '1',
                },
            }
        ],
        fallback: true
    };
}