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
import { DataTable } from '@components/vote-table/data-table';
import { columns } from '@components/vote-table/columns';
import cn from 'classnames';
import Image from 'next/image';
import Link from 'next/link';


type Props = {
  data: any[];
};

export default function Governance({ data }: Props) {
  const meta = {
    title: 'Charisma | Platform Governance',
    description: META_DESCRIPTION
  };

  const aspectRatio = "portrait";

  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <div className="container mx-auto py-10 space-y-6">
          <div className='flex sm:space-x-1 flex-wrap'>
            <Link href="https://explorer.hiro.so/txid/0xfbd5310da4aa15578e3c35857c0b526e60d291466ddc52dea7584ee35589d985?chain=mainnet" className={cn('w-64', 'm-0', 'bg-transparent', 'text-gray-200', 'border-accent-foreground', 'border', 'rounded-md', 'relative', 'cursor-pointer')}>
              <div className="overflow-hidden rounded-md">
                <Image
                  src={'/dm-logo.png'}
                  alt={'Dungeon Master Image'}
                  height={250}
                  width={250}
                  className={cn(
                    "h-auto w-auto object-cover transition-all hover:scale-105",
                    aspectRatio === "portrait" ? "aspect-[3/4]" : "aspect-square"
                  )}
                />
              </div>
              <div className='absolute bottom-0 m-2'>
                <h1 className="font-semibold">dungeon-master</h1>
                <h2 className='text-sm'>Core DAO Executor</h2>
              </div>
            </Link>
            {/* gov token card */}
            <Link href="https://explorer.hiro.so/txid/0x290c36921ad381c678fdb899afef196d9fbd911ed60c2e43f0df5cbab9fe805a?chain=mainnet" className={cn('w-64', 'm-0', 'bg-transparent', 'text-gray-200', 'border-accent-foreground', 'border', 'rounded-md', 'relative', 'cursor-pointer')}>
              <div className="overflow-hidden rounded-md">
                <Image
                  src={'/cha-token.png'}
                  alt={'Governance Token Image'}
                  height={600}
                  width={600}
                  className={cn(
                    "h-auto w-auto object-cover transition-all hover:scale-105",
                    aspectRatio === "portrait" ? "aspect-[3/4]" : "aspect-square"
                  )}
                />
              </div>
              <div className='absolute bottom-0 m-2'>
                <h1 className="font-semibold">governance-token</h1>
                <h2 className='text-sm'>Charisma SIP-10 Token</h2>
              </div>
            </Link>
            {/* voting card */}
            <Link href="https://explorer.hiro.so/txid/SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme001-proposal-voting?chain=mainnet" className={cn('w-64', 'm-0', 'bg-transparent', 'text-gray-200', 'border-accent-foreground', 'border', 'rounded-md', 'relative', 'cursor-pointer')}>
              <div className="overflow-hidden rounded-md">
                <Image
                  src={'/voting.png'}
                  alt={'Voting Extention Image'}
                  height={600}
                  width={600}
                  className={cn(
                    "h-auto w-auto object-cover transition-all hover:scale-105",
                    aspectRatio === "portrait" ? "aspect-[3/4]" : "aspect-square"
                  )}
                />
              </div>
              <div className='absolute bottom-0 m-2'>
                <h1 className="font-semibold">proposal-voting</h1>
                <h2 className='text-sm'>Vote For/Against Proposals</h2>
              </div>
            </Link>
            {/* proposals card */}
            <Link href="https://explorer.hiro.so/txid/0x8e5362eef7c1490304495827d1948389ef01ba776c0ee4edb3450ce6eb1c2380?chain=mainnet" className={cn('w-64', 'm-0', 'bg-transparent', 'text-gray-200', 'border-accent-foreground', 'border', 'rounded-md', 'relative', 'cursor-pointer')}>
              <div className="overflow-hidden rounded-md" >
                <Image
                  src={'/proposal-v2.png'}
                  alt={'Proposal Submission Extention Image'}
                  height={600}
                  width={600}
                  className={cn(
                    "h-auto w-auto object-cover transition-all hover:scale-105",
                    aspectRatio === "portrait" ? "aspect-[3/4]" : "aspect-square"
                  )}
                />
              </div>
              <div className='absolute bottom-0 m-2'>
                <h1 className="font-semibold">proposal-submission</h1>
                <h2 className='text-sm'>Submit New Proposals</h2>
              </div>
            </Link>
          </div>
          <DataTable columns={columns} data={data} />
        </div>
      </Layout >
    </Page >
  );
}

export const getStaticProps: GetStaticProps<Props> = () => {
  const data = [
    {
      id: "001",
      amount: 1,
      status: "Voting Active",
      name: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.dmp001-token-faucet",
      url: "https://explorer.hiro.so/txid/SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.dmp001-token-faucet?chain=mainnet"
    },
    {
      id: "002",
      amount: 1,
      status: "Voting Active",
      name: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.dmp002-token-metadata",
      url: "https://explorer.hiro.so/txid/SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.dmp002-token-metadata?chain=mainnet"
    }
  ]

  return {
    props: {
      data
    },
    revalidate: 60
  };
};
