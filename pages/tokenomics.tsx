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
import { accountsApi, fetchAllClaims, getTokenStats } from '@lib/stacks-api';
import HoldersChart from '@components/tokenomics/HoldersChart';
import { getAllWallets } from "@lib/cms-providers/dato";
import _ from 'lodash';


type Props = {
  data: any;
};

export default function Tokenomics({ data }: Props) {
  const meta = {
    title: 'Charisma | Tokenomics',
    description: META_DESCRIPTION
  };

  const totalSupplyWithDecimals = data.totalSupply
  const dripAmount = data.dripAmount
  const dripAmountPerDayWithDecimals = (dripAmount * 144)
  const uniqueAddresses = data.uniqueAddresses
  const percentChange = data.percentChange
  const walletBalances = data.walletBalances
  const wallets = data.wallets

  const mergedWalletBalances = _.map(walletBalances, obj1 => {
    const obj2 = _.find(wallets, { stxaddress: obj1.primary });

    if (obj2) {
      // If bns is non-blank, update the primary field
      if (obj2.bns && obj2.bns.trim() !== '') {
        obj1.primary = obj2.bns;
      }

      // Merge the two objects
      return _.merge({}, obj1, obj2);
    } else {
      return obj1;
    }
  });

  const chartData = [
    {
      data: mergedWalletBalances,
      label: "Charisma Tokens"
    }
  ]

  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <div className="m-2 sm:container sm:mx-auto sm:py-10 space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className='bg-black text-primary-foreground border-accent-foreground'>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Unique Wallet Addresses
                </CardTitle>
                <div className="text-2xl font-bold">{uniqueAddresses}</div>
              </CardHeader>
              <CardContent>

                <p className="text-xs font-semibold text-muted-foreground">
                  {`+${percentChange.toFixed(2)}% in last 7 days`}
                </p>
              </CardContent>
            </Card>
            <Card className='bg-black text-primary-foreground border-accent-foreground'>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Drip Amount
                </CardTitle>
                <div className="text-2xl font-bold">{dripAmount}</div>
              </CardHeader>
              <CardContent>

                <p className="text-xs font-semibold text-muted-foreground">
                  Charisma tokens emitted per block
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

          <h1 className='text-xl text-left mt-8 mb-2 text-gray-200 hidden xl:block'>Top 20 Addresses by Charisma Tokens</h1>
          <HoldersChart data={chartData} />

        </div>
      </Layout>
    </Page>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const { totalSupply, dripAmount } = await getTokenStats();
  const { walletBalances, totalUniqueWallets, percentChange } = await fetchAllClaims()
  const wallets = await getAllWallets()


  return {
    props: {
      data: {
        totalSupply: totalSupply,
        dripAmount: dripAmount,
        walletBalances: walletBalances,
        uniqueAddresses: totalUniqueWallets,
        percentChange: percentChange,
        wallets: wallets
      }
    },
    revalidate: 60
  };
};
