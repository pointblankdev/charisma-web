import { Card, CardContent } from "@components/ui/card";
import { Check, Info } from "lucide-react";
import { TooltipContent, TooltipTrigger } from "@components/ui/tooltip";
import { Tooltip } from "@components/ui/tooltip";
import { TooltipProvider } from "@components/ui/tooltip";
import { useGlobal } from "@lib/hooks/global-context";
import { useColor } from "color-thief-react";
import { Fingerprint, Flame, Lock } from "lucide-react";
import Image from "next/image";
import Blockies from "react-blockies";
import { useEffect, useRef, useState } from "react";

type TokenCardProps = {
    token: string;
    balance: number;
    icon: string;
    price?: number;
};

const TokenCard = ({ token, balance, icon, price }: TokenCardProps) => {
    const [structuredDataHash, setStructuredDataHash] = useState<string | null>(null);
    const [isPending, setIsPending] = useState(false);
    const [pendingAmount, setPendingAmount] = useState<number>(0);
    const lastBalanceRef = useRef(balance);

    // Use color-thief to extract colors from the token logo
    const { data: dominantColor } = useColor(icon, 'hex', {
        crossOrigin: 'anonymous',
        quality: 10,
    });

    // Listen for deposit/withdraw events
    useEffect(() => {
        const handleTransaction = (event: CustomEvent) => {
            // Only set pending if this event is for this token
            if (event.detail?.token === token) {
                setIsPending(true);
                setPendingAmount(event.detail.amount * (event.detail.action === 'withdraw' ? -1 : 1));
            }
        };

        window.addEventListener('blazeDeposit', handleTransaction as EventListener);
        window.addEventListener('blazeWithdraw', handleTransaction as EventListener);

        return () => {
            window.removeEventListener('blazeDeposit', handleTransaction as EventListener);
            window.removeEventListener('blazeWithdraw', handleTransaction as EventListener);
        };
    }, [token]);

    // Check for balance changes and manage pending state
    useEffect(() => {
        if (lastBalanceRef.current !== balance) {
            setIsPending(false);
            setPendingAmount(0);
            lastBalanceRef.current = balance;
        }
    }, [balance]);

    // Format balance based on token type
    const formattedBalance = token === 'sBTC'
        ? (balance + pendingAmount).toFixed(8)
        : token === 'WELSH'
            ? (balance + pendingAmount).toFixed(6)
            : (balance + pendingAmount).toFixed(6);

    // Calculate fiat value (dummy prices for demo)
    const fiatValue = token === 'sBTC'
        ? ((balance + pendingAmount) * 100000).toFixed(2) // Assuming $100k BTC price
        : token === 'WELSH'
            ? ((balance + pendingAmount) * 0.0005).toFixed(2) // Fun price point for WCC
            : ((balance + pendingAmount) * 0.85).toFixed(2); // Assuming $0.85 STX price

    return (
        <Card className="bg-accent/5 border-primary/20 relative overflow-hidden">
            <CardContent className="flex items-center justify-between p-0">
                <div className="flex items-center z-10">
                    <Image src={icon} alt={token} className="w-12 h-12 m-4 rounded-sm" width={200} height={200} />
                    <div className='leading-tight'>
                        <div className="flex items-center gap-2">
                            <p className="text-sm text-gray-400">{token} Balance</p>
                            {isPending && (
                                <div className="relative">
                                    <Flame className="w-4 h-4 text-primary animate-pulse" />
                                    <div className="absolute inset-0">
                                        <Flame className="w-4 h-4 text-primary/30 animate-ping" />
                                    </div>
                                </div>
                            )}
                        </div>
                        <p className={`text-2xl font-bold ${isPending ? 'animate-pulse' : ''}`}>
                            {formattedBalance} {token}
                        </p>
                        <p className="text-sm text-muted-foreground">${fiatValue} USD</p>
                    </div>
                </div>
                <TooltipProvider>
                    <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                            <div className="w-16 h-16 z-20">
                                <Blockies
                                    seed={structuredDataHash || `${token}-default-seed`}
                                    size={20}
                                    scale={4}
                                    color="#0C0C0D"
                                    bgColor="#0C0C0D"
                                    spotColor={dominantColor || '#0C0C0D'}
                                    className="cursor-pointer rounded-none absolute -right-[40px] top-0 transition-all duration-300 ease-in-out hover:animate-pulse hover:brightness-110"
                                />
                            </div>
                        </TooltipTrigger>
                        <TooltipContent
                            side="right"
                            align="start"
                            className="max-w-[550px] p-0 overflow-hidden"
                            hidden={true}
                        >
                            {/* Header Section */}
                            <div className="bg-muted/30 p-4 border-b border-border">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-background rounded-md">
                                        <Fingerprint className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-md">Balance Hash</h4>
                                        <code className="text-xs font-mono mt-1 text-muted-foreground">
                                            {structuredDataHash || 'No active channel'}
                                        </code>
                                    </div>
                                </div>
                            </div>

                            {structuredDataHash ? (
                                // Show full tooltip content for active channels
                                <div className="p-4 space-y-4">
                                    {/* What is this? */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <div className="w-1 h-1 rounded-full bg-primary" />
                                            What is this?
                                        </div>
                                        <p className="text-sm text-muted-foreground pl-3">
                                            This unique visual pattern represents the current state of your token balances in Blaze. Think of it as a fingerprint that identifies your balances's current state.
                                        </p>
                                    </div>

                                    {/* Security Features */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <div className="w-1 h-1 rounded-full bg-primary" />
                                            Security Features
                                        </div>
                                        <div className="pl-3 space-y-2">
                                            <div className="w-fit flex items-center gap-2 text-sm bg-muted/30 p-2 px-4 rounded-md">
                                                <Lock className="w-4 h-4 text-primary shrink-0" />
                                                <span className="text-muted-foreground">Cryptographically secure state verification</span>
                                            </div>
                                            <div className="w-fit flex items-center gap-2 text-sm bg-muted/30 p-2 px-4 rounded-md">
                                                <Info className="w-4 h-4 text-primary shrink-0" />
                                                <span className="text-muted-foreground">Visual state monitoring for quick verification</span>
                                            </div>
                                            <div className="w-fit flex items-center gap-2 text-sm bg-muted/30 p-2 px-4 rounded-md">
                                                <Flame className="w-4 h-4 text-primary shrink-0" />
                                                <span className="text-muted-foreground">Real-time state change detection</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Important Note */}
                                    <div className="bg-background border border-border rounded-md p-3">
                                        <div className="flex items-start gap-2">
                                            <Info className="w-4 h-4 text-primary mt-1 min-w-6" />
                                            <div className="space-y-1">
                                                <span className="text-sm font-medium">Channel State Verification</span>
                                                <p className="text-xs text-muted-foreground">
                                                    This visual pattern helps you verify your channel's state at a glance. It updates with each transaction and is secured by cryptographic signatures from both you and Blaze, ensuring the integrity of your payment channel.
                                                </p>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                                                    <Check className="w-3 h-3 text-green-500" />
                                                    <span>All state changes are cryptographically signed</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Check className="w-3 h-3 text-green-500" />
                                                    <span>Pattern changes indicate successful transactions</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // Show placeholder content for inactive channels
                                <div className="p-4 space-y-4">
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <div className="w-1 h-1 rounded-full bg-primary" />
                                            No Active Channel
                                        </div>
                                        <p className="text-sm text-muted-foreground pl-3">
                                            Deposit {token} to create a payment channel and enable instant, fee-less transfers.
                                        </p>
                                    </div>
                                    <div className="w-fit flex items-center gap-2 text-xs bg-muted/30 p-2 rounded-md">
                                        <Info className="w-3 h-3 text-primary shrink-0" />
                                        <span className="text-muted-foreground">Click "Deposit" to get started</span>
                                    </div>
                                </div>
                            )}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </CardContent>
        </Card>
    );
};

type PortfolioCardsProps = {
    balances: Record<string, number>;
    prices: Record<string, number>;
};

export function PortfolioCards({ balances, prices }: PortfolioCardsProps) {
    const totalBalance = Object.entries(balances).reduce(
        (acc, [token, balance]) => acc + balance * (prices[token] || 0),
        0
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Your Wallet</h2>
                <div className="text-sm text-muted-foreground">
                    Total Balance: ${totalBalance.toFixed(2)}
                </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* STX Card */}
                <TokenCard
                    token="STX"
                    balance={balances['.stx'] || 0}
                    icon="/stx-logo.png"
                    price={prices['.stx'] || 0}
                />

                {/* sBTC Card */}
                <TokenCard
                    token="sBTC"
                    balance={balances['.sbtc'] || 0}
                    icon="/sbtc.png"
                    price={prices['.sbtc'] || 0}
                />

                {/* Welsh Corgi Coin Card */}
                <TokenCard
                    token="WELSH"
                    balance={balances['.welsh'] || 0}
                    icon="/welsh-logo.png"
                    price={prices['.welsh'] || 0}
                />
            </div>
        </div>
    );
}
