import { toast } from "@components/ui/use-toast";
import { Check, Search, AlertTriangle } from "lucide-react";
import { Button } from "@components/ui/button";
import Image from "next/image";
import { Token } from "./action-dialogs";
import { AxiosError } from "axios";

interface TransferToastParams {
    token: Token;
    amount: number;
    to: string;
}

interface TransactionToastParams {
    token: Token;
    amount: number;
    txId: string;
}

export function showTransferSuccessToast({ token, amount, to }: TransferToastParams) {
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
                        <span className="font-medium text-base">{amount / 10 ** token.decimals} {token.symbol}</span>
                    </div>
                </div>

                {/* Recipient */}
                <div className="flex items-center justify-between bg-muted/30 p-2 rounded-md">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">To:</span>
                        <span className="text-sm font-medium">{to.slice(0, 8)}...{to.slice(-4)}</span>
                    </div>
                </div>
            </div>
        ),
    });
}

export function showTransferErrorToast(error: unknown) {
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
}

export function showDepositSuccessToast({ token, amount, txId }: TransactionToastParams) {
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
                    onClick={() => window.open(`https://explorer.stacks.co/txid/${txId}?chain=mainnet`, '_blank')}
                >
                    <Search className="w-4 h-4 mr-2" />
                    View Transaction
                </Button>
            </div>
        )
    });
}

export function showDepositCancelledToast() {
    toast({
        title: "Deposit Cancelled",
        description: "The token deposit was cancelled.",
        variant: "destructive"
    });
}

export function showDepositErrorToast(error: unknown) {
    toast({
        title: "Deposit Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
    });
}

export function showWithdrawSuccessToast({ token, amount, txId }: TransactionToastParams) {
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
                    onClick={() => window.open(`https://explorer.stacks.co/txid/${txId}?chain=mainnet`, '_blank')}
                >
                    <Search className="w-4 h-4 mr-2" />
                    View Transaction
                </Button>
            </div>
        )
    });
}

export function showWithdrawCancelledToast() {
    toast({
        title: "Withdrawal Cancelled",
        description: "The token withdrawal was cancelled.",
        variant: "destructive"
    });
}

export function showWithdrawErrorToast(error: unknown) {
    toast({
        title: "Withdrawal Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
    });
} 