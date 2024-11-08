import { Sip10Client } from './sip10.client';

const client = new Sip10Client();
describe('SIP10 Integration Tests', () => {
  test('batch get token info', async () => {
    const name = await client.batchGetTokenInfo([
      {
        contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
        contractName: 'charisma-token'
      }
    ]);
    console.log(name);
  });
});
