import {
    Cl,
    signWithKey,
    ClarityType,
    fetchCallReadOnlyFunction,
    signStructuredData
} from '@stacks/transactions';
import { setFetchOptions } from '@stacks/common';
import { CONFIG } from '@lib/stackflow/config';
import type { StacksNetwork } from '@stacks/network';

// Helper function to create token CV
function createTokenCV(token: string | null) {
    if (!token) return Cl.none();
    const [contractAddress, contractName] = token.split('.');
    return Cl.some(Cl.contractPrincipal(contractAddress, contractName));
}

export async function verifySignature(
    signature: string,
    signer: string,
    token: string | null,
    // myPrincipal: string,
    // theirPrincipal: string,
    // myBalance: bigint,
    // theirBalance: bigint,
    principal1: string,
    principal2: string,
    balance1: bigint,
    balance2: bigint,
    nonce: number,
    action: number,
    actor: string | null = null,
    hashedSecret: string | null = null,
    network: StacksNetwork
) {
    // const meFirst = myPrincipal < theirPrincipal;
    // const principal1 = meFirst ? myPrincipal : theirPrincipal;
    // const principal2 = meFirst ? theirPrincipal : myPrincipal;
    // const balance1 = meFirst ? myBalance : theirBalance;
    // const balance2 = meFirst ? theirBalance : myBalance;

    // Setup API key
    setFetchOptions({
        headers: CONFIG.API_KEY ? {
            'x-api-key': CONFIG.API_KEY
        } : undefined
    });

    const functionArgs = [
        Cl.bufferFromHex(signature),
        Cl.principal(signer),
        Cl.tuple({
            'principal-1': Cl.principal(principal1),
            'principal-2': Cl.principal(principal2),
            token: token ? createTokenCV(token) : Cl.none()
        }),
        Cl.uint(balance1),
        Cl.uint(balance2),
        Cl.uint(nonce),
        Cl.uint(action),
        actor ? Cl.some(Cl.principal(actor)) : Cl.none(),
        hashedSecret ? Cl.some(Cl.bufferFromHex(hashedSecret)) : Cl.none()
    ];

    const options = {
        contractAddress: CONFIG.CONTRACT_ADDRESS!,
        contractName: CONFIG.CONTRACT_NAME!,
        functionName: 'verify-signature',
        functionArgs,
        network,
        senderAddress: CONFIG.OWNER!
    };

    const result = await fetchCallReadOnlyFunction(options);
    return result.type === ClarityType.BoolTrue;
}

export function generateSignature(
    privateKey: string,
    token: string | null,
    // myPrincipal: string,
    // theirPrincipal: string,
    // myBalance: bigint,
    // theirBalance: bigint,
    principal1: string,
    principal2: string,
    balance1: bigint,
    balance2: bigint,
    nonce: string,
    action: number,
    actor: string | null = null,
    hashedSecret: string | null = null,
    network: StacksNetwork
): string {
    // const meFirst = myPrincipal < theirPrincipal;
    // const principal1 = meFirst ? myPrincipal : theirPrincipal;
    // const principal2 = meFirst ? theirPrincipal : myPrincipal;
    // const balance1 = meFirst ? myBalance : theirBalance;
    // const balance2 = meFirst ? theirBalance : myBalance;

    const message = Cl.tuple({
        token: token ? createTokenCV(token) : Cl.none(),
        'principal-1': Cl.principal(principal1),
        'principal-2': Cl.principal(principal2),
        'balance-1': Cl.uint(balance1),
        'balance-2': Cl.uint(balance2),
        nonce: Cl.uint(nonce),
        action: Cl.uint(action),
        actor: actor ? Cl.some(Cl.principal(actor)) : Cl.none(),
        'hashed-secret': hashedSecret ? Cl.some(Cl.bufferFromHex(hashedSecret)) : Cl.none()
    });

    const domain = Cl.tuple({
        name: Cl.stringAscii('StackFlow'),
        version: Cl.stringAscii('0.2.2'),
        'chain-id': Cl.uint(network.chainId)
    });

    return signStructuredData({ message, domain, privateKey });
}

// Generate a signature for a message with these parameters by calling the
// `make-structured-data-hash` read-only function on the contract.
// Note: if you have the secret, you can generate the `hashedSecret` by calling
// `sha256(Buffer.from(secret, "hex"))`
export async function generateSignatureContract(
    privateKey: string,
    token: string | null,
    myPrincipal: string,
    theirPrincipal: string,
    myBalance: bigint,
    theirBalance: bigint,
    nonce: string,
    action: number,
    actor: string | null = null,
    hashedSecret: string | null = null,
    network: StacksNetwork
): Promise<Buffer> {
    const meFirst = myPrincipal < theirPrincipal;
    const principal1 = meFirst ? myPrincipal : theirPrincipal;
    const principal2 = meFirst ? theirPrincipal : myPrincipal;
    const balance1 = meFirst ? myBalance : theirBalance;
    const balance2 = meFirst ? theirBalance : myBalance;

    const options = {
        contractAddress: CONFIG.CONTRACT_ADDRESS!,
        contractName: CONFIG.CONTRACT_NAME!,
        functionName: 'make-structured-data-hash',
        functionArgs: [
            Cl.tuple({
                'principal-1': Cl.principal(principal1),
                'principal-2': Cl.principal(principal2),
                token: createTokenCV(token),
            }),
            Cl.uint(balance1),
            Cl.uint(balance2),
            Cl.uint(nonce),
            Cl.uint(action),
            actor ? Cl.some(Cl.principal(actor)) : Cl.none(),
            hashedSecret ? Cl.some(Cl.bufferFromHex(hashedSecret)) : Cl.none()
        ],
        network,
        senderAddress: CONFIG.OWNER!
    };

    const result = await fetchCallReadOnlyFunction(options);
    if (result.type !== ClarityType.ResponseOk) {
        throw new Error('Error generating structured data hash');
    }

    const hash = result.value;
    const signature = signWithKey(privateKey, hash.toString());
    return Buffer.from(signature.slice(2) + signature.slice(0, 2), 'hex');
}