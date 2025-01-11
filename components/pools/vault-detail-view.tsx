import React, { useMemo } from 'react';
import { Card } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Shield, Wallet, LineChart, ArrowUpDown, Users, Info } from 'lucide-react';
import { AddLiquidityModal } from './modals/add-liquidity-modal';
import { RemoveLiquidityModal } from './modals/remove-liquidity-modal';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@components/ui/tooltip';
import Image from 'next/image';
import { Vault } from 'dexterity-sdk/dist/core/vault';
import { Liquidity } from 'dexterity-sdk';

interface VaultDetailProps {
    vault: Vault & { events: any[] }; // Updated to include events
    prices: Record<string, number>;
}

export function VaultDetailView({ vault, prices }: VaultDetailProps) {
    // Calculate real stats using vault data
    const stats = useMemo(() => {
        const token0Value = (vault.tokenA.reserves / 10 ** vault.tokenA.decimals) *
            (prices[vault.tokenA.contractId] || 0);
        const token1Value = (vault.tokenB.reserves / 10 ** vault.tokenB.decimals) *
            (prices[vault.tokenB.contractId] || 0);

        // Calculate TVL
        const tvl = token0Value + token1Value;

        // Calculate 24h volume and fees from events
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        const recentEvents = vault.events?.filter(e =>
            new Date(e.timestamp).getTime() > oneDayAgo) || [];

        const volume24h = recentEvents.reduce((sum, event) => {
            if (event.type === 'swap') {
                const amount = event.tokenInAmount * prices[event.tokenIn] || 0;
                return Number(sum) + amount;
            }
            return sum;
        }, 0);

        const fees24h = volume24h * (vault.fee / 1000000); // Convert fee to decimal

        // Calculate APY based on fees and TVL
        const dailyFeeRate = fees24h / tvl;
        const apy = dailyFeeRate * 365 * 100; // Annualized and converted to percentage

        // Count unique LP holders from events
        const lpHolders = new Set(
            vault.events
                ?.filter(e => e.type === 'add-liquidity')
                .map(e => e.sender)
        ).size;

        // Count 24h swaps
        const swaps24h = recentEvents.filter(e => e.type === 'swap').length;

        return {
            tvl,
            volume24h,
            fees24h,
            apy: Number.isFinite(apy) ? apy : 0,
            lpHolders: lpHolders || 0,
            swaps24h
        };
    }, [vault, prices]);

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
                                    backgroundImage: `url(${vault.image || '/placeholder.png'})`,
                                    opacity: 0.2
                                }}
                            />
                            {/* Subtle gradient overlay */}
                            {/* <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/10 to-background/70" /> */}

                            {/* Content */}
                            <div className="relative flex flex-col items-center gap-8 p-8">
                                <div className="h-64 w-64 overflow-hidden rounded-xl">
                                    <Image
                                        src={vault.image || '/placeholder.png'}
                                        alt={vault.name}
                                        width={256}
                                        height={256}
                                        className="rounded-xl object-cover"
                                    />
                                </div>
                                <div className="text-center">
                                    <h1 className="text-3xl font-bold tracking-tight mb-2">{vault.name}</h1>
                                    <div className="flex items-center justify-center gap-4 text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Shield className="w-4 h-4" />
                                            <span>Fee: {(vault.fee / 1000000 * 100).toFixed(2)}%</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4" />
                                            <span>{stats.lpHolders} LP Holders</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <AddLiquidityModal
                                        pool={vault}
                                        tokenPrices={prices}
                                        onAddLiquidity={() => { }}
                                        trigger={
                                            <Button className="gap-2 bg-background/20 backdrop-blur-sm hover:bg-background/40">
                                                <Wallet className="w-4 h-4" />
                                                Add Liquidity
                                            </Button>
                                        }
                                    />
                                    <RemoveLiquidityModal
                                        pool={vault}
                                        tokenPrices={prices}
                                        onRemoveLiquidity={() => { }}
                                        trigger={
                                            <Button variant="outline" className="gap-2 bg-background/20 backdrop-blur-sm hover:bg-background/40">
                                                <ArrowUpDown className="w-4 h-4" />
                                                Remove
                                            </Button>
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Stats & Info */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <StatCard
                            title="Total Value Locked"
                            value={`$${stats.tvl.toLocaleString()}`}
                            change="+5.2%"
                            icon={<Wallet className="w-5 h-5" />}
                        />
                        <StatCard
                            title="24h Volume"
                            value={`$${stats.volume24h.toLocaleString()}`}
                            change="+12.3%"
                            icon={<ArrowUpDown className="w-5 h-5" />}

                        />
                        <StatCard
                            title="APY"
                            value={`${stats.apy.toFixed(2)}%`}
                            change="+2.1%"
                            icon={<LineChart className="w-5 h-5" />}
                        />
                    </div>

                    {/* Token Pair Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <TokenInfoCard token={vault.tokenA} reserves={vault.tokenA.reserves} price={prices[vault.tokenA.contractId]} />
                        <TokenInfoCard token={vault.tokenB} reserves={vault.tokenB.reserves} price={prices[vault.tokenB.contractId]} />
                    </div>

                    {/* Activity Chart */}
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Activity</h2>
                        <div className="h-[240px] flex items-center justify-center text-muted-foreground">
                            Chart placeholder - Will implement with real data
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, change, icon, highlight }: any) {
    return (
        <Card className={`relative overflow-hidden ${highlight ? 'bg-[var(--sidebar)] border-primary/20' : 'bg-[var(--sidebar)]'
            }`}>
            <div className="absolute inset-0 bg-gradient-to-b from-background/10 to-background/0" />
            <div className="relative p-4">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${highlight ? 'bg-primary/10' : 'bg-accent/10'
                        }`}>
                        {icon}
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-white/95">{value}</span>
                            <span className={`text-sm ${change.startsWith('+') ? 'text-green-500' : 'text-red-500'
                                }`}>
                                {change}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}

function TokenInfoCard({ token, reserves, price }: any) {
    return (
        <Card className="relative overflow-hidden bg-[var(--sidebar)]">
            <div className="absolute inset-0 bg-gradient-to-b from-background/10 to-background/0" />
            <div className="relative p-4">
                <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-accent/10">
                        <Image
                            src={token.image || '/placeholder.png'}
                            alt={token.symbol}
                            width={48}
                            height={48}
                            className="rounded-lg"
                        />
                    </div>
                    <div className="flex-grow">
                        <h3 className="font-semibold text-white/95">{token.name}</h3>
                        <div className="text-sm text-muted-foreground">{token.symbol}</div>
                    </div>
                    <div className="text-right">
                        <div className="font-medium text-white/90">
                            {(reserves / 10 ** token.decimals).toLocaleString()} {token.symbol}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            ${((reserves / 10 ** token.decimals) * price).toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
} 