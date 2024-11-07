import { describe, it, expect, beforeEach } from 'vitest';
import { KVTokenData, TokenService } from './token-service';

describe('TokenService', () => {
  const tokenData: KVTokenData[] = [
    {
      symbol: 'STX',
      name: 'Stacks',
      contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wstx',
      decimals: 6,
      imagePath: '/stx-logo.png'
    },
    {
      symbol: 'CHA',
      name: 'Charisma',
      tokenName: 'charisma',
      contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token',
      decimals: 6,
      imagePath: '/charisma-logo-square.png'
    },
    {
      symbol: 'WELSH',
      name: 'Welsh',
      tokenName: 'welshcorgicoin',
      contractAddress: 'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token',
      decimals: 6,
      imagePath: '/welsh-logo.png'
    },
    {
      symbol: 'iouWELSH',
      name: 'Synthetic Welsh',
      tokenName: 'synthetic-welsh',
      contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-welsh',
      decimals: 6,
      imagePath: '/welsh-logo.png'
    },
    {
      symbol: 'ROO',
      name: 'Roo',
      tokenName: 'kangaroo',
      contractAddress: 'SP2C1WREHGM75C7TGFAEJPFKTFTEGZKF6DFT6E2GE.kangaroo',
      decimals: 6,
      imagePath: '/roo-logo.png'
    },
    {
      symbol: 'iouROO',
      name: 'Synthetic Roo',
      tokenName: 'synthetic-roo',
      contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-roo',
      decimals: 6,
      imagePath: '/roo-logo.png'
    },
    {
      symbol: 'ORDI',
      name: 'Ordi',
      tokenName: 'brc20-ordi',
      contractAddress: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.brc20-ordi',
      decimals: 8,
      imagePath: '/ordi-logo.png'
    },
    {
      symbol: 'DOG',
      name: 'DOG-GO-TO-THE-MOON',
      tokenName: 'runes-dog',
      contractAddress: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.runes-dog',
      decimals: 8,
      imagePath: '/sip10/dogLogo.webp'
    },
    {
      symbol: 'UPDOG',
      name: 'Updog',
      tokenName: 'lp-token',
      contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.up-dog',
      decimals: 6,
      imagePath: '/sip10/up-dog/logo.gif',
      isLpToken: true,
      poolId: 8 // Reference to WELSH-DOG pool
    },
    {
      symbol: 'synSTX',
      name: 'Synthetic STX',
      tokenName: 'synthetic-stx',
      contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-stx',
      decimals: 6,
      imagePath: '/sip10/synthetic-stx/logo.png'
    },
    {
      symbol: 'vWELSH',
      name: 'Virtual Welsh',
      tokenName: 'lp-token',
      contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.welsh-iouwelsh',
      decimals: 6,
      imagePath: '/welsh-logo.png',
      isLpToken: true,
      poolId: 1
    },
    {
      symbol: 'PEPE',
      name: 'Pepe',
      tokenName: 'tokensoft-token',
      contractAddress: 'SP1Z92MPDQEWZXW36VX71Q25HKF5K2EPCJ304F275.tokensoft-token-v4k68639zxz',
      decimals: 3,
      imagePath: '/pepe-logo.png'
    },
    {
      symbol: 'cPEPE',
      name: 'President Pepe',
      tokenName: 'lp-token',
      contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.president-pepe',
      decimals: 6,
      imagePath: '/sip10/president-pepe/logo.jpg'
    },
    {
      symbol: 'chaWELSH',
      name: 'Charismatic Corgi',
      tokenName: 'lp-token',
      contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.cha-welsh',
      decimals: 6,
      imagePath: '/indexes/charismatic-corgi-logo.png',
      isLpToken: true,
      poolId: 3
    },
    {
      symbol: 'vSTX',
      name: 'Virtual STX',
      tokenName: 'lp-token',
      contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wstx-synstx',
      decimals: 6,
      imagePath: '/sip10/wstx-synstx/logo.png',
      isLpToken: true,
      poolId: 10
    },
    {
      symbol: 'CORGI9K',
      name: 'CORGI-9000',
      tokenName: 'lp-token',
      contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.corgi-9000',
      decimals: 6,
      imagePath: '/sip10/corgi-9000/logo.png'
    }
  ];

  beforeEach(async () => {
    // await TokenService.clear();
  });

  describe('Token Management', () => {
    it('should start with empty tokens', async () => {
      const tokens = await TokenService.getAll();
      expect(tokens).toEqual([]);
    });

    it('should set all tokens', async () => {
      await TokenService.set(tokenData);
      const tokens = await TokenService.getAll();
      expect(tokens).toHaveLength(tokenData.length);
      expect(tokens).toEqual(tokenData);
    }, 500000);
  });

  describe('Database Seeding', () => {
    it('should seed database with tokens', async () => {
      await TokenService.set(tokenData);
      const tokens = await TokenService.getAll();
      expect(tokens).toHaveLength(tokenData.length);

      // Verify a few specific tokens
      const stx = tokens.find(t => t.symbol === 'STX');
      expect(stx).toBeDefined();
      expect(stx?.contractAddress).toBe('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wstx');

      const cha = tokens.find(t => t.symbol === 'CHA');
      expect(cha).toBeDefined();
      expect(cha?.tokenName).toBe('charisma');
    });
  });
});
