import React from 'react';
import { Card } from '@components/ui/card';
import { Coins, Sparkles, Flame, DollarSign } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@components/ui/dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@components/ui/tooltip";
import { CoinFlipGame } from './coin-flip-game';
import { cn } from '@lib/utils';

export const CoinFlipCard = () => {
    return (
        <TooltipProvider>
            <Card className="group relative overflow-hidden">
                <Dialog>
                    <DialogTrigger asChild>
                        <div className="relative p-6 cursor-pointer transition-all">
                            {/* Background Effects */}
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="absolute -right-20 -top-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-500" />

                            {/* Floating Coins Animation */}
                            <div className="absolute right-0 top-0 w-32 h-full overflow-hidden pointer-events-none">
                                {[...Array(3)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "absolute w-6 h-6 text-yellow-500/20",
                                            "animate-float opacity-0 group-hover:opacity-100",
                                            i === 0 && "right-12 top-8 delay-100",
                                            i === 1 && "right-8 top-16 delay-200",
                                            i === 2 && "right-16 top-24 delay-300"
                                        )}
                                    >
                                        <DollarSign />
                                    </div>
                                ))}
                            </div>

                            {/* Main Content */}
                            <div className="relative">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="relative">
                                        <div className="p-3 bg-primary/10 rounded-xl transition-transform duration-500 group-hover:scale-110">
                                            <Coins className="w-6 h-6 text-primary" />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <h3 className="font-semibold text-lg">Coin Flip</h3>
                                        <Tooltip delayDuration={200}>
                                            <TooltipTrigger asChild>
                                                <div className="flex items-center gap-2 cursor-help">
                                                    <Sparkles className="w-4 h-4 text-yellow-500" />
                                                    <span className="text-sm text-muted-foreground">
                                                        Double or nothing
                                                    </span>
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent className="max-w-[280px]">
                                                <div className="space-y-2">
                                                    <p className="font-medium">How it works:</p>
                                                    <div className="text-sm text-muted-foreground">
                                                        1. Choose heads or tails
                                                        2. Place your bet
                                                        3. Win double or lose it all!
                                                    </div>
                                                </div>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                </div>

                                <p className="text-sm text-muted-foreground pr-8">
                                    Test your luck! Flip a coin and double your tokens instantly.
                                </p>

                                {/* Interactive Indicator */}
                                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                            </div>
                        </div>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Blaze Coin Flip</DialogTitle>
                            <DialogDescription>
                                Choose heads or tails and double your tokens if you win!
                            </DialogDescription>
                        </DialogHeader>
                        <CoinFlipGame />
                    </DialogContent>
                </Dialog>
            </Card>
        </TooltipProvider>
    );
}; 