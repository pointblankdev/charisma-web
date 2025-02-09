import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@components/ui/button';
import { Card, CardContent } from '@components/ui/card';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@components/ui/alert-dialog";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { toast, useToast } from "@components/ui/use-toast";
import {
    Lock,
    Download,
    Upload,
    BookMarked,
    BookmarkCheck,
    CreditCard,
    DollarSign,
    Send,
    ArrowLeftRight,
    Rocket,
    TrendingUp,
    Wallet,
    Coins,
    Info,
    Flame,
    PiggyBank,
    Bitcoin,
    Landmark,
    Fingerprint,
    Check,
    Code,
    Zap,
    Banknote,
    Gamepad2,
    Sparkles,
    Shield,
    Blocks,
    Badge,
    BarChart3
} from 'lucide-react';
import { STACKS_MAINNET } from "@stacks/network";
import { Cl, PostConditionMode, Pc } from "@stacks/transactions";
import { Channel } from '@lib/stackflow/types';
import { useGlobal } from '@lib/hooks/global-context';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@components/ui/tooltip";
import Blockies from 'react-blockies';
import Image from 'next/image';
import axios from 'axios';
import { useColor } from 'color-thief-react';
import { LucideIcon } from "lucide-react";

// Constants
const CONTRACT_ADDRESS = "SP126XFZQ3ZHYM6Q6KAQZMMJSDY91A8BTT6AD08RV";
const CONTRACT_NAME = "stackflow-0-2-2";
const OWNER = "SP3619DGWH08262BJAG0NPFN4TKMXHC0ZQDN";
const API_BASE_URL = '/api/v0/stackflow';


const TokenCard = ({ token, balance, icon }: { token: string, balance: number, icon: string }) => {
    const { channels, stxAddress } = useGlobal();
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
            ? (balance + pendingAmount).toLocaleString(undefined, { maximumFractionDigits: 2 })
            : (balance + pendingAmount).toLocaleString(undefined, { maximumFractionDigits: 6 });

    // Calculate fiat value (dummy prices for demo)
    const fiatValue = token === 'sBTC'
        ? ((balance + pendingAmount) * 100000).toFixed(2) // Assuming $100k BTC price
        : token === 'WELSH'
            ? ((balance + pendingAmount) * 0.0005).toFixed(2) // Fun price point for WCC
            : ((balance + pendingAmount) * 0.85).toFixed(2); // Assuming $0.85 STX price

    // Fetch hash for this token's channel
    const fetchTokenChannelHash = async () => {
        const channel = channels.find(c =>
            (c.principal_1 === stxAddress || c.principal_2 === stxAddress) &&
            c.token === (token === 'STX' ? null : token)
        );

        if (channel) {
            try {
                await fetchStructuredDataHash(channel);
            } catch (error) {
                console.error(`Error fetching hash for ${token}:`, error);
            }
        }
    };

    // Re-fetch hash when channels update
    useEffect(() => {
        fetchTokenChannelHash();
    }, [channels, token, stxAddress]);

    const fetchStructuredDataHash = async (channel: Channel) => {
        try {
            const { getUserSession } = await import("@stacks/connect");
            const session = getUserSession();
            const currentAddress = session.loadUserData().profile.stxAddress.mainnet;
            const [contractAddress, contractName] = channel.token ? channel.token.split(".") : ["", ""];
            const tokenCV = !channel.token ? Cl.none() : Cl.some(Cl.contractPrincipal(contractAddress, contractName));

            const options = {
                contractAddress: CONTRACT_ADDRESS,
                contractName: CONTRACT_NAME,
                functionName: "make-structured-data-hash",
                functionArgs: [
                    Cl.tuple({
                        "principal-1": Cl.principal(channel.principal_1),
                        "principal-2": Cl.principal(channel.principal_2),
                        token: tokenCV,
                    }),
                    Cl.uint(channel.balance_1),
                    Cl.uint(channel.balance_2),
                    Cl.uint(channel.nonce),
                    Cl.uint(0), // Assuming action is close
                    Cl.some(Cl.principal(currentAddress)),
                    Cl.none() // No hashed-secret in this demo.
                ],
                network: STACKS_MAINNET,
                senderAddress: currentAddress,
            };

            const { fetchCallReadOnlyFunction, ClarityType } = await import("@stacks/transactions");
            const result = await fetchCallReadOnlyFunction(options);
            if (result.type !== ClarityType.ResponseOk) {
                throw new Error("Error fetching structured data hash");
            }
            // Assuming result.value holds a buffer; convert it to a hex string.
            const hashHex = (result.value as any).value.toString('hex');
            setStructuredDataHash(hashHex);
        } catch (error) {
            console.error("Error fetching structured data hash:", error);
            toast({ title: "Failed to fetch structured data hash", variant: "destructive" });
        }
    };

    useEffect(() => {
        fetchTokenChannelHash();
    }, [channels, token, stxAddress]);

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

interface InfoCardProps {
    icon: LucideIcon;
    title: string;
    content: React.ReactNode;
}

export function InfoCard({ icon: Icon, title, content }: InfoCardProps) {
    return (
        <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-background/10 to-background/0" />
            <div className="relative p-6">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-primary/10 rounded-md">
                        <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold">{title}</h3>
                </div>
                {content}
            </div>
        </Card>
    );
}

const ProtocolDashboard = ({ prices }: { prices: Record<string, number> }) => {
    const [isDepositModal, setIsDepositModal] = useState(false);
    const [isWithdrawModal, setIsWithdrawModal] = useState(false);
    const [isTransferModal, setIsTransferModal] = useState(false);
    const [isCloseModal, setIsCloseModal] = useState(false);
    const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
    const [amount, setAmount] = useState('');
    const { stxAddress, channels, fetchChannels } = useGlobal();
    const [recipientAddress, setRecipientAddress] = useState('');
    const { toast } = useToast();

    // Set the default channel when channels are loaded
    useEffect(() => {
        if (channels.length) {
            // Find STX channel first
            const stxChannel = channels.find(c =>
                (c.principal_1 === stxAddress || c.principal_2 === stxAddress) &&
                c.token === null
            );
            // Default to STX channel if exists, otherwise use first channel
            setSelectedChannel(stxChannel || channels[0]);
        }
    }, [channels, stxAddress]);

    // Calculate total balances across all channels
    const getTokenBalance = (token: string | null = null) => {
        return channels.reduce((sum: number, channel: Channel) => {
            if (channel.token === token) {
                // If user is principal_1, use balance_1, else use balance_2
                const balance = channel.principal_1 === stxAddress ?
                    channel.balance_1 : channel.balance_2;
                return sum + parseInt(balance);
            }
            return sum;
        }, 0) / 1000000; // Convert to STX
    };

    const adjustBalances = async (channel: Channel, action: string) => {
        const senderFirst = channel.principal_1 === stxAddress;
        const amountInt = Number(amount) * 1000000;

        const balanceAdjustments = {
            deposit: [amountInt, 0],
            withdraw: [-amountInt, 0],
            transfer: [-amountInt, amountInt],
            close: [0, 0],
        };

        if (!balanceAdjustments[action as keyof typeof balanceAdjustments]) {
            throw new Error("Invalid action type");
        }

        const adjustments = balanceAdjustments[action as keyof typeof balanceAdjustments];
        // Reverse adjustments if the current user is not the first principal
        const [adjust1, adjust2] = senderFirst ? adjustments : adjustments.slice().reverse();

        return {
            balance_1: parseInt(channel.balance_1) + adjust1,
            balance_2: parseInt(channel.balance_2) + adjust2,
        };
    };

    // Domain and action map for signature requests
    const domain = Cl.tuple({
        name: Cl.stringAscii("StackFlow"),
        version: Cl.stringAscii("0.2.2"),
        "chain-id": Cl.uint(STACKS_MAINNET.chainId),
    });

    const actionMap = {
        close: 0,
        transfer: 1,
        deposit: 2,
        withdraw: 3,
    };

    const buildMessage = async (action: string, channel: Channel) => {
        const { balance_1, balance_2 } = await adjustBalances(channel, action);
        console.log(channel);
        const [contractAddress, contractName] = channel.token ? channel.token.split(".") : ["", ""];

        const tokenCV = !channel.token ? Cl.none() : Cl.some(Cl.contractPrincipal(contractAddress, contractName));

        const message = Cl.tuple({
            token: tokenCV,
            "principal-1": Cl.principal(channel.principal_1),
            "principal-2": Cl.principal(channel.principal_2),
            "balance-1": Cl.uint(balance_1),
            "balance-2": Cl.uint(balance_2),
            nonce: Cl.uint(channel.nonce),
            action: Cl.uint(actionMap[action as keyof typeof actionMap]),
            actor: action === "close" ? Cl.none() : Cl.some(Cl.principal(stxAddress)),
            "hashed-secret": Cl.none() // TODO: handle secrets
        });

        return message;
    };

    const confirmAction = async (action: string) => {
        const { openStructuredDataSignatureRequestPopup, openContractCall } = await import("@stacks/connect");
        if (!selectedChannel) return alert("No channel selected");
        if (action !== "close" && !amount) return alert("Enter an amount");

        selectedChannel.nonce++

        try {
            const payload: any = {
                "principal-1": selectedChannel.principal_1,
                "principal-2": selectedChannel.principal_2,
                nonce: selectedChannel.nonce,
            };

            if (action !== "close") {
                payload.amount = Number(amount) * 1000000;
            }

            let computedBalances: any;
            if (action === "close") {
                computedBalances = {
                    balance_1: selectedChannel.balance_1,
                    balance_2: selectedChannel.balance_2,
                };
            } else {
                computedBalances = await adjustBalances(selectedChannel, action);
            }
            payload["balance-1"] = computedBalances.balance_1;
            payload["balance-2"] = computedBalances.balance_2;

            const message = await buildMessage(action, selectedChannel);
            const signOptions = {
                message,
                domain,
                network: STACKS_MAINNET,
                onFinish: async (data: any) => {
                    try {
                        // Store the user's signature
                        payload.signature = data.signature;

                        // Get the owner's signature from the backend
                        const response = await axios.post(`${API_BASE_URL}/${action}`, payload);
                        const ownerSignature = response.data.signature;

                        let functionArgs;
                        let functionName;

                        // Create post conditions based on token type
                        let postConditions: any[] = [];

                        switch (action) {
                            case "deposit":
                                functionName = "deposit";
                                functionArgs = [
                                    Cl.uint(payload.amount),
                                    selectedChannel.token ? Cl.some(Cl.contractPrincipal(selectedChannel.token, "token")) : Cl.none(),
                                    Cl.principal(selectedChannel.principal_2),
                                    Cl.uint(computedBalances.balance_1),
                                    Cl.uint(computedBalances.balance_2),
                                    Cl.bufferFromHex(payload.signature),
                                    Cl.bufferFromHex(ownerSignature),
                                    Cl.uint(payload.nonce),
                                ];

                                if (selectedChannel.token) {
                                    // For SIP-010 tokens
                                    postConditions = [];
                                } else {
                                    // For STX
                                    postConditions = [
                                        Pc.principal(stxAddress).willSendEq(payload.amount).ustx()
                                    ];
                                }
                                break;

                            case "withdraw":
                                functionName = "withdraw";
                                functionArgs = [
                                    Cl.uint(payload.amount),
                                    selectedChannel.token ? Cl.some(Cl.contractPrincipal(selectedChannel.token, "token")) : Cl.none(),
                                    Cl.principal(selectedChannel.principal_2),
                                    Cl.uint(computedBalances.balance_1),
                                    Cl.uint(computedBalances.balance_2),
                                    Cl.bufferFromHex(payload.signature),
                                    Cl.bufferFromHex(ownerSignature),
                                    Cl.uint(payload.nonce),
                                ];

                                if (selectedChannel.token) {
                                    // For SIP-010 tokens
                                    postConditions = [];
                                } else {
                                    // For STX
                                    postConditions = [
                                        Pc.principal(`${CONTRACT_ADDRESS}.${CONTRACT_NAME}`).willSendEq(payload.amount).ustx()
                                    ];
                                }
                                break;

                            case "close":
                                functionName = "close-channel";
                                functionArgs = [
                                    selectedChannel.token ? Cl.some(Cl.contractPrincipal(selectedChannel.token, "token")) : Cl.none(),
                                    Cl.principal(selectedChannel.principal_2),
                                    Cl.uint(computedBalances.balance_1),
                                    Cl.uint(computedBalances.balance_2),
                                    Cl.bufferFromHex(payload.signature),
                                    Cl.bufferFromHex(ownerSignature),
                                    Cl.uint(payload.nonce),
                                ];
                                break;

                            default:
                                // For transfer or other actions that don't need contract calls
                                toast({ title: `${action} successful` });
                                setTimeout(() => {
                                    fetchChannels();
                                }, 500);
                                return;
                        }

                        // Prepare the contract call options with post conditions
                        const txOptions = {
                            contractAddress: CONTRACT_ADDRESS,
                            contractName: CONTRACT_NAME,
                            functionName,
                            functionArgs,
                            postConditions,
                            postConditionMode: PostConditionMode.Deny,
                            network: STACKS_MAINNET,
                            onFinish: (txResult: any) => {
                                // Dispatch custom event after contract call finishes
                                window.dispatchEvent(new CustomEvent(`blaze${action.charAt(0).toUpperCase() + action.slice(1)}`, {
                                    detail: {
                                        token: selectedChannel?.token || 'STX',
                                        amount: Number(amount),
                                        action: action
                                    }
                                }));
                                toast({
                                    title: `${action} transaction submitted`,
                                    description: "The transaction has been submitted to the network."
                                });
                                fetchChannels();
                            },
                            onCancel: () => {
                                toast({
                                    title: "Transaction cancelled",
                                    description: "The user cancelled the transaction.",
                                    variant: "destructive"
                                });
                            }
                        };

                        // Make the contract call
                        await openContractCall(txOptions);

                        // Close the corresponding modal
                        if (action === "deposit") setIsDepositModal(false);
                        if (action === "withdraw") setIsWithdrawModal(false);
                        if (action === "close") setIsCloseModal(false);

                    } catch (error) {
                        console.error(`Error in ${action} contract call:`, error);
                        toast({
                            title: `${action} failed`,
                            description: error instanceof Error ? error.message : "Unknown error occurred",
                            variant: "destructive"
                        });
                    }
                },
            };

            // Open the signature request popup
            openStructuredDataSignatureRequestPopup(signOptions);
        } catch (err) {
            console.error(`Error processing ${action}:`, err);
            toast({
                title: `${action} failed`,
                description: err instanceof Error ? err.message : "Unknown error occurred",
                variant: "destructive"
            });
        }
    };

    const tokens = [
        {
            symbol: 'STX',
            icon: '/stx-logo.png',
            balance: getTokenBalance(null)
        },
        // Add more tokens here as needed
    ];

    return (
        <div className="container px-4 py-8 mx-auto">
            {/* Header with Quick Actions */}
            <div className="mb-8 space-y-6">
                {/* Header Content */}
                <div className="text-left space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Flame className="w-10 h-10 text-primary font-bold relative z-10" strokeWidth={1} />
                            <div className="absolute inset-0 z-0">
                                <Flame className="w-10 h-10 text-primary/10 animate-ping" strokeWidth={8} />
                            </div>
                            <div className="absolute inset-0 z-0">
                                <Flame className="w-10 h-10 text-primary/50 animate-pulse-glow" strokeWidth={4} />
                            </div>
                        </div>
                        <h1 className="text-5xl font-bold text-white">Blaze</h1>
                    </div>
                    <p className="text-gray-400 max-w-prose leading-tight">
                        Your gateway to the future of Bitcoin finance and decentralized applications.
                        <br className="hidden md:block" />
                        Experience instant transactions, zero fees, and unlimited scalability.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex gap-2">
                        <TooltipProvider>
                            <Tooltip delayDuration={300}>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full sm:w-auto"
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

                        <TooltipProvider>
                            <Tooltip delayDuration={300}>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full sm:w-auto"
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
                    </div>

                    <div className="hidden sm:block w-[1px] bg-border" />

                    <div className="flex gap-2">
                        <TooltipProvider>
                            <Tooltip delayDuration={300}>
                                <TooltipTrigger asChild>
                                    <Button
                                        onClick={() => setIsTransferModal(true)}
                                        variant="outline"
                                        size="sm"
                                        className="w-full sm:w-auto"
                                        disabled={channels.length === 0}
                                    >
                                        <Send className="w-4 h-4 mr-2" />
                                        Send STX
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent className="w-80 p-4">
                                    <div className="flex items-center gap-2 mb-2 pb-2 border-b">
                                        <Send className="w-5 h-5" />
                                        <span className="font-semibold">Send STX to Blaze User</span>
                                    </div>
                                    <p className="text-sm opacity-90 mb-2">
                                        Send STX instantly to any Blaze user with near-zero fees.
                                        No gas fees, no waiting for confirmations.
                                    </p>
                                    <div className="inline-flex text-xs bg-muted/50 p-2 rounded items-center gap-2 mt-4">
                                        <Flame className="w-4 h-4 rounded-full text-primary" />
                                        Instant transfers, near-zero fees, no gas fees.
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    <div className="hidden sm:block w-[1px] bg-border" />

                    <div className="flex gap-2">
                        <TooltipProvider>
                            <Tooltip delayDuration={300}>
                                <TooltipTrigger asChild>
                                    <Button
                                        onClick={() => setIsDepositModal(true)}
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
                                    <div className="inline-flex text-xs bg-muted/50 p-2 rounded items-center gap-2 mt-4">
                                        <span className="w-2 h-2 rounded-full bg-green-500" />
                                        Deposits require gas fees, and take a few seconds to confirm.
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                            <Tooltip delayDuration={300}>
                                <TooltipTrigger asChild>
                                    <Button
                                        onClick={() => setIsWithdrawModal(true)}
                                        variant="outline"
                                        size="sm"
                                        className="w-full sm:w-auto"
                                        disabled={getTokenBalance(null) === 0}
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
                                        Move your cryptocurrency from your Blaze account back to your
                                        Stacks wallet. Perfect for when you want to hold or trade elsewhere.
                                    </p>
                                    {getTokenBalance(null) === 0 ? (
                                        <div className="inline-flex text-xs bg-destructive/10 text-destructive p-2 rounded items-center gap-2 mt-4">
                                            <span className="w-2 h-2 rounded-full bg-destructive" />
                                            Deposit some STX first to enable withdrawals
                                        </div>
                                    ) : (
                                        <div className="inline-flex text-xs bg-muted/50 p-2 rounded items-center gap-2 mt-4">
                                            <span className="w-2 h-2 rounded-full bg-green-500" />
                                            Available balance: {getTokenBalance(null)} STX
                                        </div>
                                    )}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
            </div>

            {/* Platform Overview */}
            <div className="mb-12">

                <div className="grid gap-6 md:grid-cols-3 mt-6">
                    <InfoCard
                        icon={Zap}
                        title="Blazing Fast"
                        content={
                            <div className="space-y-4 text-sm text-muted-foreground">
                                <p>
                                    Experience the future of Bitcoin with instant transactions and low fees.
                                    No more waiting for confirmations or paying gas fees - just seamless,
                                    instant trading.
                                </p>
                            </div>
                        }
                    />

                    <InfoCard
                        icon={BarChart3}
                        title="DeFi & Trading"
                        content={
                            <div className="space-y-4 text-sm text-muted-foreground">
                                <p>
                                    Access professional-grade DeFi tools and trading features with bitcoin finality.
                                    Built for traders who demand speed and reliability.
                                </p>
                            </div>
                        }
                    />

                    <InfoCard
                        icon={Shield}
                        title="Bitcoin Security"
                        content={
                            <div className="space-y-4 text-sm text-muted-foreground">
                                <p>
                                    Built on Bitcoin, secured by the world's strongest network. Your keys, your coins -
                                    always in control while enjoying institutional-grade settlement.
                                </p>
                            </div>
                        }
                    />
                </div>
            </div>

            {/* Token Balances */}
            <div className="mb-8 mt-16">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Your Wallet</h2>
                    <div className="text-sm text-muted-foreground">
                        Total Balance: ${((getTokenBalance(null) * prices['.stx']).toFixed(8))}
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {/* STX Card */}
                    <TokenCard
                        token="STX"
                        balance={getTokenBalance(null)}
                        icon="/stx-logo.png"
                    />

                    {/* sBTC Card */}
                    <TokenCard
                        token="sBTC"
                        balance={0}
                        icon="/sbtc.png"
                    />

                    {/* Welsh Corgi Coin Card */}
                    <TokenCard
                        token="WELSH"
                        balance={0}
                        icon="/welsh-logo.png"
                    />
                </div>
            </div>

            {/* Apps Grid */}
            <div className="mb-8 mt-32">
                <h2 className="text-xl font-bold mb-4">App Marketplace (coming soon)</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <TooltipProvider>
                        <Tooltip delayDuration={300}>
                            <TooltipTrigger>
                                <Card className="p-6 bg-accent/5 border-primary/20 cursor-not-allowed opacity-75">
                                    <div className="flex items-center gap-3 mb-3">
                                        <ArrowLeftRight className="w-5 h-5" />
                                        <h3 className="font-semibold">Trade</h3>
                                    </div>
                                    <p className="text-sm text-gray-400">Trade tokens with zero slippage using our orderbook</p>
                                </Card>
                            </TooltipTrigger>
                            <TooltipContent className="w-80 p-4">
                                <p className="text-sm opacity-90">Coming soon: Professional trading with an orderbook. Place limit orders and trade with zero slippage.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip delayDuration={300}>
                            <TooltipTrigger>
                                <Card className="p-6 bg-accent/5 border-primary/20 cursor-not-allowed opacity-75">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Rocket className="w-5 h-5" />
                                        <h3 className="font-semibold">Bonding Curve</h3>
                                    </div>
                                    <p className="text-sm text-gray-400">Launch your token on Blaze and trade at lighning speed</p>
                                </Card>
                            </TooltipTrigger>
                            <TooltipContent className="w-80 p-4">
                                <p className="text-sm opacity-90">Just kidding! We have no interest in launching a bonding curve. We're not that kind of project.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip delayDuration={300}>
                            <TooltipTrigger>
                                <Card className="p-6 bg-accent/5 border-primary/20 cursor-not-allowed opacity-75">
                                    <div className="flex items-center gap-3 mb-3">
                                        <TrendingUp className="w-5 h-5" />
                                        <h3 className="font-semibold">Perpetuals</h3>
                                    </div>
                                    <p className="text-sm text-gray-400">Trade perpetual futures with up to 100x leverage</p>
                                </Card>
                            </TooltipTrigger>
                            <TooltipContent className="w-80 p-4">
                                <p className="text-sm opacity-90">Coming soon: Trade perpetual futures with leverage, powered by our instant settlement engine.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip delayDuration={300}>
                            <TooltipTrigger>
                                <Card className="p-6 bg-accent/5 border-primary/20 cursor-not-allowed opacity-75">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Wallet className="w-5 h-5" />
                                        <h3 className="font-semibold">Borrow</h3>
                                    </div>
                                    <p className="text-sm text-gray-400">Get instant loans using your tokens as collateral</p>
                                </Card>
                            </TooltipTrigger>
                            <TooltipContent className="w-80 p-4">
                                <p className="text-sm opacity-90">Coming soon: Borrow against your tokens instantly with competitive rates.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip delayDuration={300}>
                            <TooltipTrigger>
                                <Card className="p-6 bg-accent/5 border-primary/20 cursor-not-allowed opacity-75">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Coins className="w-5 h-5" />
                                        <h3 className="font-semibold">Earn</h3>
                                    </div>
                                    <p className="text-sm text-gray-400">Earn yield by providing liquidity to our protocols</p>
                                </Card>
                            </TooltipTrigger>
                            <TooltipContent className="w-80 p-4">
                                <p className="text-sm opacity-90">Coming soon: Earn yield by providing liquidity to various Blaze protocols.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip delayDuration={300}>
                            <TooltipTrigger>
                                <Card className="p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20 hover:border-primary/30 transition-colors cursor-pointer">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-primary/10 rounded-md">
                                            <Code className="w-5 h-5 text-primary" />
                                        </div>
                                        <h3 className="font-semibold">Build Your Own App</h3>
                                    </div>
                                    <p className="text-sm text-muted-foreground">Join the ecosystem and build on top of Blaze's infrastructure</p>
                                </Card>
                            </TooltipTrigger>
                            <TooltipContent className="w-96 p-4">
                                <div className="flex items-center gap-2 mb-2 pb-2 border-b">
                                    <Code className="w-5 h-5" />
                                    <span className="font-semibold">Developer Resources</span>
                                </div>
                                <p className="text-sm opacity-90 mb-4">
                                    Build scalable applications on Bitcoin using our developer toolkit and infrastructure.
                                </p>
                                <div className="space-y-2">
                                    <div className="w-fit flex items-center gap-2 text-xs bg-muted/30 p-2 rounded-md">
                                        <Rocket className="w-3 h-3 text-primary shrink-0" />
                                        <span className="text-muted-foreground">Quick start guides and tutorials</span>
                                    </div>
                                    <div className="w-fit flex items-center gap-2 text-xs bg-muted/30 p-2 rounded-md">
                                        <BookMarked className="w-3 h-3 text-primary shrink-0" />
                                        <span className="text-muted-foreground">Comprehensive API documentation</span>
                                    </div>
                                    <div className="w-fit flex items-center gap-2 text-xs bg-muted/30 p-2 rounded-md">
                                        <TrendingUp className="w-3 h-3 text-primary shrink-0" />
                                        <span className="text-muted-foreground">Scale to millions of users</span>
                                    </div>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>

            {/* Deposit Modal */}
            <AlertDialog open={isDepositModal} onOpenChange={setIsDepositModal}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Deposit STX</AlertDialogTitle>
                        <AlertDialogDescription>
                            Deposit STX into your Blaze account
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid items-center grid-cols-4 gap-4">
                            <Label htmlFor="amount-deposit" className="text-right">
                                Amount (STX)
                            </Label>
                            <Input
                                id="amount-deposit"
                                type="number"
                                placeholder="Enter amount"
                                className="col-span-3"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setIsDepositModal(false)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => confirmAction("deposit")}>
                            Deposit
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Withdraw Modal */}
            <AlertDialog open={isWithdrawModal} onOpenChange={setIsWithdrawModal}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Withdraw STX</AlertDialogTitle>
                        <AlertDialogDescription>
                            Withdraw STX from your Blaze account to your Stacks Wallet
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid items-center grid-cols-4 gap-4">
                            <Label htmlFor="amount-withdraw" className="text-right">
                                Amount (STX)
                            </Label>
                            <Input
                                id="amount-withdraw"
                                type="number"
                                placeholder="Enter amount"
                                className="col-span-3"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                max={getTokenBalance(null)}
                            />
                        </div>
                        <div className="text-xs text-muted-foreground px-4">
                            Available balance: {getTokenBalance(null)} STX
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setIsWithdrawModal(false)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => confirmAction("withdraw")}
                            disabled={!amount || Number(amount) > getTokenBalance(null)}
                        >
                            Withdraw
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Transfer Modal */}
            <AlertDialog open={isTransferModal} onOpenChange={setIsTransferModal}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Transfer STX</AlertDialogTitle>
                        <AlertDialogDescription>
                            Transfer STX to another Blaze user instantly
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid items-center grid-cols-4 gap-4">
                            <Label htmlFor="recipient" className="text-right">
                                Recipient
                            </Label>
                            <Input
                                id="recipient"
                                type="text"
                                placeholder="SP..."
                                className="col-span-3"
                                value={recipientAddress}
                                onChange={(e) => setRecipientAddress(e.target.value)}
                            />
                        </div>
                        <div className="grid items-center grid-cols-4 gap-4">
                            <Label htmlFor="amount-transfer" className="text-right">
                                Amount (STX)
                            </Label>
                            <Input
                                id="amount-transfer"
                                type="number"
                                placeholder="Enter amount"
                                className="col-span-3"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                max={getTokenBalance(null)}
                            />
                        </div>
                        <div className="text-xs text-muted-foreground px-4">
                            Available balance: {getTokenBalance(null)} STX
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setIsTransferModal(false)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => confirmAction("transfer")}
                            disabled={!amount || !recipientAddress || Number(amount) > getTokenBalance(null)}
                        >
                            Transfer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Close Channel Modal */}
            <AlertDialog open={isCloseModal} onOpenChange={setIsCloseModal}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Close Channel</AlertDialogTitle>
                        <AlertDialogDescription>
                            Close your payment channel and withdraw all funds to your Stacks wallet
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                        <div className="rounded-lg bg-muted p-4">
                            <div className="flex justify-between mb-2">
                                <span>Current Balance:</span>
                                <span className="font-medium">{getTokenBalance(null)} STX</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Closing the channel will withdraw all funds to your Stacks wallet. This action cannot be undone.
                            </p>
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setIsCloseModal(false)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => confirmAction("close")}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Close Channel
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default ProtocolDashboard;