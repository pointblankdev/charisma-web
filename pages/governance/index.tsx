import { GetStaticProps } from 'next';
import { SkipNavContent } from '@reach/skip-nav';

import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import Layout from '@components/layout';
import { DataTable } from '@components/vote-table/data-table';
import { columns } from '@components/vote-table/columns';
import { cn } from '@lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { fetchAllContractTransactions, getProposals, updateVoteData } from '@lib/stacks-api';
import dmlogo from '@public/dm-logo.png'
import chatoken from '@public/cha-token.png'
import voting from '@public/voting.png'
import extproposal from '@public/ext-proposal.png'
import tokenfaucet3 from '@public/token-faucet-3.png'
import { Button } from '@components/ui/button';

type CardProps = {
  href: string;
  src: any;
  alt: string;
  title: string;
  subtitle: string;
};

const Card: React.FC<CardProps> = ({ href, src, alt, title, subtitle }) => (
  <Link href={href} className={cn('w-full', 'm-0', 'bg-transparent', 'text-gray-200', 'border-accent-foreground', 'border', 'rounded-md', 'relative', 'cursor-pointer')}>
    <div className="overflow-hidden rounded-md">
      <Image
        src={src}
        alt={alt}
        height={600}
        width={600}
        className={cn("h-auto w-auto object-cover transition-all hover:scale-105", "aspect-[3/4]")}
      />
    </div>
    <div className='absolute bottom-0 m-2'>
      <h1 className="font-semibold">{title}</h1>
      <h2 className='text-sm'>{subtitle}</h2>
    </div>
  </Link>
);

type Props = {
  data: any[];
};

export default function Governance({ data }: Props) {
  const meta = {
    title: 'Charisma | Platform Governance',
    description: META_DESCRIPTION
  };

  const cards = [
    {
      href: "https://explorer.hiro.so/txid/0xfbd5310da4aa15578e3c35857c0b526e60d291466ddc52dea7584ee35589d985?chain=mainnet",
      src: dmlogo,
      alt: 'Dungeon Master Image',
      title: 'dungeon-master',
      subtitle: 'Executor DAO',
    },
    {
      href: "https://explorer.hiro.so/txid/0x290c36921ad381c678fdb899afef196d9fbd911ed60c2e43f0df5cbab9fe805a?chain=mainnet",
      src: chatoken,
      alt: 'Governance Token Image',
      title: 'governance-token',
      subtitle: 'Charisma SIP-10 Token',
    },
    {
      href: "https://explorer.hiro.so/txid/SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme001-proposal-voting?chain=mainnet",
      src: voting,
      alt: 'Voting Extention Image',
      title: 'proposal-voting',
      subtitle: 'Vote For/Against Proposals',
    },
    {
      href: "https://explorer.hiro.so/txid/0x8e5362eef7c1490304495827d1948389ef01ba776c0ee4edb3450ce6eb1c2380?chain=mainnet",
      src: extproposal,
      alt: 'Proposal Submission Extention Image',
      title: 'proposal-submission',
      subtitle: 'Submit New Proposals',
    },
    {
      href: "https://explorer.hiro.so/txid/0x29c81fe813b62e5ee04d416ad3c2f713823e2eddc04da56745787cdd708cfaf5?chain=mainnet",
      src: tokenfaucet3,
      alt: 'Token Faucet Extention Image',
      title: 'token-faucet-v0',
      subtitle: 'Token Faucet',
    }
  ];

  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <div className="m-2 sm:container sm:mx-auto sm:py-10">
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-5'>
            {cards.map((card, index) => (
              <Card key={index} {...card} />
            ))}
          </div>
          <div className='flex justify-between items-end'>
            <h1 className='text-xl text-left mt-8 mb-2 text-gray-200'>Proposals</h1>
            <Link href='/governance/guide'><Button variant={'link'} className='my-2 px-0'>DAO Contributer Guide 📕</Button></Link>
          </div>
          <DataTable columns={columns} data={data} />
        </div>
      </Layout>
    </Page>
  );
}


export const getStaticProps: GetStaticProps<Props> = async () => {

  const proposals = await getProposals();

  const transactions = await fetchAllContractTransactions('SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme001-proposal-voting')

  const updatedProposals = updateVoteData(proposals, transactions);

  return {
    props: {
      data: updatedProposals
    },
    revalidate: 60
  };
};