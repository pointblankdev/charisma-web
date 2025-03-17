import { STACKS_MAINNET } from '@stacks/network';
import { fetchCallReadOnlyFunction, cvToJSON, principalCV } from '@stacks/transactions';

async function getTransactionsAvailable(
  senderAddress = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS'
) {
  const response: any = await fetchCallReadOnlyFunction({
    network: STACKS_MAINNET,
    contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
    contractName: 'charisma-token',
    functionName: 'get-txs-available',
    functionArgs: [],
    senderAddress
  });
  return Number(response.value.value);
}

async function getBlocksUntilUnlock(senderAddress = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS') {
  const response: any = await fetchCallReadOnlyFunction({
    network: STACKS_MAINNET,
    contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
    contractName: 'charisma-token',
    functionName: 'get-blocks-until-unlock',
    functionArgs: [],
    senderAddress
  });
  return Number(response.value.value);
}

async function getBlocksPerTransaction(
  senderAddress = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS'
) {
  const response: any = await fetchCallReadOnlyFunction({
    network: STACKS_MAINNET,
    contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
    contractName: 'charisma-token',
    functionName: 'get-blocks-per-tx',
    functionArgs: [],
    senderAddress
  });
  return Number(response.value.value);
}

async function getTokensPerTransaction(
  senderAddress = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS'
) {
  const response: any = await fetchCallReadOnlyFunction({
    network: STACKS_MAINNET,
    contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
    contractName: 'charisma-token',
    functionName: 'get-max-liquidity-flow',
    functionArgs: [],
    senderAddress
  });
  return Number(response.value.value);
}

async function hasFreeClaim(address: string) {
  const response: any = await fetchCallReadOnlyFunction({
    network: STACKS_MAINNET,
    contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
    contractName: 'charisma-claims',
    functionName: 'has-free-claim',
    functionArgs: [principalCV(address)],
    senderAddress: address
  });
  return Boolean(cvToJSON(response).value);
}

async function hasClaimed(address: string) {
  const response: any = await fetchCallReadOnlyFunction({
    network: STACKS_MAINNET,
    contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
    contractName: 'charisma-claims',
    functionName: 'has-claimed',
    functionArgs: [principalCV(address)],
    senderAddress: address
  });
  return Boolean(cvToJSON(response).value);
}

export const CharismaToken = {
  getTransactionsAvailable,
  getBlocksUntilUnlock,
  getBlocksPerTransaction,
  getTokensPerTransaction,
  hasFreeClaim,
  hasClaimed
};
