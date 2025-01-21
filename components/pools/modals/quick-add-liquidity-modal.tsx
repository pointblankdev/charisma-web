import React, { useState, useMemo, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@components/ui/dialog';
import { Button } from '@components/ui/button';
import { Plus, AlertCircle, InfoIcon } from 'lucide-react';
import { Alert, AlertDescription } from '@components/ui/alert';
import { TokenDisplay } from '../shared/token-display';
import { Vault } from 'dexterity-sdk/dist/core/vault';
import { Opcode } from 'dexterity-sdk/dist/core/opcode';
import { useGlobal } from '@lib/hooks/global-context';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip';
import numeral from 'numeral';

export const QuickAddLiquidityModal = ({
    pool,
    tokenPrices,
    onAddLiquidity,
    isOpen,
    onClose
}: {
    pool: any,
    tokenPrices: any,
    onAddLiquidity: any,
    isOpen: boolean,
    onClose: () => void
}) => {
    const [isQuoting, setIsQuoting] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const { getBalance } = useGlobal();
    const vault = useMemo(() => new Vault(pool), [pool]);
    const [quotedAmounts, setQuotedAmounts] = useState({
        lpTokens: 0,
        token0Amount: 0,
        token1Amount: 0
    });

    // Calculate token amounts for $100 worth of liquidity
    useEffect(() => {
        const fetchQuote = async () => {
            setIsQuoting(true);
            try {
                // Calculate token prices in USD
                const token0Price = tokenPrices[pool.liquidity[0].contractId] || 0;
                const token1Price = tokenPrices[pool.liquidity[1].contractId] || 0;

                // Get user balances
                const token0Balance = getBalance(pool.liquidity[0].contractId) || 0;
                const token1Balance = getBalance(pool.liquidity[1].contractId) || 0;

                // Calculate max USD value user can add based on their token balances
                const maxToken0USD = (token0Balance / 10 ** pool.liquidity[0].decimals) * token0Price;
                const maxToken1USD = (token1Balance / 10 ** pool.liquidity[1].decimals) * token1Price;

                // Since we need equal value of both tokens, take the minimum
                const maxPossibleUSD = Math.min(maxToken0USD, maxToken1USD, 100) / 2;
                const totalUSDToAdd = maxPossibleUSD * 2; // Double since we're adding both tokens

                // Calculate total pool value and LP tokens
                const totalPoolValue = (pool.liquidity[0].reserves / 10 ** pool.liquidity[0].decimals) * token0Price +
                    (pool.liquidity[1].reserves / 10 ** pool.liquidity[1].decimals) * token1Price;

                const lpTokensForAmount = Math.floor((totalUSDToAdd / totalPoolValue) * pool.supply);

                // Get actual token amounts needed via quote
                const quote = await vault.quote(lpTokensForAmount, Opcode.addLiquidity());

                if (quote instanceof Error) {
                    setQuotedAmounts({
                        lpTokens: 0,
                        token0Amount: 0,
                        token1Amount: 0
                    });
                    return;
                }

                setQuotedAmounts({
                    lpTokens: lpTokensForAmount,
                    token0Amount: quote.dx,
                    token1Amount: quote.dy
                });
            } catch (error) {
                console.error('Error fetching quote:', error);
                setQuotedAmounts({
                    lpTokens: 0,
                    token0Amount: 0,
                    token1Amount: 0
                });
            } finally {
                setIsQuoting(false);
            }
        };

        fetchQuote();
    }, [pool, tokenPrices, vault]);

    const hasInsufficientBalance = useMemo(() => {
        const token0Balance = getBalance(pool.liquidity[0].contractId) || 0;
        const token1Balance = getBalance(pool.liquidity[1].contractId) || 0;
        return token0Balance < quotedAmounts.token0Amount || token1Balance < quotedAmounts.token1Amount;
    }, [quotedAmounts, getBalance, pool]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        Quick Add Liquidity (up to $100)
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <InfoIcon className="w-4 h-4 mr-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="w-64 p-2 leading-snug">
                                        This will add up to $100 worth of liquidity split evenly between both tokens, limited by your available balance.
                                        You should expect to receive {numeral(quotedAmounts.lpTokens / 10 ** 6).format('0,0')} {vault.symbol} LP tokens.
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="space-y-4">
                        <TokenDisplay
                            amount={quotedAmounts.token0Amount / 10 ** pool.liquidity[0].decimals}
                            symbol={pool.liquidity[0].symbol}
                            imgSrc={pool.liquidity[0].image}
                            price={tokenPrices[pool.liquidity[0].contractId]}
                            label="You will deposit"
                            decimals={pool.liquidity[0].decimals}
                            isLoading={isQuoting}
                        />
                        <TokenDisplay
                            amount={quotedAmounts.token1Amount / 10 ** pool.liquidity[1].decimals}
                            symbol={pool.liquidity[1].symbol}
                            imgSrc={pool.liquidity[1].image}
                            price={tokenPrices[pool.liquidity[1].contractId]}
                            label="You will deposit"
                            decimals={pool.liquidity[1].decimals}
                            isLoading={isQuoting}
                        />
                    </div>

                    {hasInsufficientBalance && (
                        <Alert variant="destructive">
                            <AlertCircle className="w-4 h-4" />
                            <AlertDescription>
                                Insufficient balance. Please ensure you have enough of both tokens.
                            </AlertDescription>
                        </Alert>
                    )}

                    <Button
                        className="w-full"
                        onClick={async () => {
                            setIsProcessing(true);
                            try {
                                await onAddLiquidity(pool, quotedAmounts.lpTokens);
                                onClose();
                            } finally {
                                setIsProcessing(false);
                            }
                        }}
                        disabled={hasInsufficientBalance || isProcessing}
                    >
                        {isProcessing ? (
                            <div className="flex items-center justify-center">
                                <div className="mr-2">Processing</div>
                                <div className="flex space-x-1">
                                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" />
                                </div>
                            </div>
                        ) : (
                            `Add ${numeral(quotedAmounts.token0Amount / 10 ** pool.liquidity[0].decimals * (tokenPrices[pool.liquidity[0].contractId] || 0) * 2).format('$0,0.00')} Liquidity`
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};