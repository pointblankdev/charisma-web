// src/lib/clients/contract-audit.client.test.ts
import { describe, expect, it } from 'vitest';
import { ContractAuditClient } from './audit.client';

// Initialize client with test URL
const client = new ContractAuditClient('http://localhost:3000/api/v0');

describe('ContractAuditClient', () => {
  it('successfully audits the contract', async () => {
    // Use the Arcana contract as a test case since we know its structure
    const contractId = 'SP1Z92MPDQEWZXW36VX71Q25HKF5K2EPCJ304F275.tokensoft-token-v4k68639zxz';

    const audit = await client.auditContract(contractId);

    console.log(audit);
  }, 50000); // Increased timeout for contract analysis
});
