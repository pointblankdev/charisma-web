import { Sip10Client } from './sip10.client';

const client = new Sip10Client();
describe('SIP10 Integration Tests', () => {
  test('batch get token info', async () => {
    const name = await client.batchGetTokenInfo([
      {
        contractAddress: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9',
        contractName: 'runes-dog'
      }
    ]);
    console.log(name);
  });
});
