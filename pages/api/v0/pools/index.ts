import { NextApiRequest, NextApiResponse } from 'next';

type ErrorResponse = {
    error: {
        code: string;
        message: string;
    };
};

export const pools = [
    {
        id: 1,
        token0: { symbol: 'WELSH', name: 'Welsh', image: '/welsh-logo.png', contractAddress: 'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token', tokenId: 'welshcorgicoin', decimals: 6 },
        token1: { symbol: 'iouWELSH', name: 'Synthetic Welsh', image: '/welsh-logo.png', contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-welsh', tokenId: 'synthetic-welsh', decimals: 6 },
        volume24h: 0,
        contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.welsh-iouwelsh',
    },
    {
        id: 2,
        token0: { symbol: '$ROO', name: 'Roo', image: '/roo-logo.png', contractAddress: 'SP2C1WREHGM75C7TGFAEJPFKTFTEGZKF6DFT6E2GE.kangaroo', tokenId: 'kangaroo', decimals: 6 },
        token1: { symbol: 'iouROO', name: 'Synthetic Roo', image: '/roo-logo.png', contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-roo', tokenId: 'synthetic-roo', decimals: 6 },
        volume24h: 0,
        contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.roo-iouroo',
    },
    {
        id: 3,
        token0: { symbol: 'CHA', name: 'Charisma', image: '/charisma-logo-square.png', contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token', tokenId: 'charisma', decimals: 6 },
        token1: { symbol: 'WELSH', name: 'Welsh', image: '/welsh-logo.png', contractAddress: 'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token', tokenId: 'welshcorgicoin', decimals: 6 },
        volume24h: 0,
        contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.cha-welsh',
    },
    {
        id: 4,
        token0: { symbol: 'STX', name: 'Stacks', image: '/stx-logo.png', contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wstx', decimals: 6 },
        token1: { symbol: 'CHA', name: 'Charisma', image: '/charisma-logo-square.png', contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token', tokenId: 'charisma', decimals: 6 },
        volume24h: 0,
        contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wstx-cha',
    },
    {
        id: 5,
        token0: { symbol: 'CHA', name: 'Charisma', image: '/charisma-logo-square.png', contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token', tokenId: 'charisma', decimals: 6 },
        token1: { symbol: 'iouWELSH', name: 'Synthetic Welsh', image: '/welsh-logo.png', contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-welsh', tokenId: 'synthetic-welsh', decimals: 6 },
        volume24h: 0,
        contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.cha-iouwelsh',
    },
    {
        id: 6,
        token0: { symbol: 'CHA', name: 'Charisma', image: '/charisma-logo-square.png', contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token', tokenId: 'charisma', decimals: 6 },
        token1: { symbol: 'ORDI', name: 'Ordi', image: '/ordi-logo.png', contractAddress: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.brc20-ordi', tokenId: 'brc20-ordi', decimals: 8 },
        volume24h: 0,
        contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.cha-ordi',
    },
    {
        id: 7,
        token0: { symbol: 'CHA', name: 'Charisma', image: '/charisma-logo-square.png', contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token', tokenId: 'charisma', decimals: 6 },
        token1: { symbol: '$ROO', name: 'Roo', image: '/roo-logo.png', contractAddress: 'SP2C1WREHGM75C7TGFAEJPFKTFTEGZKF6DFT6E2GE.kangaroo', tokenId: 'kangaroo', decimals: 6 },
        volume24h: 0,
        contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.cha-roo',
    },
    {
        id: 8,
        token0: { symbol: 'WELSH', name: 'Welsh', image: '/welsh-logo.png', contractAddress: 'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token', tokenId: 'welshcorgicoin', decimals: 6 },
        token1: { symbol: 'DOG', name: 'DOG-GO-TO-THE-MOON', image: '/sip10/dogLogo.webp', contractAddress: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.runes-dog', tokenId: 'runes-dog', decimals: 8 },
        volume24h: 0,
        contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.up-dog',
    },
    {
        id: 9,
        token0: { symbol: 'CHA', name: 'Charisma', image: '/charisma-logo-square.png', contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token', tokenId: 'charisma', decimals: 6 },
        token1: { symbol: 'UPDOG', name: 'Updog', image: '/sip10/up-dog/logo.gif', contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.up-dog', tokenId: 'lp-token', decimals: 6 },
        volume24h: 0,
        contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.cha-updog',
    },
    {
        id: 10,
        token0: { symbol: 'STX', name: 'Stacks', image: '/stx-logo.png', contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wstx', decimals: 6 },
        token1: { symbol: 'synSTX', name: 'Synthetic STX', image: '/sip10/synthetic-stx/logo.png', contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-stx', tokenId: 'synthetic-stx', decimals: 6 },
        volume24h: 0,
        contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wstx-synstx',
    },
    // {
    //   id: 11,
    //   token0: { symbol: 'WELSH', name: 'Welsh', image: '/welsh-logo.png', contractAddress: 'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token', tokenId: 'welshcorgicoin', decimals: 6 },
    //   token1: { symbol: 'BABYWELSH', name: 'Baby Welsh', image: '/babywelsh-logo.jpeg', contractAddress: 'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.baby-welsh', tokenId: 'baby-welsh', decimals: 6 },
    //   volume24h: 0,
    //   contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.up-dog',
    // },    
]

export default function PoolsAPI(
    req: NextApiRequest,
    res: NextApiResponse<any | ErrorResponse>
) {
    return res.status(200).json(pools);
}
