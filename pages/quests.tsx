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

import { GetStaticProps } from 'next';
import { SkipNavContent } from '@reach/skip-nav';

import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import Layout from '@components/layout';
import { cn } from '@lib/utils';
import Image from 'next/image';
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
import uwuLogo from '@public/uwuLogo.png'
import charismaGuildLogo from '@public/charisma.png'
import alexlabGuildLogo from '@public/ALEX_Token.webp'
import xverseLogo from '@public/xverseLogo.png'
import unisatLogo from '@public/unisatLogo.jpg'
import nomeLogo from '@public/nomeLogo.jpg'
import liquidium4 from '@public/quests/liquidium4.png'
import liquidium5 from '@public/quests/liquidium5.png'
import liquidium6 from '@public/quests/liquidium6.png'
import liquidiumLogo from '@public/liquidiumLogo.jpeg'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@components/ui/card"
import Link from 'next/link';

type Props = {
  data: any[];
};

export default function Quests({ data }: Props) {
  const meta = {
    title: 'Charisma | Quest to Earn',
    description: META_DESCRIPTION
  };

  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <div className="m-2 sm:container sm:mx-auto sm:py-10">
          {/* text letting user know quests are in preview mode and are non-functional and for demonstration purposes only */}
          <div className='text-center text-sm sm:text-xl font-fine text-yellow-200 mb-4'>
            Quests are in preview mode, and are for demonstration purposes only. For questions or comments, join Discord.
          </div>
          <div className='grid gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {data.map((quest) => (
              <Card key={quest.id} className='bg-black text-primary-foreground border-accent-foreground p-0 flex relative overflow-hidden rounded-md group/card'>
                <Link href={`quests/${quest.id}`} className='w-full'>
                  <CardContent className='p-0 w-full'>
                    <CardHeader className="z-20 absolute inset-0 h-min backdrop-blur-sm group-hover/card:backdrop-blur-3xl p-2">
                      <div className='flex gap-2'>
                        <div className='min-w-max'>
                          {quest.guildImg ?
                            <Image src={quest.guildImg} alt='alex-lab-logo' className='h-10 w-10 bg-white rounded-full border grow' />
                            : <div className='h-10 w-10 bg-white rounded-full border' />
                          }
                        </div>
                        <div className=''>
                          <div className='text-sm font-semibold text-secondary leading-none'>
                            {quest.title}
                          </div>
                          <div className='text-xs font-fine text-secondary leading-tight mt-1'>
                            {quest.subtitle}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <Image
                      src={quest.src}
                      alt={quest.alt}
                      className={cn("w-full object-cover transition-all group-hover/card:scale-105", "aspect-[1/2]", 'opacity-75', 'group-hover/card:opacity-100', 'flex', 'z-10', 'relative')}
                    />
                    <div className='absolute inset-0 bg-gradient-to-b from-white to-transparent opacity-30 z-0' />
                    <CardFooter className='z-20 absolute inset-0 top-auto flex justify-end p-2'>
                    </CardFooter>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    </Page>
  );
}

export const getStaticProps: GetStaticProps<Props> = () => {
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

  return {
    props: {
      data
    },
    revalidate: 60
  };
};
