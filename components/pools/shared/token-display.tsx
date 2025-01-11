import React, { useMemo } from 'react';
import numeral from 'numeral';

interface TokenDisplayProps {
    amount: number;
    symbol: string;
    imgSrc?: string;
    label: string;
    rounded?: boolean;
    price: number;
    decimals: number;
    isLoading?: boolean;
}

export const TokenDisplay: React.FC<TokenDisplayProps> = ({
    amount,
    symbol,
    imgSrc,
    label,
    price,
    decimals,
    isLoading
}) => {
    const usdValue = useMemo(() => {
        if (!price || !amount) return null;
        return amount * price;
    }, [amount, price]);

    return (
        <div className="flex items-center justify-between p-4 border rounded-lg border-border relative z-20 bg-background">
            <div className="flex items-center space-x-3">
                <img src={imgSrc} alt={symbol} className="w-8 h-8 rounded-md" />
                <div>
                    <div className="text-sm text-muted-foreground">{label}</div>
                    <div className="text-lg font-medium">
                        {numeral(amount).format(`0,0.${'0'.repeat(decimals)}`)} {symbol}
                    </div>
                </div>
            </div>
            {usdValue === null ? (
                <div className="text-right text-muted-foreground">
                    Price unavailable
                </div>
            ) : (
                <div className="text-right text-muted-foreground">
                    {isLoading ? (
                        <span className="animate-pulse text-muted-foreground/50 font-medium">Loading...</span>
                    ) : (
                        <span>≈ ${numeral(usdValue).format('0,0.00')}</span>
                    )}
                </div>
            )}
        </div>
    );
};

interface BalanceInfoProps {
    balance: number;
    symbol: string;
    price: number;
    decimals: number;
    required?: number;
    isLoading?: boolean;
}

export const BalanceInfo: React.FC<BalanceInfoProps> = ({
    balance,
    symbol,
    price,
    decimals,
    required,
    isLoading
}) => {
    const formattedBalance = balance / 10 ** decimals;
    const usdValue = useMemo(() => {
        if (!price || !formattedBalance) return null;
        return formattedBalance * price;
    }, [formattedBalance, price]);

    return (
        <div className="flex flex-col space-y-1">
            <div className="flex justify-between text-sm text-muted-foreground">
                <span>
                    Balance: {numeral(formattedBalance).format(`0,0.${'0'.repeat(decimals)}`)} {symbol}
                </span>
                {usdValue === null ? (
                    <span>Price unavailable</span>
                ) : (
                    isLoading ? (
                        <span className="animate-pulse text-muted-foreground/50 font-medium">Loading...</span>
                    ) : (
                        <span>≈ ${numeral(usdValue).format('0,0.00')}</span>
                    )
                )}
            </div>
        </div>
    );
}; 