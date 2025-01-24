import React, { useMemo } from 'react';
import { Card } from '@components/ui/card';
import { Shield, Wallet, LineChart, ArrowUpDown, Users, Info, Settings } from 'lucide-react';
import Image from 'next/image';
import { Token } from 'dexterity-sdk';
import { useGlobal } from '@lib/hooks/global-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { toast } from "@components/ui/use-toast";
import { TokenMetadataForm } from './token-metadata-form';
import { Dexterity } from 'dexterity-sdk';

interface TokenDetailProps {
    token: Token;
    prices: Record<string, number>;
}

export function TokenDetailView({ token, prices }: TokenDetailProps) {
    const { stxAddress, balances } = useGlobal();

    // Check if the connected user is the contract owner
    const isContractOwner = stxAddress === token.contractId.split('.')[0];

    // Calculate stats
    const stats = useMemo(() => {
        const price = prices[token.contractId] || 0;
        const totalSupply = token.supply || 0;
        const marketCap = (totalSupply / 10 ** token.decimals) * price;

        // Count unique holders from balances
        const holders = Object.keys(balances.fungible_tokens[token.contractId]?.holders || {}).length;

        return {
            price,
            marketCap,
            holders,
            volume24h: 0, // You'll need to implement this
        };
    }, [token, prices, balances]);

    return (
        <div className="container mx-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Left Panel - Hero Image */}
                <div className="lg:col-span-2">
                    <div className="sticky top-6">
                        <div className="relative overflow-hidden rounded-xl h-full min-h-[600px]">
                            {/* Full background image with overlay */}
                            <div
                                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                                style={{
                                    backgroundImage: `url(${token.image || '/placeholder.png'})`,
                                    opacity: 0.2
                                }}
                            />

                            {/* Content */}
                            <div className="relative flex flex-col items-center gap-8 p-8">
                                <div className="h-64 w-64 overflow-hidden rounded-xl">
                                    <Image
                                        src={token.image || '/charisma.png'}
                                        alt={token.name}
                                        width={256}
                                        height={256}
                                        className="rounded-xl object-cover"
                                    />
                                </div>
                                <div className="text-center">
                                    <h1 className="text-3xl font-bold tracking-tight mb-2">{token.name}</h1>
                                    <div className="flex items-center justify-center gap-4 text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Shield className="w-4 h-4" />
                                            <span>{token.symbol}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4" />
                                            <span>{stats.holders} Holders</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Stats & Info */}
                <div className="lg:col-span-3">
                    <Tabs defaultValue="stats" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-1 md:grid-cols-2">
                            <TabsTrigger value="stats" className="space-x-2">
                                <LineChart className="h-4 w-4" />
                                <span>Stats & Info</span>
                            </TabsTrigger>
                            {isContractOwner && (
                                <TabsTrigger value="manage" className="space-x-2">
                                    <Settings className="h-4 w-4" />
                                    <span>Manage Token</span>
                                </TabsTrigger>
                            )}
                        </TabsList>

                        <TabsContent value="stats" className="space-y-6">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <StatCard
                                    title="Price"
                                    value={`$${stats.price.toLocaleString()}`}
                                    icon={<Wallet className="w-5 h-5" />}
                                />
                                <StatCard
                                    title="Market Cap"
                                    value={`$${stats.marketCap.toLocaleString()}`}
                                    icon={<ArrowUpDown className="w-5 h-5" />}
                                />
                                <StatCard
                                    title="24h Volume"
                                    value={`$${stats.volume24h.toLocaleString()}`}
                                    icon={<LineChart className="w-5 h-5" />}
                                />
                            </div>

                            {/* Token Info */}
                            <Card className="p-6">
                                <h2 className="text-xl font-semibold mb-4">Token Information</h2>
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Contract ID</span>
                                        <span className="font-mono">
                                            {token.contractId.split('.').map((part, index) => (
                                                index === 0
                                                    ? `${part.slice(0, 4)}...${part.slice(-4)}`
                                                    : `.${part}`
                                            )).join('')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Decimals</span>
                                        <span>{token.decimals}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Total Supply</span>
                                        <span>{(token.supply || 0 / 10 ** token.decimals).toLocaleString()} {token.symbol}</span>
                                    </div>
                                </div>
                            </Card>

                            {/* Activity Chart */}
                            <Card className="p-6">
                                <h2 className="text-xl font-semibold mb-4">Price History</h2>
                                <div className="h-[240px] flex items-center justify-center text-muted-foreground">
                                    Chart placeholder - Will implement with real data
                                </div>
                            </Card>
                        </TabsContent>

                        {isContractOwner && (
                            <TabsContent value="manage" className="space-y-6">
                                <TokenMetadataForm
                                    token={token}
                                    onMetadataUpdate={async (newMetadata) => {
                                        try {
                                            toast({
                                                title: "Success",
                                                description: "Token metadata has been updated",
                                            });
                                        } catch (error) {
                                            toast({
                                                title: "Error",
                                                description: "Failed to update token metadata",
                                                variant: "destructive",
                                            });
                                        }
                                    }}
                                />
                            </TabsContent>
                        )}
                    </Tabs>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, highlight }: any) {
    return (
        <Card className={`relative overflow-hidden ${highlight ? 'bg-[var(--sidebar)] border-primary/20' : 'bg-[var(--sidebar)]'}`}>
            <div className="absolute inset-0 bg-gradient-to-b from-background/10 to-background/0" />
            <div className="relative p-4">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${highlight ? 'bg-primary/10' : 'bg-accent/10'}`}>
                        {icon}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-medium text-muted-foreground truncate">{title}</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-white/95 truncate">{value}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
} 