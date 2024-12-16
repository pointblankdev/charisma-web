import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import Layout from '@components/layout/layout';
import { GetStaticProps } from 'next';
import { SwapInterface } from '@components/swap/swap-interface';
import PricesService from '@lib/server/prices/prices-service';
import { DexClient } from '@lib/server/pools/pools.client';
import TokenRegistryClient, { charismaNames } from '@lib/server/registry/registry.client';
import { DEXTERITY_ABI, getContractsByTrait } from '@lib/server/traits/service';
import { getDecimals, getIdentifier, getSymbol, getTokenMetadata } from '@lib/stacks-api';
import _ from 'lodash';

// Initialize client
const service = PricesService.getInstance();

export const getStaticProps: GetStaticProps<any> = async () => {
  // Get enhanced token info and prices in parallel
  const [contracts, prices] = await Promise.all([
    getContractsByTrait({ traitAbi: DEXTERITY_ABI, limit: 100 }),
    service.getAllTokenPrices()
  ]);

  const tokens = [];
  const pools = [];

  // get all token metadata
  for (const contract of contracts) {
    const metadata = await getTokenMetadata(contract.contract_id);

    const metadataA = await getTokenMetadata(metadata.properties.tokenAContract);
    const metadataB = await getTokenMetadata(metadata.properties.tokenBContract);

    const token0 = {
      contractId: metadata.properties.tokenAContract,
      metadata: {
        ...metadataA,
        symbol: await getSymbol(metadata.properties.tokenAContract),
        decimals: await getDecimals(metadata.properties.tokenAContract),
        identifier: await getIdentifier(metadata.properties.tokenAContract)
      }
    };
    const token1 = {
      contractId: metadata.properties.tokenBContract,
      metadata: {
        ...metadataB,
        symbol: await getSymbol(metadata.properties.tokenBContract),
        decimals: await getDecimals(metadata.properties.tokenBContract),
        identifier: await getIdentifier(metadata.properties.tokenBContract)
      }
    };

    tokens.push(token0, token1);
    pools.push({
      contractId: contract.contract_id,
      metadata: {
        ...metadata,
        symbol: await getSymbol(contract.contract_id),
        decimals: await getDecimals(contract.contract_id),
        identifier: await getIdentifier(contract.contract_id)
      },
      token0,
      token1
    });
  }

  return {
    props: {
      data: {
        prices,
        tokens: _.uniqBy(tokens, 'contractId'),
        pools: pools
      }
    },
    revalidate: 60
  };
};

export default function SwapPage({ data }: any) {
  const meta = {
    title: 'Charisma | Swap',
    description: 'Swap tokens on the Charisma DEX',
    image: 'https://charisma.rocks/swap-screenshot.png'
  };

  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <div className="sm:container sm:mx-auto sm:pb-10 md:max-w-5xl">
          <SwapInterface data={data} />
        </div>
      </Layout>
    </Page>
  );
}
