import { network } from '@components/stacks-session/connect';
import { fetchCallReadOnlyFunction, cvToJSON, principalCV, uintCV } from '@stacks/transactions';

async function lookupPool(
  token0: string,
  token1: string,
  senderAddress = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS'
) {
  const response: any = await fetchCallReadOnlyFunction({
    network: network,
    contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
    contractName: 'univ2-core',
    functionName: 'lookup-pool',
    functionArgs: [principalCV(token0), principalCV(token1)],
    senderAddress
  });
  return Number(response.value.value);
}

export const DEX = {
  lookupPool
};
