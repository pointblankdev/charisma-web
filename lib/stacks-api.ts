import { createClient, Transaction } from '@stacks/blockchain-api-client';
import {
  fetchCallReadOnlyFunction,
  cvToValue,
  parseToCV,
  hexToCV,
  cvToHex,
  boolCV,
  uintCV,
  contractPrincipalCV
} from '@stacks/transactions';
import { cvToJSON } from '@stacks/transactions';
import { kv } from '@vercel/kv';
import { latestDungeonKeeperContract } from 'pages/admin';

const CACHE_DURATION = 60 * 60 * 24 * 7; // 7 days in seconds

export const client = createClient({
  baseUrl: 'https://api.mainnet.hiro.so'
});

client.use({
  onRequest({ request }) {
    request.headers.set('x-hiro-api-key', String(process.env.STACKS_API_KEY));
    return request;
  }
});

export async function getNamesFromAddress(address: string) {
  const response = await client.GET('/v1/addresses/{blockchain}/{address}', {
    params: {
      path: { blockchain: 'stacks', address }
    }
  });
  return response?.data?.names;
}

export async function getAccountBalance(principal: string) {
  const { data: response } = await client.GET('/extended/v1/address/{principal}/balances', {
    params: {
      path: { principal }
    }
  });
  return response;
}

export async function getBlocks({ limit = 1 }: { limit?: number } = {}) {
  const { data: response } = await client.GET('/extended/v2/blocks/', {
    params: {
      query: { limit }
    }
  });
  return response;
}

export async function getCollectionSize(
  contract = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token'
) {
  // Create a unique cache key
  const cacheKey = `collection-size:${contract}`;

  try {
    // Try to get from cache first
    const cachedSize = await kv.get(cacheKey);
    if (cachedSize !== null) {
      return Number(cachedSize);
    }

    // If not in cache, fetch from blockchain
    const [address, name] = contract.split('.');
    const path = `/v2/contracts/call-read/${address}/${name}/get-last-token-id` as any;
    const response = await client.POST(path, {
      body: { sender: address, arguments: [] }
    });

    const size = Number(cvToValue(cvToValue(hexToCV(response.data.result))));

    // Cache the result
    await kv.set(cacheKey, size, {
      ex: CACHE_DURATION
    });

    return size;
  } catch (error) {
    console.error(`Error fetching collection size for ${contract}:`, error);
    throw error;
  }
}

export async function getNftOwner(
  contract = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token',
  tokenId = 99
) {
  // Create a unique cache key
  const cacheKey = `nft-owner:${contract}:${tokenId}`;

  try {
    // Try to get from cache first
    const cachedOwner = await kv.get(cacheKey);
    if (cachedOwner !== null) {
      return cachedOwner;
    }

    // If not in cache, fetch from blockchain
    const [address, name] = contract.split('.');
    const path = `/v2/contracts/call-read/${address}/${name}/get-owner` as any;
    const response = await client.POST(path, {
      body: { sender: address, arguments: [cvToHex(parseToCV(String(tokenId), 'uint128'))] }
    });

    const owner = cvToValue(hexToCV(response.data.result)).value.value;

    // Cache the result
    await kv.set(cacheKey, owner, {
      ex: 60 // cache for 60 seconds
    });

    return owner;
  } catch (error) {
    console.error(`Error fetching owner for ${contract} token ${tokenId}:`, error);
    throw error;
  }
}

// Optional: Add a function to manually invalidate cache if needed
export async function invalidateNftCache(contract: string, tokenId?: number) {
  if (tokenId) {
    // Invalidate specific NFT owner cache
    await kv.del(`nft-owner:${contract}:${tokenId}`);
  } else {
    // Invalidate collection size cache
    await kv.del(`collection-size:${contract}`);
  }
}

export async function getTokenBalance(
  contract = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token',
  user = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS'
) {
  const [address, name] = contract.split('.');

  const path = `/v2/contracts/call-read/${address}/${name}/get-balance` as any;
  const response = await client.POST(path, {
    body: { sender: address, arguments: [cvToHex(parseToCV(String(user), 'principal'))] }
  });
  return Number(cvToValue(cvToValue(hexToCV(response.data.result))));
}

export async function getTokenURI(
  contract = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token'
) {
  const [address, name] = contract.split('.');

  const path = `/v2/contracts/call-read/${address}/${name}/get-token-uri` as any;
  const response = await client.POST(path, {
    body: { sender: address, arguments: [] }
  });
  return cvToJSON(hexToCV(response.data.result)).value.value.value;
}

export async function getTokenMetadata(
  contract = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token'
) {
  const [address, name] = contract.split('.');

  const path = `/v2/contracts/call-read/${address}/${name}/get-token-uri` as any;
  const response = await client.POST(path, {
    body: { sender: address, arguments: [] }
  });
  const url =
    cvToJSON(hexToCV(response.data.result))?.value?.value?.value ||
    'https://charisma.rocks/charisma.json';
  return await (await fetch(url)).json();
}

export async function getTokenImage(
  contract = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token'
) {
  const [address, name] = contract.split('.');

  const path = `/v2/contracts/call-read/${address}/${name}/get-token-uri` as any;
  const response = await client.POST(path, {
    body: { sender: address, arguments: [] }
  });
  const url =
    cvToJSON(hexToCV(response.data.result))?.value?.value?.value ||
    'https://charisma.rocks/charisma.json';
  return (await (await fetch(url, { mode: 'no-cors', redirect: 'follow' })).json()).image;
}

export async function getNftURI(
  contract = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.odins-raven',
  tokenId: string | number = 1
) {
  const CACHE_DURATION_1_YEAR = 60 * 60 * 24 * 365; // 1 year in seconds
  const cacheKey = `nft-uri:${contract}:${tokenId}`;

  try {
    // Try to get from cache first
    const cachedData = await kv.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // If not in cache, fetch from blockchain
    const [address, name] = contract.split('.');
    const path = `/v2/contracts/call-read/${address}/${name}/get-token-uri` as any;
    const response = await client.POST(path, {
      body: { sender: address, arguments: [cvToHex(parseToCV(String(tokenId), 'uint128'))] }
    });
    const cv = cvToJSON(hexToCV(response.data.result));
    let url = cv.value.value.value.replace('{id}', tokenId);

    // Handle ipfs:// protocol
    if (url.startsWith('ipfs://')) {
      url = url.replace('ipfs://', 'https://ipfs.io/');
    }

    // Handle direct IPFS gateway URLs
    const ipfsGateways = [
      'https://ipfs.io/',
      'https://gateway.ipfs.io/',
      'https://cloudflare-ipfs.com/',
      'https://dweb.link/',
      'https://ipfs.infura.io/'
    ];

    for (const gateway of ipfsGateways) {
      if (url.startsWith(gateway)) {
        const cid = url.replace(gateway, '');
        url = `https://ipfs.io/${cid}`;
      }
    }

    const result = await fetch(url);
    const out = await result.json();
    out.image = out.image.replace('ipfs://', 'https://ipfs.io/');

    // Cache the result
    await kv.set(cacheKey, out, {
      ex: CACHE_DURATION_1_YEAR
    });

    return out;
  } catch (error) {
    console.error('Error fetching NFT URI:', error);
    throw error;
  }
}

export async function getSymbol(
  contract = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token'
) {
  const [address, name] = contract.split('.');

  const path = `/v2/contracts/call-read/${address}/${name}/get-symbol` as any;
  const response = await client.POST(path, {
    body: { sender: address, arguments: [] }
  });
  return String(cvToValue(hexToCV(response.data.result)).value);
}

export async function getTokenName(
  contract = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token'
) {
  const [address, name] = contract.split('.');

  const path = `/v2/contracts/call-read/${address}/${name}/get-name` as any;
  const response = await client.POST(path, {
    body: { sender: address, arguments: [] }
  });
  return String(cvToValue(hexToCV(response.data.result)).value);
}

export async function getDecimals(
  contract = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token'
) {
  const [address, name] = contract.split('.');

  const path = `/v2/contracts/call-read/${address}/${name}/get-decimals` as any;
  const response = await client.POST(path, {
    body: { sender: address, arguments: [] }
  });
  return Number(cvToValue(cvToValue(hexToCV(response.data.result))));
}

export async function getTotalSupply(
  contract = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token'
) {
  try {
    const [address, name] = contract.split('.');
    const path = `/v2/contracts/call-read/${address}/${name}/get-total-supply` as any;
    const response = await client.POST(path, {
      body: { sender: address, arguments: [] }
    });
    return Number(cvToValue(cvToValue(hexToCV(response.data.result))));
  } catch (error) {
    return 0;
  }
}

export async function getIsVerifiedInteraction(
  contract = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.hoot-dex'
) {
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
  return verifiedCV;
}

export async function getDexterityReserves(
  contract = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.hoot-dex'
) {
  try {
    const [address, name] = contract.split('.');
    const path = `/v2/contracts/call-read/${address}/${name}/get-reserves` as any;
    const response = await client.POST(path, {
      body: { sender: address, arguments: [] }
    });
    const reservesCV = cvToValue(hexToCV(response.data.result)).value;
    return { token0: Number(reservesCV.token0.value), token1: Number(reservesCV.token1.value) };
  } catch (error) {
    return { token0: 0, token1: 0 };
  }
}

export async function getDexterityFees(
  contract = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.hoot-dex'
) {
  try {
    const [address, name] = contract.split('.');
    const path = `/v2/contracts/call-read/${address}/${name}/get-swap-fee` as any;
    const response = await client.POST(path, {
      body: { sender: address, arguments: [] }
    });
    const feesCV = cvToValue(hexToCV(response.data.result)).value;
    return {
      swapFee: { numerator: 1000 - feesCV / 1000, denominator: 1000 },
      protocolFee: { numerator: 0, denominator: 1000 },
      shareFee: { numerator: 0, denominator: 1000 }
    };
  } catch (error) {
    return {
      swapFee: { numerator: 1000, denominator: 1000 },
      protocolFee: { numerator: 0, denominator: 1000 },
      shareFee: { numerator: 0, denominator: 1000 }
    };
  }
}

export async function getDexterityQuote(
  contract = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.hoot-dex',
  forwardSwap = true,
  amountIn = 1000000,
  applyFee = true
) {
  try {
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
    return amountOut;
  } catch (error) {
    return 0;
  }
}

export async function getAvailableRedemptions() {
  const responseWelsh = await fetchCallReadOnlyFunction({
    contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
    contractName: 'redemption-vault-v0',
    functionName: 'get-available-welsh',
    functionArgs: [],
    senderAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS'
  });

  const responseRoo = await fetchCallReadOnlyFunction({
    contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
    contractName: 'redemption-vault-v0',
    functionName: 'get-available-roo',
    functionArgs: [],
    senderAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS'
  });

  return {
    welsh: Number(cvToJSON(responseWelsh).value.value),
    roo: Number(cvToJSON(responseRoo).value.value)
  };
}

export interface InteractionMetadata {
  url: string;
  image: string;
  name: string;
  subtitle: string;
  description: string[];
  contract: string;
  category: string;
  actions: string[];
  analytics?: any;
  tokenContract?: string;
}

export async function getInteractionUri(
  contractAddress: string,
  contractName: string
): Promise<InteractionMetadata | null> {
  try {
    // First get the URI from the contract
    const response = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-interaction-uri',
      functionArgs: [],
      senderAddress: contractAddress
    });
    const value = cvToValue(response).value;
    if (!value.value) return null;
    // Fetch the JSON metadata from the URI
    try {
      const metadataResponse = await fetch(value.value);
      const metadata: InteractionMetadata = await metadataResponse.json();
      return metadata;
    } catch (error) {
      console.error('Error fetching interaction metadata:', error);
      return null;
    }
  } catch (error) {
    console.error('Error fetching interaction URI:', error);
    return null;
  }
}

export const getKeepersPetitionRewardAmount = async () => {
  const response = await fetchCallReadOnlyFunction({
    contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
    contractName: 'keepers-petition-rc7',
    functionName: 'get-token-amount',
    functionArgs: [],
    senderAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS'
  });

  return cvToValue(response).value;
};

export const geFatigueEnergyCost = async () => {
  const response = await fetchCallReadOnlyFunction({
    contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
    contractName: 'fatigue-rc7',
    functionName: 'get-energy-burn-amount',
    functionArgs: [],
    senderAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS'
  });

  return cvToValue(response).value;
};

export async function getTransaction(txid: string) {
  const response = await client.GET('/extended/v1/tx/{tx_id}', {
    params: { path: { tx_id: txid } }
  });
  return response.data as Transaction;
}

/**
 * Get all contract events
 * @param contractId Contract identifier
 * @param totalLimit Maximum total number of events to fetch
 */
export async function getAllContractEvents(contractId: string, totalLimit: number = 5000) {
  const allEvents: any[] = [];
  let offset = 0;
  let hasMore = true;
  const limitPerRequest = 50;

  while (hasMore && allEvents.length < totalLimit) {
    const response: any = await client.GET('/extended/v1/contract/{contract_id}/events', {
      params: {
        path: { contract_id: contractId },
        query: {
          limit: Math.min(limitPerRequest, totalLimit - allEvents.length),
          offset
        }
      }
    });

    if (response?.data?.results && response.data.results.length > 0) {
      for (const event of response.data.results) {
        const contractEvent = cvToValue(hexToCV(event.contract_log.value.hex));
        const tx = await getTransaction(event.tx_id);
        const newContractEvent = {
          block_time: tx?.block_time,
          block_time_iso: tx?.block_time_iso,
          sender_address: tx?.sender_address,
          ...contractEvent
        };
        allEvents.push(newContractEvent);
      }
      offset += response.data.results.length;
      hasMore = response.data.results.length === limitPerRequest;
    } else {
      hasMore = false;
    }
  }

  return allEvents;
}
