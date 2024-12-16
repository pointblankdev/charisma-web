import { describe, test } from 'vitest';
import { TokenMetadataClient } from './client';

export const HOST = 'http://localhost:3001';

// Create test client
const client = new TokenMetadataClient(HOST, process.env.API_SECRET_KEY || '');

console.log('Token Metadata Client:', client, '\n');

// Test contract ID
const testContractId = 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.test-token';

describe('TokenMetadataClient Integration Tests', () => {
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
    const result1 = await client.get('SP15WAVKQNT241YVCGQMJS777E17H9TS96M21Q5DX.sexy-pepe');

    const result2 = await client.patch(
      'SP15WAVKQNT241YVCGQMJS777E17H9TS96M21Q5DX.sexy-pep',
      result1.metadata as any
    );

    console.log('Custom Generate Response:', JSON.stringify(result2, null, 2));
  });

  test('get metadata by contract ID', async () => {
    console.log('Testing metadata retrieval by contract ID...\n');

    // Test with multiple contract IDs
    const contractIds = [
      'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.test-token',
      'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.custom-token',
      'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nonexistent-token' // Testing with non-existent token
    ];

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

    const oldKey = 'SP15WAVKQNT241YVCGQMJS777E17H9TS96M21Q5DX.sexy-pepe';
    const newKey = 'SP15WAVKQNT241YVCGQMJS777E17H9TS96M21Q5DX.sexy-pep';

    try {
      const results = await client.migrateData(oldKey, newKey);
      console.log('Migration Results:', JSON.stringify(results, null, 2));
    } catch (error) {
      console.error('Migration failed:', error);
    }
  });
}, 200000);
