import { getContractMetadata, setContractMetadata } from "./user-api"

describe('User API', () => {
    it('should get metadata', async () => {
        const response = await getContractMetadata('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.fuji-apples')
        const result = await response.json()
        console.log(result)
    })

    it('should set metadata', async () => {
        const response = await setContractMetadata('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.fuji-apples', {
            name: 'Fuji Apples',
            description: 'Fresh Fuji apples grow in the orchard. They can be exchanged for sCHA at a 1M:1 ratio.',
            image: 'https://www.charisma.rocks/stations/fuji-apples.png',
            background: 'https://www.charisma.rocks/stations/apple-orchard.png',
            symbol: 'FUJI',
            ft: 'index-token',
            weight: '2000000',
            contains: [
                {
                    address: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-charisma',
                    symbol: 'sCHA',
                    ft: 'liquid-staked-token',
                    weight: '1'
                },
                {
                    address: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-charisma',
                    symbol: 'sCHA',
                    ft: 'liquid-staked-token',
                    weight: '1'
                }
            ]
        })
        console.log(await response.text())
    })
})