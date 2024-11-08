// src/lib/clients/contract-audit.client.test.ts
import { describe, it } from 'vitest';
import { ContractAuditClient } from './audit.client';

// Initialize client with test URL
const client = new ContractAuditClient('http://localhost:3001/api/v0');

describe('ContractAuditClient', () => {
  it('successfully audits the contract', async () => {
    const contractId = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.corgi-9000';
    const audit = await client.auditContract(contractId);
    console.log(audit);
  }, 50000); // Increased timeout for contract analysis
});
