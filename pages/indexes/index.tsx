import { GetStaticProps } from 'next';
import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import Layout from '@components/layout';
import liquidStakedWelsh from '@public/liquid-staked-welshcorgicoin.png';
import liquidStakedRoo from '@public/liquid-staked-roo.png';
import liquidStakedOdin from '@public/liquid-staked-odin.png';
import { PlusIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import Image from 'next/image';

type Props = {
  indexes: any[];
};

export const getStaticProps: GetStaticProps<Props> = () => {
  const apps = [
    {
      guild: {
        logo: {
          url: '/woo-icon.png'
        }
      },
      title: `Roo Flair's Bizarre Adventure`,
      ticker: 'WOO',
      subtitle: 'The fight to save the Spirit of Bitcoin',
      cardImage: {
        url: '/woo-1.png'
      },
      slug: '/crafting/woo',
      wip: false,
      apps: [
        { slug: '/stake/welsh', img: liquidStakedWelsh },
        { slug: '/stake/roo', img: liquidStakedRoo }
      ]
    },
    {
      guild: {
        logo: {
          url: '/fenrir-icon-2.png'
        }
      },
      title: 'Fenrir, Corgi of Ragnarok',
      ticker: 'FENRIR',
      subtitle: '...and the end of the world',
      cardImage: {
        url: '/fenrir-21.png'
      },
      slug: '/crafting/fenrir',
      wip: false,
      apps: [
        { slug: '/stake/welsh', img: liquidStakedWelsh },
        { slug: '/stake/odin', img: liquidStakedOdin }
      ]
    },
    {
      guild: {
        logo: {
          url: '/woooooo.webp'
        }
      },
      title: 'Wooo! (Deprecated)',
      ticker: 'WOOO',
      subtitle: 'sWELSH + sROO = WOOO',
      cardImage: {
        url: '/wooo-title-belt.gif'
      },
      slug: '/crafting/wooo',
      wip: true,
      apps: [
        { slug: '/stake/welsh', img: liquidStakedWelsh },
        { slug: '/stake/roo', img: liquidStakedRoo }
      ]
    }
  ];

  return {
    props: {
      indexes: apps
    },
    revalidate: 60
  };
};

export default function Crafting({ indexes }: Props) {
  const meta = {
    title: 'Charisma | Crafting',
    description: META_DESCRIPTION,
    image: '/fenrir-21.png'
  };

  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <div className="m-2 sm:container sm:mx-auto py-10 gap-12 flex flex-col">
          <div className="flex flex-col border-2 p-2 rounded-lg border-[#f5f7fa14]">
            <ul className='m-2 space-y-4'>
              <li>Leverage your liquid staked memecoins to mint new tokens called Indexes.</li>
              <li>Indexes enable you to consolidate your tokens into a single, more valuable token- like an stocks index fund.</li>
              <li>Indexes always maintain a fixed ratio between their base pair tokens, so you'll never be subject to impermanent loss.</li>
              <li>The staking process for Indexes is 100% trustless, so your funds are always safe and can be withdrawn at any time.</li>
            </ul>
          </div>

          <div className="flex gap-2 flex-col">

            <div className="px-2 w-full rounded-lg bg-[#252932]">
              <table className="border-[#f5f7fa14] w-full">
                <tr className="border-b-[1px] border-[#f5f7fa14]">
                  <th className="text-left p-4">Index</th>
                  <th className="text-left py-4">Ticker</th>
                  <th className="text-left py-4">Name</th>
                  {/* <th className="text-left py-4">Description</th> */}
                  {/* <th className="text-left py-4">TVL</th> */}
                </tr>
                {indexes.map((item, i) => (
                  <tr className="border-b-[1px] border-[#f5f7fa14]" key={i}>
                    <td className="p-4"><Image src={item.cardImage.url} width={40} height={40} alt='guild-logo' className='w-10 h-10 border border-white rounded-full grow' /></td>
                    <td className="py-4">{item.ticker}</td>
                    <td className="py-4">{item.title}</td>
                    {/* <td className="py-4">{item.subtitle}</td> */}
                    {/* <td className="py-4">{item.TVL}</td> */}
                  </tr>
                ))}
              </table>
            </div>
          </div>
        </div>
      </Layout>
    </Page>
  );
}
