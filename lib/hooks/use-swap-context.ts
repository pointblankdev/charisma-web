import { createContext } from 'react';

export type SwapContextType = {
    tokenList: any;
    setTokenList: React.Dispatch<React.SetStateAction<any>>;
    swapConfig: SwapConfig;
    setSwapConfig: React.Dispatch<React.SetStateAction<SwapConfig>>;
};

export type Token = {
    symbol: string;
    contractAddress: string;
    assetName: string;
    decimal: string;
    imageUrl: string;
    name: string;
    percent_change_24h: string;
    price: string;
    socialLinks: {
        website: string;
        twitter: string;
        discord: string;
        telegram: string;
    };
    timestamp: string;
    tokenDecimalNum: number;
};

export type Ticker = {
    ask: number;
    base_currency: `${string}.${string}`;
    base_volume: number;
    bid: number;
    high: number;
    last_price: number;
    liquidity_in_usd: number;
    low: number;
    pool_id: string;
    target_currency: `${string}.${string}`;
    target_volume: number;
    ticker_id: `${string}.${string}_${string}.${string}`;
};

export type StepConfig = {
    fromToken: `${string}.${string}`;
    fromAmount: number;
    action: string;
    toToken: `${string}.${string}`;
    toAmount: number;
};

export type SwapConfig = {
    steps: StepConfig[];
    options: any;
};

export const SwapContext = createContext<SwapContextType>({
    tokenList: null,
    setTokenList: () => { },
    swapConfig: { steps: [], options: {} },
    setSwapConfig: () => { }
});
