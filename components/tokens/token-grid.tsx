import React from 'react';
import { Card } from '@components/ui/card';
import { Shield, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Token } from 'dexterity-sdk';
import { cn } from '@lib/utils';

interface TokenGridProps {
    tokens: Token[];
    prices: Record<string, number>;
}

export function TokenGrid({ tokens, prices }: TokenGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tokens.map((token) => (
                <Link
                    key={token.contractId}
                    href={`/tokens/${token.contractId}`}
                    className="transition-transform hover:scale-[1.02]"
                >
                    <Card className="relative overflow-hidden bg-[var(--sidebar)]">
                        <div className="absolute inset-0 bg-gradient-to-b from-background/10 to-background/0" />
                        <div className="relative p-6">
                            {/* Token Image */}
                            <div className="flex justify-center mb-4">
                                <div className="relative h-24 w-24 overflow-hidden rounded-xl">
                                    <Image
                                        src={token.image || '/placeholder.png'}
                                        alt={token.name}
                                        width={96}
                                        height={96}
                                        className="object-cover"
                                    />
                                </div>
                            </div>

                            {/* Token Info */}
                            <div className="text-center space-y-2">
                                <h3 className="font-semibold text-lg text-white/95">{token.name}</h3>
                                <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-4 h-4" />
                                        <span>{token.symbol}</span>
                                    </div>
                                </div>

                                {/* Price if available */}
                                {prices[token.contractId] > 0 && (
                                    <div className="text-xl font-bold text-white/90">
                                        ${prices[token.contractId].toLocaleString()}
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                </Link>
            ))}
        </div>
    );
} 