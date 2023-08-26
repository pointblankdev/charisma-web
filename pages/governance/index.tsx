import { GetStaticProps } from 'next';
import { SkipNavContent } from '@reach/skip-nav';

import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import Layout from '@components/layout';
import { DataTable } from '@components/vote-table/data-table';
import { columns } from '@components/vote-table/columns';
import { cn } from '@lib/utils';
import Image from 'next/image';
import { Button } from '@components/ui/button';
import Link from 'next/link';
import { fetchAllContractTransactions, getProposals, updateVoteData } from '@lib/stacks-api';
import dmlogo from '@public/dm-logo.png'
import chatoken from '@public/cha-token.png'
import voting from '@public/voting.png'
import extproposal from '@public/ext-proposal.png'
import tokenfaucet3 from '@public/token-faucet-3.png'
import treasurechest from '@public/governance/treasure-chest.png'
import questmap from '@public/governance/quest-map.png'
import locked from '@public/governance/locked.png'
import questhelper from '@public/governance/quest-helper.png'
import oracle from '@public/governance/oracle.png'

type CardProps = {
  href: string;
  src: any;
  alt: string;
  title: string;
  subtitle: string;
};

const Card: React.FC<CardProps> = ({ href, src, alt, title, subtitle }) => (
  <Link href={href} className={cn('w-full', 'm-0', 'bg-transparent', 'text-gray-200', 'border-accent-foreground', 'border', 'rounded-md', 'relative', 'cursor-pointer', 'group/card', 'overflow-hidden')}>
    <div className="overflow-hidden rounded-md">
      <Image
        src={src}
        alt={alt}
        height={600}
        width={600}
        className={cn("h-auto w-auto object-cover transition-all group-hover/card:scale-[120%]", "aspect-[3/4]")}
      />
    </div>
    <div className='absolute left-0 right-0 bottom-0 p-2 h-min hidden group-hover/card:block group-hover/card:backdrop-blur-3xl'>
      <h1 className="font-semibold leading-none md:leading-6">{title}</h1>
      <h2 className='text-sm leading-none md:leading-6'>{subtitle}</h2>
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
      title: 'token-faucet',
      subtitle: 'Token Faucet',
    },
    {
      href: "https://explorer.hiro.so/txid/0xc05db7eb16e3745c4d82884e120be4f2fe4af660f295e1450abf1beeca24c034?chain=mainnet",
      src: locked,
      alt: 'Quest Completion Extention Image',
      title: 'quest-completion',
      subtitle: 'Quest Completion State',
    },
    {
      href: "https://explorer.hiro.so/txid/0xe746ec5258c7b7342b337ec7e1bc529a4e0926d1c7998cf19710d6448176b0a7?chain=mainnet",
      src: oracle,
      alt: 'Centralized Quest Oracle Extention Image',
      title: 'quest-completion-oracle',
      subtitle: 'Centralized Quest Oracle',
    },
    {
      href: "https://explorer.hiro.so/txid/0xef3f3eadc18d5240bb6f76eabb9215f13cc94924ac4f318dbdb8412d8660e8df?chain=mainnet",
      src: questmap,
      alt: 'Quest Metadata Extention Image',
      title: 'quest-metadata',
      subtitle: 'Quest Details and Information',
    },
    {
      href: "https://explorer.hiro.so/txid/0x0fd98f76b0eab5edcd618cadc5b310b38c7fbec6fa104d079cd931573117cb81?chain=mainnet",
      src: treasurechest,
      alt: 'Charisma Rewards Extention Image',
      title: 'charisma-rewards',
      subtitle: 'Rewards for Quest Completion',
    },
    {
      href: "https://explorer.hiro.so/txid/0x580ed0b7902319403be4e43feb73eceaa5f7d875fc84bf4730e5a34ca20b33e4?chain=mainnet",
      src: questhelper,
      alt: 'Quest Reward Helper Extention Image',
      title: 'quest-reward-helper',
      subtitle: 'Utility for Quest Rewards',
    }
  ];

  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <div className="m-2 sm:container sm:mx-auto sm:py-10">
          <div className='grid gap-1 sm:gap-4 grid-cols-5'>
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