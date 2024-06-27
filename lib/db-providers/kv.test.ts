import { getContractMetadata, setContractMetadata } from "./kv";

describe('metadata api', () => {
    it('should get contract metadata by id', async () => {
        const ca = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.test-index'
        const response = await getContractMetadata(ca)
        console.log(response)
        expect(response).toBeDefined()
    });

    it('should set contract metadata by id', async () => {
        const ca = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charismatic-corgi'
        const metadata = {
            "name": "Charismatic Corgi",
            "description": "An index fund composed of sWELSH and sCHA at a fixed 100:1 ratio.",
            "image": "https://charisma.rocks/indexes/charismatic-corgi-logo.png",
            "background": "https://charisma.rocks/indexes/charismatic-corgi-bg.png",
            "symbol": "iCC",
            "ft": "index-token",
            "contains": [
                {
                    "address": "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-welsh-v2",
                    "symbol": "sWELSH",
                    "ft": "liquid-staked-token",
                    "weight": 100
                },
                {
                    "address": "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-charisma",
                    "symbol": "sCHA",
                    "ft": "liquid-staked-token",
                    "weight": 1
                }
            ]
        }
        const response = await setContractMetadata(ca, metadata)
        console.log(response)
    })


});
