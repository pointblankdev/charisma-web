import { kv } from '@vercel/kv';
import { cvToValue, hexToCV } from '@stacks/transactions';
import { client, getIsVerifiedInteraction, getTotalSupply } from './stacks-api';
import { getContractMetadata, getIndexContracts } from './db-providers/kv';

const CACHE_TTL = 300; // 5 minutes in seconds
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
    console.log(contract);
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
    await kv.set(cacheKey, reserves, { ex: CACHE_TTL });
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
    await kv.set(cacheKey, fees, { ex: CACHE_TTL });
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
