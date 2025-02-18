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
import { TOKEN_CONTRACT_MAP } from "@lib/blaze/helpers";
import { Skeleton } from "@components/ui/skeleton";
import { Balance } from "blaze-sdk";

type TokenCardProps = {
    token: string;
    balance: number;
    icon: string;
    price: number;
    isLoading?: boolean;
    blazeContract: string;
    decimals: number;
};

const TokenCard = ({ token, balance, icon, price, isLoading, blazeContract, decimals }: TokenCardProps) => {
    const [structuredDataHash, setStructuredDataHash] = useState<string | null>(null);
    const [isPending, setIsPending] = useState(false);
    const [pendingAmount, setPendingAmount] = useState<number>(0);
    const [pendingAction, setPendingAction] = useState<'deposit' | 'withdraw' | null>(null);
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
            if (event.detail?.token.blazeContract === blazeContract) {
                setIsPending(true);
                setPendingAction(event.detail.action);
                setPendingAmount(event.detail.amount * (event.detail.action === 'deposit' ? 1 : -1));

                // Reset pending state after animation (2 minutes)
                setTimeout(() => {
                    setIsPending(false);
                    setPendingAction(null);
                    setPendingAmount(0);
                }, 120000);
            }
        };

        window.addEventListener('blazeDeposit', handleTransaction as EventListener);
        window.addEventListener('blazeWithdraw', handleTransaction as EventListener);
        window.addEventListener('blazeTransfer', handleTransaction as EventListener);

        return () => {
            window.removeEventListener('blazeDeposit', handleTransaction as EventListener);
            window.removeEventListener('blazeWithdraw', handleTransaction as EventListener);
            window.removeEventListener('blazeTransfer', handleTransaction as EventListener);
        };
    }, [token]);

    // Check for balance changes and manage pending state
    useEffect(() => {
        if (lastBalanceRef.current !== balance) {
            setIsPending(false);
            setPendingAction(null);
            setPendingAmount(0);
            lastBalanceRef.current = balance;
        }
    }, [balance]);

    // Format balance based on token type
    const formattedBalance = (balance + pendingAmount)

    // Calculate fiat value 
    const fiatValue = ((balance + pendingAmount) * price).toFixed(2)

    if (isLoading) {
        return (
            <Card className="bg-accent/5 border-primary/20 relative overflow-hidden">
                <CardContent className="flex items-center justify-between p-0">
                    <div className="flex items-center z-10 w-full">
                        <Skeleton className="w-12 h-12 m-4 rounded-sm" />
                        <div className='leading-tight w-full pr-16'>
                            <Skeleton className="h-4 w-24 mb-2" />
                            <Skeleton className="h-8 w-32 mb-2" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                    </div>
                    <div className="w-16 h-16 absolute -right-[40px] top-0">
                        <Skeleton className="w-full h-full" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className={`bg-accent/5 border-primary/20 relative overflow-hidden ${isPending ? 'ring-1 ring-primary/20' : ''}`}>
            <CardContent className="flex items-center justify-between p-0">
                <div className="flex items-center z-10">
                    <div className="relative">
                        <Image src={icon} alt={token} className="w-12 h-12 m-4 rounded-sm" width={200} height={200} />
                        {isPending && (
                            <div className="absolute top-2 right-2 bg-background/80 rounded-full p-1 shadow-md">
                                <div className="relative">
                                    <Flame className="w-4 h-4 text-primary animate-pulse" />
                                    <div className="absolute inset-0">
                                        <Flame className="w-4 h-4 text-primary/30 animate-ping" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className='leading-tight'>
                        <div className="flex items-center gap-2">
                            <p className="text-sm text-gray-400">{token} Balance</p>
                            {isPending && (
                                <span className="text-xs text-primary animate-pulse">
                                    {pendingAction === 'deposit' ? 'Depositing...' : 'Transferring...'}
                                </span>
                            )}
                        </div>
                        <p className={`text-2xl font-bold ${isPending ? 'animate-pulse' : ''}`}>
                            {formattedBalance.toFixed(decimals)} {token}
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
    balances: Record<string, Balance>;
    prices: Record<string, number>;
};

export function PortfolioCards({ balances, prices }: PortfolioCardsProps) {
    const tokens = [{
        tokenContract: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.blaze-welsh-v0',
        tokenSymbol: 'WELSH',
        tokenIcon: '/welsh-logo.png',
        tokenPrice: prices['SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token'] || 0,
        tokenBalance: balances['SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.blaze-welsh-v0']!.total / 10 ** 6 || 0,
        tokenDecimals: 6,
    }]

    const [mounted, setMounted] = useState(false);

    // if balances is empty, set isLoading to true
    const isLoading = !mounted || Object.keys(balances).length === 0;

    // Calculate total balance
    const totalBalance = tokens.reduce((acc, token) => acc + token.tokenBalance * token.tokenPrice, 0);

    // Handle mounting to prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Your Balances</h2>
                <div className="text-sm text-muted-foreground">
                    {isLoading ? (
                        <Skeleton className="h-4 w-32" />
                    ) : mounted ? (
                        `Total Balance: $${totalBalance.toFixed(2)}`
                    ) : null}
                </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {tokens.map(({ tokenContract, tokenSymbol, tokenIcon, tokenPrice, tokenBalance, tokenDecimals }) => {
                    return (
                        <TokenCard
                            key={tokenContract}
                            token={tokenSymbol}
                            balance={tokenBalance}
                            icon={tokenIcon}
                            price={tokenPrice}
                            isLoading={isLoading}
                            blazeContract={tokenContract}
                            decimals={tokenDecimals}
                        />
                    );
                })}
            </div>
        </div>
    );
}
