import { AnchorMode, boolCV, broadcastTransaction, callReadOnlyFunction, cvToJSON, makeContractCall, principalCV, uintCV } from "@stacks/transactions";
import { StacksMainnet } from "@stacks/network";
import { generateWallet } from "@stacks/wallet-sdk";
import { checkQuestComplete, checkQuestLocked, getAccountAssets, getAccountBalance, getNameFromAddress, getProposals, getQuestRewards, getTitleBeltHolder, getWooTitleBeltContractEvents, setQuestComplete } from "./stacks-api";
import { get } from "lodash";

const network = new StacksMainnet();

describe('Stacks API', () => {
    it('should return a token balance', async () => {

        const r: any = await callReadOnlyFunction({
            network: new StacksMainnet(),
            contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
            contractName: "balance-at-block-v2",
            functionName: "get-balance-at-block",
            functionArgs: [principalCV('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS'), uintCV(118360)],
            senderAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS'
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
})