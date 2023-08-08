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
import { accountsApi, scApi } from '@lib/stacks-api';

type CardProps = {
  href: string;
  src: string;
  alt: string;
  title: string;
  subtitle: string;
};

const Card: React.FC<CardProps> = ({ href, src, alt, title, subtitle }) => (
  <Link href={href} className={cn('w-64', 'm-0', 'bg-transparent', 'text-gray-200', 'border-accent-foreground', 'border', 'rounded-md', 'relative', 'cursor-pointer')}>
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
      src: '/dm-logo.png',
      alt: 'Dungeon Master Image',
      title: 'dungeon-master',
      subtitle: 'Executor DAO',
    },
    {
      href: "https://explorer.hiro.so/txid/0x290c36921ad381c678fdb899afef196d9fbd911ed60c2e43f0df5cbab9fe805a?chain=mainnet",
      src: '/cha-token.png',
      alt: 'Governance Token Image',
      title: 'governance-token',
      subtitle: 'Charisma SIP-10 Token',
    },
    {
      href: "https://explorer.hiro.so/txid/SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme001-proposal-voting?chain=mainnet",
      src: '/voting.png',
      alt: 'Voting Extention Image',
      title: 'proposal-voting',
      subtitle: 'Vote For/Against Proposals',
    },
    {
      href: "https://explorer.hiro.so/txid/0x8e5362eef7c1490304495827d1948389ef01ba776c0ee4edb3450ce6eb1c2380?chain=mainnet",
      src: '/proposal-v2.png',
      alt: 'Proposal Submission Extention Image',
      title: 'proposal-submission',
      subtitle: 'Submit New Proposals',
    }
  ];

  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <div className="container mx-auto py-10">
          <div className='flex sm:space-x-1 space-y-6 sm:space-y-0 flex-wrap justify-evenly'>
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

  });

  return data;
}


export const getStaticProps: GetStaticProps<Props> = async () => {
  const accountsResp: any = await accountsApi.getAccountTransactionsWithTransfers({
    principal: 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme002-proposal-submission',
  })

  // console.log(accountsResp.results.map(r => r.tx.contract_call?.function_args))
  // todo: convert this into the intial data

  const resp: any = await scApi.getContractEventsById({
    contractId: 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme001-proposal-voting',
    limit: 50,
    unanchored: true
  })

  const data = [
    // ...accountsResp.results.map(r => ({ ...r.tx.contract_call })),
    {
      id: "001",
      amount: 0,
      against: 0,
      status: "Voting Active",
      name: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.dmp001-token-faucet",
      url: "https://explorer.hiro.so/txid/SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.dmp001-token-faucet?chain=mainnet",
      startBlockHeight: 114840,
      endBlockHeight: 116280,
    },
    {
      id: "002",
      amount: 0,
      against: 0,
      status: "Voting Active",
      name: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.dmp002-token-metadata",
      url: "https://explorer.hiro.so/txid/SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.dmp002-token-metadata?chain=mainnet",
      startBlockHeight: 114840,
      endBlockHeight: 116280,
    }
  ]

  const inputStrings = resp.results.map((r: any) => r.contract_log.value.repr)


  const updatedData = updateVoteData(data, inputStrings);

  return {
    props: {
      data: updatedData
    },
    revalidate: 60
  };
};
