import { GetStaticProps } from 'next';
import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import Layout from '@components/layout/layout';
import { Card } from '@components/ui/card';
import { useEffect, useState } from 'react';
import useWallet from '@lib/hooks/wallet-balance-provider';
import { motion } from 'framer-motion';
import { PoolsInterface } from '@components/pools/pools-interface';
import PricesService from '@lib/server/prices/prices-service';
import PoolsLayout from '@components/pools/layout';
import { DexClient } from '@lib/server/pools/pools.client';
import { ContractAuditClient } from '@lib/server/audit/audit.client';
import { Sip10Client } from '@lib/server/sips/sip10.client';
import { cha, stx, welsh } from '@lib/token-images';

// Initialize clients
const dexClient = new DexClient();
const sip10Client = new Sip10Client();
const auditClient = new ContractAuditClient();

// Token images mapping
const tokenImages = {
  STX: stx,
  WELSH: welsh,
  CHA: cha
  // ... (rest of image mapping)
};

export interface TokenInfo {
  symbol: string;
  name: string;
  image: string;
  contractAddress: string;
  tokenId: string | null;
  decimals: number;
  price: number;
  isLpToken: boolean;
  poolId?: number | null;
  // Added fields from audit
  isMintable?: boolean;
  isBurnable?: boolean;
  isTransferable?: boolean;
  alignment?: number;
}

export interface PoolInfo {
  id: number;
  name: string;
  symbol: string;
  image: string;
  token0: TokenInfo;
  token1: TokenInfo;
  reserves: {
    token0: number;
    token1: number;
  };
  tvl: number;
  contractAddress: string;
  totalLpSupply: number;
  // Added fields from audit
  swapFee: {
    numerator: number;
    denominator: number;
  };
  alignment: number; // Pool's overall alignment based on tokens
}

type Props = {
  data: {
    pools: PoolInfo[];
    tokenPrices: { [key: string]: number };
  };
};

// Helper to convert contract principal to address and name
const splitPrincipal = (principal: string) => {
  const [address, name] = principal.split('.');
  return { address, name };
};

// Cache for responses
const responseCache = new Map<string, any>();

/**
 * Get comprehensive token information using all services
 */
async function getEnhancedTokenInfo(principal: string) {
  const cacheKey = `token:${principal}`;
  if (responseCache.has(cacheKey)) {
    return responseCache.get(cacheKey);
  }

  const { address, name } = splitPrincipal(principal);

  try {
    // Fetch data from all services in parallel
    const [sip10Info, audit] = await Promise.all([
      sip10Client.getTokenInfo(address, name),
      auditClient.auditContract(principal)
    ]);

    // Combine the data
    const tokenData = {
      sip10: sip10Info,
      audit: audit?.fungibleTokens?.[0]
      // Add any additional data sources here
    };
    console.log(tokenData);

    responseCache.set(cacheKey, tokenData);
    return tokenData;
  } catch (error) {
    console.error(`Error fetching token info for ${principal}:`, error);
    return null;
  }
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  try {
    // Get number of pools
    const numPools = await dexClient.getNumberOfPools();
    const poolIds = [...Array(numPools).keys()].map(i => i.toString());

    // Get pools data first
    const pools = await dexClient.getPools(poolIds);

    // Create a unique set of token principals
    const tokenPrincipals = new Set<string>();
    pools.forEach(pool => {
      tokenPrincipals.add(pool.token0);
      tokenPrincipals.add(pool.token1);
    });

    // Get enhanced token info and prices in parallel
    const [tokenInfos, prices] = await Promise.all([
      Promise.all(Array.from(tokenPrincipals).map(principal => getEnhancedTokenInfo(principal))),
      PricesService.getAllTokenPrices()
    ]);

    // Convert combined data to TokenInfo format
    const tokenMap = new Map<string, TokenInfo>();
    Array.from(tokenPrincipals).forEach((principal, index) => {
      const info = tokenInfos[index];
      if (!info) return;

      const { sip10, audit } = info;
      const symbol =
        sip10.symbol === 'wSTX'
          ? 'STX'
          : sip10.symbol === 'WELSH-iouWELSH'
          ? 'vWELSH'
          : sip10.symbol;

      tokenMap.set(principal, {
        symbol,
        name: sip10.name,
        image: sip10?.metadata?.image || tokenImages[symbol as keyof typeof tokenImages] || cha,
        contractAddress: principal,
        tokenId: audit?.tokenIdentifier || null,
        decimals: sip10.decimals,
        price: prices[symbol] || 0,
        isLpToken: audit.isLpToken || false,
        // Add audit data
        isMintable: audit?.isMintable || false,
        isBurnable: audit?.isBurnable || false,
        isTransferable: audit?.isTransferable || false,
        alignment: info.audit?.arcanaRecommendation?.alignment || 0
      });
    });

    // Convert pool data to PoolInfo format with enhanced information
    const poolInfo = pools
      .map(pool => {
        const token0 = tokenMap.get(pool.token0)!;
        const token1 = tokenMap.get(pool.token1)!;

        const reserve0 = Number(pool.reserve0) / Math.pow(10, token0.decimals);
        const reserve1 = Number(pool.reserve1) / Math.pow(10, token1.decimals);

        return {
          id: Number(pool.id),
          name: `${token0?.symbol}/${token1?.symbol}`,
          symbol: `${token0?.symbol}/${token1?.symbol}`,
          image: token0?.image || '',
          token0,
          token1,
          reserves: {
            token0: reserve0,
            token1: reserve1
          },
          tvl: reserve0 * token0.price + reserve1 * token1.price,
          contractAddress: pool.id,
          totalLpSupply: Number(pool.totalSupply),
          swapFee: {
            numerator: pool.swapFee.numerator,
            denominator: pool.swapFee.denominator
          },
          // Calculate pool alignment as average of token alignments
          alignment:
            token0?.alignment && token1?.alignment
              ? Math.round((token0.alignment + token1.alignment) / 2)
              : 0
        };
      })
      .filter(pool => pool !== null)
      .filter(pool => !pool.token0.isLpToken && !pool.token1.isLpToken)
      .sort((a, b) => b.tvl - a.tvl); // Sort by TVL

    return {
      props: {
        data: {
          pools: poolInfo,
          tokenPrices: prices
        }
      },
      revalidate: 600
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return {
      props: {
        data: {
          pools: [],
          tokenPrices: {}
        }
      },
      revalidate: 10
    };
  }
};

export default function SpotPoolsPage({ data }: Props) {
  const meta = {
    title: 'Charisma | Spot Pools',
    description: 'View and manage spot liquidity pools on the Charisma DEX',
    image: 'https://charisma.rocks/pools-screenshot.png'
  };

  const { wallet } = useWallet();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (wallet) setLoading(false);
  }, [wallet]);

  const isAuthorized = wallet.experience.balance >= 1000 || wallet.redPilled;

  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        {!loading && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
            className="sm:max-w-[2400px] sm:mx-auto sm:pb-10"
          >
            <PoolsLayout>
              {isAuthorized ? (
                <PoolsInterface data={data} title={'Spot Pools'} />
              ) : (
                <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
                  <Card className="w-full max-w-lg p-6 text-center">
                    <h2 className="mb-4 text-2xl font-bold">Access Restricted</h2>
                    <p className="mb-4">To view and manage liquidity pools, you need either:</p>
                    <ul className="mb-4 text-left list-disc list-inside">
                      <li
                        className={
                          wallet.experience.balance >= 1000 ? 'text-green-500' : 'text-red-500'
                        }
                      >
                        At least 1000 Experience {wallet.experience.balance >= 1000 ? '✓' : '✗'}
                      </li>
                      <li className={wallet.redPilled ? 'text-green-500' : 'text-red-500'}>
                        Own the Red Pill NFT {wallet.redPilled ? '✓' : '✗'}
                      </li>
                    </ul>
                    <p className="text-sm text-muted-foreground">
                      Continue using Charisma to gain more experience and unlock this feature.
                    </p>
                  </Card>
                </div>
              )}
            </PoolsLayout>
          </motion.div>
        )}
      </Layout>
    </Page>
  );
}
