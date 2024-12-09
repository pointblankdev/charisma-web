import { describe, test } from 'vitest';
import TokenRegistryClient from './registry.client';
import _ from 'lodash';

const registry = new TokenRegistryClient();

describe('Token Registry Operations', () => {
  test('listAll should return all tokens', async () => {
    const result = await registry.listAll();
    console.log(result);
  });

  test('listSymbols should return all symbol mappings', async () => {
    const result = await registry.listSymbols();
    console.log(result);
  });

  test('listMetadata should return all token metadata', async () => {
    const result = await registry.listMetadata();
    console.log(JSON.stringify(result, null, 2));
  });

  test('listLpTokens should return all LP tokens', async () => {
    const result = await registry.listLpTokens();
    console.log(result);
  });

  test('listAudits should return all contract audits', async () => {
    const result = await registry.listAudits();
    console.log(result);
  });

  test('listPools should return all pool relationships', async () => {
    const result = await registry.listPools();
    console.log(result);
  });

  test('listPrices should return all token prices', async () => {
    const result = await registry.listPrices();
    console.log(result);
  });
});
