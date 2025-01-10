import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import Layout from '@components/layout/layout';
import { GetStaticProps } from 'next';
import { SwapInterface } from '@components/swap/swap-interface';
import PricesService from '@lib/server/prices/prices-service';
import { ContractId, Dexterity, LPToken, Token } from 'dexterity-sdk';

Dexterity.configure({ apiKeyRotation: 'loop', parallelRequests: 10 }).catch(console.error);

const blacklist = [
  'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.chdollar',
  'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.dmg-runes',
  'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.uahdmg',
  'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.dmg-lp-token',
  'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.stx-lp-token',
  'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.abtc-dog-vault-wrapper-alex'
] as ContractId[];

export const getStaticProps: GetStaticProps<any> = async () => {
  const service = PricesService.getInstance();
  const prices = await service.getAllTokenPrices();
  const pools = await Dexterity.discover({ serialize: true, blacklist });
  const tokens = Dexterity.getTokens();

  return {
    props: {
      prices,
      tokens: tokens,
      pools: pools
    },
    revalidate: 60
  };
};

export default function SwapPage({
  prices,
  tokens,
  pools
}: {
  prices: any;
  tokens: Token[];
  pools: LPToken[];
}) {
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
          <SwapInterface prices={prices} tokens={tokens} pools={pools} />
        </div>
      </Layout>
    </Page>
  );
}
