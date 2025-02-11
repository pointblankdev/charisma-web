import { fetchCallReadOnlyFunction, signStructuredData } from "@stacks/transactions";
import { Cl, ClarityType } from "@stacks/transactions";
import { STACKS_MAINNET } from "@stacks/network";
import { CONFIG } from "@lib/stackflow/config";

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

export async function generateBlazeSignature(
    token: string,
    to: string,
    amount: bigint,
    nonce: number,
) {
    // Create domain matching contract
    const domain = Cl.tuple({
        name: Cl.stringAscii("blaze"),
        version: Cl.stringAscii("0.1.0"),
        "chain-id": Cl.uint(STACKS_MAINNET.chainId),
    });

    // Create message tuple
    const message = Cl.tuple({
        token: Cl.principal(token),
        to: Cl.principal(to),
        amount: Cl.uint(amount),
        nonce: Cl.uint(nonce)
    });

    return signStructuredData({ message, domain, privateKey: CONFIG.PRIVATE_KEY! });
}
