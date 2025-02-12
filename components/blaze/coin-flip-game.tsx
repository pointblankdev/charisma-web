import React, { useState, useEffect } from 'react';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { Coins, Loader2, PartyPopper, DollarSign, X, Sparkles, Flame } from 'lucide-react';
import { useGlobal } from '@lib/hooks/global-context';
import { fetchBlazeBalances, handleCoinFlip } from './action-helpers';
import { toast } from '@components/ui/use-toast';
import Image from 'next/image';
import { cn } from '@lib/utils';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@components/ui/tooltip";


const gameToken = 'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token'

export const CoinFlipGame = () => {
    const [choice, setChoice] = useState<'heads' | 'tails' | null>(null);
    const [amount, setAmount] = useState('');
    const [isFlipping, setIsFlipping] = useState(false);
    const [flipCount, setFlipCount] = useState(0);
    const [gameResult, setGameResult] = useState<{
        won: boolean;
        result: 'heads' | 'tails';
        amount: string;
        lastChoice: 'heads' | 'tails';
    } | null>(null);
    const { stxAddress, setBlazeBalances, blazeBalances } = useGlobal();

    // Add new state for hover effects
    const [hoveredCoin, setHoveredCoin] = useState<'heads' | 'tails' | null>(null);

    // Animate coin while flipping
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isFlipping) {
            interval = setInterval(() => {
                setFlipCount(count => count + 1);
            }, 150) as any; // Speed of the flip animation
        }
        return () => clearInterval(interval);
    }, [isFlipping]);

    const handlePlay = async (playChoice: 'heads' | 'tails', playAmount: string) => {
        if (!playChoice || !playAmount || isFlipping) return;

        setIsFlipping(true);
        setGameResult(null);
        setFlipCount(0);

        try {
            // Add a minimum flip time for better UX
            const result: any = await Promise.all([
                handleCoinFlip({
                    choice: playChoice,
                    amount: parseFloat(playAmount),
                    stxAddress
                }),
                new Promise(resolve => setTimeout(resolve, 2100)) // Minimum 2.1s flip animation
            ]).then(([result]) => result);

            setGameResult({
                won: result.won,
                result: result.result as 'heads' | 'tails',
                amount: playAmount,
                lastChoice: playChoice
            });

            setBlazeBalances({
                ...blazeBalances,
                [gameToken]: {
                    balance: parseFloat(result.newBalance),
                    credit: parseFloat(result.newBalance),
                    nonce: result.nextNonce,
                    contract: gameToken
                }
            });

            // Show success toast
            toast({
                title: result.won ? "You Won! 🎉" : "Better Luck Next Time!",
                description: (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className={`p-1.5 ${result.won ? 'bg-green-500/10' : 'bg-yellow-500/10'} rounded-md`}>
                                <Coins className={`w-4 h-4 ${result.won ? 'text-green-500' : 'text-yellow-500'}`} />
                            </div>
                            <div>
                                <div className="font-medium">{result.won ? 'Doubled your WELSH!' : 'Try again!'}</div>
                                <div className="text-sm text-muted-foreground">
                                    {result.won
                                        ? `Congratulations! You've won ${(parseFloat(playAmount) * 2).toFixed(0)} WELSH`
                                        : `You lost ${playAmount} WELSH`}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong while playing. Please try again.",
                variant: "destructive"
            });
            setGameResult(null);
        } finally {
            setIsFlipping(false);
        }
    };

    const playAgain = () => {
        if (!gameResult) return;
        handlePlay(gameResult.lastChoice, gameResult.amount);
    };

    const resetGame = () => {
        setGameResult(null);
        setChoice(null);
        setAmount('');
        setIsFlipping(false);
    };

    if (isFlipping) {
        return (
            <div className="py-12 flex flex-col items-center justify-center space-y-8">
                <div className="relative w-40 h-40">
                    {/* Add particle effects during flip */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        {[...Array(8)].map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "absolute w-2 h-2 bg-primary/30 rounded-full",
                                    "animate-particle opacity-0",
                                    `particle-${i}`
                                )}
                            />
                        ))}
                    </div>

                    {/* Enhanced coin flip animation */}
                    <div className="relative w-full h-full perspective-1000">
                        <div
                            className={cn(
                                "absolute w-full h-full backface-hidden transition-transform duration-150",
                                "shadow-[0_0_15px_rgba(0,0,0,0.1)]",
                                "rounded-full overflow-hidden transform-gpu",
                                flipCount % 2 === 0 ? "rotate-y-0" : "rotate-y-180"
                            )}
                        >
                            <Image
                                src="/indexes/charismatic-corgi-bg.png"
                                alt="Heads"
                                width={160}
                                height={160}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div
                            className={cn(
                                "absolute w-full h-full backface-hidden transition-transform duration-150",
                                "shadow-[0_0_15px_rgba(0,0,0,0.1)]",
                                "rounded-full overflow-hidden transform-gpu rotate-y-180",
                                flipCount % 2 === 0 ? "rotate-y-180" : "rotate-y-360"
                            )}
                        >
                            <Image
                                src="/explorations/breaking-stacks.png"
                                alt="Tails"
                                width={160}
                                height={160}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>

                {/* Enhanced betting status */}
                <div className="relative text-center space-y-3">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                    <h3 className="text-xl font-semibold flex items-center justify-center gap-2">
                        <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
                        Flipping Coin...
                    </h3>
                    <p className="text-muted-foreground">
                        Betting <span className="font-medium text-primary">{amount} WELSH</span> on{' '}
                        <span className="font-medium text-primary">{choice}</span>
                    </p>
                </div>
            </div>
        );
    }

    if (gameResult) {
        return (
            <div className="space-y-6 py-4">
                <div className="relative flex flex-col items-center gap-6 text-center">
                    {/* Background effects */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent opacity-50" />

                    {gameResult.won ? (
                        <>
                            <div className="relative">
                                <div className="h-24 w-24 rounded-full bg-green-500/10 flex items-center justify-center animate-bounce-slow">
                                    <PartyPopper className="h-12 w-12 text-green-500" />
                                </div>
                                {[...Array(3)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "absolute -inset-1 rounded-full bg-green-500/20",
                                            "animate-ping-slow",
                                            i === 0 && "delay-0",
                                            i === 1 && "delay-300",
                                            i === 2 && "delay-600"
                                        )}
                                    />
                                ))}
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-green-500">You Won!</h3>
                                <p className="text-muted-foreground">
                                    Congratulations! You've won {(parseFloat(gameResult.amount) * 2).toFixed(0)} WELSH
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="relative">
                                <div className="h-24 w-24 rounded-full bg-yellow-500/10 flex items-center justify-center">
                                    <DollarSign className="h-12 w-12 text-yellow-500" />
                                </div>
                                <div className="absolute -inset-1 rounded-full bg-yellow-500/10 animate-pulse" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-yellow-500">Better Luck Next Time!</h3>
                                <p className="text-muted-foreground">
                                    You lost {gameResult.amount} WELSH
                                </p>
                            </div>
                        </>
                    )}

                    {/* Enhanced action buttons */}
                    <div className="flex gap-3 w-full">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        className={cn(
                                            "flex-1 relative overflow-hidden",
                                            gameResult.won && "bg-green-500 hover:bg-green-600",
                                            !gameResult.won && "bg-yellow-500 hover:bg-yellow-600"
                                        )}
                                        onClick={playAgain}
                                        disabled={isFlipping}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 animate-shimmer" />
                                        {isFlipping ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Flipping...
                                            </>
                                        ) : (
                                            <>
                                                <Flame className="mr-2 h-4 w-4" />
                                                Double or Nothing
                                            </>
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Play again with {gameResult.amount} WELSH</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <Button
                            variant="outline"
                            onClick={resetGame}
                            disabled={isFlipping}
                            className="relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 animate-shimmer" />
                            Change Bet
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Initial game state (betting UI)
    return (
        <div className="space-y-6">
            <div className="flex justify-center gap-4">
                <TooltipProvider>
                    {['heads', 'tails'].map((side) => (
                        <Tooltip key={side}>
                            <TooltipTrigger asChild>
                                <Button
                                    variant={choice === side ? 'default' : 'outline'}
                                    className={cn(
                                        "w-32 h-32 rounded-full p-0 relative overflow-hidden transition-all",
                                        "hover:scale-105 hover:shadow-lg",
                                        choice === side && "ring-2 ring-primary ring-offset-2",
                                        hoveredCoin === side && "shadow-xl"
                                    )}
                                    onClick={() => setChoice(side as 'heads' | 'tails')}
                                    onMouseEnter={() => setHoveredCoin(side as 'heads' | 'tails')}
                                    onMouseLeave={() => setHoveredCoin(null)}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <Image
                                        src={side === 'heads' ? "/indexes/charismatic-corgi-bg.png" : "/explorations/breaking-stacks.png"}
                                        alt={side}
                                        width={100}
                                        height={100}
                                        className="rounded-full transform transition-transform group-hover:scale-110"
                                    />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="capitalize">Choose {side}</p>
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </TooltipProvider>
            </div>

            <div className="space-y-2">
                <Label className="flex items-center gap-2">
                    Bet Amount
                    <span className="text-sm text-muted-foreground">(WELSH)</span>
                </Label>
                <div className="relative">
                    <Input
                        type="number"
                        placeholder="Enter amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="pl-12"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <Coins className="w-5 h-5 text-muted-foreground" />
                    </div>
                </div>
            </div>

            <Button
                className={cn(
                    "w-full relative overflow-hidden",
                    "transition-all duration-300",
                    (!choice || !amount) && "opacity-70"
                )}
                onClick={() => handlePlay(choice!, amount)}
                disabled={!choice || !amount || isFlipping}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 animate-shimmer" />
                {isFlipping ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Flipping...
                    </>
                ) : (
                    <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Flip Coin
                    </>
                )}
            </Button>
        </div>
    );
};
