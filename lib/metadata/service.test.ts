import { MetadataService } from "./service";


it('should getn metadata with metadata service', async () => {
    const metadata = await MetadataService.get('SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.old-faithful');
    console.log(metadata);
});

it('should set metadata with metadata service', async () => {
    const metadata = await MetadataService.set('SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.old-faithful', {
        name: 'Old Faithful',
        symbol: 'FAITH',
        description: 'Liquidity vault wrapper for the USDA-aeUSDC stableswap pair.',
        identifier: 'FAITH',
        decimals: 6,
        properties: {
            tokenAContract: 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.usda-token',
            tokenBContract: 'SP3Y2ZSH8P7D50B0VBTSX11S7XSG24M1VB9YFQA4K.token-aeusdc',
            lpRebatePercent: 2.5,
            tokenAMetadata: {
                contractId: 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.usda-token',
                identifier: 'usda',
                name: 'USDA',
                symbol: 'USDA',
                decimals: 6,
                description: '',
                image: ''
            },
            tokenBMetadata: {
                contractId: 'SP3Y2ZSH8P7D50B0VBTSX11S7XSG24M1VB9YFQA4K.token-aeusdc',
                identifier: 'aeUSDC',
                name: 'Ethereum USDC via Allbridge',
                symbol: 'aeUSDC',
                decimals: 6,
                description: 'Ethereum USDC via Allbridge',
                image: 'https://allbridge-assets.web.app/320px/ETH/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48.svg'
            },
            date: '2025-01-22T02:16:42.230Z',
            externalPoolId: 'SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M.stableswap-usda-aeusdc-v-1-4'
        },
        imagePrompt: 'Old Faithful and a bison head on a gold commerative coin. Use a limited color palette with maximum 2-3 colors. intense manga art style with bold lines and deep contrast',
        image: 'https://kghatiwehgh3dclz.public.blob.vercel-storage.com/b9f9a6b4-b757-4754-b069-41fe187d676f-qT56oZpvFSVFWBPWHyHnLM4D8gTu2k.png',
        customImageUrl: 'https://kghatiwehgh3dclz.public.blob.vercel-storage.com/b9f9a6b4-b757-4754-b069-41fe187d676f-qT56oZpvFSVFWBPWHyHnLM4D8gTu2k.png'
    });
    console.log(metadata);
});