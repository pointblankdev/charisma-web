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
// dwarves
import x2 from '@public/quests/x2.png'
import x3 from '@public/quests/x3.png'
// male alchemist
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

function getRandomImage(images: any[]) {
  const randomIndex = Math.floor(Math.random() * images.length);
  return images[randomIndex];
}


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


export const data = [
  {
    id: 1,
    amount: 100,
    title: "Charismatic Flow",
    subtitle: "A quest of allure, magic, and the promise of brighter future",
    href: "https://explorer.hiro.so/txid/0xfbd5310da4aa15578e3c35857c0b526e60d291466ddc52dea7584ee35589d985?chain=mainnet",
    src: getRandomImage([f1, f2, f4, f5]),
    guildImg: charismaGuildLogo,
    objectives: [{
      text: 'Claim Charisma Tokens from the Faucet',
      metric: '0/1'
    }],
    description: [
      `The city awakens to a golden dawn, and with it comes murmurs of an ethereal gift nestled amidst the peaks of the Stacks Mountains. The Charisma Token, a blend of magic and bitcoin brilliance, is no mere currency. It embodies the very essence of allure and power. And the source of this treasure? A legendary fountain, veiled in mists and myth, known to many as the Charisma Faucet.`,
      ` At the heart of the city square, a monument stands - adorned with the emblem of the Charisma Guild. Below this sigil flows a stream of pure crystal water, with a shimmer suggesting untold magic within. Beside it, a robed sage, with wisdom etched on his features, narrates tales of champions who've ventured into the mountains, driven by dreams of Charisma Tokens.`,
      ` His gaze fixes upon you, and with a gentle nod, he whispers, "The fountain awaits. Will you rise to the challenge and bring back the tokens of Charisma?`,
    ],
  },
  {
    id: 2,
    amount: 100,
    title: "Alchemical Fusion at ALEX Lab",
    subtitle: "Venture into the realm of alchemy and forge liquidity anew",
    href: "https://explorer.hiro.so/txid/0xfbd5310da4aa15578e3c35857c0b526e60d291466ddc52dea7584ee35589d985?chain=mainnet",
    src: getRandomImage([a1, a3, a5, a6]),
    guildImg: alexlabGuildLogo,
    objectives: [{
      text: 'Create Liquidity Pair Tokens in ALEX Lab',
      metric: '0/1'
    }],
    description: [
      `In a realm where the pulse of Bitcoin illuminates every shadow, ALEX Lab stands as a beacon of innovation and wonder. Nestled at the intersection of magic and logic, this sanctuary is often cloaked in mystery, known only to the select few with a thirst for alchemical pursuits.`,
      ` A siren's song resonates through the alleys and marketplaces, a melody imbued with the power of two tokens becoming one. A fusion, they say, more profound than mere combination. It's the alchemy of liquidity, a dance of elements led by the grand alchemists of ALEX Lab.`,
      ` As you navigate the bustling streets, a sigil marked with an X – the emblem of ALEX Lab – catches your gaze. An enigmatic figure, draped in robes that shimmer like the night sky, beckons. "Do you seek the secrets of the Liquidity Pair Token?" she inquires with a knowing smile, offering you a chance to be a part of this transcendent fusion.`,
    ]
  },
  {
    id: 'uwu1',
    amount: 100,
    title: "Whispers of the Celestial Muse",
    subtitle: "Dance in the rhythm of ancient ledgers and new promises",
    href: "https://explorer.hiro.so/txid/0xfbd5310da4aa15578e3c35857c0b526e60d291466ddc52dea7584ee35589d985?chain=mainnet",
    src: getRandomImage([uwu1, uwu2, uwu7]),
    guildImg: uwuLogo,
    objectives: [{
      text: 'Borrow stablecoins from UWU',
      metric: '0/10'
    }],
    description: [
      `Amidst the vibrant festivities of a grand city celebration, a dance of elegance and allure unfolds. At its center, a figure, resplendent in hues of dark orange and radiant gold, gracefully moves with the finesse reminiscent of ancient sages. Her pink garments, dancing with every gust of wind, tell tales of old-world charm and wisdom.`,
      ` As the crowd stands mesmerized, hanging onto every swirl, every gesture of her performance, she catches your eye. This isn't a mere glance; it's a call. When the applause resonates through the streets, she motions you towards her.`,
      ` In the serenity of a lush garden nearby, she identifies herself as the Ethereal Dreamweaver, not just a guardian of forgotten realms but also a curator of cryptic ledgers. With a voice as soft as silk, she speaks of the balance in the universe, stability in all things. She introduces you to U'wu, a celestial ledger that keeps the balance of the cosmos.`,
      ` She entrusts you with a challenge, "Take from U'wu– and become a part of the eternal balance. Are you ready to engage in this dance of trust and responsibility?"`,
    ]
  },
  {
    id: 101,
    amount: 100,
    title: "Echoes of the Fragmented Canvas",
    subtitle: "Unearth the artistry and contribute to the canvas of legends",
    href: "https://explorer.hiro.so/txid/0xfbd5310da4aa15578e3c35857c0b526e60d291466ddc52dea7584ee35589d985?chain=mainnet",
    src: getRandomImage([nome4, nome5, nome6, nome7]),
    guildImg: nomeLogo,
    objectives: [{
      text: 'Mint a NōME Block Ordinal and add to the masterpiece',
      metric: '0/1'
    }],
    description: [
      `In a realm where artistry merges with the pulse of blockchain, an ancient riddle echoes – a canvas, vast and untouched, waits to be unveiled. Each block, a fragment; each fragment, a story waiting to be told. This is the world of NōME, where the tangible meets the ethereal.`,
      ` Amidst the galleries of creation, a fabled artist, renowned for her ethereal strokes painted in hues of starlight and dusk, beckons you closer. Her attire, reminiscent of galaxies far away, swirls as she presents a challenge only the truly dedicated can undertake.`,
      ` "Complete the Canvas," she whispers, her voice laden with the magic of forgotten realms. "A Canvas of 100 blocks, each carrying a sliver of the grand tapestry. Will you contribute your vision and be part of this timeless creation?"`
    ]
  },
  {
    id: 3,
    amount: 100,
    title: "The Luminous Ledger of Xverse",
    subtitle: "A beacon of innovation beckons you to transact in bitcoin",
    href: "https://explorer.hiro.so/txid/0xfbd5310da4aa15578e3c35857c0b526e60d291466ddc52dea7584ee35589d985?chain=mainnet",
    src: getRandomImage([h1, h3]),
    guildImg: xverseLogo,
    objectives: [{
      text: 'Use the Xverse wallet to send bitcoin',
      metric: '0/1'
    }],
    description: [
      `As dawn's first light graces the city, whispers rise among its citizens about a novel means of trading their most precious asset - bitcoin. A magnificent vessel, radiant in its design and teeming with innovation, has anchored itself in the town's center. Emblazoned on its mast is the emblem of the Xverse Guild, a name synonymous with pioneering strides in the bitcoin domain.`,
      ` Near this ship, an elegant merchant, adorned in lavish robes embroidered with gold and silver threads, extends an invitation to all. She speaks of the Xverse wallet, a tool of the future, designed to handle bitcoin transactions with unparalleled ease and security.`,
      ` Captivated by her tales and the promise of a new dawn in trading, she turns to you, handing over a gleaming device, the very Xverse wallet she praised. "Champion," she begins, "Would you demonstrate its might by sending bitcoin? Show the city that the future of transactions is here."`
    ]
  },
  {
    id: 993,
    amount: 100,
    title: "Dance of the Luminous Depths",
    subtitle: "Engage in a mystical communion with the Majestic Luminance",
    href: "https://explorer.hiro.so/txid/0xfbd5310da4aa15578e3c35857c0b526e60d291466ddc52dea7584ee35589d985?chain=mainnet",
    src: getRandomImage([liquidium4, liquidium5, liquidium6]),
    guildImg: liquidiumLogo,
    objectives: [{
      text: 'Borrow bitcoin with ordinals on Liquidium',
      metric: '0/1'
    }],
    description: [
      `Amidst the vast, digital seas, a vision of ethereal beauty emerges from the silent abyss. A colossal jellyfish, its body pulsating with the mysteries of the moonlit night and the first blush of dawn. Its tentacles, tendrils of liquid light, weave a mesmerizing dance, beckoning those who dare to approach its grandeur.`,
      ` Within the Liquidium reefs, elders speak of the Majestic Luminance - a guardian jellyfish believed to be the living embodiment of Liquidium's legacy. Legend holds that the glow of this otherworldly creature can guide souls to the enigmatic depths where they can pledge their cherished ordinals. In return, the Majestic Luminance blesses them with the pure essence of the digital realm's most treasured possession – native bitcoin.`,
      ` As you draw nearer to the Majestic Luminance, a harmonious hum envelops you, whispering promises of ancient secrets and bounties from the depths. "Pledge, and the abyss shall reward thee." Do you dare to heed the call of the Dance of the Luminous Depths?`
    ]
  },
  {
    id: 15,
    amount: 100,
    title: "The Alchemist's Conundrum",
    subtitle: "Engage in the ancient rite of the token swap",
    href: "https://explorer.hiro.so/txid/0xfbd5310da4aa15578e3c35857c0b526e60d291466ddc52dea7584ee35589d985?chain=mainnet",
    src: getRandomImage([x4, x5]),
    guildImg: alexlabGuildLogo,
    objectives: [{
      text: 'Perform a token swap on ALEX Lab',
      metric: '0/1'
    }],
    description: [
      `In the heart of the bustling digital agora, the figure of a seasoned alchemist emerges from the swirling mists of time. Cloaked in garments resonating with ancient sigils and forgotten runes, he is a bridge between the world of alchemical lore and the modern realm of blockchain alchemy.`,
      ` Master Aleron, as he introduces himself, is a custodian of ALEX Lab, a crucible where digital elements morph and fuse under his experienced hands. He's revered for his uncanny ability to discern the true essence of any token, guiding it through transmutations unknown to the average trader.`,
      ` As you engage with him, Master Aleron presents a challenge, an alchemical riddle intertwined with the very fabric of blockchain. "Can you master the ritual of the swap?" he asks, his eyes gleaming with curiosity. "Dare you trade old for new, known for unknown, in the arcane dance of digital metamorphosis?"`,
      ` The gauntlet has been thrown. Will you rise to the alchemist's challenge and prove your mastery over the token swap?`
    ]
  },
  {
    id: 6,
    amount: 100,
    title: "Secrets of the Deepforge",
    subtitle: "Forge your destiny in the fires of Unisat's digital crucible",
    href: "https://explorer.hiro.so/txid/0xfbd5310da4aa15578e3c35857c0b526e60d291466ddc52dea7584ee35589d985?chain=mainnet",
    src: getRandomImage([x2, x3]),
    guildImg: unisatLogo,
    objectives: [{
      text: 'Mint a BRC-20 ordinal in Unisat',
      metric: '0/1'
    }],
    description: [
      `The hustle and clatter of the marketplace fade as you stumble upon a vivid tapestry depicting the Deepforge clan, a venerable line of dwarves known for their unmatched mining prowess and insatiable thirst for unearthing the hidden treasures of the earth. The heart of the tapestry pulsates with a moment of discovery: a cadre of determined dwarves, lanterns aglow, unveiling a luminescent artifact that radiates with the very essence of the blockchain.`,
      ` Word in the winding alleyways is that these dwarves, under the banner of the Unisat Guild, have unearthed a technique to crystallize these digital treasures into coveted ordinals.`,
      ` Elder Durim, the venerable leader of this discovery expedition, extends a hand of invitation to those daring enough to venture into the digital deep and mold the raw essence of the blockchain into the pristine form of a fungible token.`,
      ` The mines beckon. Do you possess the mettle to follow in the footsteps of the Deepforge clan and mint your own legacy from the blockchain?`
    ]
  },
]

export const getStaticProps: GetStaticProps<Props> = () => {

  return {
    props: {
      data
    },
    revalidate: 60
  };
};
