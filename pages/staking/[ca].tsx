import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import Layout from '@components/layout';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { GetStaticProps } from 'next';
import { useState } from 'react';
import { cn } from '@lib/utils';
import { motion } from 'framer-motion';
import useWallet from '@lib/hooks/use-wallet-balances';
import { getLand, getLands } from '@lib/db-providers/kv';
import LandControls from '@components/liquidity/lands';
import { useGlobalState } from '@lib/hooks/global-state-context';
import schaImg from '@public/liquid-staked-charisma.png'
import { useOpenContractCall } from '@micro-stacks/react';
import { uintCV, contractPrincipalCV } from 'micro-stacks/clarity';
import { FungibleConditionCode, makeStandardFungiblePostCondition } from '@stacks/transactions';


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
  // if (!metadata.whitelisted) {
  //   const isWhitelisted = await getIsWhitelisted(params.ca)
  //   if (isWhitelisted) {
  //     await setLandWhitelisted(params.ca, true)
  //   }
  // }
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
          <Card className="grid bg-black text-primary-foreground border-accent-foreground p-0 relative overflow-hidden rounded-md group/card w-full max-w-3xl opacity-[0.99] shadow-black shadow-2xl">
            <CardHeader className="z-20 p-4">
              <div className="flex items-center justify-start space-x-4">
                <Image src={metadata.image} width={200} height={200} alt='token-logo' className='h-[4.5rem] w-[4.5rem] rounded-full' />
                <div>
                  <CardTitle className="z-30 text-lg font-semibold sm:text-3xl">
                    {metadata.name}
                  </CardTitle>
                  <CardDescription className="z-30 text-sm sm:text-md font-fine text-muted-foreground">
                    {metadata.wraps.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid p-4">
              <div className="z-20">
                <div className="z-30 text-xl font-semibold">Overview</div>
                <CardDescription className="z-30 mb-6 text-sm font-fine text-foreground">
                  <p className="leading-normal text-primary-foreground/60">
                    Staking is a simple way to earn rewards by locking up your tokens. When you stake your tokens in the pool, you start earning Energy over time, which you can later use to get special rewards like tokens, NFTs, or access to exclusive activites. All you need to do is stake your tokens, and as long as they stay in the pool, you'll keep earning Energy. This is an easy way to earn extra perks and be more involved in your favorite memecoin community.
                  </p>
                </CardDescription>
              </div>
              {metadata.whitelisted &&
                <div className="z-20">
                  <div className="z-30 text-xl font-semibold">How to Use</div>
                  <CardDescription className="z-30 mb-6 text-sm font-fine text-foreground">
                    <p className="leading-normal text-primary-foreground/60">
                      To use the Stake-to-Earn pool, simply move the slider to the right to select the amount of tokens you want to stake, then press the Stake button. Make sure you're holding the tokens you want to stake in your wallet. To unstake, just move the slider to the left to choose the amount you want to withdraw, then press the Unstake button.
                    </p>
                  </CardDescription>
                </div>
              }

              <section className='grid grid-cols-2'>
                <div className="z-20">
                  <div className="z-30 text-xl font-semibold">Requirements</div>
                  <div className="z-30 mb-4 text-sm font-fine text-primary-foreground/60">
                    One sCHA is burned when staking or unstaking in this pool.
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="relative">
                      <Image
                        alt="protocol-fee-token-image"
                        src={schaImg}
                        quality={10}
                        className="z-30 w-full rounded-full"
                      />
                      <div className="absolute px-1 font-bold rounded-full -top-1 -right-3 text-md md:text-base lg:text-sm bg-accent text-accent-foreground min-w-6 text-center">
                        1
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </CardContent>
            <div className='grid p-4'>
              {metadata.whitelisted ?
                <LandControls
                  min={-landTokenBalance}
                  max={baseTokenBalance}
                  onSetTokensSelected={setTokensSelected}
                  tokensSelected={tokensSelected}
                  metadata={metadata}
                /> :
                <div className="z-20">
                  <div className="z-30 text-xl font-semibold">Community Approval Required</div>
                  <CardDescription className="z-30 mb-6 text-sm font-fine text-primary-foreground/60">
                    <p className="leading-normal">
                      Before this Stake-to-Earn pool can be activated, it needs to pass a governance proposal vote. To request community approval, you must hold at least 0.01% of the total supply of the CHA token. This requirement ensures that only invested and committed members can propose new pools, maintaining the integrity of the ecosystem. Once a proposal is submitted, community members who hold governance tokens can review and vote on it. If the proposal receives majority approval, the pool will be enabled for staking. This process empowers the community to collectively shape the future of the Charisma ecosystem while ensuring that proposals are made by those with a meaningful stake in the platform.
                    </p>
                  </CardDescription>
                  <GovernanceProposalButton metadata={metadata} />
                </div>
              }
            </div>
            <Image
              src={metadata.cardImage}
              width={800}
              height={1600}
              alt={'card-background-image'}
              className={cn(
                'object-cover',
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
  const proposal = metadata?.proposal?.split('.')

  const { openContractCall } = useOpenContractCall();

  const { block } = useGlobalState()

  function submitProposal() {
    openContractCall({
      contractAddress: "SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ",
      contractName: 'dme002-proposal-submission',
      functionName: "propose",
      functionArgs: [contractPrincipalCV(proposal[0], proposal[1]), uintCV(Number(block.height) + 15)],
    });
  }
  return (
    <Button onClick={submitProposal}>Request Approval</Button>
  )
}