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
import { data } from 'pages/quests';

export default function QuestDetail(props: any) {
    const { query } = useRouter();
    const meta = {
        title: 'Charisma | Quest-to-Earn',
        description: META_DESCRIPTION
    };

    const [questAccepted, setQuestAccepted] = React.useState(false)

    const quest = data.find(p => String(p.id) === query.slug)

    return (
        <Page meta={meta} fullViewport>
            <Layout className='m-2 sm:container sm:mx-auto sm:py-10 items-center'>
                {/* text letting user know quests are in preview mode and are non-functional and for demonstration purposes only */}
                <div className='text-center text-sm sm:text-xl font-fine text-yellow-200 mb-4'>
                    Quests are in preview mode, and are for demonstration purposes only. For questions or comments, join Discord.
                </div>
                <Card className='bg-black text-primary-foreground border-accent-foreground p-0 relative overflow-hidden rounded-md group/card w-full max-w-2xl'>
                    <CardHeader className='p-4 z-20 '>
                        <CardTitle className='text-xl font-semibold z-30'>{quest?.title}</CardTitle>
                        <CardDescription className='text-sm font-fine text-foreground z-30'>{quest?.subtitle}</CardDescription>
                        <div className='z-20'>
                            <CardTitle className='text-xl font-semibold z-30'>Rewards</CardTitle>
                            <CardDescription className='text-sm font-fine text-foreground mb-4 z-30'>You will recieve:</CardDescription>
                            <div className='grid gap-4 grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10'>
                                {quest?.guildImg ?
                                    <Image src={quest?.guildImg as any} alt='alex-lab-logo' className='bg-white rounded-full border w-full z-30' />
                                    : <div className='h-16 w-16 bg-white rounded-full border z-30' />
                                }
                            </div>
                        </div>
                    </CardHeader>
                    {!questAccepted && <CardFooter className="p-4 flex justify-between z-30">
                        <Link href='/quests'><Button variant="ghost">Cancel</Button></Link>
                        <Button variant="ghost" className='text-primary hover:bg-white hover:text-primary' onClick={() => setQuestAccepted(true)}>Accept</Button>
                    </CardFooter>}

                    {questAccepted && <CardContent className='p-0 z-20'>
                        <div className=''>
                            {/* blog post from DatoCMS goes here */}
                            <div className='h-[384px] sm:h-[800px] border border-dashed border-gray-900'>
                            </div>
                        </div>
                    </CardContent>}
                    {questAccepted && <CardFooter className="p-4 flex justify-between z-20">
                        <Link href='/quests'><Button variant="ghost">Back</Button></Link>
                        <Button variant="ghost" className='text-primary hover:bg-white hover:text-primary'>Claim Rewards</Button>
                    </CardFooter>}
                    <Image
                        src={quest?.src as any}
                        alt={'alex-lab-quest'}
                        className={cn("object-cover", "aspect-[1/2]", 'opacity-10', 'flex', 'z-10', 'absolute', 'inset-0', 'pointer-events-none')}
                    />
                    <div className='absolute inset-0 bg-gradient-to-b from-white to-transparent opacity-10 z-0 pointer-events-none' />
                </Card>
            </Layout>

        </Page >
    );
}
