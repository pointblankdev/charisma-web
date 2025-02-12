import { fetchCallReadOnlyFunction, signStructuredData } from "@stacks/transactions";
import { Cl, ClarityType } from "@stacks/transactions";
import { STACKS_MAINNET } from "@stacks/network";
import { kv } from "@vercel/kv";

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

export async function signBlazeTransfer({ token, from, to, amount, nonce }: any) {
    // Convert amount to tokens
    const tokens = amount * 1_000_000;
    const lastNonce = 0
    const nextNonce = nonce ? nonce : lastNonce + 1;

    // Create domain matching contract
    const domain = Cl.tuple({
        name: Cl.stringAscii("blaze"),
        version: Cl.stringAscii("0.1.0"),
        "chain-id": Cl.uint(STACKS_MAINNET.chainId),
    });

    // Create message tuple matching contract's make-message-hash
    const message = Cl.tuple({
        token: Cl.principal(token.contract),
        to: Cl.principal(to),
        amount: Cl.uint(tokens),
        nonce: Cl.uint(nextNonce)
    });
    const { openStructuredDataSignatureRequestPopup } = await import("@stacks/connect");
    return new Promise((resolve) => {
        openStructuredDataSignatureRequestPopup({
            domain,
            message,
            network: STACKS_MAINNET,
            onFinish: async (data) => {
                resolve(data);
            },
        });
    });
}

export async function getBlazeNonce(contract: string, user: string) {
    const currentNonce = await kv.get<number>(`nonce:${contract}:${user}`) || 0;
    return currentNonce;
}

export async function setBlazeNonce(contract: string, user: string, nonce: number) {
    await kv.set(`nonce:${contract}:${user}`, nonce);
}

export async function getBlazeBalance(contract: string, user: string) {
    const balance = await kv.get<number>(`balance:${contract}:${user}`) || 0;
    return balance;
}

export async function setBlazeBalance(contract: string, user: string, balance: number) {
    await kv.set(`balance:${contract}:${user}`, balance);
}