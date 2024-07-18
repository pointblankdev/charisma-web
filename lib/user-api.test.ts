import { getContractMetadata, setContractMetadata } from "./user-api"

describe('User API', () => {
    it('should get metadata', async () => {
        const response = await getContractMetadata('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.magic-mojo')
        const result = await response.json()
        console.log(result)
    })

    it('should set metadata', async () => {
        const response = await setContractMetadata('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.magic-mojo', {
            name: 'Magic Mojo',
            description: 'An index token composed of MOJO and sCHA at a fixed 4:1 ratio.',
            image: 'https://www.charisma.rocks/indexes/magic-mojo-logo.png',
            background: 'https://www.charisma.rocks/indexes/magic-mojo-bg.png',
            symbol: 'iMM',
            ft: 'index-token',
            weight: 1,
            contains: [
                {
                    address: 'SP16KWQY6ZPXNYT43A4RKXBXMFT3V7ZMV5YYNR1CK.mojo',
                    symbol: 'MOJO',
                    ft: 'Mojo',
                    weight: 4
                },
                {
                    address: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-charisma',
                    symbol: 'sCHA',
                    ft: 'liquid-staked-token',
                    weight: 1
                }
            ]
        })
        console.log(await response.text())
    })
})