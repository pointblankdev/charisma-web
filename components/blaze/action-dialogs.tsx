import { AlertDialog, AlertDialogTitle, AlertDialogContent, AlertDialogHeader, AlertDialogDescription, AlertDialogCancel, AlertDialogFooter, AlertDialogAction } from "@components/ui/alert-dialog";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Check, Flame, Wallet, Zap } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useGlobal } from "@lib/hooks/global-context";
import { getBalance, SignTransferParams, TransactionParams } from "./action-helpers";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";

export interface Token {
    symbol: string;
    name: string;
    icon: string;
    contract: string;
    identifier: string;
}

const SUPPORTED_TOKENS: Token[] = [
    {
        symbol: 'WELSH',
        name: 'Welsh',
        icon: '/welsh-logo.png',
        contract: 'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token',
        identifier: 'welshcorgicoin'
    }
];

export const DepositDialog = ({ open, onOpenChange, onConfirm }: { open: boolean, onOpenChange: (open: boolean) => void, onConfirm: (params: TransactionParams) => void }) => {
    const [selectedToken, setSelectedToken] = useState<Token>(SUPPORTED_TOKENS[0]);
    const [amount, setAmount] = useState<string>("");
    const [balance, setBalance] = useState<number>(0);
    const { stxAddress } = useGlobal();

    useEffect(() => {
        const fetchBalance = async () => {
            const balance = await getBalance(stxAddress, selectedToken.contract);
            setBalance(balance);
        };
        fetchBalance();
    }, [stxAddress]);

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Deposit {selectedToken.symbol}</AlertDialogTitle>
                    <AlertDialogDescription>
                        Add {selectedToken.symbol} to the Blaze layer for instant, zero-fee transfers
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-4 py-4">
                    <div className="rounded-lg bg-muted/30 p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Flame className="w-4 h-4 text-primary" />
                            <span className="font-medium">How it works</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Your {selectedToken.symbol} will be added to the Blaze layer, enabling instant transfers with zero fees.
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
                                    if (numValue <= 1 && (!value.includes('.') || value.split('.')[1]?.length <= 6)) {
                                        setAmount(value);
                                    }
                                }}
                                className="pl-24"
                                max={1}
                                min={0}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Maximum deposit: 1 {selectedToken.symbol} (up to 6 decimal places)
                        </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Current balance: {balance} {selectedToken.symbol}
                    </p>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => onConfirm({ token: selectedToken, amount, stxAddress })}
                        disabled={!amount || Number(amount) > 1}
                    >
                        Deposit
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export const WithdrawDialog = ({
    open,
    onOpenChange,
    onConfirm,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (params: TransactionParams) => void;
}) => {
    const [selectedToken, setSelectedToken] = useState<Token>(SUPPORTED_TOKENS[0]);
    const [amount, setAmount] = useState<string>("");
    const [balance, setBalance] = useState<number>(0);
    const { stxAddress } = useGlobal();

    useEffect(() => {
        const fetchBalance = async () => {
            const balance = await getBalance(stxAddress, selectedToken.contract);
            setBalance(balance);
        };
        fetchBalance();
    }, [stxAddress]);

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Withdraw</AlertDialogTitle>
                    <AlertDialogDescription>
                        Move tokens from the Blaze layer back to your wallet
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-4 py-4">
                    <div className="rounded-lg bg-muted/30 p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Wallet className="w-4 h-4 text-primary" />
                            <span className="font-medium">How it works</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Your tokens will be moved from the Blaze layer back to your wallet.
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
                                onChange={(e) => setAmount(e.target.value)}
                                className="pl-24"
                                max={balance}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Available balance: {balance} {selectedToken.symbol}
                        </p>
                    </div>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => onConfirm({ token: selectedToken, amount, stxAddress })}
                        disabled={!amount || Number(amount) > balance}
                    >
                        Withdraw
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export const TransferDialog = ({
    open,
    onOpenChange,
    onConfirm,
    prices,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (params: SignTransferParams) => void;
    prices: Record<string, number>;
}) => {
    const [amount, setAmount] = useState<string>("");
    const [recipientAddress, setRecipientAddress] = useState<string>("");
    const [isValidAddress, setIsValidAddress] = useState(false);
    const [selectedToken, setSelectedToken] = useState<Token>(SUPPORTED_TOKENS[0]);
    const { stxAddress } = useGlobal();
    const [balance, setBalance] = useState<number>(0);

    useEffect(() => {
        const fetchBalance = async () => {
            const balance = await getBalance(stxAddress, selectedToken.contract);
            setBalance(balance);
        };
        fetchBalance();
    }, [stxAddress]);

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

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="sm:max-w-[500px]">
                <AlertDialogHeader>
                    <AlertDialogTitle>Send</AlertDialogTitle>
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
                        <Label>Recipient</Label>
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
                                onChange={(e) => setAmount(e.target.value)}
                                className="pl-24"
                                max={balance}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Available balance: {balance} {selectedToken.symbol}
                        </p>
                    </div>
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => onConfirm({
                            token: selectedToken,
                            from: stxAddress,
                            amount: Number(amount),
                            to: recipientAddress
                        })}
                        disabled={!amount || !isValidAddress || Number(amount) > balance}
                    >
                        Send
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
