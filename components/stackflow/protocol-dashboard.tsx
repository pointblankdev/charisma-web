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
import { Cl, PostConditionMode, Pc } from "@stacks/transactions";

// Import Tooltip components (adjust the path if necessary)
import { Tooltip, TooltipTrigger, TooltipContent } from '@components/ui/tooltip';

const ProtocolDashboard = () => {
    const [isOpenChannel, setIsOpenChannel] = useState(false);
    const [isCloseChannel, setIsCloseChannel] = useState(false);
    const [isTransferModal, setIsTransferModal] = useState(false);
    const [isDepositModal, setIsDepositModal] = useState(false);
    const [isWithdrawModal, setIsWithdrawModal] = useState(false);
    const [channels, setChannels] = useState([]);
    const [selectedChannel, setSelectedChannel] = useState(null);
    const [amount, setAmount] = useState('');
    const { toast } = useToast();

    const CONTRACT_ADDRESS = "SP126XFZQ3ZHYM6Q6KAQZMMJSDY91A8BTT6AD08RV";
    const CONTRACT_NAME = "stackflow-0-2-2";
    const OWNER = "SP3619DGWH08262BJAG0NPFHZQDPN4TKMXHC0ZQDN";

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
        const { getUserSession, showConnect, openContractCall } = await import("@stacks/connect");
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

    const handleAction = (channel: any, action: string) => {
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
        return channels.reduce((sum: number, channel: any) =>
            sum + parseInt(channel.balance_1) + parseInt(channel.balance_2), 0
        ) / 1000000;
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
                        {/* Wrapped the New Channel button with a tooltip */}
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
                        {channels.map((channel: any) => (
                            <div key={channel.id} className="flex items-center justify-between p-4 border rounded-lg border-primary/20">
                                <div className="flex items-center">
                                    <Wallet className="w-6 h-6 mr-4 text-primary" />
                                    <div>
                                        <p className="font-semibold">Channel with {channel.principal_2}</p>
                                        <p className="text-sm text-gray-400">
                                            Balance: {channel.balance_1 / 1000000} / {channel.balance_2 / 1000000} STX
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
                                                    disabled={true}
                                                >
                                                    <Send className="w-4 h-4" />
                                                </Button>
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Transfer funds from this channel</p>
                                        </TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span className="inline-block">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleAction(channel, 'deposit')}
                                                    disabled={true}
                                                >
                                                    <Download className="w-4 h-4" />
                                                </Button>
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Deposit funds into this channel</p>
                                        </TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span className="inline-block">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleAction(channel, 'withdraw')}
                                                    disabled={true}
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
                                                    disabled={true}
                                                >
                                                    <Unlock className="w-4 h-4" />
                                                </Button>
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Close this channel (coming soon)</p>
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
                            // Handle close channel logic
                            setIsCloseChannel(false);
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
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => {
                            // Implement the transfer logic here.
                            setIsTransferModal(false);
                        }}>
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
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => {
                            // Implement deposit logic here.
                            setIsDepositModal(false);
                        }}>
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
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => {
                            // Implement withdrawal logic here.
                            setIsWithdrawModal(false);
                        }}>
                            Withdraw
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default ProtocolDashboard;