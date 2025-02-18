import { Button } from '@components/ui/button';
import {
    TooltipProvider,
    Tooltip,
    TooltipTrigger,
    TooltipContent,
} from "@components/ui/tooltip";
import { useGlobal } from '@lib/hooks/global-context';
import {
    Bitcoin,
    Landmark,
    Send,
    Download,
    Upload,
    Flame,
    Check,
} from 'lucide-react';
import Image from 'next/image';
import { useEffect } from 'react';
import { useState } from 'react';
import { getBalance } from './action-helpers';

interface ActionButtonProps {
    onClick?: () => void;
    disabled?: boolean;
}

// Buy Bitcoin Button
export function BuyBitcoinButton({ disabled = true }: ActionButtonProps) {
    return (
        <TooltipProvider>
            <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto"
                        disabled={disabled}
                    >
                        <Bitcoin className="w-4 h-4 mr-2" />
                        Buy Bitcoin
                    </Button>
                </TooltipTrigger>
                <TooltipContent className="w-80 p-4">
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b">
                        <Bitcoin className="w-5 h-5" />
                        <span className="font-semibold">Buy Bitcoin with Card</span>
                    </div>
                    <p className="text-sm opacity-90 mb-2">
                        Purchase bitcoin directly using your credit or debit card.
                        Instantly convert your local currency into bitcoin.
                    </p>
                    <div className="inline-flex text-xs bg-muted/50 p-2 rounded items-center gap-2 mt-4">
                        <span className="w-2 h-2 rounded-full bg-yellow-500" />
                        Coming soon: Direct fiat-to-bitcoin purchases
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

// Cash Out Button
export function CashOutButton({ disabled = true }: ActionButtonProps) {
    return (
        <TooltipProvider>
            <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto"
                        disabled={disabled}
                    >
                        <Landmark className="w-4 h-4 mr-2" />
                        Cash Out
                    </Button>
                </TooltipTrigger>
                <TooltipContent className="w-80 p-4">
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b">
                        <Landmark className="w-5 h-5" />
                        <span className="font-semibold">Convert to Cash</span>
                    </div>
                    <p className="text-sm opacity-90 mb-2">
                        Convert your cryptocurrency back to your local currency and withdraw
                        directly to your bank account.
                    </p>
                    <div className="inline-flex text-xs bg-muted/50 p-2 rounded items-center gap-2 mt-4">
                        <span className="w-2 h-2 rounded-full bg-yellow-500" />
                        Coming soon: Direct crypto-to-fiat withdrawals
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

// Send Tokens Button
export function SendTokensButton({ onClick, disabled }: ActionButtonProps) {
    return (
        <TooltipProvider>
            <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                    <Button
                        onClick={onClick}
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto"
                        disabled={disabled}
                    >
                        <Send className="w-4 h-4 mr-2" />
                        Send Tokens
                    </Button>
                </TooltipTrigger>
                <TooltipContent className="w-80 p-4">
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b">
                        <Send className="w-5 h-5" />
                        <span className="font-semibold">Send tokens to Blaze User</span>
                    </div>
                    <p className="text-sm opacity-90 mb-2">
                        Send tokens instantly to any Blaze user with zero fees.
                        No gas fees, no waiting for confirmations.
                    </p>
                    <div className="inline-flex text-xs bg-muted/50 p-2 rounded items-center gap-2 mt-4">
                        <Flame className="w-4 h-4 rounded-full text-primary" />
                        Instant transfers, no fees, no gas.
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

// Deposit Button
export function DepositButton({ onClick }: ActionButtonProps) {
    const [balance, setBalance] = useState<number>(0);
    const { stxAddress } = useGlobal();

    useEffect(() => {
        const fetchBalance = async () => {
            const balance = await getBalance(stxAddress, 'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token');
            setBalance(balance);
        };
        fetchBalance();
    }, [stxAddress]);
    return (
        <TooltipProvider>
            <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                    <Button
                        onClick={onClick}
                        size="sm"
                        className="w-full sm:w-auto"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Deposit
                    </Button>
                </TooltipTrigger>
                <TooltipContent className="w-96 p-4">
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b">
                        <Download className="w-5 h-5" />
                        <span className="font-semibold">Deposit to Blaze</span>
                    </div>
                    <p className="text-sm opacity-90 mb-2">
                        Move your cryptocurrency from your Stacks wallet into your Blaze account
                        for instant transfers, low-fee trading and nearly unlimited transactions per second.
                    </p>
                    {balance === 0 ? (
                        <div className="inline-flex text-xs bg-destructive/10 text-destructive p-2 rounded items-center gap-2 mt-4">
                            <span className="w-2 h-2 rounded-full bg-destructive" />
                            Deposit some STX first to enable transfers
                        </div>
                    ) : (
                        <div className="inline-flex text-xs bg-muted/50 p-2 rounded items-center gap-2 mt-4">
                            <span className="w-2 h-2 rounded-full bg-green-500" />
                            Deposits require gas fees, and take a few seconds to confirm.
                        </div>
                    )}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

// Withdraw Button
export function WithdrawButton({ onClick }: ActionButtonProps) {
    const [balance, setBalance] = useState<number>(0);
    const { stxAddress } = useGlobal();

    useEffect(() => {
        const fetchBalance = async () => {
            const balance = await getBalance(stxAddress, 'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token');
            setBalance(balance);
        };
        fetchBalance();
    }, [stxAddress]);
    return (
        <TooltipProvider>
            <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                    <Button
                        onClick={onClick}
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto"
                        disabled={balance === 0}
                    >
                        <Upload className="w-4 h-4 mr-2" />
                        Withdraw
                    </Button>
                </TooltipTrigger>
                <TooltipContent className="w-80 p-4">
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b">
                        <Upload className="w-5 h-5" />
                        <span className="font-semibold">Withdraw from Blaze</span>
                    </div>
                    <p className="text-sm opacity-90 mb-2">
                        Move your tokens from your Blaze account back to your
                        Bitcoin wallet. Perfect for when you want to hold or trade elsewhere.
                    </p>
                    {balance === 0 ? (
                        <div className="inline-flex text-xs bg-destructive/10 text-destructive p-2 rounded items-center gap-2 mt-4">
                            <span className="w-2 h-2 rounded-full bg-destructive" />
                            Deposit some WELSH first to enable withdrawals
                        </div>
                    ) : (
                        <div className="inline-flex text-xs bg-muted/50 p-2 rounded items-center gap-2 mt-4">
                            <span className="w-2 h-2 rounded-full bg-green-500" />
                            Available balance: {balance / 1_000_000} WELSH
                        </div>
                    )}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
