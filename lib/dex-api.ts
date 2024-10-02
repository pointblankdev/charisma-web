import { callReadOnlyFunction, cvToJSON, principalCV, uintCV } from "@stacks/transactions";
import { StacksMainnet } from '@stacks/network';
import { callContractPublicFunction } from "./stacks-api";

async function lookupPool(token0: string, token1: string, senderAddress = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS') {
  const response: any = await callReadOnlyFunction({
    network: new StacksMainnet(),
    contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
    contractName: 'univ2-core',
    functionName: 'lookup-pool',
    functionArgs: [principalCV(token0), principalCV(token1)],
    senderAddress
  });
  return Number(response.value.value);
}

export const DEX = {
  lookupPool,
}