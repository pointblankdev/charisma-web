import React, { useState } from 'react';
import { Cl } from "@stacks/transactions";
import { STACKS_MAINNET } from "@stacks/network";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@components/ui/dialog";
import { userSession } from '@components/stacks-session/connect';
import axios from 'axios';
import { SIP10_TOKEN } from '@lib/blaze/helpers';

const TestSigningDialog = () => {
    const [open, setOpen] = useState(false);
    const [amount, setAmount] = useState('');
    const [to, setTo] = useState('');
    const [result, setResult] = useState('');

    const handleTest = async () => {
        try {
            const { openStructuredDataSignatureRequestPopup } = await import("@stacks/connect");

            // Convert amount to micros
            const amountMicros = Number(amount) * 1_000_000;

            // Get the connected wallet address
            const stxAddress = userSession.loadUserData().profile.stxAddress.mainnet;

            // Create message tuple matching contract's make-message-hash
            // IMPORTANT: This is the structured data hash!
            const message = Cl.tuple({
                token: Cl.principal(SIP10_TOKEN),
                to: Cl.principal(to),
                amount: Cl.uint(amountMicros),
                nonce: Cl.uint(1) // Using static nonce=1 for testing
            });

            // Create domain matching contract
            const domain = Cl.tuple({
                name: Cl.stringAscii("blaze"),
                version: Cl.stringAscii("0.1.0"),
                "chain-id": Cl.uint(STACKS_MAINNET.chainId),
            });

            // Request signature from wallet to get the hash
            await openStructuredDataSignatureRequestPopup({
                message,
                domain,
                network: STACKS_MAINNET,
                onFinish: async (data) => {
                    try {
                        const response = await axios.post('/api/v0/stackflow/xfer', {
                            signature: data.signature,
                            from: stxAddress,
                            to,
                            amount: amountMicros,
                            nonce: 1
                        });
                        console.log(response);
                        setResult(`Result: ${JSON.stringify(response.data)}`);
                    } catch (error) {
                        console.error(error);
                        setResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
                    }
                },
            });

        } catch (error) {
            setResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Test Signing</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Test Blaze Signature</DialogTitle>
                    <DialogDescription>
                        Generate a test signature for a transfer using your connected wallet.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                            id="amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Amount to transfer"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="to">To Address</Label>
                        <Input
                            id="to"
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                            placeholder="Recipient address"
                        />
                    </div>
                    {result && (
                        <div className="mt-2 p-2 bg-muted rounded-md">
                            <Label>Result:</Label>
                            <div className="mt-1 text-xs font-mono break-all">{result}</div>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button onClick={handleTest}>Sign with Wallet</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default TestSigningDialog;