import { SkipNavContent } from '@reach/skip-nav';

import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import Layout from '@components/layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@components/ui/card"
import { GetStaticProps } from 'next';
import { callReadOnlyFunction } from '@stacks/transactions';
import { StacksMainnet } from "@stacks/network";
import { accountsApi } from '@lib/stacks-api';


export default function Tokenomics({ data }: Props) {
  const meta = {
    title: 'Charisma | Tokenomics',
    description: META_DESCRIPTION
  };

  const totalSupplyWithDecimals = data.totalSupply / 1000000
  const dripAmountPerDayWithDecimals = (data.dripAmount / 1000000 * 144).toFixed(6)
  const uniqueAddresses = data.uniqueAddresses
  const uniqueAddressesIncreaseSinceLastMonth = `${data.uniqueAddresses.length - 1}`

  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <div className="container mx-auto py-10 space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className='bg-black text-primary-foreground border-accent-foreground'>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Unique Wallet Addresses
                </CardTitle>
                <div className="text-2xl font-bold">{uniqueAddresses.length}</div>
              </CardHeader>
              <CardContent>

                <p className="text-xs font-semibold text-muted-foreground">
                  {`+${uniqueAddressesIncreaseSinceLastMonth}00% in last 7 days`}
                </p>
              </CardContent>
            </Card>
            <Card className='bg-black text-primary-foreground border-accent-foreground'>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Supply
                </CardTitle>
                <div className="text-2xl font-bold">{totalSupplyWithDecimals}</div>
              </CardHeader>
              <CardContent>

                <p className="text-xs font-semibold text-muted-foreground">
                  ~{dripAmountPerDayWithDecimals} tokens minted per day
                </p>
              </CardContent>
            </Card>
            {/* <Card className='bg-black text-primary-foreground border-accent-foreground'>

            </Card>
            <Card className='bg-black text-primary-foreground border-accent-foreground'>

            </Card> */}
          </div>

          <p className="mb-4 font-light">
            The Charisma Token operates within a unique economic model designed for transparency, controlled distribution, and a self-sustaining ecosystem.
          </p>

          <ol className="list-decimal pl-5 font-extralight">
            <li className="mb-3">
              <b className='font-semibold'>Token Faucet Mechanism</b>: At the heart of the DAO's tokenomics is the Charisma Token Faucet. This system drips or mints Charisma tokens over a set period. The rate, known as the "drip amount," defines the number of tokens released per blockchain block. This drip mechanism ensures a steady and predictable token supply growth, giving users and investors a clear view of issuance.
            </li>

            <li className="mb-3">
              <b className='font-semibold'>Claiming Tokens</b>: Users have the opportunity to claim tokens from the faucet. The amount claimable is a product of the drip rate and the number of blocks since the last claim. This system not only promotes user interaction but also ensures a decentralized distribution of tokens over time.
            </li>

            <li className="mb-3">
              <b className='font-semibold'>Controlled Issuance</b>: While users can claim tokens, the drip amount or rate of token issuance can only be adjusted by the DAO or its authorized extensions. This provision preserves the integrity of the tokenomics, ensuring no unauthorized or unpredictable supply surges.
            </li>

            <li className="mb-3">
              <b className='font-semibold'>Transparency & Security</b>: All token issuance and transactions are recorded on the blockchain, offering a transparent audit trail. Moreover, measures are in place to prevent any abuse, like unauthorized changes to the drip amount or claims when insufficient balance is available.
            </li>
          </ol>

          <p className="mt-4 font-light">
            In essence, this approach emphasizes a stable growth model, transparency, and user-centric distribution, aiming to build trust, value, and a strong community foundation.
          </p>

        </div>
      </Layout>
    </Page>
  );
}

async function fetchAllClaims() {
  let offset = 0;
  const limit = 50;
  const uniqueWallets: Set<string> = new Set(); // This will keep track of unique wallets

  while (true) {
    const f: any = await accountsApi.getAccountTransactionsWithTransfers({
      principal: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.dme005-token-faucet-v0',
      limit: limit,
      offset: offset
    });

    if (!f.results.length) {
      break; // exit the loop if there are no more results
    }

    f.results.forEach((r: any) => {
      // console.log(r.tx.sender_address);
      if (r.tx.contract_call?.function_name === 'claim' && r.tx.tx_result.repr === '(ok true)') {
        uniqueWallets.add(r.tx.sender_address);
      }
    });

    offset += limit; // increment the offset for the next page
  }

  console.log(`Total unique wallets that claimed the token: ${uniqueWallets.size}`);
  return uniqueWallets;
}


type Props = {
  data: any;
};

export const getStaticProps: GetStaticProps<Props> = async () => {


  const r: any = await callReadOnlyFunction({
    network: new StacksMainnet(),
    contractAddress: "SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ",
    contractName: "dme000-governance-token",
    functionName: "get-total-supply",
    functionArgs: [],
    senderAddress: 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ'
  })


  const d: any = await callReadOnlyFunction({
    network: new StacksMainnet(),
    contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
    contractName: "dme005-token-faucet-v0",
    functionName: "get-drip-amount",
    functionArgs: [],
    senderAddress: 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ'
  })



  const uniqueAddresses = await fetchAllClaims()


  return {
    props: {
      data: {
        totalSupply: Number(r.value.value),
        dripAmount: Number(d.value.value),
        uniqueAddresses: [...uniqueAddresses]
      }
    },
    revalidate: 60
  };
};
