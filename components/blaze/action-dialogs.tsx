import { AlertDialog, AlertDialogTitle, AlertDialogContent, AlertDialogHeader, AlertDialogDescription, AlertDialogCancel, AlertDialogFooter, AlertDialogAction } from "@components/ui/alert-dialog";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Check, Flame, Wallet, Zap, UserPlus, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useGlobal } from "@lib/hooks/global-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Button } from "@components/ui/button";
import type { Friend } from "@lib/hooks/global-context";
import { Blaze } from "blaze-sdk";
import { PostConditionMode } from "@stacks/transactions";
import { Pc } from "@stacks/transactions";
import { Cl } from "@stacks/transactions";
import { STACKS_MAINNET } from "@stacks/network";

export interface Token {
    symbol: string;
    name: string;
    icon: string;
    contract: string;
    identifier: string;
    decimals: number;
    blazeContract: string;
}

const SUPPORTED_TOKENS: Token[] = [
    {
        symbol: 'WELSH',
        name: 'Welsh',
        icon: '/welsh-logo.png',
        contract: 'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token',
        identifier: 'welshcorgicoin',
        blazeContract: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.blaze-welsh-v0',
        decimals: 6
    }
];

export const DepositDialog = ({ open, onOpenChange, }: any) => {
    const [selectedToken, setSelectedToken] = useState<Token>(SUPPORTED_TOKENS[0] as Token);
    const [amount, setAmount] = useState<string>("");
    const { stxAddress, blazeBalances, getBalance } = useGlobal();

    // Initialize Blaze client
    const blaze = new Blaze(selectedToken.blazeContract, stxAddress, '/api/v0/blaze');

    const handleDeposit = async () => {
        // Convert decimal amount to uint with proper decimals
        const uintAmount = Number(amount) * (10 ** selectedToken.decimals);
        await blaze.deposit(uintAmount);
        window.dispatchEvent(new CustomEvent('blazeDeposit', {
            detail: {
                token: selectedToken,
                amount: Number(amount),
                action: 'deposit'
            }
        }));
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Deposit {selectedToken.symbol}</AlertDialogTitle>
                    <AlertDialogDescription>
                        Add {selectedToken.symbol} to the Blaze subnet for instant, zero-fee transfers
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-4 py-4">
                    <div className="rounded-lg bg-muted/30 p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Flame className="w-4 h-4 text-primary" />
                            <span className="font-medium">How it works</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Your {selectedToken.symbol} will be added to the Blaze subnet, enabling instant transfers with zero fees.
                            You can withdraw your funds back to your wallet at any time.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Label>Token</Label>
                        <Select
                            value={selectedToken.symbol}
                            onValueChange={(value) => {
                                console.log(value)
                                setSelectedToken(SUPPORTED_TOKENS.find(t => t.symbol === value)!);
                            }}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue>
                                    <div className="flex items-center gap-2">
                                        <Image
                                            src={selectedToken.icon}
                                            alt={selectedToken.symbol}
                                            width={20}
                                            height={20}
                                            className="rounded-sm"
                                        />
                                        <span>{selectedToken.name}</span>
                                    </div>
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {SUPPORTED_TOKENS.map((token) => (
                                    <SelectItem key={token.symbol} value={token.symbol}>
                                        <div className="flex items-center gap-2">
                                            <Image
                                                src={token.icon}
                                                alt={token.symbol}
                                                width={20}
                                                height={20}
                                                className="rounded-sm"
                                            />
                                            <span>{token.name}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Amount</Label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                <Image
                                    src={selectedToken.icon}
                                    alt={selectedToken.symbol}
                                    width={20}
                                    height={20}
                                    className="rounded-sm"
                                />
                                <span className="text-sm font-medium">{selectedToken.symbol}</span>
                            </div>
                            <Input
                                type="number"
                                placeholder="0.0"
                                value={amount}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    const numValue = Number(value);
                                    if (numValue <= 10 && (!value.includes('.') || value.split('.')[1]!.length <= selectedToken.decimals)) {
                                        setAmount(value);
                                    }
                                }}
                                className="pl-24"
                                max={10}
                                min={0}
                                step={1 / (10 ** selectedToken.decimals)}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Maximum deposit: 10 {selectedToken.symbol} (up to {selectedToken.decimals} decimal places)
                        </p>
                    </div>
                    <p className="text-xs text-muted-foreground leading-none">
                        In Blaze Wallet: {(blazeBalances[selectedToken.blazeContract]?.total || 0) / (10 ** selectedToken.decimals)} {selectedToken.symbol}
                    </p>
                    <p className="text-xs text-muted-foreground leading-none">
                        In Stacks Wallet: {(getBalance(selectedToken.contract) || 0) / (10 ** selectedToken.decimals)} {selectedToken.symbol}
                    </p>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDeposit}
                        disabled={!amount || Number(amount) > 10}
                    >
                        Deposit
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export const WithdrawDialog = ({ open, onOpenChange, }: any) => {
    const [selectedToken, setSelectedToken] = useState<any>(SUPPORTED_TOKENS[0]);
    const [amount, setAmount] = useState<string>("");
    const { stxAddress, blazeBalances } = useGlobal();

    // Initialize Blaze client
    const blaze = new Blaze(selectedToken.blazeContract, stxAddress, '/api/v0/blaze');

    const handleWithdraw = () => {
        // Convert decimal amount to uint with proper decimals
        const uintAmount = Number(amount) * (10 ** selectedToken.decimals);
        blaze.withdraw(uintAmount);
    };

    const maxBalance = (blazeBalances[selectedToken.blazeContract]?.total || 0) / (10 ** selectedToken.decimals);

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Withdraw</AlertDialogTitle>
                    <AlertDialogDescription>
                        Move tokens from the Blaze subnet back to your wallet
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-4 py-4">
                    <div className="rounded-lg bg-muted/30 p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Wallet className="w-4 h-4 text-primary" />
                            <span className="font-medium">How it works</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Your tokens will be moved from the Blaze subnet back to your wallet.
                            This requires a blockchain transaction and may take a few minutes.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label>Token</Label>
                        <Select
                            value={selectedToken.symbol}
                            onValueChange={(value) => {
                                setSelectedToken(SUPPORTED_TOKENS.find(t => t.symbol === value)!);
                            }}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue>
                                    <div className="flex items-center gap-2">
                                        <Image
                                            src={selectedToken.icon}
                                            alt={selectedToken.symbol}
                                            width={20}
                                            height={20}
                                            className="rounded-sm"
                                        />
                                        <span>{selectedToken.name}</span>
                                    </div>
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {SUPPORTED_TOKENS.map((token) => (
                                    <SelectItem key={token.symbol} value={token.symbol}>
                                        <div className="flex items-center gap-2">
                                            <Image
                                                src={token.icon}
                                                alt={token.symbol}
                                                width={20}
                                                height={20}
                                                className="rounded-sm"
                                            />
                                            <span>{token.name}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Amount</Label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                <Image
                                    src={selectedToken.icon}
                                    alt={selectedToken.symbol}
                                    width={20}
                                    height={20}
                                    className="rounded-sm"
                                />
                                <span className="text-sm font-medium">{selectedToken.symbol}</span>
                            </div>
                            <Input
                                type="number"
                                placeholder="0.0"
                                value={amount}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (!value.includes('.') || value.split('.')[1]!.length <= selectedToken.decimals) {
                                        setAmount(value);
                                    }
                                }}
                                className="pl-24"
                                max={maxBalance}
                                min={0}
                                step={1 / (10 ** selectedToken.decimals)}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Available balance: {maxBalance} {selectedToken.symbol}
                        </p>
                    </div>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleWithdraw}
                        disabled={!amount || Number(amount) > maxBalance}
                    >
                        Withdraw
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export const TransferDialog = ({ open, onOpenChange, prices, }: any) => {
    const [amount, setAmount] = useState<string>("");
    const [recipientAddress, setRecipientAddress] = useState<string>("");
    const [isValidAddress, setIsValidAddress] = useState(false);
    const [selectedToken, setSelectedToken] = useState<Token>(SUPPORTED_TOKENS[0] as Token);
    const { stxAddress, friends, addFriend, removeFriend, updateFriendLastUsed, blazeBalances } = useGlobal();

    // Initialize Blaze client
    const blaze = new Blaze(selectedToken.blazeContract, stxAddress, '/api/v0/blaze');

    const handleTransfer = () => {
        // Convert decimal amount to uint with proper decimals
        const uintAmount = Number(amount) * (10 ** selectedToken.decimals);
        blaze.transfer({
            to: recipientAddress,
            amount: uintAmount
        });
    };

    const maxBalance = (blazeBalances[selectedToken.blazeContract]?.total || 0) / (10 ** selectedToken.decimals);

    const validateStacksAddress = (address: string) => {
        try {
            // Check that address isn't the same as the sender
            if (address === stxAddress) {
                return false;
            }

            return true;
        } catch {
            return false;
        }
    };

    const handleSelectFriend = (friend: Friend) => {
        setRecipientAddress(friend.address);
        setIsValidAddress(validateStacksAddress(friend.address));
        updateFriendLastUsed(friend.address);
    };

    // Sort friends by last used, most recent first
    const sortedFriends = [...friends].sort((a, b) =>
        (b.lastUsed || 0) - (a.lastUsed || 0)
    );

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="sm:max-w-[500px]">
                <AlertDialogHeader>
                    <AlertDialogTitle>Send Tokens</AlertDialogTitle>
                    <AlertDialogDescription>
                        Send tokens instantly to any Stacks address
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-4 py-4">
                    <div className="rounded-lg bg-muted/30 p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Zap className="w-4 h-4 text-primary" />
                            <span className="font-medium">Instant Transfers</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Send tokens instantly to any Stacks address. No gas fees, no waiting for confirmations.
                        </p>
                    </div>

                    {/* Friends List */}
                    <div className="space-y-2">
                        <Label>Recent Recipients</Label>
                        <div className="flex flex-wrap gap-2">
                            {sortedFriends.map((friend) => (
                                <Button
                                    key={friend.address}
                                    variant={recipientAddress === friend.address ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handleSelectFriend(friend)}
                                    className="flex items-center gap-2"
                                >
                                    <span>{friend.address.slice(0, 4)}...{friend.address.slice(-4)}</span>
                                    <X
                                        className="w-3 h-3 opacity-50 hover:opacity-100"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeFriend(friend.address);
                                        }}
                                    />
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Token</Label>
                        <Select
                            value={selectedToken.symbol}
                            onValueChange={(value) => {
                                setSelectedToken(SUPPORTED_TOKENS.find(t => t.symbol === value)!);
                            }}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue>
                                    <div className="flex items-center gap-2">
                                        <Image
                                            src={selectedToken.icon}
                                            alt={selectedToken.symbol}
                                            width={20}
                                            height={20}
                                            className="rounded-sm"
                                        />
                                        <span>{selectedToken.name}</span>
                                    </div>
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {SUPPORTED_TOKENS.map((token) => (
                                    <SelectItem key={token.symbol} value={token.symbol}>
                                        <div className="flex items-center gap-2">
                                            <Image
                                                src={token.icon}
                                                alt={token.symbol}
                                                width={20}
                                                height={20}
                                                className="rounded-sm"
                                            />
                                            <span>{token.name}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>Recipient</Label>
                            {isValidAddress && !friends.some(f => f.address === recipientAddress) && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => addFriend(recipientAddress)}
                                    className="h-6 px-2"
                                >
                                    <UserPlus className="w-4 h-4 mr-1" />
                                    Save
                                </Button>
                            )}
                        </div>
                        <div className="relative">
                            <Input
                                placeholder="Enter Stacks address..."
                                value={recipientAddress}
                                onChange={(e) => {
                                    const value = e.target.value.toUpperCase();
                                    setRecipientAddress(value);
                                    setIsValidAddress(validateStacksAddress(value));
                                }}
                                className={`${isValidAddress ? 'border-green-500' : ''}`}
                            />
                            {isValidAddress && (
                                <Check className="w-4 h-4 text-green-500 absolute right-3 top-1/2 -translate-y-1/2" />
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>Amount</Label>
                            {amount && prices[selectedToken.symbol.toLowerCase()] && (
                                <div className="text-xs text-muted-foreground">
                                    ≈ ${(Number(amount) * prices[selectedToken.symbol.toLowerCase()]).toFixed(2)} USD
                                </div>
                            )}
                        </div>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                <Image
                                    src={selectedToken.icon}
                                    alt={selectedToken.symbol}
                                    width={20}
                                    height={20}
                                    className="rounded-sm"
                                />
                                <span className="text-sm font-medium">{selectedToken.symbol}</span>
                            </div>
                            <Input
                                type="number"
                                placeholder="0.0"
                                value={amount}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (!value.includes('.') || value.split('.')[1]!.length <= selectedToken.decimals) {
                                        setAmount(value);
                                    }
                                }}
                                className="pl-24"
                                max={maxBalance}
                                min={0}
                                step={1 / (10 ** selectedToken.decimals)}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Available balance: {maxBalance} {selectedToken.symbol}
                        </p>
                    </div>
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleTransfer}
                        disabled={!amount || !isValidAddress || Number(amount) > maxBalance}
                    >
                        Send
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
