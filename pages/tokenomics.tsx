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


export default function Tokenomics() {
  const meta = {
    title: 'Charisma | Tokenomics',
    description: META_DESCRIPTION
  };

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
                <div className="text-2xl font-bold">16</div>
              </CardHeader>
              <CardContent>

                <p className="text-xs font-semibold text-muted-foreground">
                  +1500% from last month
                </p>
              </CardContent>
            </Card>
            <Card className='bg-black text-primary-foreground border-accent-foreground'>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Supply
                </CardTitle>
                <div className="text-2xl font-bold">0.003758</div>
              </CardHeader>
              <CardContent>

                <p className="text-xs font-semibold text-muted-foreground">
                  ~0.000144 tokens minted per day
                </p>
              </CardContent>
            </Card>
            {/* <Card className='bg-black text-primary-foreground border-accent-foreground'>

            </Card>
            <Card className='bg-black text-primary-foreground border-accent-foreground'>

            </Card> */}
          </div>

          <p className="mb-4">
            The Charisma Token operates within a unique economic model designed for transparency, controlled distribution, and a self-sustaining ecosystem.
          </p>

          <ol className="list-decimal pl-5">
            <li className="mb-3">
              <b>Token Faucet Mechanism</b>: At the heart of the DAO's tokenomics is the Charisma Token Faucet. This system drips or mints Charisma tokens over a set period. The rate, known as the "drip amount," defines the number of tokens released per blockchain block. This drip mechanism ensures a steady and predictable token supply growth, giving users and investors a clear view of issuance.
            </li>

            <li className="mb-3">
              <b>Claiming Tokens</b>: Users have the opportunity to claim tokens from the faucet. The amount claimable is a product of the drip rate and the number of blocks since the last claim. This system not only promotes user interaction but also ensures a decentralized distribution of tokens over time.
            </li>

            <li className="mb-3">
              <b>Controlled Issuance</b>: While users can claim tokens, the drip amount or rate of token issuance can only be adjusted by the DAO or its authorized extensions. This provision preserves the integrity of the tokenomics, ensuring no unauthorized or unpredictable supply surges.
            </li>

            <li className="mb-3">
              <b>Transparency & Security</b>: All token issuance and transactions are recorded on the blockchain, offering a transparent audit trail. Moreover, measures are in place to prevent any abuse, like unauthorized changes to the drip amount or claims when insufficient balance is available.
            </li>
          </ol>

          <p className="mt-4">
            In essence, the Charisma Token DAO emphasizes a stable growth model, transparency, and user-centric distribution, aiming to build trust, value, and a strong community foundation.
          </p>

        </div>
      </Layout>
    </Page>
  );
}

