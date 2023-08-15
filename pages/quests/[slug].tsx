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
import f4 from '@public/quests/f4.png'
import f5 from '@public/quests/f5.png'
import a1 from '@public/quests/a1.png'
import a3 from '@public/quests/a3.png'
import a5 from '@public/quests/a5.png'
import a6 from '@public/quests/a6.png'
import x2 from '@public/quests/x2.png'
import x4 from '@public/quests/x4.png'
import x5 from '@public/quests/x5.png'
import h1 from '@public/quests/h1.png'
import h3 from '@public/quests/h3.png'
import nome4 from '@public/quests/nome4.png'
import nome5 from '@public/quests/nome5.png'
import nome6 from '@public/quests/nome6.png'
import nome7 from '@public/quests/nome7.png'
import uwu1 from '@public/quests/uwu1.png'
import uwu2 from '@public/quests/uwu2.png'
import uwu7 from '@public/quests/uwu7.png'
import charismaGuildLogo from '@public/charisma.png'
import alexlabGuildLogo from '@public/ALEX_Token.webp'
import xverseLogo from '@public/xverseLogo.png'
import unisatLogo from '@public/unisatLogo.jpg'
import nomeLogo from '@public/nomeLogo.jpg'
import uwuLogo from '@public/uwuLogo.png'
import liquidium4 from '@public/quests/liquidium4.png'
import liquidium5 from '@public/quests/liquidium5.png'
import liquidium6 from '@public/quests/liquidium6.png'
import liquidiumLogo from '@public/liquidiumLogo.jpeg'
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
        id: 'uwu1',
        amount: 100,
        title: "Borrow stablecoins on UWU",
        subtitle: "Borrow against your STX collateral at 0% interest to complete this quest",
        href: "https://explorer.hiro.so/txid/0xfbd5310da4aa15578e3c35857c0b526e60d291466ddc52dea7584ee35589d985?chain=mainnet",
        src: uwu1,
        guildImg: uwuLogo,
    },
    {
        id: 101,
        amount: 100,
        title: "Mint a NōME Block",
        subtitle: "100 blocks = 100 fractions of one canvas",
        href: "https://explorer.hiro.so/txid/0xfbd5310da4aa15578e3c35857c0b526e60d291466ddc52dea7584ee35589d985?chain=mainnet",
        src: nome7,
        guildImg: nomeLogo,
    },
    {
        id: 3,
        amount: 100,
        title: "Send BTC with Xverse wallet",
        subtitle: "Send bitcoin using the Xverse wallet to complete this quest",
        href: "https://explorer.hiro.so/txid/0xfbd5310da4aa15578e3c35857c0b526e60d291466ddc52dea7584ee35589d985?chain=mainnet",
        src: h1,
        guildImg: xverseLogo,
    },
    {
        id: 102,
        amount: 100,
        title: "Mint a NōME Block",
        subtitle: "100 blocks = 100 fractions of one canvas",
        href: "https://explorer.hiro.so/txid/0xfbd5310da4aa15578e3c35857c0b526e60d291466ddc52dea7584ee35589d985?chain=mainnet",
        src: nome4,
        guildImg: nomeLogo,
    },
    {
        id: 993,
        amount: 100,
        title: "Borrow bitcoin on Liquidium",
        subtitle: "Use your ordinals as collateral to borrow native BTC to complete this quest",
        href: "https://explorer.hiro.so/txid/0xfbd5310da4aa15578e3c35857c0b526e60d291466ddc52dea7584ee35589d985?chain=mainnet",
        src: liquidium6,
        guildImg: liquidiumLogo,
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
        id: 15,
        amount: 100,
        title: "Swap a SIP-10 token on ALEX",
        subtitle: "Swap a SIP-10 token on ALEX Lab to complete this quest",
        href: "https://explorer.hiro.so/txid/0xfbd5310da4aa15578e3c35857c0b526e60d291466ddc52dea7584ee35589d985?chain=mainnet",
        src: x5,
        guildImg: alexlabGuildLogo,
    },
    {
        id: 'uwu7',
        amount: 100,
        title: "Borrow stablecoins on UWU",
        subtitle: "Borrow against your STX collateral at 0% interest to complete this quest",
        href: "https://explorer.hiro.so/txid/0xfbd5310da4aa15578e3c35857c0b526e60d291466ddc52dea7584ee35589d985?chain=mainnet",
        src: uwu7,
        guildImg: uwuLogo,
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
        id: 6,
        amount: 100,
        title: "Mint a BRC-20 Token on Unisat",
        subtitle: "Mint a BRC-20 ordinal on Unisat to complete this quest",
        href: "https://explorer.hiro.so/txid/0xfbd5310da4aa15578e3c35857c0b526e60d291466ddc52dea7584ee35589d985?chain=mainnet",
        src: x2,
        guildImg: unisatLogo,
    },
    {
        id: 991,
        amount: 100,
        title: "Borrow bitcoin on Liquidium",
        subtitle: "Use your ordinals as collateral to borrow native BTC to complete this quest",
        href: "https://explorer.hiro.so/txid/0xfbd5310da4aa15578e3c35857c0b526e60d291466ddc52dea7584ee35589d985?chain=mainnet",
        src: liquidium4,
        guildImg: liquidiumLogo,
    },
    {
        id: 103,
        amount: 100,
        title: "Mint a NōME Block",
        subtitle: "100 blocks = 100 fractions of one canvas",
        href: "https://explorer.hiro.so/txid/0xfbd5310da4aa15578e3c35857c0b526e60d291466ddc52dea7584ee35589d985?chain=mainnet",
        src: nome5,
        guildImg: nomeLogo,
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
        id: 12,
        amount: 100,
        title: "Swap a SIP-10 token on ALEX",
        subtitle: "Swap a SIP-10 token on ALEX Lab to complete this quest",
        href: "https://explorer.hiro.so/txid/0xfbd5310da4aa15578e3c35857c0b526e60d291466ddc52dea7584ee35589d985?chain=mainnet",
        src: x4,
        guildImg: alexlabGuildLogo,
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
        id: 'uwu2',
        amount: 100,
        title: "Borrow stablecoins on UWU",
        subtitle: "Borrow against your STX collateral at 0% interest to complete this quest",
        href: "https://explorer.hiro.so/txid/0xfbd5310da4aa15578e3c35857c0b526e60d291466ddc52dea7584ee35589d985?chain=mainnet",
        src: uwu2,
        guildImg: uwuLogo,
    },
    {
        id: 992,
        amount: 100,
        title: "Borrow bitcoin on Liquidium",
        subtitle: "Use your ordinals as collateral to borrow native BTC to complete this quest",
        href: "https://explorer.hiro.so/txid/0xfbd5310da4aa15578e3c35857c0b526e60d291466ddc52dea7584ee35589d985?chain=mainnet",
        src: liquidium5,
        guildImg: liquidiumLogo,
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
        title: "Send BTC using Xverse wallet",
        subtitle: "Send bitcoin using the Xverse wallet to complete this quest",
        href: "https://explorer.hiro.so/txid/0xfbd5310da4aa15578e3c35857c0b526e60d291466ddc52dea7584ee35589d985?chain=mainnet",
        src: h3,
        guildImg: xverseLogo,
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
        id: 104,
        amount: 100,
        title: "Mint a NōME Block",
        subtitle: "100 blocks = 100 fractions of one canvas",
        href: "https://explorer.hiro.so/txid/0xfbd5310da4aa15578e3c35857c0b526e60d291466ddc52dea7584ee35589d985?chain=mainnet",
        src: nome6,
        guildImg: nomeLogo,
    },
]

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
                        className={cn("w-auto object-cover", "aspect-[1/2]", 'opacity-10', 'flex', 'z-10', 'absolute', 'inset-0', 'pointer-events-none')}
                    />
                    <div className='absolute inset-0 bg-gradient-to-b from-white to-transparent opacity-10 z-0 pointer-events-none' />
                </Card>
            </Layout>

        </Page >
    );
}
