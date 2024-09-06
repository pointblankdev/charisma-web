import { addLand, cacheGlobalState, clearLeaderboard, clearRewardsLeaderboard, getContractMetadata, getExperienceLeaderboard, getGlobalState, getLand, getLands, getLandsBalance, getMob, getNftCollectionMetadata, getNftCollections, getNftMetadata, removeLand, removeNftCollection, setContractMetadata, setHadLandBefore, setLand, setLandsBalance, setLandWhitelisted, setMob, setNftCollectionMetadata } from "./kv";
import { Land } from "./kv.types";

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
        const response = await addLand('SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.wstx-wcha')
        console.log(response)
    })

    it('should remove land', async () => {
        const response = await removeLand('SP16KWQY6ZPXNYT43A4RKXBXMFT3V7ZMV5YYNR1CK.mojo')
        console.log(response)
    })

    it('should get land bitty', async () => {
        const response = await getLand('SP1Z92MPDQEWZXW36VX71Q25HKF5K2EPCJ304F275.tokensoft-token-v4kr5skoysg')
        console.log(response)
    })

    it('should update welsh land', async () => {
        const land = await getLand('SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token')
        // land.id = 4
        // await setLand('SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token', land)
        console.log(land)
    })

    it('should update leo land', async () => {
        const land = await getLand('SP1AY6K3PQV5MRT6R4S671NWW2FRVPKM0BR162CT6.leo-token')
        // land.whitelisted = true
        // land.id = 6
        // await setLand('SP1AY6K3PQV5MRT6R4S671NWW2FRVPKM0BR162CT6.leo-token', land)
        console.log(land)
    })

    it('should update fair land', async () => {
        const land = await getLand('SP253J64EGMH59TV32CQXXTVKH5TQVGN108TA5TND.fair-bonding-curve')
        // land.whitelisted = true
        // land.id = 7
        // land.wraps.symbol = 'FAIR'
        await setLand('SP253J64EGMH59TV32CQXXTVKH5TQVGN108TA5TND.fair-bonding-curve', land)
        console.log(land)
    })

    it('should update fam land', async () => {
        const land = await getLand('SP3SMQNVWRBVWC81SRJYFV4X1ZQ7AWWJFBQJMC724.fam')
        // land.id = 5
        land.wraps.symbol = 'FAM'
        // land.wraps.asset = 'TheFellowshipOfTheMeme'
        // land.wraps.decimals = 6
        // land.wraps.totalSupply = 2100000000000
        // land.attributes[0].value = 2100000000000 / 1000000
        // land.whitelisted = true
        await setLand('SP3SMQNVWRBVWC81SRJYFV4X1ZQ7AWWJFBQJMC724.fam', land)
        console.log(land)
    })

    it('should get fair land', async () => {
        const response = await getLand('SP253J64EGMH59TV32CQXXTVKH5TQVGN108TA5TND.fair-bonding-curve')
        response.wraps.asset = 'FAIR'
        await setLand('SP253J64EGMH59TV32CQXXTVKH5TQVGN108TA5TND.fair-bonding-curve', response)
        console.log(response)
    })

    it('should update land 5', async () => {
        const contract = 'SP1Z92MPDQEWZXW36VX71Q25HKF5K2EPCJ304F275.tokensoft-token-v4kr5skoysg'
        const land = await getLand(contract)
        land.cardImage = 'https://i.ibb.co/wczPttp/2da1e0b934a1166f76cf6ba42ecb4b24.jpg'
        console.log(land)
        await setLand(contract, land)
    })

    it('should update edel land', async () => {
        const contract = 'SP26PZG61DH667XCX51TZNBHXM4HG4M6B2HWVM47V.edelcoin'
        const land = await getLand(contract)
        // land.wraps.symbol = 'EDLC'
        land.wraps.totalSupply = 1000000000000000
        console.log(land)
        await setLand(contract, land)
    })

    it('should update STX-sCHA land', async () => {
        const contract = 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.wstx-scha'
        const land = await getLand(contract)
        // land.whitelisted = true
        // land.id = 13
        // land.wraps.symbol = 'STX-sCHA'
        // land.wraps.decimals = 0
        // land.wraps.totalSupply = 253246838943
        console.log(land)
        // await setLand(contract, land)
    })

    it('should update STX-wCHA land', async () => {
        const contract = 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.wstx-wcha'
        const land = await getLand(contract)
        // land.whitelisted = true
        // land.id = 12
        // land.wraps.symbol = 'STX-sCHA'
        // land.wraps.decimals = 0
        // land.wraps.totalSupply = 253246838943
        console.log(land)
        // await setLand(contract, land)
    })

    it('should update not land', async () => {
        const contract = 'SP32AEEF6WW5Y0NMJ1S8SBSZDAY8R5J32NBZFPKKZ.nope'
        const land = await getLand(contract)
        land.cardImage = 'https://beta.charisma.rocks/liquid-nothing-21.png'
        console.log(land)
        await setLand(contract, land)
    })

    it('should update edmund land', async () => {
        const contract = 'SP1MJPVQ6ZE408ZW4JM6HET50S8GYTYRZ7PC6RKH7.edmundfitzgeraldcoin'
        const land = await getLand(contract)
        land.id = 8
        console.log(land)
        await setLand(contract, land)
    })

    it('should update rock land', async () => {
        const contract = 'SP4M2C88EE8RQZPYTC4PZ88CE16YGP825EYF6KBQ.stacks-rock'
        const land = await getLand(contract)
        land.id = 9
        console.log(land)
        await setLand(contract, land)
    })

    it('should update gyatt land', async () => {
        const contract = 'SP739VRRCMXY223XPR28BWEBTJMA0B27DY8GTKCH.gyatt-bonding-curve'
        const land = await getLand(contract)
        land.id = 10
        console.log(land)
        await setLand(contract, land)
    })

    it('should update edelcoin land', async () => {
        const contract = 'SP26PZG61DH667XCX51TZNBHXM4HG4M6B2HWVM47V.edelcoin'
        const land = await getLand(contract)
        land.id = 11
        console.log(land)
        await setLand(contract, land)
    })

    it('should make a copy of stx-scha land', async () => {
        const contract = 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.wstx-scha'
        const land = await getLand(contract)
        land.name = 'STX-wCHA - Velar LP'
        land.image = 'https://charisma.rocks/lands/img/stx-wcha-lp-icon.png'
        land.cardImage = 'https://charisma.rocks/lands/img/card/stx-wcha-lp.png'
        land.proposal = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.list-stx-wcha-velar-lp'
        land.whitelisted = false
        land.wraps = {
            ca: 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.wstx-wcha',
            name: 'STX-wCHA - Velar LP',
            description: 'Support Charisma by staking LP tokens',
            image: 'https://charisma.rocks/lands/img/stx-wcha-lp-icon.png',
            asset: 'lp-token',
            decimals: 6
        }
        console.log(land)
        await setLand('SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.wstx-wcha', land)
    })

    it('should set land whitelisted', async () => {
        const contract = 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.wstx-wcha'
        const land = await setLandWhitelisted(contract, true)
        console.log(land)
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

    it('should set land 8 data into db', async () => {
        const id = 8
        const name = "Edmund Fitzgerald Coin"
        const image = "https://edmund-fitzgerald-coin.notion.site/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2F6b0ac1c0-4974-4204-830a-82830a622dc5%2Fa1fd1d53-47fe-4fa3-bf65-0126b4af88a1%2Fedmund.png?table=block&id=5548e486-8a78-4408-9866-a6a306d35613&spaceId=6b0ac1c0-4974-4204-830a-82830a622dc5&width=480&userId=&cache=v2"
        const cardImage = "https://charisma.rocks/lands/img/card/edmund.png"
        const description = "The legend lives on from the Chippewa on down"
        const contractAddress = "SP1MJPVQ6ZE408ZW4JM6HET50S8GYTYRZ7PC6RKH7.edmundfitzgeraldcoin"
        const assetIdentifier = "EDMUND"
        const symbol = "EDMUND"
        const decimals = 6
        const totalSupply = 11101975290000
        const difficulty = 111019753
        const proposalName = `SP1MJPVQ6ZE408ZW4JM6HET50S8GYTYRZ7PC6RKH7.list-edmund-fitzgerald-coin`
        const response = await setLand('SP1MJPVQ6ZE408ZW4JM6HET50S8GYTYRZ7PC6RKH7.edmundfitzgeraldcoin', {
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
            whitelisted: false,
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
        // await addLand('SP1MJPVQ6ZE408ZW4JM6HET50S8GYTYRZ7PC6RKH7.edmundfitzgeraldcoin')
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

    // delete rewards leaderboard
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
        const hogger = await getMob('hogger')
        console.log(hogger)
    })

    it('should update hogger health', async () => {
        const hogger = await getMob('hogger')
        hogger.health = 0
        // hogger.maxHealth = 5900000
        const response = await setMob('hogger', hogger)
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

    // should get lands balance
    it('should get lands balance', async () => {
        const response = await getLandsBalance('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-charisma', 'SP3T1M18J3VX038KSYPP5G450WVWWG9F9G6GAZA4Q')
        console.log(response)
    })

    // should get lands balance
    it('should get welsh lands balance', async () => {
        const response = await getLandsBalance('SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token', 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS')
        console.log(response)
    })

    it('should sync lands balance', async () => {
        const response = await setLandsBalance(7, 'SP1FHC2XXJW3CQFNFZX60633E5WPWST4DBW8JFP66')
        console.log(response)
    })

    it('should set had land before', async () => {
        const response = await setHadLandBefore(1, 'SPBNZD0NMBJVRYJZ3SJ4MTRSZ3FEMGGTV2YM5MFV')
        console.log(response)
    })

});


describe('nfts api', () => {
    it('should get nft collections', async () => {
        const response = await getNftCollections()
        console.log(JSON.stringify(response, null, 2))
    })

    it('should remove nft collections', async () => {
        const response = await removeNftCollection("SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.memobots-guardians-of-the-gigaverse")
        console.log(JSON.stringify(response, null, 2))
    })

    // should get nft collection metadata
    it('should get nft collection metadata', async () => {
        const response = await getNftCollectionMetadata('SP3TMGZ7WTT658PA632A3BA4B1GRXBNNEN8XPZQ5X.tremp-election-2024')
        console.log(JSON.stringify(response, null, 2))
    })

    // should get nft item
    it('should get nft item metadata', async () => {
        const response = await getNftMetadata('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.spell-scrolls', '1')
        console.log(JSON.stringify(response, null, 2))
    })

    it('should update nft collection metadata (mooning-sharks)', async () => {
        const data = await getNftCollectionMetadata('SP1KMAA7TPZ5AZZ4W67X74MJNFKMN576604CWNBQS.mooning-sharks')
        data.properties.minted = 20
        await setNftCollectionMetadata('SP1KMAA7TPZ5AZZ4W67X74MJNFKMN576604CWNBQS.mooning-sharks', data)
        console.log(JSON.stringify(data, null, 2))
    })

    it('should update nft collection metadata (spell-scrolls)', async () => {
        const data = await getNftCollectionMetadata('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.spell-scrolls')
        data.properties.minted = 32
        // data.properties.items[0].image_url = 'https://charisma.rocks/quests/spell-scroll/fire-bolt-icon.png'
        await setNftCollectionMetadata('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.spell-scrolls', data)
        console.log(JSON.stringify(data, null, 2))
    })

    it('should update nft collection metadata (kraqen-lotto)', async () => {
        const data = await getNftCollectionMetadata('SPGYCP878RYFVT03ZT8TWGPKNYTSQB1578VVXHGE.kraqen-lotto')
        data.properties.minted = 30
        // data.properties.items[0].image_url = 'https://charisma.rocks/quests/spell-scroll/fire-bolt-icon.png'
        await setNftCollectionMetadata('SPGYCP878RYFVT03ZT8TWGPKNYTSQB1578VVXHGE.kraqen-lotto', data)
        console.log(JSON.stringify(data, null, 2))
    })

    it('should update nft collection metadata (bitcoin-pepe)', async () => {
        const contractId = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.bitcoin-pepe-whitelist-ticket'
        const data = await getNftCollectionMetadata(contractId)
        data.properties.whitelisted = true
        await setNftCollectionMetadata(contractId, data)
        console.log(JSON.stringify(data, null, 2))
    })
})