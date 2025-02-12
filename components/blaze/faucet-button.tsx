import { Button } from "@components/ui/button";
import { useToast } from "@components/ui/use-toast";
import { Droplets } from "lucide-react";
import { useState } from "react";
import { useGlobal } from "@lib/hooks/global-context";

export function FaucetButton() {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { stxAddress, setBlazeBalances, blazeBalances } = useGlobal();

    const handleFaucet = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/v0/blaze/faucet', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ address: stxAddress }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error);
            }

            toast({
                title: "Faucet Success",
                description: "1000 WELSH credits have been added to your blaze balance",
            });

            // Trigger a balance refresh event
            window.dispatchEvent(new CustomEvent('blazeDeposit', {
                detail: {
                    token: 'WELSH',
                    amount: 1000,
                    action: 'faucet'
                }
            }));

            setBlazeBalances({
                ...blazeBalances,
                ['SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token']: {
                    credit: data.newBalance,
                }
            } as any);

        } catch (error) {
            toast({
                title: "Faucet Error",
                description: error instanceof Error ? error.message : "Failed to get WELSH tokens",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleFaucet}
            disabled={isLoading}
        >
            <Droplets className="w-4 h-4 mr-2" />
            Get Test Tokens
        </Button>
    );
} 