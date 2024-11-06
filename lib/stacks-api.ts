import { createClient } from '@stacks/blockchain-api-client';
import { fetchCallReadOnlyFunction, cvToValue, parseToCV, hexToCV, cvToHex } from '@stacks/transactions';
import { cvToJSON } from '@stacks/transactions';

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

export async function getTokenBalance(contract = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token', user = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS') {
  const [address, name] = contract.split('.');

  const path = `/v2/contracts/call-read/${address}/${name}/get-balance` as any
  const response = await client.POST(path, {
    body: { sender: address, arguments: [cvToHex(parseToCV(String(user), 'principal'))] },
  });
  return Number(cvToValue(cvToValue(hexToCV(response.data.result))))
}

export async function getTokenURI(contract = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token') {
  const [address, name] = contract.split('.');

  const path = `/v2/contracts/call-read/${address}/${name}/get-token-uri` as any
  const response = await client.POST(path, {
    body: { sender: address, arguments: [] },
  });
  return cvToJSON(hexToCV(response.data.result)).value.value.value
}

export async function getTokenImage(contract = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token') {
  const [address, name] = contract.split('.');

  const path = `/v2/contracts/call-read/${address}/${name}/get-token-uri` as any
  const response = await client.POST(path, {
    body: { sender: address, arguments: [] },
  });
  const url = cvToJSON(hexToCV(response.data.result))?.value?.value?.value || 'https://charisma.rocks/charisma.json';
  return (await (await fetch(url)).json()).image;
}

export async function getNftURI(contract = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.odins-raven', tokenId = 1) {
  const [address, name] = contract.split('.');

  const path = `/v2/contracts/call-read/${address}/${name}/get-token-uri` as any
  const response = await client.POST(path, {
    body: { sender: address, arguments: [cvToHex(parseToCV(String(tokenId), 'uint128'))] },
  });
  const cv = cvToJSON(hexToCV(response.data.result))
  const url = cv.value.value.value.replace('{id}', tokenId);
  return await (await fetch(url)).json();
}

export async function getSymbol(contract = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token') {
  const [address, name] = contract.split('.');

  const path = `/v2/contracts/call-read/${address}/${name}/get-symbol` as any
  const response = await client.POST(path, {
    body: { sender: address, arguments: [] },
  });
  return String(cvToValue(hexToCV(response.data.result)).value)
}

export async function getTokenName(contract = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token') {
  const [address, name] = contract.split('.');

  const path = `/v2/contracts/call-read/${address}/${name}/get-name` as any
  const response = await client.POST(path, {
    body: { sender: address, arguments: [] },
  });
  return String(cvToValue(hexToCV(response.data.result)).value)
}


export async function getDecimals(contract = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token') {
  const [address, name] = contract.split('.');

  const path = `/v2/contracts/call-read/${address}/${name}/get-decimals` as any
  const response = await client.POST(path, {
    body: { sender: address, arguments: [] },
  });
  return Number(cvToValue(cvToValue(hexToCV(response.data.result))))
}

export async function getTotalSupply(contract = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token') {
  const [address, name] = contract.split('.');

  const path = `/v2/contracts/call-read/${address}/${name}/get-total-supply` as any
  const response = await client.POST(path, {
    body: { sender: address, arguments: [] },
  });
  return Number(cvToValue(cvToValue(hexToCV(response.data.result))))
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
