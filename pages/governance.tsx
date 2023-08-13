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
import { accountsApi, blocksApi, scApi } from '@lib/stacks-api';
import dmlogo from '@public/dm-logo.png'
import chatoken from '@public/cha-token.png'
import voting from '@public/voting.png'
import extproposal from '@public/ext-proposal.png'
import tokenfaucet3 from '@public/token-faucet-3.png'

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
          <h1 className='text-xl text-left mt-8 mb-2 text-gray-200'>Proposals</h1>
          <DataTable columns={columns} data={data} />
        </div>
      </Layout>
    </Page>
  );
}

function updateVoteData(data: any[], inputStrings: string[]) {

  inputStrings.forEach(inputStr => {
    const namePattern = /(proposal\s'+([^']+)\))/gm;
    const amountPattern = /(amount\s+u(\d+))/gm;
    const forPattern = /(for\s+(true|false))/gm;

    const nameMatch = namePattern.exec(inputStr);
    const amountMatch = amountPattern.exec(inputStr);
    const forMatch = forPattern.exec(inputStr);


    if (!amountMatch && !forMatch) {
      // throw new Error("Unable to parse the string");
      return
    }

    const name = nameMatch?.[2];
    const amount = Number(amountMatch?.[2]);
    const vote = forMatch?.[2];

    // Find the entry in the data array that matches the name
    const dataEntry = data.find(entry => entry.name === name);
    if (!dataEntry) return; // skip if not found

    if (vote === 'true') {
      dataEntry.amount += amount;
    } else {
      dataEntry.against += amount;
    }

    if (dataEntry.status !== 'Voting Active' && dataEntry.status !== 'Pending') {

      if (dataEntry.amount > dataEntry.against) {
        dataEntry.status = 'Passed';
      } else {
        dataEntry.status = 'Failed';
      }
    }

  });

  return data;
}


export const getStaticProps: GetStaticProps<Props> = async () => {


  const { results } = await blocksApi.getBlockList({ limit: 1 })
  const latestBlock = Number(results[0].height)

  const accountsResp: any = await accountsApi.getAccountTransactionsWithTransfers({
    principal: 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme002-proposal-submission',
  })

  const proposals: any[] = []

  for (const r of accountsResp.results) {
    const args = r.tx.contract_call?.function_args
    if (args) {
      const startBlockHeight = Number(args[1].repr.slice(1))
      const endBlockHeight = startBlockHeight + 1440
      let status = ''
      if (latestBlock < startBlockHeight) {
        status = 'Pending'
      } else if (latestBlock < endBlockHeight) {
        status = 'Voting Active'
      } else {
        status = 'Voting Ended'
      }

      const [contractAddress, contractName] = args[0].repr.slice(1).split('.')

      const proposalSourceResp: any = await scApi.getContractSource({ contractAddress, contractName })

      const contractPrincipal = `${contractAddress}.${contractName}`
      proposals.push({
        id: args[0].repr.split('.')[1],
        name: contractPrincipal,
        source: proposalSourceResp.source,
        startBlockHeight,
        endBlockHeight: endBlockHeight,
        amount: 0,
        against: 0,
        status,
        url: `https://explorer.hiro.so/txid/${contractPrincipal}?chain=mainnet`,
      })
    }
  }

  const resp: any = await scApi.getContractEventsById({
    contractId: 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme001-proposal-voting',
    limit: 50,
    unanchored: true
  })

  const inputStrings = resp.results.map((r: any) => r.contract_log.value.repr)


  const updatedData = updateVoteData(proposals, inputStrings);

  return {
    props: {
      data: updatedData
    },
    revalidate: 60
  };
};
