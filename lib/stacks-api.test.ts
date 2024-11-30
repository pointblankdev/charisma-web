import { generateSecretKey } from '@stacks/wallet-sdk';
import {
  getNamesFromAddress,
  getNftURI,
  getTokenBalance,
  getTokenURI,
  getAvailableRedemptions,
  getTotalSupply,
  getInteractionUri,
  client,
  getCollectionSize,
  getNftOwner,
  getAllContractEvents,
  getTokenMetadata,
  getDecimals,
  getSymbol,
  getDexterityFees,
  getDexterityQuote
} from './stacks-api';
import { describe, it, expect } from 'vitest';
import { hexToInt } from '@stacks/common';
import { cvToValue, hexToCV } from '@stacks/transactions';
import { getContractMetadata, setContractMetadata } from './db-providers/kv';

describe('Stacks API', () => {
  it('should lookup a BNS name given an address', async () => {
    const address = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS';
    const names = await getNamesFromAddress(address);
    console.log(names);
  });

  it('should get marketplace contract events', async () => {
    const events = await getAllContractEvents(
      'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.marketplace-v6'
    );
    console.log(events);
  });

  it('should get babywelsh contract events', async () => {
    const events = await getAllContractEvents(
      'SP1Z92MPDQEWZXW36VX71Q25HKF5K2EPCJ304F275.tokensoft-token-v4kjvtr37ht'
    );
    console.log(events);
  });

  it('should get collection size', async () => {
    const size = await getCollectionSize('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.odins-raven');
    console.log(size);
  });

  it('should get nft owner', async () => {
    const owner = await getNftOwner('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.odins-raven', 99);
    console.log(owner);
  });

  // should get token uri
  it('should get token uri', async () => {
    const result = await getTokenURI(
      'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-welsh'
    );
    console.log(result);
    expect(result).toBeDefined();
  }, 20000);

  it('should get interaction URI', async () => {
    const result = await getInteractionUri(
      'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
      'keepers-petition-rc7'
    );
    console.log(result);
    expect(result).toBeDefined();
  });

  it('should get token metadata', async () => {
    const metadata = await getTokenMetadata(
      'SP20VRJRCZ3FQG7RE4QSPFPQC24J92TKDXJVHWEAW.charisma-phoenix-stxcity'
    );
    console.log(metadata);
  });

  it('should update token metadata with decimals and token lookup', async () => {
    const contractId =
      'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.natures-perfect-predator-dexterity';
    const metadata = await getTokenMetadata(contractId);
    await setContractMetadata(contractId, {
      ...metadata,
      image: 'https://charisma.rocks/indexes/npp.jpeg'
    });
    const updatedMetadata = await getContractMetadata(contractId);
    console.log(updatedMetadata);
  });

  it('should update the token metadata field', async () => {
    const contractId =
      'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.natures-perfect-predator-dexterity';
    const metadata = await getContractMetadata(contractId);
    await setContractMetadata(contractId, {
      ...metadata
    });
    const updatedMetadata = await getContractMetadata(contractId);
    console.log(updatedMetadata);
  });

  it('should get nft token uri', async () => {
    const result = await getNftURI('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.odins-raven', 9);
    console.log(result);
    expect(result).toBeDefined();
  });

  it('should get token balance', async () => {
    const result = await getTokenBalance(
      'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.experience',
      'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS'
    );
    console.log(result);
    expect(result).toBeDefined();
  });

  it('should get total supply', async () => {
    const result = await getTotalSupply('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.experience');
    console.log(result);
    expect(result).toBeDefined();
  });

  it('should get bns name', async () => {
    const result = await getNamesFromAddress('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS');
    console.log(result);
    expect(result).toBeDefined();
  });

  it('should generate a seed phrase', () => {
    const secretKey128 = generateSecretKey(128);
    console.log(secretKey128);
    expect(secretKey128).toBeDefined();
  });
});

describe('Recovery', () => {
  it('should get available redemptions', async () => {
    const response = await getAvailableRedemptions();
    console.log(response);
  });
});

describe('Dexterity Pools', () => {
  it('should get fees', async () => {
    const fees = await getDexterityFees('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.hoot-dex');
    console.log(fees);
  });
  it('should get quote', async () => {
    const amountOut = await getDexterityQuote(
      'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.cyclops-liquidity-dexterity',
      false,
      1000000,
      false
    );
    console.log(amountOut);
  });
}, 200000);
