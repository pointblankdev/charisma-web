import { Cl } from "@stacks/transactions";
import { STACKS_MAINNET } from "@stacks/network";
import axios, { AxiosError } from 'axios';
import { toast } from "@components/ui/use-toast";
import Image from "next/image";
import { Check, Zap, Banknote, AlertTriangle } from "lucide-react";
import Blockies from "react-blockies";
import { Button } from "@components/ui/button";
import { Search } from "lucide-react";
import { Pc, PostConditionMode, fetchCallReadOnlyFunction, ClarityType } from "@stacks/transactions";
import { Token } from "./action-dialogs";
import { getBlazeContractForToken } from "@lib/blaze/helpers";


export interface SignTransferParams {
    token: Token;
    from: string;
    to: string;
    amount: number; // Amount in base units (not micros)
    nonce?: number;
}

export interface TransactionParams {
    token: Token;
    amount: string;
    stxAddress: string;
}

/**
 * Shortens a blockchain address to a more readable format
 * @param address The full address to shorten
 * @param chars Number of characters to show at start and end (default: 4)
 * @returns Shortened address with ellipsis in the middle
 * @example
 * shortenAddress("SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS")
 * // Returns: "SP2Z...55KS"
 */
export function shortenAddress(address: string, chars: number = 4): string {
    if (!address) return '';
    if (address.length <= chars * 2) return address;

    const prefix = address.slice(0, chars);
    const suffix = address.slice(-chars);
    return `${prefix}...${suffix}`;
}

export async function handleTransfer({ token, from, to, amount }: SignTransferParams): Promise<any> {
    const tokens = amount;
    const nextNonce = Date.now();

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
    return new Promise((resolve, reject) => {
        openStructuredDataSignatureRequestPopup({
            domain,
            message,
            network: STACKS_MAINNET,
            onFinish: async (data) => {
                try {
                    const response = await axios.post('/api/v0/blaze/xfer', {
                        signature: data.signature,
                        from,
                        token: token.contract,
                        to,
                        amount: tokens,
                        nonce: nextNonce
                    });

                    // Success toast with detailed transfer information
                    toast({
                        title: "Transfer Successful",
                        description: (
                            <div className="space-y-3 pt-3 w-80">
                                {/* Amount and Value */}
                                <div className="flex items-center justify-between p-2">
                                    <div className="flex items-center gap-3">
                                        <Image
                                            src={token.icon}
                                            alt={token.symbol}
                                            width={24}
                                            height={24}
                                            className="rounded-sm"
                                        />
                                        <span className="font-medium text-base">{amount} {token.symbol}</span>
                                    </div>
                                    {/* <span className="text-sm text-muted-foreground">
                                        ≈ ${(amount * prices[token]).toFixed(2)}
                                    </span> */}
                                </div>

                                {/* Recipient */}
                                <div className="flex items-center justify-between gap-3 bg-muted/30 p-3 rounded-md">
                                    <div className="flex items-center gap-3">
                                        <Blockies
                                            seed={to}
                                            size={6}
                                            scale={3}
                                            className="rounded-sm"
                                        />
                                        <span className="text-sm font-mono">{shortenAddress(to)}</span>
                                    </div>
                                    <Check className="w-5 h-5 text-primary" />
                                </div>

                                {/* Stats */}
                                <div className="flex gap-3 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-md">
                                        <Zap className="w-4 h-4 text-primary" />
                                        Instant
                                    </div>
                                    <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-md">
                                        <Banknote className="w-4 h-4 text-primary" />
                                        No Fees
                                    </div>
                                </div>
                            </div>
                        )
                    });

                    resolve(response.data);
                } catch (error) {
                    // Error toast with detailed error information
                    toast({
                        title: "Transfer Failed",
                        description: (
                            <div className="space-y-4 pt-3">
                                <div className="flex items-center gap-3 text-destructive">
                                    <div className="p-2 bg-destructive/10 rounded-md">
                                        <AlertTriangle className="w-4 h-4" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="font-medium">Transaction Error</div>
                                        <div className="text-sm text-muted-foreground">
                                            {error instanceof AxiosError ? error?.response?.data?.error : "Failed to process transfer"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ),
                    });

                    console.error("Error transferring tokens", error);
                    resolve(error);
                }
            },
        });
    });
}

export async function handleDeposit({ token, amount, stxAddress }: TransactionParams): Promise<void> {
    const [contractAddress, contractName] = getBlazeContractForToken(token.contract).split('.');
    try {
        // Convert amount to micros (assuming 6 decimals)
        const amountMicros = Number(amount) * 1_000_000;

        const contractCall = {
            contractAddress,
            contractName,
            functionName: "deposit",
            functionArgs: [
                Cl.uint(amountMicros)
            ],
            postConditions: [
                Pc.principal(stxAddress).willSendEq(amountMicros).ft(token.contract as any, token.identifier)
            ],
            postConditionMode: PostConditionMode.Deny,
            network: STACKS_MAINNET,
            onFinish: (data: any) => {
                // Dispatch event for optimistic updates
                window.dispatchEvent(new CustomEvent('blazeDeposit', {
                    detail: {
                        token,
                        amount: Number(amount),
                        action: 'deposit'
                    }
                }));

                toast({
                    title: "Deposit Successful",
                    description: (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-green-500/10 rounded-md">
                                    <Check className="w-4 h-4 text-green-500" />
                                </div>
                                <div>
                                    <div className="font-medium">Tokens Deposited</div>
                                    <div className="text-sm text-muted-foreground">
                                        {amount} {token.symbol} have been deposited to your account
                                    </div>
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => window.open(`https://explorer.stacks.co/txid/${data.txId}?chain=mainnet`, '_blank')}
                            >
                                <Search className="w-4 h-4 mr-2" />
                                View Transaction
                            </Button>
                        </div>
                    )
                });
            },
            onCancel: () => {
                toast({
                    title: "Deposit Cancelled",
                    description: "The token deposit was cancelled.",
                    variant: "destructive"
                });
            }
        };

        const { openContractCall } = await import("@stacks/connect");
        await openContractCall(contractCall);
    } catch (error) {
        console.error('Deposit error:', error);
        toast({
            title: "Deposit Failed",
            description: error instanceof Error ? error.message : "Unknown error occurred",
            variant: "destructive"
        });
    }
}

export async function handleWithdraw({ token, amount }: TransactionParams): Promise<void> {
    const [contractAddress, contractName] = getBlazeContractForToken(token.contract).split('.');
    try {
        // Convert amount to micros (assuming 6 decimals)
        const amountMicros = Number(amount) * 1_000_000;

        const contractCall = {
            contractAddress,
            contractName,
            functionName: "withdraw",
            functionArgs: [
                Cl.uint(amountMicros)
            ],
            postConditions: [
                Pc.principal(`${contractAddress}.${contractName}`)
                    .willSendEq(amountMicros)
                    .ft(token.contract as any, token.identifier)
            ],
            postConditionMode: PostConditionMode.Deny,
            network: STACKS_MAINNET,
            onFinish: (data: any) => {
                // Dispatch event for optimistic updates
                window.dispatchEvent(new CustomEvent('blazeWithdraw', {
                    detail: {
                        token,
                        amount: Number(amount),
                        action: 'withdraw'
                    }
                }));

                toast({
                    title: "Withdrawal Successful",
                    description: (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-green-500/10 rounded-md">
                                    <Check className="w-4 h-4 text-green-500" />
                                </div>
                                <div>
                                    <div className="font-medium">Tokens Withdrawn</div>
                                    <div className="text-sm text-muted-foreground">
                                        {amount} {token.symbol} have been withdrawn to your wallet
                                    </div>
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => window.open(`https://explorer.stacks.co/txid/${data.txId}?chain=mainnet`, '_blank')}
                            >
                                <Search className="w-4 h-4 mr-2" />
                                View Transaction
                            </Button>
                        </div>
                    )
                });
            },
            onCancel: () => {
                toast({
                    title: "Withdrawal Cancelled",
                    description: "The token withdrawal was cancelled.",
                    variant: "destructive"
                });
            }
        };

        const { openContractCall } = await import("@stacks/connect");
        await openContractCall(contractCall);
    } catch (error) {
        console.error('Withdrawal error:', error);
        toast({
            title: "Withdrawal Failed",
            description: error instanceof Error ? error.message : "Unknown error occurred",
            variant: "destructive"
        });
    }
}

/**
 * Fetches the balance of a given address from the Blaze contract
 * @param address The Stacks address to check balance for
 * @returns Promise<number> Balance in base units (not micros)
 * @throws Error if the balance fetch fails
 */
export async function getBalance(address: string, tokenContract: string): Promise<number> {
    const [contractAddress, contractName] = getBlazeContractForToken(tokenContract).split('.');
    try {
        const options = {
            contractAddress,
            contractName,
            functionName: "get-balance",
            functionArgs: [
                Cl.principal(address)
            ],
            network: STACKS_MAINNET,
            senderAddress: address,
        };

        const result = await fetchCallReadOnlyFunction(options);

        // Check if we got a valid uint response
        if (result.type !== ClarityType.UInt) {
            throw new Error("Unexpected response type from contract");
        }

        // Convert from micros to base units
        return Number(result.value);
    } catch (error) {
        console.error("Error fetching balance:", error);
        return 0;
    }
}

/**
 * Fetches the current nonce for a given address from the Blaze contract
 * @param address The Stacks address to check nonce for
 * @returns Promise<number> Current nonce value
 * @throws Error if the nonce fetch fails
 */
export async function getNonce(address: string, blazeContract: string): Promise<number> {
    const [contractAddress, contractName] = blazeContract.split('.');
    try {
        const options = {
            contractAddress,
            contractName,
            functionName: "get-nonce",
            functionArgs: [
                Cl.principal(address)
            ],
            network: STACKS_MAINNET,
            senderAddress: address,
        };

        const result = await fetchCallReadOnlyFunction(options);

        // Check if we got a valid uint response
        if (result.type !== ClarityType.UInt) {
            throw new Error("Unexpected response type from contract");
        }

        return Number(result.value);
    } catch (error) {
        console.error("Error fetching nonce:", error);
        throw error;
    }
}

export async function handleCoinFlip({ choice, amount, stxAddress }: {
    choice: 'heads' | 'tails';
    amount: number;
    stxAddress: string;
}): Promise<{
    won: boolean;
    result: string;
    newBalance: string;
}> {

    const amountMicros = amount * 1_000_000;
    const nonce = 1 //await getNonce(stxAddress);

    // Create domain matching contract
    const domain = Cl.tuple({
        name: Cl.stringAscii("blaze"),
        version: Cl.stringAscii("0.1.0"),
        "chain-id": Cl.uint(STACKS_MAINNET.chainId),
    });

    const gameHost = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS'
    const gameToken = 'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token'

    // Create message tuple
    const message = Cl.tuple({
        token: Cl.principal(gameToken),
        to: Cl.principal(gameHost),
        amount: Cl.uint(amountMicros),
        nonce: Cl.uint(nonce)
    });

    const { openStructuredDataSignatureRequestPopup } = await import("@stacks/connect");

    return new Promise((resolve, reject) => {
        openStructuredDataSignatureRequestPopup({
            domain,
            message,
            network: STACKS_MAINNET,
            onFinish: async (data) => {
                try {
                    const response = await axios.post('/api/v0/blaze/coinflip', {
                        signature: data.signature,
                        from: stxAddress,
                        token: gameToken,
                        amount: amountMicros,
                        choice,
                        nonce
                    });
                    resolve(response.data);
                } catch (error) {
                    reject(error);
                }
            },
        });
    });
}

export async function fetchBlazeBalances(user: string) {
    const response = await fetch(`/api/v0/blaze/user/${user}`);
    const data = await response.json();
    console.log(data);
    return data.total;
}