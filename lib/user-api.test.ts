import { getContractMetadata, setContractMetadata } from "./user-api"

describe('User API', () => {
    it('should get metadata', async () => {
        const response = await getContractMetadata('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.fuji-apples')
        const result = await response.json()
        console.log(result)
    })

    it('should set metadata', async () => {
        const response = await setContractMetadata('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.quiet-confidence', {
            name: 'Quiet Confidence',
            description: 'An index of 10x sCHA tokens with liquidity removal limited to one transaction per 20 blocks.',
            image: 'https://www.charisma.rocks/indexes/quiet-confidence-logo.png',
            background: 'https://www.charisma.rocks/indexes/quiet-confidence-bg.png',
            symbol: 'iQC',
            ft: 'index-token',
            contains: [
                {
                    address: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-charisma',
                    symbol: 'sCHA',
                    ft: 'liquid-staked-token',
                    weight: 5
                },
                {
                    address: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-charisma',
                    symbol: 'sCHA',
                    ft: 'liquid-staked-token',
                    weight: 5
                }
            ]
        })
        console.log(await response.text())
    })
})