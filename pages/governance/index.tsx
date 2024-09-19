import { GetServerSideProps } from 'next';
import { SkipNavContent } from '@reach/skip-nav';

import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import Layout from '@components/layout/layout';
import { DataTable } from '@components/vote-table/data-table';
import { columns } from '@components/vote-table/columns';
import { cn } from '@lib/utils';
import Image from 'next/image';
import { Button } from '@components/ui/button';
import Link from 'next/link';
import { fetchAllContractTransactions, getProposals, updateVoteData } from '@lib/stacks-api';
import dmlogo from '@public/dm-logo.png';
import chatoken from '@public/cha-token.png';
import voting from '@public/voting.png';
import extproposal from '@public/ext-proposal.png';
import tokenfaucet3 from '@public/token-faucet-3.png';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
import greenRoom from '@public/green-room-card.png';

type CardProps = {
  href: string;
  src: any;
  alt: string;
  title: string;
  subtitle: string;
};

const Card: React.FC<CardProps> = ({ href, src, alt, title, subtitle }) => (
  <Link
    href={href}
    className={cn(
      'w-full',
      'm-0',
      'bg-transparent',
      'text-gray-200',
      'border-accent-foreground',
      'border',
      'rounded-md',
      'relative',
      'cursor-pointer',
      'group/card',
      'overflow-hidden'
    )}
  >
    <div className="relative overflow-hidden rounded-md group">
      <Image
        src={src}
        alt={alt}
        height={600}
        width={600}
        className={cn(
          'h-auto w-full object-cover transition-transform duration-500 group-hover:scale-[110%]'
        )}
      />
    </div>
    <div className="absolute bottom-0 left-0 right-0 hidden p-2 h-min group-hover/card:block group-hover/card:backdrop-blur-3xl">
      <h1 className="font-semibold leading-none md:leading-6">{title}</h1>
      <h2 className="text-sm leading-none md:leading-6">{subtitle}</h2>
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
      href:
        'https://explorer.hiro.so/txid/0xfbd5310da4aa15578e3c35857c0b526e60d291466ddc52dea7584ee35589d985?chain=mainnet',
      src: dmlogo,
      alt: 'Dungeon Master Image',
      title: 'dungeon-master',
      subtitle: 'Executor DAO'
    },
    {
      href:
        'https://explorer.hiro.so/txid/0x290c36921ad381c678fdb899afef196d9fbd911ed60c2e43f0df5cbab9fe805a?chain=mainnet',
      src: chatoken,
      alt: 'Governance Token Image',
      title: 'governance-token',
      subtitle: 'Charisma SIP-10 Token'
    },
    {
      href:
        'https://explorer.hiro.so/txid/SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme001-proposal-voting?chain=mainnet',
      src: voting,
      alt: 'Voting Extention Image',
      title: 'proposal-voting',
      subtitle: 'Vote For/Against Proposals'
    },
    {
      href:
        'https://explorer.hiro.so/txid/0x8e5362eef7c1490304495827d1948389ef01ba776c0ee4edb3450ce6eb1c2380?chain=mainnet',
      src: extproposal,
      alt: 'Proposal Submission Extention Image',
      title: 'proposal-submission',
      subtitle: 'Submit New Proposals'
    },
    {
      href:
        'https://explorer.hiro.so/txid/0x29c81fe813b62e5ee04d416ad3c2f713823e2eddc04da56745787cdd708cfaf5?chain=mainnet',
      src: tokenfaucet3,
      alt: 'Token Faucet Extention Image',
      title: 'token-faucet',
      subtitle: 'Token Faucet'
    },
    {
      href:
        'https://explorer.hiro.so/txid/0xdf39fdd38e530c0bfce31b9fea28d038c4250932a7c2da6e608a6c3fcbb3a580?chain=mainnet',
      src: greenRoom,
      alt: 'Green Room Extention Image',
      title: 'green-room',
      subtitle: 'The Green Room'
    }
    // {
    //   href: "https://explorer.hiro.so/txid/0xc05db7eb16e3745c4d82884e120be4f2fe4af660f295e1450abf1beeca24c034?chain=mainnet",
    //   src: locked,
    //   alt: 'Quest Completion Extention Image',
    //   title: 'quest-completion',
    //   subtitle: 'Quest Completion State',
    // },
    // {
    //   href: "https://explorer.hiro.so/txid/0xe746ec5258c7b7342b337ec7e1bc529a4e0926d1c7998cf19710d6448176b0a7?chain=mainnet",
    //   src: oracle,
    //   alt: 'Centralized Quest Oracle Extention Image',
    //   title: 'quest-completion-oracle',
    //   subtitle: 'Centralized Quest Oracle',
    // },
    // {
    //   href: "https://explorer.hiro.so/txid/0xef3f3eadc18d5240bb6f76eabb9215f13cc94924ac4f318dbdb8412d8660e8df?chain=mainnet",
    //   src: questmap,
    //   alt: 'Quest Metadata Extention Image',
    //   title: 'quest-metadata',
    //   subtitle: 'Quest Details and Information',
    // },
    // {
    //   href: "https://explorer.hiro.so/txid/0x0fd98f76b0eab5edcd618cadc5b310b38c7fbec6fa104d079cd931573117cb81?chain=mainnet",
    //   src: treasurechest,
    //   alt: 'Charisma Rewards Extention Image',
    //   title: 'charisma-rewards',
    //   subtitle: 'Rewards for Quest Completion',
    // },
    // {
    //   href: "https://explorer.hiro.so/txid/0x36a45ef4f999840c2e2d200018feffd2452872647d5b5180f3a5174ab71be4c4?chain=mainnet",
    //   src: questhelper,
    //   alt: 'Quest Reward Helper Extention Image',
    //   title: 'quest-reward-helper',
    //   subtitle: 'Utility for Quest Rewards',
    // },
    // {
    //   href: "https://explorer.hiro.so/txid/0x129a38ebc010cc4effdbcc2aa809dbc0f72392cc7c6b5ab1f38ab88cc911d9b7?chain=mainnet",
    //   src: hourglass,
    //   alt: 'Quest Expiration Extention Image',
    //   title: 'quest-expiration',
    //   subtitle: 'Quest Expiration State',
    // },
    // {
    //   href: "https://explorer.hiro.so/txid/0xc92771238fc644061978ddaf9ab0c3371048aa6af410bce28b76abf13d87c520?chain=mainnet",
    //   src: startingFlag,
    //   alt: 'Quest Activation Extention Image',
    //   title: 'quest-activation',
    //   subtitle: 'Quest Activation State',
    // },
    // {
    //   href: "https://explorer.hiro.so/txid/0x29cd63daee13b536ebf2a7b6a27847aa3beb87d361090a1b0df271e050257997?chain=mainnet",
    //   src: wantedPosters,
    //   alt: 'Quest Max Completions Extention Image',
    //   title: 'quest-max-completions',
    //   subtitle: 'Quest Max Completions State',
    // },
    // {
    //   href: "https://explorer.hiro.so/txid/0x9dc11777ade6802bed2c19efd5b2896e2adddcf997a2dda790af3b9bd5c96aca?chain=mainnet",
    //   src: stxRewards,
    //   alt: 'Quest STX Rewards Extention Image',
    //   title: 'quest-stx-rewards',
    //   subtitle: 'Quest STX Rewards',
    // },
    // {
    //   href: "https://explorer.hiro.so/txid/0xe209e5a4dfb558ba379ab1c0abafad1867af3ff7ec9bd6f11098e3941bfd6b02?chain=mainnet",
    //   src: courthouse,
    //   alt: 'Quest Ownership Extention Image',
    //   title: 'quest-ownership',
    //   subtitle: 'Quest Ownership State',
    // },
    // {
    //   href: "https://explorer.hiro.so/txid/0xe693a752b92c97db141ed784a1d7ff0e0605bd737ce5e38de998f402658ddcd3?chain=mainnet",
    //   src: innkeeper,
    //   alt: 'Quest Helper Extention Image',
    //   title: 'quest-helper',
    //   subtitle: 'Utility for Quest Creators',
    // },
  ];

  return (
    <Page meta={meta} fullViewport>
      <div className="overflow-x-hidden">
        <SkipNavContent />
        <Layout>
          <div className="m-2 py-10 sm:max-w-[1400px] sm:px-4">
            <Tabs defaultValue="proposals" className="">
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
                <TabsList className="flex flex-wrap gap-2 mb-4">
                  <TabsTrigger value="proposals" className="flex-grow sm:flex-grow-0">
                    Proposals
                  </TabsTrigger>
                  <TabsTrigger value="extentions" className="flex-grow sm:flex-grow-0">
                    DAO Extentions
                  </TabsTrigger>
                </TabsList>
                <Link href="/governance/guide" className="ml-auto">
                  <Button variant={'link'} className="block mt-2 ml-auto sm:mt-0 sm:inline-block">
                    Contributer Guide 📕
                  </Button>
                </Link>
              </div>
              <TabsContent value="proposals">
                <DataTable columns={columns} data={data} />
              </TabsContent>
              <TabsContent value="extentions">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                  {cards.map((card, index) => (
                    <Card key={index} {...card} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </Layout>
      </div>
    </Page>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  try {
    // TODO: utilize the new proposal data provided by chainhooks to get initial list of proposals
    // we will still need to enrich this data with proposal metadata, tbd
    const [proposals, transactions] = await Promise.all([
      getProposals(),
      fetchAllContractTransactions(
        'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme001-proposal-voting'
      )
    ]);

    const updatedProposals = updateVoteData(proposals, transactions);

    return {
      props: {
        data: updatedProposals
      }
    };
  } catch (error) {
    console.error(error);
    return {
      props: {
        data: []
      }
    };
  }
};
