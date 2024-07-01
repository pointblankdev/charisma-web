import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import Layout from '@components/layout';
import Image from 'next/image';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@components/ui/tooltip"
import { Info } from 'lucide-react';
import { Card } from '@components/ui/card';
import liquidCharisma from '@public/liquid-charisma.png'
import { GetStaticProps } from 'next';
import { callReadOnlyFunction } from '@stacks/transactions';
import { StacksMainnet } from "@stacks/network";
import { useState } from 'react';
import millify from 'millify';
import useWallet from '@lib/hooks/use-wallet-balances';
import StakingControls from '@components/liquidity/staking';
import velarApi from '@lib/velar-api';

export default function Stake({ data }: Props) {

  const meta = {
    title: 'Charisma | Stake Charisma Tokens',
    description: META_DESCRIPTION,
    image: '/liquid-charisma.png'
  };

  const tokensInPool = data.tokensInPool

  const { balances } = useWallet()

  const sCharismaBalance = (balances?.fungible_tokens?.['SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-charisma::liquid-staked-token'] as any)?.balance || 0
  const charismaBalance = (balances?.fungible_tokens?.['SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme000-governance-token::charisma'] as any)?.balance || 0

  const tvl = data.sChaToken.price * tokensInPool / Math.pow(10, Number(data.sChaToken.decimal.replace('u', '')))

  const [tokensSelected, setTokensSelected] = useState(0);

  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <div className="m-2 sm:container sm:mx-auto sm:py-10 md:max-w-2xl">

          <Card className='p-0 overflow-hidden bg-black text-primary-foreground border-accent-foreground rounded-xl relative'>
            <Image alt='Liquid Charisma' src={liquidCharisma} width="1080" height="605" className='border-b border-accent-foreground' />
            <div className='my-2 mx-4 absolute top-0 right-0 font-medium text-lg'>${millify(tvl)} TVL</div>
            <div className='m-2'>
              <div className='flex justify-between mb-2'>
                <h1 className="self-center font-bold text-md sm:text-2xl">Liquid Staked Charisma</h1>
                {data.exchangeRate && <div className="self-center px-2 my-1 text-xs font-light text-center rounded-full sm:text-lg sm:p-0 sm:px-4">
                  <div className="self-center px-2 my-1 text-xs font-light text-center rounded-full sm:text-lg bg-primary sm:p-0 sm:px-4">1 sCHA = {Number(data.exchangeRate) / 1000000} CHA</div>
                </div>}
              </div>

              <div className='flex justify-between'>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <div className='flex items-center gap-1 mb-2'>
                        <h1 className="font-bold text-left text-md">How Staking Works</h1>
                        <Info size={16} color='#948f8f' />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className='max-w-2xl leading-tight text-white bg-black border-primary'>
                      <h2 className="mb-2 text-lg font-bold">Interacting with the Staking Dashboard:</h2>
                      <ul className="pl-5 mb-4 space-y-2 list-disc text-md">
                        <li>
                          <b>Stake Tokens</b>: Stake your Charisma tokens to receive Liquid Staked Charisma (sCHA). The amount of sCHA you receive is calculated based on the current inverse exchange rate.
                        </li>
                        <li>
                          <b>Unstake Tokens</b>: Redeem your sCHA for Charisma tokens based on the current exchange rate.
                        </li>
                      </ul>
                      <p className="mb-4">
                        Staking your Charisma tokens allows you to participate in governance and earn staking rewards generated from network activities. Your staked tokens help secure the network and in return, you earn more tokens over time.
                      </p>
                      <p className="mb-4">
                        The staking interface aims to provide a transparent, user-friendly experience to support your investment decisions.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <div className='px-2 sm:p-0 sm:px-4'>
                  {millify(tokensInPool / 1000000)} CHA Staked
                </div>
              </div>
              <p className="mb-8 text-xs font-thin leading-tight sm:text-sm">
                Charisma Staking is a crucial part of the network's financial ecosystem, providing a way for token holders to earn passive income while contributing to the token's number-go-up mechanism.
              </p>
              <div className='space-y-2'>
                <StakingControls
                  min={-sCharismaBalance}
                  max={charismaBalance}
                  onSetTokensSelected={setTokensSelected}
                  tokensSelected={tokensSelected}
                  tokensRequested={0}
                  tokensRequired={[]}
                  contractAddress='SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS'
                  contractName='liquid-staked-charisma'
                  symbol={tokensSelected >= 0 ? 'CHA' : 'sCHA'}
                  baseTokenContractAddress='SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ'
                  baseTokenContractName='dme000-governance-token'
                  baseFungibleTokenName='charisma'
                  decimals={6}
                />
              </div>
            </div>
          </Card>
        </div>
      </Layout>
    </Page>
  );
}

type Props = {
  data: any;
};

export const getStaticProps: GetStaticProps<Props> = async () => {

  try {
    const lc: any = await callReadOnlyFunction({
      network: new StacksMainnet(),
      contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
      contractName: "liquid-staked-charisma",
      functionName: "get-exchange-rate",
      functionArgs: [],
      senderAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS'
    })


    const totalStaked: any = await callReadOnlyFunction({
      network: new StacksMainnet(),
      contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
      contractName: "liquid-staked-charisma",
      functionName: "get-total-in-pool",
      functionArgs: [],
      senderAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS'
    })

    const tokens = await velarApi.tokens('sCHA')
    const sChaToken = tokens.find((token: any) => token.contractAddress === 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-charisma')

    const data = {
      exchangeRate: Number(lc.value),
      tokensInPool: Number(totalStaked.value),
      sChaToken: sChaToken
    }

    return {
      props: { data },
      revalidate: 60
    };

  } catch (error) {
    console.error(error)
    return {
      props: {
        data: {}
      },
    }
  }
};