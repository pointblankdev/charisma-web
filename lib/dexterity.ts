import { kv } from '@vercel/kv';
import {
  boolCV,
  contractPrincipalCV,
  cvToHex,
  cvToValue,
  hexToCV,
  uintCV
} from '@stacks/transactions';
import { client, getTotalSupply } from './hiro/stacks-api';
import { getContractMetadata, getIndexContracts } from './redis/kv';

const CACHE_PREFIX = 'dexterity:';

interface DexterityReserves {
  token0: number;
  token1: number;
}

interface Fee {
  numerator: number;
  denominator: number;
}

interface DexterityFees {
  swapFee: Fee;
  protocolFee: Fee;
  shareFee: Fee;
}

export async function buildDexterityPools(tokens: any[]) {
  const dexterityPools = [];
  const dexterityContracts = await getIndexContracts();
  for (const contract of dexterityContracts) {
    const dflt = { contractId: '', metadata: {} };
    const [contractMetadata, verified, reserves, totalSupply, fees] = await Promise.all([
      getContractMetadata(contract),
      getIsVerifiedInteraction(contract),
      getDexterityReserves(contract),
      getTotalSupply(contract),
      getDexterityFees(contract)
    ]);
    dexterityPools.push({
      contractId: contract,
      audit: tokens.find((t: any) => t.contractId === contract || '')?.audit || {},
      metadata: { decimals: 6, ...contractMetadata, verified },
      lpInfo: {
        dex: 'DEXTERITY',
        token0: contractMetadata?.tokenA || '',
        token1: contractMetadata?.tokenB || ''
      },
      poolData: {
        token0: contractMetadata?.tokenA || '',
        token1: contractMetadata?.tokenB || '',
        reserve0: reserves.token0,
        reserve1: reserves.token1,
        lpToken: contract,
        totalSupply: totalSupply,
        ...fees
      },
      token0: tokens.find((t: any) => t.contractId === contractMetadata?.tokenA || '') || dflt,
      token1: tokens.find((t: any) => t.contractId === contractMetadata?.tokenB || '') || dflt
    });
  }
  return dexterityPools;
}

/**
 * Get reserves from cache or fetch from contract
 */
export async function getDexterityReserves(
  contract = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.hoot-dex'
): Promise<DexterityReserves> {
  const cacheKey = `${CACHE_PREFIX}reserves:${contract}`;

  try {
    // Try to get from cache
    const cached = await kv.get<DexterityReserves>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    // If not in cache, fetch from contract
    const [address, name] = contract.split('.');
    const path = `/v2/contracts/call-read/${address}/${name}/get-reserves` as any;
    const response = await client.POST(path, {
      body: { sender: address, arguments: [] }
    });

    const reservesCV = cvToValue(hexToCV(response.data.result)).value;
    const reserves = {
      token0: Number(reservesCV.token0.value),
      token1: Number(reservesCV.token1.value)
    };

    // Cache the result
    await kv.set(cacheKey, reserves, { ex: 60 });
    return reserves;
  } catch (error) {
    console.error(`Error fetching reserves for ${contract}:`, error);
    return { token0: 0, token1: 0 };
  }
}

/**
 * Get fees from cache or fetch from contract
 */
export async function getDexterityFees(
  contract = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.hoot-dex'
): Promise<DexterityFees> {
  const cacheKey = `${CACHE_PREFIX}fees:${contract}`;

  try {
    // Try to get from cache
    const cached = await kv.get<DexterityFees>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    // If not in cache, fetch from contract
    const [address, name] = contract.split('.');
    const path = `/v2/contracts/call-read/${address}/${name}/get-swap-fee` as any;
    const response = await client.POST(path, {
      body: { sender: address, arguments: [] }
    });

    const feesCV = cvToValue(hexToCV(response.data.result)).value;
    const fees = {
      swapFee: { numerator: 1000 - feesCV / 1000, denominator: 1000 },
      protocolFee: { numerator: 0, denominator: 1000 },
      shareFee: { numerator: 0, denominator: 1000 }
    };

    // Cache the result
    await kv.set(cacheKey, fees, { ex: 60 * 60 * 24 });
    return fees;
  } catch (error) {
    console.error(`Error fetching fees for ${contract}:`, error);
    return {
      swapFee: { numerator: 1000, denominator: 1000 },
      protocolFee: { numerator: 0, denominator: 1000 },
      shareFee: { numerator: 0, denominator: 1000 }
    };
  }
}

export async function getIsVerifiedInteraction(
  contract = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.hoot-dex'
) {
  const cacheKey = `${CACHE_PREFIX}verified:${contract}`;

  try {
    // Try to get from cache
    const cached = await kv.get<boolean>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const [
      rulesAddress,
      rulesName
    ] = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-rulebook-v0'.split('.');
    const [address, name] = contract.split('.');
    const path = `/v2/contracts/call-read/${rulesAddress}/${rulesName}/is-verified-interaction` as any;
    const response = await client.POST(path, {
      body: { sender: address, arguments: [cvToHex(contractPrincipalCV(address, name))] }
    });
    const verifiedCV = cvToValue(hexToCV(response.data.result)).value;

    // Cache for 7 days
    await kv.set(cacheKey, verifiedCV, { ex: 60 * 60 * 24 * 7 });
    return verifiedCV;
  } catch (error) {
    return false;
  }
}

export async function getDexterityQuote(
  contract = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.hoot-dex',
  forwardSwap = true,
  amountIn = 1000000,
  applyFee = true
) {
  const cacheKey = `${CACHE_PREFIX}quote:${contract}:${forwardSwap}:${amountIn}:${applyFee}`;

  try {
    // Try to get from cache
    const cached = await kv.get<number>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const [address, name] = contract.split('.');
    const path = `/v2/contracts/call-read/${address}/${name}/get-quote` as any;
    const response = await client.POST(path, {
      body: {
        sender: address,
        arguments: [
          cvToHex(boolCV(forwardSwap)),
          cvToHex(uintCV(amountIn)),
          cvToHex(boolCV(applyFee))
        ]
      }
    });
    const amountOut = cvToValue(hexToCV(response.data.result)).value;

    // Cache for 30 seconds
    await kv.set(cacheKey, amountOut, { ex: 30 });
    return amountOut;
  } catch (error) {
    return 0;
  }
}

/**
 * Helper function to invalidate cache for a specific contract
 */
export async function invalidateDexterityCache(contract: string): Promise<void> {
  try {
    const reservesCacheKey = `${CACHE_PREFIX}reserves:${contract}`;
    const feesCacheKey = `${CACHE_PREFIX}fees:${contract}`;

    await Promise.all([kv.del(reservesCacheKey), kv.del(feesCacheKey)]);
  } catch (error) {
    console.error(`Error invalidating cache for ${contract}:`, error);
  }
}

/**
 * Clear all dexterity-related cache entries
 */
export async function clearDexterityCache(): Promise<void> {
  try {
    const keys = await kv.keys(`${CACHE_PREFIX}*`);
    if (keys.length > 0) {
      await kv.del(...keys);
    }
  } catch (error) {
    console.error('Error clearing dexterity cache:', error);
  }
}
