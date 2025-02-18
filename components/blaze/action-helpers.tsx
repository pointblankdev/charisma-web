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
import {
    showTransferSuccessToast,
    showTransferErrorToast,
    showDepositSuccessToast,
    showDepositCancelledToast,
    showDepositErrorToast,
    showWithdrawSuccessToast,
    showWithdrawCancelledToast,
    showWithdrawErrorToast
} from "./toast-confirmations";


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
                    const response = await axios.post(`/api/v0/blaze/subnets/${getBlazeContractForToken(token.contract)}/xfer`, {
                        signature: data.signature,
                        from,
                        token: token.contract,
                        to,
                        amount: tokens,
                        nonce: nextNonce
                    });

                    // Dispatch event for optimistic updates
                    window.dispatchEvent(new CustomEvent('blazeTransfer', {
                        detail: {
                            token,
                            amount: tokens / 10 ** token.decimals,
                            to,
                            action: 'transfer'
                        }
                    }));

                    showTransferSuccessToast({ token, amount: tokens, to });
                    resolve(response.data);
                } catch (error) {
                    showTransferErrorToast(error);
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
        const tokens = Number(amount) * 10 ** token.decimals;

        const contractCall = {
            contractAddress,
            contractName,
            functionName: 'deposit',
            functionArgs: [Cl.uint(tokens)],
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

                showDepositSuccessToast({ token, amount: Number(amount), txId: data.txId });
            },
            onCancel: () => {
                showDepositCancelledToast();
            }
        };

        const { openContractCall } = await import("@stacks/connect");
        await openContractCall(contractCall);
    } catch (error) {
        console.error('Deposit error:', error);
        showDepositErrorToast(error);
    }
}

export async function handleWithdraw({ token, amount, stxAddress }: TransactionParams): Promise<void> {
    const [contractAddress, contractName] = getBlazeContractForToken(token.contract).split('.');
    try {
        // Convert amount to micros (assuming 6 decimals)
        const tokens = Number(amount) * 10 ** token.decimals;

        const contractCall = {
            contractAddress,
            contractName,
            functionName: 'withdraw',
            functionArgs: [Cl.uint(tokens)],
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

                showWithdrawSuccessToast({ token, amount: Number(amount), txId: data.txId });
            },
            onCancel: () => {
                showWithdrawCancelledToast();
            }
        };

        const { openContractCall } = await import("@stacks/connect");
        await openContractCall(contractCall);
    } catch (error) {
        console.error('Withdrawal error:', error);
        showWithdrawErrorToast(error);
    }
}