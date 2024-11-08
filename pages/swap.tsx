import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import Layout from '@components/layout/layout';
import { StaticImageData } from 'next/image';
import { GetStaticProps } from 'next';
import { SwapInterface } from '@components/swap/swap-interface';
import PricesService from '@lib/server/prices/prices-service';
import { ValuationService } from '@lib/server/valuations/valuation-service';
import { DexClient } from '@lib/server/pools/pools.client';
import { Sip10Client } from '@lib/server/sips/sip10.client';

// Import token images
import stxLogo from '@public/stx-logo.png';
import welshLogo from '@public/welsh-logo.png';
import chaLogo from '@public/charisma-logo-square.png';
import rooLogo from '@public/roo-logo.png';
import ordiLogo from '@public/ordi-logo.png';
import dogLogo from '@public/sip10/dogLogo.webp';
import updogLogo from '@public/sip10/up-dog/logo.gif';
import syntheticStxLogo from '@public/sip10/synthetic-stx/logo.png';
import { chawelsh, corgi9k, cpepe, pepe, vstx } from '@lib/token-images';
import { ContractAuditClient } from '@lib/server/audit/audit.client';

// Initialize clients
const poolClient = new DexClient();
const sip10Client = new Sip10Client();
const auditClient = new ContractAuditClient();

// Token images mapping
const tokenImages: Record<string, StaticImageData> = {
  STX: stxLogo,
  WELSH: welshLogo,
  CHA: chaLogo,
  $ROO: rooLogo,
  ordi: ordiLogo,
  DOG: dogLogo,
  UPDOG: updogLogo,
  synSTX: syntheticStxLogo,
  iouWELSH: welshLogo,
  iouROO: rooLogo,
  vWELSH: welshLogo,
  PEPE: pepe,
  cPEPE: cpepe,
  CORGI9K: corgi9k,
  vSTX: vstx,
  chaWELSH: chawelsh
};

export interface TokenInfo {
  symbol: string;
  name: string;
  image: StaticImageData;
  tokenName?: string;
  contractAddress: string;
  decimals: number;
}

export interface PoolInfo {
  id: string;
  token0: TokenInfo;
  token1: TokenInfo;
  swapFee: {
    num: number;
    den: number;
  };
}

export type Props = {
  data: {
    chaPerStx: number;
    prices: any;
    tokens: TokenInfo[];
    pools: PoolInfo[];
  };
};

// Helper to convert contract principal to address and name
const splitPrincipal = (principal: string) => {
  const [address, name] = principal.split('.');
  return { address, name };
};

// Token identifier cache to avoid redundant audits
const tokenIdentifierCache: Record<string, string> = {};

/**
 * Get token identifier from contract audit
 */
async function getTokenIdentifier(
  contractAddress: string,
  contractName: string
): Promise<string | undefined> {
  const contractId = `${contractAddress}.${contractName}`;

  // Check cache first
  if (tokenIdentifierCache[contractId]) {
    return tokenIdentifierCache[contractId];
  }

  try {
    const audit = await auditClient.auditContract(contractId);

    // Get first fungible token's identifier
    if (audit.fungibleTokens?.[0]?.tokenIdentifier) {
      const identifier = audit.fungibleTokens[0].tokenIdentifier;
      tokenIdentifierCache[contractId] = identifier;
      return identifier;
    }
  } catch (error) {
    console.error(`Failed to get token identifier for ${contractId}:`, error);
  }

  return undefined;
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  try {
    // Get number of pools
    const numPools = await poolClient.getNumberOfPools();
    const poolIds = [...Array(numPools + 1).keys()].map(i => i.toString());

    // Get pools data first to identify all tokens
    const pools = await poolClient.getPools(poolIds);

    // Create a unique set of token principals
    const tokenPrincipals = new Set<string>();
    pools.forEach(pool => {
      tokenPrincipals.add(pool.token0);
      tokenPrincipals.add(pool.token1);
    });

    // Get token info using SIP10 client
    const tokenQueries = Array.from(tokenPrincipals).map(principal => {
      const { address, name } = splitPrincipal(principal);
      return {
        contractAddress: address,
        contractName: name
      };
    });

    // Fetch data in parallel
    const [tokenInfos, prices, chaPerStx, tokenIdentifiers] = await Promise.all([
      sip10Client.batchGetTokenInfo(tokenQueries),
      PricesService.getAllTokenPrices(),
      ValuationService.getChaPerStx(),
      // Get token identifiers for all tokens
      Promise.all(
        tokenQueries.map(async ({ contractAddress, contractName }) =>
          getTokenIdentifier(contractAddress, contractName)
        )
      )
    ]);

    // Convert token info to TokenInfo format
    const tokens = tokenInfos.map((info, index) => {
      const principal = Array.from(tokenPrincipals)[index];
      const tokenIdentifier = tokenIdentifiers[index];

      info.symbol = info.symbol === 'wSTX' ? 'STX' : info.symbol;
      info.symbol = info.symbol === 'WELSH-iouWELSH' ? 'vWELSH' : info.symbol;
      return {
        symbol: info.symbol,
        name: info.name,
        image: tokenImages[info.symbol] || chaLogo, // Default to CHA logo if not found
        tokenName: tokenIdentifier,
        contractAddress: principal,
        decimals: info.decimals
      };
    });

    // Convert pool data to PoolInfo format
    const poolInfo = pools.map(pool => ({
      id: pool.id,
      token0: tokens.find(t => t.contractAddress === pool.token0)!,
      token1: tokens.find(t => t.contractAddress === pool.token1)!,
      swapFee: {
        num: pool.swapFee.numerator,
        den: pool.swapFee.denominator
      }
    }));

    return {
      props: {
        data: {
          chaPerStx,
          prices,
          tokens,
          pools: poolInfo
        }
      },
      revalidate: 60
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    throw error; // Let Next.js handle the error
  }
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
