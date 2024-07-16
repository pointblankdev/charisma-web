import { getContractMetadata, setContractMetadata } from "./user-api"

describe('User API', () => {
    it('should get metadata', async () => {
        const response = await getContractMetadata('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.presidential-pepe')
        const result = await response.json()
        console.log(result)
    })

    it('should set metadata', async () => {
        const response = await setContractMetadata('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.presidential-pepe', {
            "name": "Presidential Pepe",
            "description": "An index token composed of sPEPE and sCHA at a fixed 10k:1 ratio.",
            "image": "https://www.charisma.rocks/indexes/presidential-pepe-logo.jpg",
            "background": "https://www.charisma.rocks/indexes/presidential-pepe-bg.jpg",
            "symbol": "iPP",
            "ft": "index-token",
            "weight": 1,
            "contains": [
                {
                    "address": "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-pepe",
                    "symbol": "sPEPE",
                    "ft": "liquid-staked-token",
                    "weight": 10000
                },
                {
                    "address": "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-charisma",
                    "symbol": "sCHA",
                    "ft": "liquid-staked-token",
                    "weight": 1
                }
            ]
        })
        console.log(await response.text())
    })
})