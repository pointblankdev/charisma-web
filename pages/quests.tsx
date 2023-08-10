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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@components/ui/card"

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
        <div className="container mx-auto py-10">
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            {data.map((quest) => (
              <Card key={quest.id} className='bg-black text-primary-foreground border-accent-foreground p-0 flex relative overflow-hidden rounded-md'>
                <CardContent className='p-0'>
                  <div className="z-20 absolute inset-0 h-min backdrop-blur-sm p-2">
                    <div className='text-sm font-semibold text-secondary '>
                      {quest.title}
                    </div>
                    <div className='text-xs font-fine text-secondary leading-tight mt-1'>
                      {quest.subtitle}
                    </div>
                  </div>
                  <Image
                    src={quest.src}
                    alt={quest.alt}
                    className={cn("w-auto object-cover transition-all hover:scale-105", "aspect-[1/2]", 'opacity-75', 'hover:opacity-100', 'flex', 'z-10', 'relative')}
                  />
                  <div className='absolute inset-0 bg-gradient-to-b from-white to-transparent opacity-30 z-0' />
                </CardContent>
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
      id: "001",
      amount: 100,
      title: "Use the Charisma Token Faucet",
      subtitle: "Claim tokens from the Charisma Faucet to completed this quest",
      href: "https://explorer.hiro.so/txid/0xfbd5310da4aa15578e3c35857c0b526e60d291466ddc52dea7584ee35589d985?chain=mainnet",
      src: f1,
    },
    {
      id: "001",
      amount: 100,
      title: "Create an LP token on ALEX",
      subtitle: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      href: "https://explorer.hiro.so/txid/0xfbd5310da4aa15578e3c35857c0b526e60d291466ddc52dea7584ee35589d985?chain=mainnet",
      src: a1,
    },
    {
      id: "001",
      amount: 100,
      title: "Send Bitcoin using Hiro Wallet",
      subtitle: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      href: "https://explorer.hiro.so/txid/0xfbd5310da4aa15578e3c35857c0b526e60d291466ddc52dea7584ee35589d985?chain=mainnet",
      src: x1,
    },
    {
      id: "001",
      amount: 100,
      title: "The Charisma Token Faucet",
      subtitle: "Claim tokens from the Charisma Faucet to completed this quest",
      href: "https://explorer.hiro.so/txid/0xfbd5310da4aa15578e3c35857c0b526e60d291466ddc52dea7584ee35589d985?chain=mainnet",
      src: f2,
    },
    {
      id: "001",
      amount: 100,
      title: "Create an LP token on ALEX",
      subtitle: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      href: "https://explorer.hiro.so/txid/0xfbd5310da4aa15578e3c35857c0b526e60d291466ddc52dea7584ee35589d985?chain=mainnet",
      src: a2,
    },
    {
      id: "001",
      amount: 100,
      title: "Mint a BRC-20 Token on Unisat",
      subtitle: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      href: "https://explorer.hiro.so/txid/0xfbd5310da4aa15578e3c35857c0b526e60d291466ddc52dea7584ee35589d985?chain=mainnet",
      src: x2,
    },
    {
      id: "001",
      amount: 100,
      title: "The Charisma Token Faucet",
      subtitle: "Claim tokens from the Charisma Faucet to completed this quest",
      href: "https://explorer.hiro.so/txid/0xfbd5310da4aa15578e3c35857c0b526e60d291466ddc52dea7584ee35589d985?chain=mainnet",
      src: f3,
    },
    {
      id: "001",
      amount: 100,
      title: "Create an LP token on ALEX",
      subtitle: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      href: "https://explorer.hiro.so/txid/0xfbd5310da4aa15578e3c35857c0b526e60d291466ddc52dea7584ee35589d985?chain=mainnet",
      src: a3,
    },
    {
      id: "001",
      amount: 100,
      title: "Mint a BRC-20 Token on Unisat",
      subtitle: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      href: "https://explorer.hiro.so/txid/0xfbd5310da4aa15578e3c35857c0b526e60d291466ddc52dea7584ee35589d985?chain=mainnet",
      src: x3,
    },
    {
      id: "001",
      amount: 100,
      title: "The Charisma Token Faucet",
      subtitle: "Claim tokens from the Charisma Faucet to completed this quest",
      href: "https://explorer.hiro.so/txid/0xfbd5310da4aa15578e3c35857c0b526e60d291466ddc52dea7584ee35589d985?chain=mainnet",
      src: f4,
    },
    {
      id: "001",
      amount: 100,
      title: "Create an LP token on ALEX",
      subtitle: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      href: "https://explorer.hiro.so/txid/0xfbd5310da4aa15578e3c35857c0b526e60d291466ddc52dea7584ee35589d985?chain=mainnet",
      src: a4,
    },
    {
      id: "001",
      amount: 100,
      title: "Swap a SIP-10 token on ALEX",
      subtitle: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      href: "https://explorer.hiro.so/txid/0xfbd5310da4aa15578e3c35857c0b526e60d291466ddc52dea7584ee35589d985?chain=mainnet",
      src: x4,
    },
    {
      id: "001",
      amount: 100,
      title: "The Charisma Token Faucet",
      subtitle: "Claim tokens from the Charisma Faucet to completed this quest",
      href: "https://explorer.hiro.so/txid/0xfbd5310da4aa15578e3c35857c0b526e60d291466ddc52dea7584ee35589d985?chain=mainnet",
      src: f5,
    },
    {
      id: "001",
      amount: 100,
      title: "Create an LP token on ALEX",
      subtitle: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      href: "https://explorer.hiro.so/txid/0xfbd5310da4aa15578e3c35857c0b526e60d291466ddc52dea7584ee35589d985?chain=mainnet",
      src: a5,
    },
    {
      id: "001",
      amount: 100,
      title: "Swap a SIP-10 token on ALEX",
      subtitle: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      href: "https://explorer.hiro.so/txid/0xfbd5310da4aa15578e3c35857c0b526e60d291466ddc52dea7584ee35589d985?chain=mainnet",
      src: x5,
    },
    {
      id: "001",
      amount: 100,
      title: "The Charisma Token Faucet",
      subtitle: "Claim tokens from the Charisma Faucet to completed this quest",
      href: "https://explorer.hiro.so/txid/0xfbd5310da4aa15578e3c35857c0b526e60d291466ddc52dea7584ee35589d985?chain=mainnet",
      src: f6,
    },
    {
      id: "001",
      amount: 100,
      title: "Create an LP token on ALEX",
      subtitle: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      href: "https://explorer.hiro.so/txid/0xfbd5310da4aa15578e3c35857c0b526e60d291466ddc52dea7584ee35589d985?chain=mainnet",
      src: a6,
    },
    {
      id: "001",
      amount: 100,
      title: "Send Bitcoin using Hiro Wallet",
      subtitle: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      href: "https://explorer.hiro.so/txid/0xfbd5310da4aa15578e3c35857c0b526e60d291466ddc52dea7584ee35589d985?chain=mainnet",
      src: x6,
    },
  ]

  return {
    props: {
      data
    },
    revalidate: 60
  };
};
