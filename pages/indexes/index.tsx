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

type Props = {
  apps: any[];
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
      apps
    },
    revalidate: 60
  };
};

export default function Crafting({ apps }: Props) {
  const meta = {
    title: 'Charisma | Crafting',
    description: META_DESCRIPTION,
    image: '/fenrir-21.png'
  };

  const [searchInput, setSearchInput] = useState('');
  const [renderedArr, setRenderedArr] = useState(
    [] as {
      name: string;
      TVL: number;
      volume: number;
      fees: number;
      APR: string;
    }[]
  );

  const desArr = [
    {
      name: 'fjjjf jdjfjfjf',
      TVL: 283664,
      volume: 122323,
      fees: 985896985,
      APR: '--'
    },
    {
      name: 'qqqqqq',
      TVL: 283664,
      volume: 122323,
      fees: 985896985,
      APR: '--'
    },
    {
      name: 'tttt',
      TVL: 283664,
      volume: 122323,
      fees: 985896985,
      APR: '--'
    },
    {
      name: 'pppppp',
      TVL: 283664,
      volume: 122323,
      fees: 985896985,
      APR: '--'
    }
  ];
  useEffect(() => {
    if (!searchInput) setRenderedArr(desArr);
    else {
      const searchMatch = desArr.filter(item =>
        item.name.toLowerCase().includes(searchInput.toLowerCase())
      );

      setRenderedArr(searchMatch);
    }
  }, [searchInput]);

  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <div className="m-2 sm:container sm:mx-auto py-10 gap-12 flex flex-col">
          <div className="flex flex-col border-2 p-2 rounded-lg border-[#f5f7fa14]">
            <p className="text-2xl font-bold">All Indexes</p>
            <p>Provide liquidity and earn fees</p>
          </div>

          <div className="flex gap-2 flex-col border-2 p-2 rounded-lg border-[#f5f7fa14]">
            <div className="flex justify-between items-center">
              <div className="flex gap-3">
                <div className="py-1 px-2 flex items-center justify-center rounded-md bg-[#252932]">
                  All Pools
                </div>
                <div className="p-1 flex items-center justify-center rounded-md bg-[#252932]">
                  All Pools
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <input
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder="Search..."
                  className="w-80 px-2 rounded-lg bg-black border-2 border-[#252932]"
                />
                <PlusIcon />
              </div>
            </div>

            <div className="px-2 w-full rounded-lg bg-[#252932]">
              <table className="border-[#f5f7fa14] w-full">
                <tr className="border-b-[1px] border-[#f5f7fa14]">
                  <th className="text-left py-4">#</th>
                  <th className="text-left py-4">Name</th>
                  <th className="text-left py-4">TVL</th>
                  <th className="text-left py-4">Volume(24h)</th>
                  <th className="text-left py-4">Fees(24h)</th>
                  <th className="text-left py-4">APR</th>
                </tr>
                {renderedArr.map((item, i) => (
                  <tr className="border-b-[1px] border-[#f5f7fa14]" key={i}>
                    <td className="py-4">{i}</td>
                    <td className="py-4">{item.name}</td>
                    <td className="py-4">{item.TVL}</td>
                    <td className="py-4">{item.volume}</td>
                    <td className="py-4">{item.fees}</td>
                    <td className="py-4">{item.APR}</td>
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
