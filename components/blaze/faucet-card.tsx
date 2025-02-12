import { Button } from "@components/ui/button";
import { useToast } from "@components/ui/use-toast";
import { Droplets, Loader2 } from "lucide-react";
import { useState } from "react";
import { useGlobal } from "@lib/hooks/global-context";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";

export const FaucetCard = () => {
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
        <Card>
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Droplets className="w-5 h-5 text-primary leading-none" />
                    Test Token Faucet
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground leading-none">
                        Get test WELSH tokens to explore Blaze features
                    </p>
                    <Button
                        className="w-full relative overflow-hidden h-8 leading-none"
                        onClick={handleFaucet}
                        disabled={isLoading}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 animate-shimmer" />
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Getting Tokens...
                            </>
                        ) : (
                            <>
                                <Droplets className="mr-2 h-4 w-4" />
                                Get 1000 WELSH
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}; 