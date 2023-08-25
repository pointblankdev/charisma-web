import { callReadOnlyFunction, principalCV, uintCV } from "@stacks/transactions";
import { StacksMainnet } from "@stacks/network";

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
})