
import { useRouter } from 'next/router';
import { SkipNavContent } from '@reach/skip-nav';

import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import ParticleBackground from '@components/lp/ParticleBackground';
import LandingPage from '@components/lp';
import { GetStaticProps } from 'next';
import { blocksApi } from '@lib/stacks-api';
import { callReadOnlyFunction } from '@stacks/transactions';
import { StacksMainnet } from "@stacks/network";

export default function Conf({ data }: Props) {
  const { query } = useRouter();
  const meta = {
    title: 'Charisma',
    description: META_DESCRIPTION
  };
  const ticketNumber = query.ticketNumber?.toString();
  const defaultUserData = {
    id: query.id?.toString(),
    ticketNumber: ticketNumber ? parseInt(ticketNumber, 10) : undefined,
    name: query.name?.toString(),
    username: query.username?.toString()
  };

  return (
    <Page meta={meta} fullViewport>
      <ParticleBackground />
      <SkipNavContent />
      <LandingPage
        defaultUserData={defaultUserData}
        defaultPageState={query.ticketNumber ? 'ticket' : 'registration'}
        data={data}
      />

    </Page>
  );
}


type Props = {
  data: any;
};

export const getStaticProps: GetStaticProps<Props> = async () => {

  try {
    const { results } = await blocksApi.getBlockList({ limit: 1 })

    const lc: any = await callReadOnlyFunction({
      network: new StacksMainnet(),
      contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
      contractName: "dme005-token-faucet-v0",
      functionName: "get-last-claim",
      functionArgs: [],
      senderAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS'
    })


    const d: any = await callReadOnlyFunction({
      network: new StacksMainnet(),
      contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
      contractName: "dme005-token-faucet-v0",
      functionName: "get-drip-amount",
      functionArgs: [],
      senderAddress: 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ'
    })

    const data = {
      lastClaim: Number(lc.value.value),
      dripAmount: Number(d.value.value),
      latestBlock: results[0].height
    }

    return {
      props: { data },
      revalidate: 60
    };

  } catch (error) {
    return {
      props: {
        data: {}
      },
    }
  }
};