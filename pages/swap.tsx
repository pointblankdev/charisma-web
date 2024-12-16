import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import Layout from '@components/layout/layout';
import { GetStaticProps } from 'next';
import { SwapInterface } from '@components/swap/swap-interface';
import PricesService from '@lib/server/prices/prices-service';
import { DEXTERITY_ABI, getContractsByTrait } from '@lib/server/traits/service';
import { getDecimals, getIdentifier, getSymbol, getTokenMetadata } from '@lib/stacks-api';
import _ from 'lodash';

// Define default STX token data
const STX_TOKEN = {
  contractId: '.stx',
  metadata: {
    name: 'Stacks',
    symbol: 'STX',
    decimals: 6,
    identifier: '.stx',
    image: '/stx-logo.png',
    description: 'Native Stacks blockchain token'
  }
};

// Helper to get token data
async function getTokenData(contractId: string) {
  if (contractId === '.stx') return STX_TOKEN;

  return {
    contractId,
    metadata: {
      ...(await getTokenMetadata(contractId)),
      symbol: await getSymbol(contractId),
      decimals: await getDecimals(contractId),
      identifier: await getIdentifier(contractId)
    }
  };
}

// Helper to get pool data
async function getPoolData(contract: any) {
  const metadata = await getTokenMetadata(contract.contract_id);
  const [token0, token1] = await Promise.all([
    getTokenData(metadata.properties.tokenAContract),
    getTokenData(metadata.properties.tokenBContract)
  ]);

  return {
    contractId: contract.contract_id,
    metadata: {
      ...metadata,
      symbol: await getSymbol(contract.contract_id),
      decimals: await getDecimals(contract.contract_id),
      identifier: await getIdentifier(contract.contract_id)
    },
    token0,
    token1
  };
}

export const getStaticProps: GetStaticProps<any> = async () => {
  const service = PricesService.getInstance();

  // Get contracts and prices
  const [contracts, prices] = await Promise.all([
    getContractsByTrait({ traitAbi: DEXTERITY_ABI, limit: 100 }),
    service.getAllTokenPrices()
  ]);

  // Add STX price mapping
  prices['.stx'] = prices['SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.wstx'];

  // Get pools data
  const pools = await Promise.all(contracts.map((contract: any) => getPoolData(contract)));

  // Extract unique tokens from pools and add STX
  const tokens = _.uniqBy(
    [STX_TOKEN, ...pools.flatMap(pool => [pool.token0, pool.token1])],
    'contractId'
  );

  return {
    props: {
      data: { prices, tokens, pools }
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
