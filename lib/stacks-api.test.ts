import { AnchorMode, boolCV, broadcastTransaction, callReadOnlyFunction, makeContractCall, principalCV, uintCV } from "@stacks/transactions";
import { StacksMainnet } from "@stacks/network";
import { generateWallet } from "@stacks/wallet-sdk";
import { checkQuestComplete, setQuestComplete } from "./stacks-api";

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

        console.log(response)

        expect(response.value).toBe('true')

    })

    it('should mark a quest as complete', async () => {

        const address = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS'
        const questId = 0
        const complete = true

        const broadcastResponse = await setQuestComplete(address, questId, complete)

        console.log(broadcastResponse)

        expect(broadcastResponse.error).not.toBeDefined()

    })
})