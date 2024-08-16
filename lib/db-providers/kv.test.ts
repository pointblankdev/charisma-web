import { addLand, cacheGlobalState, clearLeaderboard, clearRewardsLeaderboard, getContractMetadata, getExperienceLeaderboard, getGlobalState, getLand, getLands, getMob, removeLand, setContractMetadata, setLand, setLandById, setLandWhitelisted, setMob } from "./kv";

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

    it('should get lands', async () => {
        const response = await getLands()
        console.log(response)
    })

    it('should add land', async () => {
        const response = await addLand('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-charisma')
        console.log(response)
    })

    it('should remove land', async () => {
        const response = await removeLand('SP1B46TPZD8Y3ETHGZYJAPHD9GHJK81K08WRB127X.list-fair')
        console.log(response)
    })

    it('should get land 1', async () => {
        const response = await getLand('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-charisma')
        console.log(response)
    })

    it('should get land 4', async () => {
        const response = await getLand('SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token')
        console.log(response)
    })

    it('should get fair land', async () => {
        const response = await getLand('SP253J64EGMH59TV32CQXXTVKH5TQVGN108TA5TND.fair-bonding-curve')
        response.wraps.asset = 'FAIR'
        await setLand('SP253J64EGMH59TV32CQXXTVKH5TQVGN108TA5TND.fair-bonding-curve', response)
        console.log(response)
    })

    it('should update land 5', async () => {
        const response = await getLand('SP3SMQNVWRBVWC81SRJYFV4X1ZQ7AWWJFBQJMC724.fam')
        // response.proposal = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.pool-proposal-the-fellowship-of-the-meme'
        console.log(response)
        // await setLand('SP3SMQNVWRBVWC81SRJYFV4X1ZQ7AWWJFBQJMC724.fam', response)
    })

    it('should set welsh land whitelisted', async () => {
        const response = await setLandWhitelisted('SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token', false)
        console.log(response)
    })

    it('should set land 1 data into db', async () => {
        const id = 1
        const name = "Liquid Staked Charisma"
        const image = "https://charisma.rocks/liquid-staked-charisma.png"
        const cardImage = "https://charisma.rocks/liquid-charisma-21.png"
        const description = "Charisma ecosystem rebase token"
        const contractAddress = "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-charisma"
        const assetIdentifier = "liquid-staked-token"
        const symbol = "sCHA"
        const decimals = 6
        const totalSupply = 2777401042359
        const difficulty = 1000000
        const proposalName = `pool-proposal-${name.toLowerCase().replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, "-")}`
        const response = await setLand('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-charisma', {
            sip: 16,
            id: id,
            name: name,
            image: image,
            cardImage: cardImage,
            description: {
                type: "string",
                description: description
            },
            proposal: proposalName,
            whitelisted: true,
            wraps: {
                ca: contractAddress,
                name: name,
                description: description,
                image: image,
                asset: assetIdentifier,
                symbol: symbol,
                decimals: Number(decimals),
                totalSupply: Number(totalSupply)
            },
            attributes: [
                {
                    trait_type: "difficulty",
                    display_type: "number",
                    value: difficulty
                }
            ],
            properties: {
                collection: "Charisma Lands",
                collection_image: "https://charisma.rocks/lands/img/lands.jpg",
                category: "image",
                symbol: "LAND",
                decimals: 6
            }
        })
        console.log(response)
    })

    it('should update land by id', async () => {
        const land = await getLand('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-charisma')
        const response = await setLandById(1, land)
        console.log(response)
    })

    it('should set welsh land metadata into db', async () => {
        const response = await setLand('SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token', {
            sip: 16,
            name: 'Welshcorgicoin',
            image: 'https://raw.githubusercontent.com/Welshcorgicoin/Welshcorgicoin/main/logos/welsh_tokenlogo.png',
            cardImage: 'https://charisma.rocks/liquid-welsh-21.png',
            description: { type: 'string', description: 'The first memecoin on Stacks' },
            whitelisted: false,
            wraps: {
                ca: 'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token',
                name: 'Welshcorgicoin',
                description: 'The first memecoin on Stacks',
                image: 'https://raw.githubusercontent.com/Welshcorgicoin/Welshcorgicoin/main/logos/welsh_tokenlogo.png',
                asset: 'welshcorgicoin',
                symbol: 'WELSH',
                decimals: 6,
                totalSupply: 10000000000000000
            },
            attributes: [
                {
                    trait_type: 'difficulty',
                    display_type: 'number',
                    value: 10000000000
                }
            ],
            properties: {
                collection: 'Charisma Lands',
                collection_image: 'https://charisma.rocks/lands/img/lands.jpg',
                category: 'image',
                symbol: 'LAND',
                decimals: 6
            }
        })
        console.log(response)
    })

    it('should update welsh land', async () => {
        const land = await getLand('SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token')
        land.proposal = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.pool-proposal-welshcorgicoin'
        const response = await setLand('SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token', land)
        console.log(response)
    })

    // delete experience leaderboard
    it('should delete experience lb', async () => {
        const response = await clearLeaderboard()
        console.log(response)
    })

    // delete experience leaderboard
    it('should delete cha rewards lb', async () => {
        const response = await clearRewardsLeaderboard('SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme000-governance-token::charisma')
        console.log(response)
    })

    // get experience holders
    it('should get experience holders', async () => {
        const response = await getExperienceLeaderboard(0, -1)
        console.log(response)
    })

    it('should get hogger', async () => {
        const response = await getMob('hogger')
        console.log(response)
    })

    it('should set hogger', async () => {
        const response = await setMob('hogger', {
            level: 5,
            health: 1005059,
            maxHealth: 1700000,
            regenRate: 50
        })
        console.log(response)
    })


});
