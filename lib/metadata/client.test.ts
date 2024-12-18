import { describe, test } from 'vitest';
import { TokenMetadataClient } from './client';
describe('TokenMetadataClient Integration Tests', () => {
  const HOST = 'http://localhost:3000';
  // Create test client
  const client = new TokenMetadataClient(HOST, process.env.API_SECRET_KEY || '');
  // Test contract ID
  const testContractId = 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.test-token';

  test('full workflow - generate, get, update, patch', async () => {
    console.log('Starting token metadata workflow test...\n');

    // 1. Generate new metadata
    console.log('1. Generating new metadata...');
    const generateResult = await client.generate(testContractId, {
      name: 'Test Token',
      symbol: 'TEST',
      decimals: 8,
      identifier: 'TEST',
      description: 'A test token for integration testing',
      properties: {
        website: 'https://test.com',
        twitter: '@test'
      },
      imagePrompt: 'Create a simple, minimalist cryptocurrency token icon in blue and white.'
    });
    console.log('Generate Response:', JSON.stringify(generateResult, null, 2), '\n');

    // 2. Get metadata
    console.log('2. Getting metadata...');
    const getResult = await client.get(testContractId);
    console.log('Get Response:', JSON.stringify(getResult, null, 2), '\n');

    // 3. Update metadata
    console.log('3. Updating metadata...');
    const updateResult = await client.update(testContractId, {
      name: 'Updated Test Token',
      symbol: 'TEST',
      decimals: 8,
      identifier: 'TEST',
      description: 'An updated test token description',
      image: getResult.metadata?.image,
      properties: {
        website: 'https://test-updated.com',
        twitter: '@test_updated'
      }
    });
    console.log('Update Response:', JSON.stringify(updateResult, null, 2), '\n');

    // 4. Patch metadata
    console.log('4. Patching metadata...');
    const patchResult = await client.patch(testContractId, {
      description: 'A partially updated description'
    });
    console.log('Patch Response:', JSON.stringify(patchResult, null, 2), '\n');
  });

  test('move data to new endpoint', async () => {
    const result1 = await client.get('SP3T1M18J3VX038KSYPP5G450WVWWG9F9G6GAZA4Q.mecha-meme');

    const result2 = await client.patch('SP3T1M18J3VX038KSYPP5G450WVWWG9F9G6GAZA4Q.mecha-meme', {
      ...(result1.metadata as any),
      properties: {
        contractName: 'mecha-meme',
        tokenAContract: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token',
        tokenBContract: 'SP3HNEXSXJK2RYNG5P6YSEE53FREX645JPJJ5FBFA.meme-stxcity'
      }
    });

    console.log('Custom Generate Response:', JSON.stringify(result2, null, 2));
  });

  test('get metadata by contract ID', async () => {
    console.log('Testing metadata retrieval by contract ID...\n');

    // Test with multiple contract IDs
    const contractIds = ['SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.dungeon-master-liquidity'];

    for (const contractId of contractIds) {
      console.log(`Getting metadata for ${contractId}...`);
      try {
        const result = await client.get(contractId);
        console.log('Metadata Response:', JSON.stringify(result, null, 2), '\n');
      } catch (error) {
        console.log('Error Response:', error, '\n');
      }
    }
  });

  test('migrate data to new key', async () => {
    console.log('Starting full data migration...\n');

    const oldKey = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.dungeon-master-liquidity';
    const newKey = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.dungeon-master-liquidity';

    try {
      const results = await client.migrateData(oldKey, newKey);
      console.log('Migration Results:', JSON.stringify(results, null, 2));
    } catch (error) {
      console.error('Migration failed:', error);
    }
  });
}, 200000);
