import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import Layout from '@components/layout';
import Image from 'next/image';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@components/ui/card';
import { Button } from '@components/ui/button';
import {
  blocksApi,
  getBlockCounter,
  getBlocksUntilUnlocked,
  getDecimals,
  getIsUnlocked,
  getIsWhitelisted,
  getSymbol,
  getTokenURI,
  getTotalSupply
} from '@lib/stacks-api';
import { GetServerSideProps, GetStaticProps } from 'next';
import { useEffect, useState } from 'react';
import { cn } from '@lib/utils';
import { motion } from 'framer-motion';
import useWallet from '@lib/hooks/use-wallet-balances';
import { useConnect } from '@stacks/connect-react';
import { AnchorMode, callReadOnlyFunction, cvToJSON, Pc, PostConditionMode, principalCV, uintCV } from '@stacks/transactions';
import { StacksMainnet } from "@stacks/network";
import { getGlobalState, getLand, getLands, setLandWhitelisted } from '@lib/db-providers/kv';
import LandControls from '@components/liquidity/lands';
import { useGlobalState } from '@lib/hooks/global-state-context';


export const getStaticPaths = async () => {
  // get all staking lands from db
  const landContractAddresses = await getLands()
  const paths = landContractAddresses.map((ca: string) => ({ params: { ca: ca } }))
  return {
    paths: paths,
    fallback: false, // false or "blocking"
  }
}

export const getStaticProps: GetStaticProps<Props> = async ({ params }: any) => {
  // get land metadata from db
  const metadata = await getLand(params.ca)
  if (!metadata.whitelisted) {
    const isWhitelisted = await getIsWhitelisted(params.ca)
    if (isWhitelisted) {
      await setLandWhitelisted(params.ca, true)
    }
  }
  return {
    props: { metadata },
    revalidate: 60000
  };
};

type Props = {
  metadata: any;
};

export default function StakingDetailPage({ metadata }: Props) {
  const meta = {
    title: `Charisma | ${metadata.name}`,
    description: metadata.description.description,
    image: metadata.image
  };

  const [tokensSelected, setTokensSelected] = useState(0);

  const { getBalanceByKey } = useWallet()

  const landTokenBalance = getBalanceByKey(`SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.lands::lands`)?.balance || 0
  const baseTokenBalance = getBalanceByKey(`${metadata.wraps.ca}::${metadata.wraps.asset}`)?.balance || 0

  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
          className="m-2 space-y-4 sm:container sm:mx-auto sm:py-10 md:max-w-2xl lg:max-w-3xl"
        >
          <Card className="bg-black text-primary-foreground border-accent-foreground p-0 relative overflow-hidden rounded-md group/card w-full max-w-3xl opacity-[0.99] shadow-black shadow-2xl">
            <CardHeader className="z-20 p-4">
              <div className="flex items-center justify-between">
                <CardTitle className="z-30 text-lg font-semibold sm:text-xl">
                  {metadata.name}
                </CardTitle>
              </div>
              <CardDescription className="z-30 text-sm sm:text-md font-fine text-foreground">
                {metadata.wraps.description}
              </CardDescription>
            </CardHeader>
            <div className='p-4 space-y-2'>
              {metadata.whitelisted ?
                <LandControls
                  min={-landTokenBalance}
                  max={baseTokenBalance}
                  onSetTokensSelected={setTokensSelected}
                  tokensSelected={tokensSelected}
                  metadata={metadata}
                /> :
                <p className='space-y-2'>
                  <p>This Stake-to-Earn pool must first pass a governance proposal vote before it is enabled.</p>
                  <GovernanceProposalButton metadata={metadata} />
                </p>
              }
            </div>
            <Image
              src={metadata.cardImage}
              width={800}
              height={1600}
              alt={'card-background-image'}
              className={cn(
                'object-cover',
                'lg:aspect-square',
                'sm:aspect-[2/3]',
                'aspect-[1/2]',
                'opacity-10',
                'flex',
                'z-10',
                'absolute',
                'inset-0',
                'pointer-events-none'
              )}
            />
            <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-white to-black opacity-10" />
          </Card>
        </motion.div>
      </Layout>
    </Page>
  )
}

const GovernanceProposalButton = ({ metadata }: any) => {
  const { doContractCall } = useConnect();
  const { block } = useGlobalState()

  console.log(metadata)

  function submitProposal() {
    doContractCall({
      network: new StacksMainnet(),
      anchorMode: AnchorMode.Any,
      contractAddress: "SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ",
      contractName: 'dme002-proposal-submission',
      functionName: "propose",
      functionArgs: [principalCV(metadata.proposal), uintCV(Number(block.height) + 15)],
      postConditionMode: PostConditionMode.Deny,
      postConditions: [],
    });
  }
  return (
    <Button onClick={submitProposal}>Submit Proposal to Vote</Button>
  )
}