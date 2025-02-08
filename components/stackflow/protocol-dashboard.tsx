import React, { useState, useEffect } from 'react';
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
import { useToast } from "@components/ui/use-toast";
import {
    Wallet,
    ArrowRightLeft,
    Router,
    Lock,
    Unlock,
    Plus,
    History,
    Send,
    Download,
    Upload
} from 'lucide-react';
import { STACKS_MAINNET } from "@stacks/network";
import { Cl, PostConditionMode, Pc, signWithKey, FungibleConditionCode } from "@stacks/transactions";
import { Tooltip, TooltipTrigger, TooltipContent } from '@components/ui/tooltip';
import axios from 'axios';
import { Channel } from '@lib/stackflow/types';

const ProtocolDashboard = () => {
    const [isOpenChannel, setIsOpenChannel] = useState(false);
    const [isCloseChannel, setIsCloseChannel] = useState(false);
    const [isTransferModal, setIsTransferModal] = useState(false);
    const [isDepositModal, setIsDepositModal] = useState(false);
    const [isWithdrawModal, setIsWithdrawModal] = useState(false);
    const [isHashModal, setIsHashModal] = useState(false);
    const [isVerifySignatureModal, setIsVerifySignatureModal] = useState(false);
    const [signatureToVerify, setSignatureToVerify] = useState('');
    const [verificationResult, setVerificationResult] = useState<boolean | null>(null);
    const [structuredDataHash, setStructuredDataHash] = useState<string | null>(null);
    const [channels, setChannels] = useState([]);
    const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
    const [amount, setAmount] = useState('');
    const { toast } = useToast();

    const CONTRACT_ADDRESS = "SP126XFZQ3ZHYM6Q6KAQZMMJSDY91A8BTT6AD08RV";
    const CONTRACT_NAME = "stackflow-0-2-2";
    const OWNER = "SP3619DGWH08262BJAG0NPFHZQDPN4TKMXHC0ZQDN";
    const API_BASE_URL = "/api/v0/stackflow";

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

    useEffect(() => {
        fetchChannels();
    }, []);

    const fetchChannels = async () => {
        const { getUserSession } = await import("@stacks/connect");
        const session = getUserSession();
        if (session.isUserSignedIn()) {
            const userAddress = session.loadUserData().profile.stxAddress.mainnet;
            try {
                const response = await fetch(`/api/v0/stackflow/channels?principal=${userAddress}`);
                const data = await response.json();
                setChannels(data.channels);
            } catch (error) {
                console.error('Error fetching channels:', error);
            }
        }
    };

    const handleOpenChannel = async () => {
        const { showConnect, openContractCall, getUserSession } = await import("@stacks/connect");
        const session = getUserSession();
        if (!session.isUserSignedIn()) {
            showConnect({
                appDetails: {
                    name: 'Charisma',
                    icon: 'https://charisma.rocks/charisma.png'
                }
            });
            return;
        }

        const userAddress = session.loadUserData().profile.stxAddress.mainnet;
        const tokenAmount = BigInt(Number(amount) * 1000000);

        openContractCall({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: "fund-channel",
            functionArgs: [
                Cl.none(),
                Cl.uint(tokenAmount),
                Cl.principal(OWNER),
                Cl.uint(0)
            ],
            postConditionMode: PostConditionMode.Deny,
            postConditions: [
                Pc.principal(userAddress).willSendEq(tokenAmount).ustx(),
            ],
            network: STACKS_MAINNET,
            onFinish: (data) => {
                toast({
                    title: "Channel Created",
                    description: "Transaction submitted successfully",
                });
                setIsOpenChannel(false);
                fetchChannels();
            },
            onCancel: () => {
                toast({
                    title: "Cancelled",
                    description: "Channel creation cancelled",
                    variant: "destructive"
                });
            }
        });
    };

    // ---- Merged Functions for Balance Adjustment & API Message Building ---- //

    const adjustBalances = async (channel: Channel, action: string) => {
        const { getUserSession } = await import("@stacks/connect");
        const session = getUserSession();
        const currentAddress = session.loadUserData().profile.stxAddress.mainnet;
        const senderFirst = channel.principal_1 === currentAddress;
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

    const buildMessage = async (action: string, channel: Channel) => {
        const { getUserSession } = await import("@stacks/connect");
        const { balance_1, balance_2 } = await adjustBalances(channel, action);
        const [contractAddress, contractName] = channel.token ? channel.token.split(".") : ["", ""];

        const tokenCV = !channel.token ? Cl.none() : Cl.some(Cl.contractPrincipal(contractAddress, contractName));
        const session = getUserSession();
        const currentAddress = session.loadUserData().profile.stxAddress.mainnet;

        const message = Cl.tuple({
            token: tokenCV,
            "principal-1": Cl.principal(channel.principal_1),
            "principal-2": Cl.principal(channel.principal_2),
            "balance-1": Cl.uint(balance_1),
            "balance-2": Cl.uint(balance_2),
            nonce: Cl.uint(channel.nonce),
            action: Cl.uint(actionMap[action as keyof typeof actionMap]),
            actor: action === "close" ? Cl.none() : Cl.some(Cl.principal(currentAddress)),
            "hashed-secret": Cl.none() // TODO: handle secrets
        });

        return message;
    };

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
                    Cl.uint(actionMap.close),
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
            setIsHashModal(true);
        } catch (error) {
            console.error("Error fetching structured data hash:", error);
            toast({ title: "Failed to fetch structured data hash", variant: "destructive" });
        }
    };

    const confirmChannelAction = async (action: string) => {
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
                                await axios.post(`${API_BASE_URL}/${action}`, payload);
                                toast({ title: `${action} successful` });
                                if (action === "transfer") setIsTransferModal(false);
                                return;
                        }

                        // Prepare the contract call options with post conditions
                        const txOptions = {
                            contractAddress: CONTRACT_ADDRESS,
                            contractName: CONTRACT_NAME,
                            functionName,
                            functionArgs,
                            postConditions,
                            postConditionMode: PostConditionMode.Deny, // Enforce all post-conditions
                            network: STACKS_MAINNET,
                            onFinish: (txResult: any) => {
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
                        if (action === "close") setIsCloseChannel(false);

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

    // -------------------------------------------------------------------------- //

    // When an action button is clicked, remember the channel and open the proper modal.
    const handleAction = (channel: Channel, action: string) => {
        setSelectedChannel(channel);
        openModal(action);
    };

    const openModal = (type: string) => {
        switch (type) {
            case 'close':
                setIsCloseChannel(true);
                break;
            case 'transfer':
                setIsTransferModal(true);
                break;
            case 'deposit':
                setIsDepositModal(true);
                break;
            case 'withdraw':
                setIsWithdrawModal(true);
                break;
            default:
                setIsOpenChannel(true);
        }
    };

    const getTotalLocked = () => {
        return channels.reduce((sum: number, channel: Channel) =>
            sum + parseInt(channel.balance_1) + parseInt(channel.balance_2), 0
        ) / 1000000;
    };

    const verifySignature = async (channel: Channel, signature: string) => {
        try {
            const { getUserSession } = await import("@stacks/connect");
            const session = getUserSession();
            const currentAddress = session.loadUserData().profile.stxAddress.mainnet;
            const [contractAddress, contractName] = channel.token ? channel.token.split(".") : ["", ""];
            const tokenCV = !channel.token ? Cl.none() : Cl.some(Cl.contractPrincipal(contractAddress, contractName));

            const options = {
                contractAddress: CONTRACT_ADDRESS,
                contractName: CONTRACT_NAME,
                functionName: "verify-signature",
                functionArgs: [
                    Cl.bufferFromHex(signature),
                    Cl.principal(currentAddress), // signer
                    Cl.tuple({
                        token: tokenCV,
                        "principal-1": Cl.principal(channel.principal_1),
                        "principal-2": Cl.principal(channel.principal_2),
                    }),
                    Cl.uint(channel.balance_1),
                    Cl.uint(channel.balance_2),
                    Cl.uint(channel.nonce),
                    Cl.uint(actionMap.close), // Using 'close' as example action
                    Cl.some(Cl.principal(currentAddress)), // actor
                    Cl.none(), // No hashed-secret in this example
                ],
                network: STACKS_MAINNET,
                senderAddress: currentAddress,
            };

            const { fetchCallReadOnlyFunction, ClarityType } = await import("@stacks/transactions");
            const result: any = await fetchCallReadOnlyFunction(options);

            console.log({
                result: result.type
            });

            // The verify-signature function returns a boolean
            setVerificationResult(result.type === ClarityType.BoolTrue);

        } catch (error) {
            console.error("Error verifying signature:", error);
            toast({
                title: "Failed to verify signature",
                description: error instanceof Error ? error.message : "Unknown error",
                variant: "destructive"
            });
        }
    };

    return (
        <div className="container px-4 py-8 mx-auto">
            <div className="mb-8 text-center">
                <h1 className="mb-4 text-3xl font-bold text-white">Payment Channel Dashboard</h1>
                <p className="text-gray-400">Manage your payment channels and transactions</p>
            </div>

            {/* Channel Stats */}
            <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-3">
                <Card className="bg-accent/5 border-primary/20">
                    <CardContent className="flex items-center p-6">
                        <div className="p-4 mr-4 rounded-lg bg-primary/10">
                            <Lock className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Total Locked</p>
                            <p className="text-2xl font-bold">{getTotalLocked()} STX</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-accent/5 border-primary/20">
                    <CardContent className="flex items-center p-6">
                        <div className="p-4 mr-4 rounded-lg bg-primary/10">
                            <Router className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Active Channels</p>
                            <p className="text-2xl font-bold">{channels.length}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-accent/5 border-primary/20">
                    <CardContent className="flex items-center p-6">
                        <div className="p-4 mr-4 rounded-lg bg-primary/10">
                            <ArrowRightLeft className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">24h Volume</p>
                            <p className="text-2xl font-bold">--</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Channel List */}
            <Card className="mb-8 bg-accent/5 border-primary/20">
                <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Active Channels</h2>
                        {/* New Channel Button with Tooltip */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="inline-block">
                                    <Button
                                        className="p-2"
                                        onClick={() => setIsOpenChannel(true)}
                                        disabled={channels.length > 0}
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        New Channel
                                    </Button>
                                </span>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>
                                    {channels.length > 0
                                        ? "You already have an open channel"
                                        : "Click to open a new channel"}
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                    <div className="space-y-4">
                        {channels.map((channel: Channel) => (
                            <div key={channel.id} className="flex items-center justify-between p-4 border rounded-lg border-primary/20">
                                <div className="flex items-center">
                                    <Wallet className="w-6 h-6 mr-4 text-primary" />
                                    <div>
                                        <p className="font-semibold">Channel with {channel.principal_2}</p>
                                        <p className="text-sm text-gray-400">
                                            Balance: {Number(channel.balance_1) / 1000000} / {Number(channel.balance_2) / 1000000} STX
                                        </p>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span className="inline-block">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleAction(channel, 'transfer')}
                                                    disabled
                                                >
                                                    <Send className="w-4 h-4" />
                                                </Button>
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Transfer funds from this channel (coming soon)</p>
                                        </TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span className="inline-block">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleAction(channel, 'deposit')}
                                                    disabled
                                                >
                                                    <Download className="w-4 h-4" />
                                                </Button>
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Deposit funds into this channel (coming soon)</p>
                                        </TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span className="inline-block">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleAction(channel, 'withdraw')}
                                                    disabled={channel.balance_1 === '0' || channel.balance_2 === '0'}
                                                >
                                                    <Upload className="w-4 h-4" />
                                                </Button>
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Withdraw funds from this channel</p>
                                        </TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span className="inline-block">
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleAction(channel, 'close')}
                                                    disabled
                                                >
                                                    <Unlock className="w-4 h-4" />
                                                </Button>
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Close this channel (coming soon)</p>
                                        </TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span className="inline-block">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => fetchStructuredDataHash(channel)}
                                                >
                                                    Show Data Hash
                                                </Button>
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Show structured data hash</p>
                                        </TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span className="inline-block">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setSelectedChannel(channel);
                                                        setIsVerifySignatureModal(true);
                                                    }}
                                                >
                                                    Verify Signature
                                                </Button>
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Verify signature</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                            </div>
                        ))}
                        {channels.length === 0 && (
                            <div className="text-center py-8 text-gray-400">
                                No active channels. Create one to get started!
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Open Channel Dialog */}
            <AlertDialog open={isOpenChannel} onOpenChange={setIsOpenChannel}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Open New Channel</AlertDialogTitle>
                        <AlertDialogDescription>
                            Create a new payment channel with the hub
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid items-center grid-cols-4 gap-4">
                            <Label htmlFor="amount" className="text-right">
                                Amount (STX)
                            </Label>
                            <Input
                                id="amount"
                                type="number"
                                placeholder="100"
                                className="col-span-3"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleOpenChannel}>Open Channel</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Close Channel Dialog */}
            <AlertDialog open={isCloseChannel} onOpenChange={setIsCloseChannel}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Close Channel</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to close this channel?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => {
                            setIsCloseChannel(false);
                            confirmChannelAction("close");
                        }}>Close Channel</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Transfer Modal */}
            <AlertDialog open={isTransferModal} onOpenChange={setIsTransferModal}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Transfer Funds</AlertDialogTitle>
                        <AlertDialogDescription>
                            Transfer funds from this channel.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="grid gap-4 py-4">
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
                            />
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setIsTransferModal(false)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => confirmChannelAction("transfer")}>
                            Transfer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Deposit Modal */}
            <AlertDialog open={isDepositModal} onOpenChange={setIsDepositModal}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Deposit Funds</AlertDialogTitle>
                        <AlertDialogDescription>
                            Deposit funds into this channel.
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
                        <AlertDialogAction onClick={() => confirmChannelAction("deposit")}>
                            Deposit
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Withdraw Modal */}
            <AlertDialog open={isWithdrawModal} onOpenChange={setIsWithdrawModal}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Withdraw Funds</AlertDialogTitle>
                        <AlertDialogDescription>
                            Withdraw funds from this channel.
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
                            />
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setIsWithdrawModal(false)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => confirmChannelAction("withdraw")}>
                            Withdraw
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={isHashModal} onOpenChange={setIsHashModal}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Structured Data Hash</AlertDialogTitle>
                        <AlertDialogDescription>
                            This hash is generated by the smart contract's <code>make-structured-data-hash</code> function. It represents a unique fingerprint of the channel's current state—including its principals, balances, nonce, action, and any hashed secret. This hash is used for binding off-chain signatures to the correct channel state and ensures data integrity.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="my-4">
                        <Label htmlFor="structured-data-hash">Hash:</Label>
                        <Input id="structured-data-hash" type="text" readOnly value={structuredDataHash || ""} />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => setIsHashModal(false)}>
                            Close
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={isVerifySignatureModal} onOpenChange={setIsVerifySignatureModal}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Verify Signature</AlertDialogTitle>
                        <AlertDialogDescription>
                            This tool verifies if a signature is valid for the current channel state.
                            The signature must have been generated by signing the structured data hash
                            that represents the channel's current state (principals, balances, nonce, etc.).
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="signature">Signature (hex):</Label>
                            <Input
                                id="signature"
                                value={signatureToVerify}
                                onChange={(e) => setSignatureToVerify(e.target.value)}
                                placeholder="Enter 65-byte signature in hex format"
                            />
                        </div>
                        {verificationResult !== null && (
                            <div className={`p-4 rounded-md ${verificationResult
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                                }`}>
                                Signature is {verificationResult ? "valid" : "invalid"}
                            </div>
                        )}
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => {
                            setSignatureToVerify('');
                            setVerificationResult(null);
                        }}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (!selectedChannel) return;
                                verifySignature(selectedChannel, signatureToVerify);
                            }}
                            disabled={!signatureToVerify || signatureToVerify.length !== 130} // 65 bytes = 130 hex chars
                        >
                            Verify
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default ProtocolDashboard;