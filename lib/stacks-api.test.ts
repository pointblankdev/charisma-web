import { generateSecretKey } from '@stacks/wallet-sdk';
import {
  getNamesFromAddress,
  getNftURI,
  getTokenBalance,
  getTokenURI,
  getAvailableRedemptions,
  getTotalSupply,
  getInteractionUri,
  client,
  getCollectionSize,
  getNftOwner,
  getAllContractEvents,
  getTokenMetadata,
  getDecimals,
  getSymbol,
  getAccountBalance
} from './stacks-api';
import { describe, it, expect } from 'vitest';
import { hexToInt } from '@stacks/common';
import { cvToValue, hexToCV } from '@stacks/transactions';
import { getContractMetadata, setContractMetadata } from './db-providers/kv';
import { getDexterityFees, getDexterityQuote, getIsVerifiedInteraction } from './dexterity';
import { addresses } from './server/aibtcdev.constants';
import { writeFileSync } from 'fs';
import PricesService from './server/prices/prices-service';

const service = PricesService.getInstance();

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
    const metadata = await getTokenMetadata('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wstx-cha');
    console.log(metadata);
  });

  it('should get contract metadata for single token', async () => {
    const metadata = await getContractMetadata(
      'SP2J6Y09JMFWWZCT4VJX0BA5W7A9HZP5EX96Y6VZY.mentalbalance-dexterity'
    );
    console.log(metadata);
  });

  it('should update token metadata with decimals and token lookup', async () => {
    const contractId = 'SP3M31QFF6S96215K4Y2Z9K5SGHJN384NV6YM6VM8.satoshai';
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
});

describe('Recovery', () => {
  it('should get available redemptions', async () => {
    const response = await getAvailableRedemptions();
    console.log(response);
  });
});

describe('Dexterity Pools', () => {
  it('should get is verified interaction', async () => {
    const verified = await getIsVerifiedInteraction(
      'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.hoot-dex'
    );
    console.log(verified);
  });
  it('should get fees', async () => {
    const fees = await getDexterityFees('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.hoot-dex');
    console.log(fees);
  });
  it('should get quote', async () => {
    const amountOut = await getDexterityQuote(
      'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.cyclops-liquidity-dexterity',
      false,
      1000000,
      false
    );
    console.log(amountOut);
  });
}, 200000);

describe('AI BTC Dev', async () => {
  const prices = await service.getAllTokenPrices();

  it('should get balances at block 260000', async () => {
    const balances = await getAccountBalance('SP1FFZ1HEAC0Y9GF4QCSRVHVRASPF1TZPAGRS2X9J', '260000');
    console.log(balances);
  });

  it('should format and write balances to file', async () => {
    const allBalances = [];
    for (const address of addresses) {
      const balances = await getAccountBalance(address, '260000');
      const formattedBalances = {
        address,
        stx: Number(balances?.stx.balance),
        tokens: Object.entries(balances?.fungible_tokens as any).reduce(
          (acc: { [key: string]: any }, [key, value]: any) => {
            const balance = Number(value?.balance);
            if (balance > 0) {
              acc[key] = balance;
            }
            return acc;
          },
          {} as { [key: string]: any }
        )
      };
      if (formattedBalances.stx > 0 || Object.keys(formattedBalances.tokens).length > 0) {
        allBalances.push(formattedBalances);
      }
    }
    allBalances.sort((a, b) => b.stx - a.stx);
    writeFileSync('./output/balances.json', JSON.stringify(allBalances, null, 2));
  });

  it('should calculate itemized balance in USD for each address and total portfolio balance', async () => {
    const allBalances = [];
    const missingTokens = new Set<string>();
    const decimalsMap = new Map<string, number>();

    for (const address of addresses) {
      const balances = await getAccountBalance(address, '260000');
      const formattedBalances: any = {
        address,
        stx: {
          tokenBalance: Number(balances?.stx.balance),
          decimals: 6,
          balanceWithDecimals: Number(balances?.stx.balance) / 10 ** 6,
          tokenPrice: Number(prices['SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wstx'] || 0),
          usdValue:
            (Number(balances?.stx.balance) / 10 ** 6) *
            Number(prices['SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wstx'] || 0)
        },
        tokens: await Object.entries(balances?.fungible_tokens || {}).reduce(
          async (accPromise: Promise<{ [key: string]: any }>, [key, value]: any) => {
            const acc = await accPromise;
            const tokenKey = key.split('::')[0];
            let decimals = decimalsMap.get(tokenKey);
            if (decimals === undefined) {
              decimals = await getDecimals(tokenKey);
              decimalsMap.set(tokenKey, decimals);
            }
            const balance = Number(value?.balance);
            const balanceWithDecimals = balance / Number(10 ** decimals);
            const price = Number(prices[tokenKey]);
            const usdValue = balanceWithDecimals * (price || 0);
            if (balance > 0) {
              acc[key] = {
                tokenBalance: balance,
                decimals,
                balanceWithDecimals,
                tokenPrice: price || 0,
                usdValue
              };
            }
            return acc;
          },
          Promise.resolve({} as { [key: string]: any })
        )
      };

      formattedBalances['totalUsdValue'] =
        Number(formattedBalances.stx.usdValue) +
        Number(
          Object.values(formattedBalances.tokens).reduce(
            (acc, token: any) => Number(acc) + Number(token.usdValue),
            0
          )
        );

      if (formattedBalances.totalUsdValue > 0) {
        allBalances.push(formattedBalances);
      }
    }

    allBalances.sort((a, b) => b.totalUsdValue - a.totalUsdValue);
    writeFileSync('./output/itemized_balances.json', JSON.stringify(allBalances, null, 2));
    console.log('Missing tokens:', Array.from(missingTokens));
  });
}, 200000);
