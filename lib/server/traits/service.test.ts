import { describe, test } from 'vitest';
import {
  getAllContractsByTrait,
  getContractInfo,
  getContractsByTrait,
  DEXTERITY_ABI
} from './service';

describe('Contracts by Trait Tests', () => {
  test('fetch NFT contracts implementing SIP-009', async () => {
    console.log('Fetching first batch of SIP-009 contracts...\n');

    const firstBatch = await getContractsByTrait({
      traitAbi: DEXTERITY_ABI,
      limit: 10
    });

    console.log('First 10 SIP-009 contracts:');
    console.log(JSON.stringify(firstBatch, null, 2));
    console.log('\n');

    // // Test pagination
    // console.log('Fetching second batch with offset...\n');
    // const secondBatch = await getContractsByTrait({
    //   traitAbi: SIP009_TRAIT_ABI,
    //   limit: 10,
    //   offset: 10
    // });

    // console.log('Next 10 SIP-009 contracts:');
    // console.log(JSON.stringify(secondBatch, null, 2));
    // console.log('\n');

    // // Test getAllContractsByTrait with smaller limit for testing
    // console.log('Fetching all SIP-009 contracts (limited to 25)...\n');
    // const allContracts = await getAllContractsByTrait(SIP009_TRAIT_ABI, 25);

    // console.log(`Found ${allContracts.length} total contracts:`);
    // console.log(JSON.stringify(allContracts, null, 2));
  }, 30000); // Increased timeout for API calls
});

describe('Get Contract By ID', () => {
  test('fetch contract by ID', async () => {
    console.log('Fetching contract by ID...\n');

    const contractId = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.dexterity-pool-v1';
    const contract = await getContractInfo(contractId);

    console.log('Contract by ID:');
    console.log(JSON.parse(contract.data.abi));
  }, 30000); // Increased timeout for API calls
}, 20000);
