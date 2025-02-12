import { fetchCallReadOnlyFunction, signStructuredData } from "@stacks/transactions";
import { Cl, ClarityType } from "@stacks/transactions";
import { STACKS_MAINNET } from "@stacks/network";

export const TOKEN_CONTRACT_MAP: Record<string, string> = {
    'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token': 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.blaze-test-2',
};

export function getBlazeContractForToken(token: string): string {
    const contract = TOKEN_CONTRACT_MAP[token];
    if (!contract) {
        throw new Error(`No contract mapping found for token: ${token}`);
    }
    return contract;
}

export async function verifyBlazeSignature(
    contract: string,
    signature: string,
    signer: string,
    to: string,
    amount: number,
    nonce: number,
) {
    const [contractAddress, contractName] = contract.split('.');
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
    amount: number,
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

    return signStructuredData({ message, domain, privateKey: process.env.PRIVATE_KEY! });
}
