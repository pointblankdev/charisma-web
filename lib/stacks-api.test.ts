import { AnchorMode, boolCV, broadcastTransaction, callReadOnlyFunction, cvToJSON, makeContractCall, principalCV, TransactionVersion, uintCV } from "@stacks/transactions";
import { StacksMainnet } from "@stacks/network";
import { generateSecretKey, generateWallet, getStxAddress } from "@stacks/wallet-sdk";
import { checkIfEpochIsEnding, checkQuestComplete, checkQuestLocked, getAccountAssets, getAccountBalance, getAllCharismaWallets, getTxsFromMempool, getCreaturePower, getDeployedIndexes, getFeeEstimate, getGuestlist, getNameFromAddress, getNftURI, getProposals, getQuestRewards, getTitleBeltHolder, getTokenBalance, getTokenURI, getTotalInPool, getVelarSwapAmountOut, getWooTitleBeltContractEvents, hasPercentageBalance, setQuestComplete, getLandBalance, getLandId, getNftOwner, getStoredEnergy } from "./stacks-api";
import { get } from "lodash";
import { writeFileSync } from "fs";
import { tryResetEpochs } from "./try-reset-epochs";

const network = new StacksMainnet();

describe('Stacks API', () => {
    it('should return a token balance', async () => {

        const r: any = await callReadOnlyFunction({
            network: new StacksMainnet(),
            contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
            contractName: "balance-at-block-v2",
            functionName: "get-balance-at-block",
            functionArgs: [principalCV('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS'), uintCV(118360)],
            senderAddress: 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ'
        });

        console.log(r)
    })

    it('should check if a quest is complete', async () => {

        const address = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS'
        const questId = 0

        const response = await checkQuestComplete(address, questId)

        const result = cvToJSON(response)
        console.log(result)

        expect(result.value).toEqual(true)

    })

    it('should check if a quest is incomplete', async () => {

        const address = 'SP18QG8A8943KY9S15M08AMAWWF58W9X1M90BRCSJ'
        const questId = 0

        const response = await checkQuestComplete(address, questId)

        console.log(response.type)

        expect(response.type).toEqual(1)

    })

    it('should check if a quest is locked', async () => {

        const address = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS'
        const questId = 0

        const response = await checkQuestLocked(address, questId)

        console.log(response.type)

        expect(response.type).toEqual(3)

    })

    it('should check if a quest is unlocked', async () => {

        const address = 'SP18QG8A8943KY9S15M08AMAWWF58W9X1M90BRCSJ'
        const questId = 0

        const response = await checkQuestLocked(address, questId)

        console.log(response.type)

        expect(response.type).toEqual(4)

    })

    xit('should mark a quest as complete', async () => {

        const address = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS'
        const questId = 0
        const complete = true

        const broadcastResponse = await setQuestComplete(address, questId, complete)

        console.log(broadcastResponse)

        expect(broadcastResponse.error).not.toBeDefined()

    })

    it('should lookup a BNS name given an address', async () => {
        const address = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS'

        const { names } = await getNameFromAddress(address)

        console.log(names)


    })

    // test get quest rewards for a specific quest
    it('should get quest rewards', async () => {

        const questId = 0

        const result = await getQuestRewards(questId)

        console.log(result)

        expect(result.value).toEqual({ type: 'uint', value: '100' })

    })

    // test get proposals
    it('should get proposals', async () => {

        const result = await getProposals()
        console.log(result)
        expect(result).toBeDefined()

    }, 20000)

    // test get title belt holder
    it('should get title belt holder', async () => {

        const result = await getTitleBeltHolder()
        console.log(result)
        expect(result).toBeDefined()

    }, 20000)

    // test get account assets
    it('should get account assets', async () => {

        const result = await getAccountAssets('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS')
        console.log(result)
        expect(result).toBeDefined()

    }, 20000)

    // test get account balance
    it('should get account balance', async () => {

        const result = await getAccountBalance('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS')
        console.log(result.fungible_tokens)
        // SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-welsh::liquid-staked-welsh
        // SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-roo::liquid-staked-roo
        // .balance
        expect(result).toBeDefined()

    }, 20000)

    // test get wooo title belt contract events
    it('should get wooo title belt contract events', async () => {

        const result = await getWooTitleBeltContractEvents() as any
        const repr = result.results[0].contract_log.value.repr
        const wooRecord = repr.split(' ')[2]
        console.log(wooRecord)
        expect(result).toBeDefined()

    }, 20000)

    // should get all charisma wallets
    it('should get all charisma wallets', async () => {
        const result = await getAllCharismaWallets()
        // console.log(result)
        writeFileSync('charisma-wallets.json', JSON.stringify(result, null, 2))
    }, 20000)

    // should get token uri
    it('should get token uri', async () => {
        const result = await getTokenURI('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-welsh')
        console.log(result)
        expect(result).toBeDefined()
    }, 20000)

    // should get deploy index contracts
    it('should get deploy index contracts', async () => {
        const result = await getDeployedIndexes()
        console.log(result)
        expect(result).toBeDefined()
    }, 20000)

    it('should check the guestlist for a address', async () => {
        const result = await getGuestlist('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS')
        console.log(result)
        expect(result).toBeDefined()
    }, 20000)

    it('should get arbitrage txs from mempool', async () => {
        const result = await getTxsFromMempool('SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.univ2-router')
        console.log(JSON.stringify(result, null, 4))
        // console.log(result.map(r => JSON.stringify(r.post_conditions)))
        expect(result).toBeDefined()
    }, 20000)

    it('should get a fee rate request', async () => {
        const result = await getFeeEstimate('0x84890bfdd1ed70e67439ae49c9996e02531165f273145a609d70d7041b1eae18')
        console.log(result)
    })

    it('should return the amount out from a swap', async () => {

        const amountIn = 1000000
        const tokenIn = 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.wstx'
        const tokenOut = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charismatic-corgi'
        const result = await getVelarSwapAmountOut({ amountIn, tokenIn, tokenOut })
        console.log(result)
        expect(result).toBeDefined()

    })

    it('should get creatue power', async () => {
        const result = await getCreaturePower(1)
        console.log(result)
        expect(result).toBeDefined()
    })

    it('should get total in pool', async () => {
        const result = await getTotalInPool('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-charisma')
        console.log(result)
        expect(result).toBeDefined()
    })

    it('should get nft token uri', async () => {
        const result = await getNftURI('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.odins-raven', 9)
        console.log(result)
        expect(result).toBeDefined()
    })

    it('should get token balance', async () => {
        const result = await getTokenBalance('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.experience', 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS')
        console.log(result)
        expect(result).toBeDefined()
    })

    it('should get bns name', async () => {
        const result = await getNameFromAddress('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS')
        console.log(result)
        expect(result).toBeDefined()
    })

    it('should get if has 1% percentage balance', async () => {
        const result = await hasPercentageBalance('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.experience', 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS', 100000)
        console.log(result)
        expect(result).toBeDefined()
    })

    // checkIfEpochIsEnding
    it('should check if epoch is ending', async () => {
        const result = await checkIfEpochIsEnding('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wanted-hogger-v2')
        console.log(result)
        expect(result).toBeDefined()
    })

    // getTxsFromMempool
    it('should get txs from mempool', async () => {
        const result = await getTxsFromMempool('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wanted-hogger-v2')
        console.log(result)
        expect(result).toBeDefined()
    })

    //tryResetEpochs
    it('should try reset epochs', async () => {
        const result = await tryResetEpochs([{
            address: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wanted-hogger-v2",
            function: "start-new-epoch",
            args: []
        }])
        console.log(result)
        expect(result).toBeDefined()
    })

    it('should generate a seed phrase', () => {
        const secretKey128 = generateSecretKey(128);
        console.log(secretKey128)
        expect(secretKey128).toBeDefined()
    })

    it('should generate a wallet', async () => {
        const secretKey128 = ''
        const wallet = await generateWallet({
            secretKey: secretKey128,
            password: '',
        });
        // get an account from the user's wallet
        const account = wallet.accounts[0];
        const mainnetAddress = getStxAddress({ account, transactionVersion: TransactionVersion.Mainnet });
        console.log(mainnetAddress)
        expect(mainnetAddress).toBeDefined()
    })

    // should get land balance
    it('should get land balance', async () => {
        const result = await getLandBalance(4, 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS')
        console.log(result)
        expect(result).toBeDefined()
    })

    // should get land id
    it('should get land id', async () => {
        const result = await getLandId('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-charisma')
        console.log(result)
        expect(result).toEqual(1)
    })

    it('should get stored energy', async () => {
        const result = await getStoredEnergy('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS')
        console.log(result)
        expect(result).toBeDefined()
    })

})

describe('SIP9 traits', () => {

    it('should get owner', async () => {
        const owner = await getNftOwner('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.bitcoin-pepe-whitelist-ticket', 10)
        console.log(owner)
        expect(owner).toBeDefined()
    })

})