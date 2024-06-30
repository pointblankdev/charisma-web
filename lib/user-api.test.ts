import { getContractMetadata, setContractMetadata } from "./user-api"

describe('User API', () => {
    it('should get metadata', async () => {
        const response = await getContractMetadata('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wrapped-charisma')
        const result = await response.json()
        console.log(result)
    })

    it('should set metadata', async () => {
        const response = await setContractMetadata('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wrapped-charisma',
            {
                name: 'Wrapped Charisma',
                description: 'A wrapped version of the Charisma token.',
                image: 'https://www.charisma.rocks/indexes/wrapped-charisma-logo.png',
                background: 'https://www.charisma.rocks/indexes/wrapped-charisma-bg.png',
                symbol: 'wCHA',
                ft: 'index-token',
                weight: 2,
                contains: [
                    {
                        address: 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme000-governance-token',
                        symbol: 'CHA',
                        ft: 'charisma',
                        weight: 1
                    },
                    {
                        address: 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme000-governance-token',
                        symbol: 'CHA',
                        ft: 'charisma',
                        weight: 1
                    }
                ]
            }
        )
        const result = await response.json()
        console.log(result)
    })
})