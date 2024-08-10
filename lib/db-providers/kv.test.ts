import { cacheGlobalState, getContractMetadata, getGlobalState, setContractMetadata } from "./kv";

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

    it('should get creature data', async () => {
        const response = await getGlobalState('creatures:1')
        console.log(response)
        expect(response).toBeDefined()
    });

    it('should set creatures 1 data into global state', async () => {
        const response = await cacheGlobalState('creatures:1', {
            id: 1,
            title: 'Farmers',
            description: 'Farmers are the backbone of the economy.',
            cost: 1000000,
            power: 5
        })
        console.log(response)
    })

    it('should set creatures 2 data into global state', async () => {
        const response = await cacheGlobalState('creatures:2', {
            id: 2,
            title: 'Blacksmiths',
            cost: 1000000,
            power: 5
        })
        console.log(response)
    })

    it('should set creatures 3 data into global state', async () => {
        const response = await cacheGlobalState('creatures:3', {
            id: 3,
            title: 'Corgi Soldiers',
            cost: 10000000,
            power: 80
        })
        console.log(response)
    })

    it('should set creatures 4 data into global state', async () => {
        const response = await cacheGlobalState('creatures:4', {
            id: 4,
            title: 'Alchemists',
            cost: 10000000,
            power: 25
        })
        console.log(response)
    })

    it('should set land 3 data into global state', async () => {
        const response = await cacheGlobalState('lands:SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-charisma', {
            "sip": 16,
            "name": "Liquid Staked Charisma",
            "image": "https://charisma.rocks/liquid-staked-charisma.png",
            "description": {
                "type": "string",
                "description": "Charisma ecosystem rebase token."
            },
            'ft': 'liquid-staked-token',
            "attributes": [
                {
                    "trait_type": "difficulty",
                    "display_type": "number",
                    "value": 1000000
                }
            ],
            "properties": {
                "collection": "Charisma Lands",
                "collection_image": "https://charisma.rocks/lands/img/lands.jpg",
                "category": "image",
                "symbol": "LAND",
                "decimals": 6
            }
        })
        console.log(response)
    })


});
