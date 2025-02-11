import { fetchCallReadOnlyFunction } from "@stacks/transactions";
import { Cl, ClarityType } from "@stacks/transactions";
import { STACKS_MAINNET } from "@stacks/network";

export const BLAZE_CONTRACT = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.blaze-test-2';
export const SIP10_TOKEN = 'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token';

export async function verifyBlazeSignature(
    signature: string,
    signer: string,
    to: string,
    amount: bigint,
    nonce: number,
) {
    const [contractAddress, contractName] = BLAZE_CONTRACT.split('.');
    const options = {
        contractAddress,
        contractName,
        functionName: 'verify-signature',
        functionArgs: [
            Cl.bufferFromHex(signature),
            Cl.principal(signer),
            Cl.principal(to),
            Cl.uint(amount),
            Cl.uint(nonce)
        ],
        network: STACKS_MAINNET,
        senderAddress: signer
    };

    const result = await fetchCallReadOnlyFunction(options);
    return result.type === ClarityType.BoolTrue;
}