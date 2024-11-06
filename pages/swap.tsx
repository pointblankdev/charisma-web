import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import Layout from '@components/layout/layout';
import { StaticImageData } from 'next/image';
import stxLogo from '@public/stx-logo.png';
import welshLogo from '@public/welsh-logo.png';
import chaLogo from '@public/charisma-logo-square.png';
import rooLogo from '@public/roo-logo.png';
import ordiLogo from '@public/ordi-logo.png';
import dogLogo from '@public/sip10/dogLogo.webp';
import updogLogo from '@public/sip10/up-dog/logo.gif';
import syntheticStxLogo from '@public/sip10/synthetic-stx/logo.png';
import { GetStaticProps } from 'next';
import { PoolService } from '@lib/server/pools/pool-service';
import { TokenService } from '@lib/server/tokens/token-service';
import { SwapInterface } from '@components/swap/swap-interface';
import PricesService from '@lib/server/prices/prices-service';
import { ValuationService } from '@lib/server/valuations/valuation-service';

interface TokenInfo {
  symbol: string;
  name: string;
  image: StaticImageData;
  tokenName?: string;
  contractAddress: string;
  decimals: number;
}

interface PoolInfo {
  id: number;
  token0: TokenInfo;
  token1: TokenInfo;
  swapFee: { num: number; den: number };
}

type Props = {
  data: {
    chaPerStx: number;
    prices: any;
    tokens: TokenInfo[];
    pools: PoolInfo[];
  };
};

export const getStaticProps: GetStaticProps<Props> = async () => {
  // Get data from services
  const [tokens, pools, prices, chaPerStx] = await Promise.all([
    TokenService.getAll(),
    PoolService.getAll(),
    PricesService.getAllTokenPrices(),
    ValuationService.getChaPerStx()
  ]);

  // Import token images
  const tokenImages = {
    STX: stxLogo,
    WELSH: welshLogo,
    CHA: chaLogo,
    ROO: rooLogo,
    ORDI: ordiLogo,
    DOG: dogLogo,
    UPDOG: updogLogo,
    synSTX: syntheticStxLogo,
    iouWELSH: welshLogo,
    iouROO: rooLogo
  };

  // hack: Convert KVTokenData to TokenInfo (adding images)
  const tokenInfo = tokens.map(token => ({
    symbol: token.symbol,
    name: token.name,
    image: tokenImages[token.symbol as keyof typeof tokenImages],
    tokenName: token.tokenName || '',
    contractAddress: token.contractAddress,
    decimals: token.decimals
  }));

  // hack: Convert KVPoolData to PoolInfo
  const poolInfo = pools.map(pool => ({
    id: pool.id,
    token0: tokenInfo.find(t => t.symbol === pool.token0Symbol)!,
    token1: tokenInfo.find(t => t.symbol === pool.token1Symbol)!,
    swapFee: { num: 995, den: 1000 } // Standard fee for now
  }));

  return {
    props: {
      data: {
        chaPerStx,
        prices,
        tokens: tokenInfo,
        pools: poolInfo
      }
    },
    revalidate: 60
  };
};

export default function SwapPage({ data }: Props) {
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
          <div className="my-2 font-light text-center text-muted-foreground/90">
            All trading fees go to WELSH & ROO token redemptions
          </div>
          <SwapInterface data={data} />
        </div>
      </Layout>
    </Page>
  );
}
