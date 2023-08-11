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
import f1 from '@public/quests/f1.png'
import f2 from '@public/quests/f2.png'
import f3 from '@public/quests/f3.png'
import f4 from '@public/quests/f4.png'
import f5 from '@public/quests/f5.png'
import f6 from '@public/quests/f6.png'
import a1 from '@public/quests/a1.png'
import a2 from '@public/quests/a2.png'
import a3 from '@public/quests/a3.png'
import a4 from '@public/quests/a4.png'
import a5 from '@public/quests/a5.png'
import a6 from '@public/quests/a6.png'
import x1 from '@public/quests/x1.png'
import x2 from '@public/quests/x2.png'
import x3 from '@public/quests/x3.png'
import x4 from '@public/quests/x4.png'
import x5 from '@public/quests/x5.png'
import x6 from '@public/quests/x6.png'
import charismaGuildLogo from '@public/charisma.png'
import alexlabGuildLogo from '@public/ALEX_Token.webp'
import { cn } from '@lib/utils';
import React from 'react';

const data = [
    {
        id: 1,
        amount: 100,
        title: "Use the Charisma token faucet",
        subtitle: "Claim tokens from the Charisma faucet to complete this quest",
        href: "https://explorer.hiro.so/txid/0xfbd5310da4aa15578e3c35857c0b526e60d291466ddc52dea7584ee35589d985?chain=mainnet",
        src: f1,
        guildImg: charismaGuildLogo,
    },
    {
        id: 2,
        amount: 100,
        title: "Create an LP token on ALEX",
        subtitle: "Combine two tokens to create a liquidity pair token on ALEX Lab",
        href: "https://explorer.hiro.so/txid/0xfbd5310da4aa15578e3c35857c0b526e60d291466ddc52dea7584ee35589d985?chain=mainnet",
        src: a1,
        guildImg: alexlabGuildLogo,
    },
    {
        id: 3,
        amount: 100,
        title: "Send BTC with Hiro wallet",
        subtitle: "Send bitcoin using the Hiro wallet to complete this quest",
        href: "https://explorer.hiro.so/txid/0xfbd5310da4aa15578e3c35857c0b526e60d291466ddc52dea7584ee35589d985?chain=mainnet",
        src: x1,
        guildImg: '',
    },
    {
        id: 4,
        amount: 100,
        title: "Use the Charisma token faucet",
        subtitle: "Claim tokens from the Charisma faucet to complete this quest",
        href: "https://explorer.hiro.so/txid/0xfbd5310da4aa15578e3c35857c0b526e60d291466ddc52dea7584ee35589d985?chain=mainnet",
        src: f2,
        guildImg: charismaGuildLogo,
    },
    {
        id: 5,
        amount: 100,
        title: "Create an LP token on ALEX",
        subtitle: "Combine two tokens to create a liquidity pair token on ALEX Lab",
        href: "https://explorer.hiro.so/txid/0xfbd5310da4aa15578e3c35857c0b526e60d291466ddc52dea7584ee35589d985?chain=mainnet",
        src: a2,
        guildImg: alexlabGuildLogo,
    },
    {
        id: 6,
        amount: 100,
        title: "Mint a BRC-20 Token on Unisat",
        subtitle: "Mint a BRC-20 ordinal on Unisat to complete this quest",
        href: "https://explorer.hiro.so/txid/0xfbd5310da4aa15578e3c35857c0b526e60d291466ddc52dea7584ee35589d985?chain=mainnet",
        src: x2,
        guildImg: '',
    },
    {
        id: 7,
        amount: 100,
        title: "Use the Charisma token faucet",
        subtitle: "Claim tokens from the Charisma faucet to complete this quest",
        href: "https://explorer.hiro.so/txid/0xfbd5310da4aa15578e3c35857c0b526e60d291466ddc52dea7584ee35589d985?chain=mainnet",
        src: f6,
        guildImg: charismaGuildLogo,
    },
    {
        id: 8,
        amount: 100,
        title: "Create an LP token on ALEX",
        subtitle: "Combine two tokens to create a liquidity pair token on ALEX Lab",
        href: "https://explorer.hiro.so/txid/0xfbd5310da4aa15578e3c35857c0b526e60d291466ddc52dea7584ee35589d985?chain=mainnet",
        src: a3,
        guildImg: alexlabGuildLogo,
    },
    {
        id: 9,
        amount: 100,
        title: "Mint a BRC-20 Token on Unisat",
        subtitle: "Mint a BRC-20 ordinal on Unisat to complete this quest",
        href: "https://explorer.hiro.so/txid/0xfbd5310da4aa15578e3c35857c0b526e60d291466ddc52dea7584ee35589d985?chain=mainnet",
        src: x3,
        guildImg: '',
    },
    {
        id: 10,
        amount: 100,
        title: "Use the Charisma token faucet",
        subtitle: "Claim tokens from the Charisma faucet to complete this quest",
        href: "https://explorer.hiro.so/txid/0xfbd5310da4aa15578e3c35857c0b526e60d291466ddc52dea7584ee35589d985?chain=mainnet",
        src: f4,
        guildImg: charismaGuildLogo,
    },
    {
        id: 11,
        amount: 100,
        title: "Create an LP token on ALEX",
        subtitle: "Combine two tokens to create a liquidity pair token on ALEX Lab",
        href: "https://explorer.hiro.so/txid/0xfbd5310da4aa15578e3c35857c0b526e60d291466ddc52dea7584ee35589d985?chain=mainnet",
        src: a4,
        guildImg: alexlabGuildLogo,
    },
    {
        id: 12,
        amount: 100,
        title: "Swap a SIP-10 token on ALEX",
        subtitle: "Swap a SIP-10 token on ALEX Lab to complete this quest",
        href: "https://explorer.hiro.so/txid/0xfbd5310da4aa15578e3c35857c0b526e60d291466ddc52dea7584ee35589d985?chain=mainnet",
        src: x4,
        guildImg: alexlabGuildLogo,
    },
    {
        id: 13,
        amount: 100,
        title: "Use the Charisma token faucet",
        subtitle: "Claim tokens from the Charisma faucet to complete this quest",
        href: "https://explorer.hiro.so/txid/0xfbd5310da4aa15578e3c35857c0b526e60d291466ddc52dea7584ee35589d985?chain=mainnet",
        src: f5,
        guildImg: charismaGuildLogo,
    },
    {
        id: 14,
        amount: 100,
        title: "Create an LP token on ALEX",
        subtitle: "Combine two tokens to create a liquidity pair token on ALEX Lab",
        href: "https://explorer.hiro.so/txid/0xfbd5310da4aa15578e3c35857c0b526e60d291466ddc52dea7584ee35589d985?chain=mainnet",
        src: a5,
        guildImg: alexlabGuildLogo,
    },
    {
        id: 15,
        amount: 100,
        title: "Swap a SIP-10 token on ALEX",
        subtitle: "Swap a SIP-10 token on ALEX Lab to complete this quest",
        href: "https://explorer.hiro.so/txid/0xfbd5310da4aa15578e3c35857c0b526e60d291466ddc52dea7584ee35589d985?chain=mainnet",
        src: x5,
        guildImg: alexlabGuildLogo,
    },
    {
        id: 16,
        amount: 100,
        title: "Create an LP token on ALEX",
        subtitle: "Combine two tokens to create a liquidity pair token on ALEX Lab",
        href: "https://explorer.hiro.so/txid/0xfbd5310da4aa15578e3c35857c0b526e60d291466ddc52dea7584ee35589d985?chain=mainnet",
        src: a6,
        guildImg: alexlabGuildLogo,
    },
    {
        id: 17,
        amount: 100,
        title: "Send BTC using Hiro wallet",
        subtitle: "Send bitcoin using the Hiro wallet to complete this quest",
        href: "https://explorer.hiro.so/txid/0xfbd5310da4aa15578e3c35857c0b526e60d291466ddc52dea7584ee35589d985?chain=mainnet",
        src: x6,
        guildImg: '',
    },
]

export default function QuestDetail(props: any) {
    const { query } = useRouter();
    console.log(query.slug)
    const meta = {
        title: 'Charisma | Quest-to-Earn',
        description: META_DESCRIPTION
    };

    const [questAccepted, setQuestAccepted] = React.useState(false)

    const quest = data.find(p => String(p.id) === query.slug)

    return (
        <Page meta={meta} fullViewport>
            <Layout className='m-2 sm:container sm:mx-auto sm:py-10 items-center'>
                <Card className='bg-black text-primary-foreground border-accent-foreground p-0 relative overflow-hidden rounded-md group/card w-full max-w-2xl'>
                    <CardHeader className='p-4 z-20 '>
                        <CardTitle className='text-xl font-semibold'>{quest?.title}</CardTitle>
                        <CardDescription className='text-sm font-fine text-foreground'>{quest?.subtitle}</CardDescription>
                        <div className=''>
                            <CardTitle className='text-xl font-semibold'>Rewards</CardTitle>
                            <CardDescription className='text-sm font-fine text-foreground mb-4'>You will recieve:</CardDescription>
                            <div className='grid gap-4 grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10'>
                                {quest?.guildImg ?
                                    <Image src={quest?.guildImg as any} alt='alex-lab-logo' className='bg-white rounded-full border w-full z-30' />
                                    : <div className='h-20 w-20 bg-white rounded-full border z-30' />
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
                        className={cn("w-auto object-cover", "aspect-[1/2]", 'opacity-10', 'flex', 'z-10', 'absolute', 'inset-0', 'pointer-events-none')}
                    />
                    <div className='absolute inset-0 bg-gradient-to-b from-white to-transparent opacity-30 z-0 pointer-events-none' />
                </Card>
            </Layout>

        </Page >
    );
}
