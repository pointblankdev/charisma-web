import { generateSecretKey } from '@stacks/wallet-sdk';
import {
  getNamesFromAddress,
  getNftURI,
  getTokenBalance,
  getTokenURI,
  getTotalSupply,
  getInteractionUri,
  getCollectionSize,
  getNftOwner,
  getAllContractEvents,
  getTokenMetadata,
} from './stacks-api';
import { describe, it, expect } from 'vitest';
import { getContractMetadata, setContractMetadata } from '../redis/kv';

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

  it('should get dex pool contract events', async () => {
    const events = await getAllContractEvents(
      'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.dungeon-master-liquidity'
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

  it('should get token metadata for single token', async () => {
    const metadata = await getTokenMetadata(
      'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token'
    );
    console.log(metadata);
  });

  it('should get contract metadata for single token', async () => {
    const metadata = await getContractMetadata(
      'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token'
    );
    console.log(metadata);
  });

  it('should update token metadata with decimals and token lookup', async () => {
    const contractId =
      'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.teenage-mutant-ninja-turtles-dexterity';
    const metadata = await getTokenMetadata(contractId);
    console.log(metadata);
    await setContractMetadata(contractId, {
      ...metadata
      // tokenA: 'SP3YB4JCE0H9QCE63MQ199BM8GXWV24E13G9J381F.mia-meme-token-mobile-legend'
      // description: 'The first permissionless pool and LP token created on Stacks.',
      // image: 'https://charisma.rocks/sip10/hooter/body.png'
    });
    const updatedMetadata = await getContractMetadata(contractId);
    console.log(updatedMetadata);
  });

  it('should update the token metadata field', async () => {
    const contractId = 'SPGYCP878RYFVT03ZT8TWGPKNYTSQB1578VVXHGE.charismatic-dollar-dexterity';
    const metadata = await getContractMetadata(contractId);
    await setContractMetadata(contractId, {
      ...metadata,
      image: 'https://charisma.rocks/indexes/cha-susdt.png'
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
}, 50000);
