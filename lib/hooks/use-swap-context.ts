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

interface StakingConfig {
    from: string;
    to: string;
    rate: number;
}


const stakingConfigs = [
    { from: 'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token', to: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-welsh-v2', rate: 1 / 1.0005 },
    { from: 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme000-governance-token', to: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wrapped-charisma', rate: 1 },
    { from: 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme000-governance-token', to: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-charisma', rate: 1 },
];

function findPool(tickers: Ticker[], fromToken: string, toToken: string): Ticker | undefined {
    return tickers.find(ticker =>
        ticker.ticker_id === `${fromToken}_${toToken}` || ticker.ticker_id === `${toToken}_${fromToken}`
    );
}

function calculateSwapAmount(pool: Ticker | undefined, fromAmount: number, fromToken: string, toToken: string): number {
    if (!pool) return 0;
    return pool.ticker_id === `${fromToken}_${toToken}`
        ? pool.last_price * fromAmount
        : fromAmount / pool.last_price;
}

function getStakingPair(toToken: string): StakingConfig {
    const config = stakingConfigs.find(cfg => (toToken === cfg.to || toToken === cfg.from));
    if (!config) { new Error(`No staking configuration found for: ${toToken}`) }
    return config as StakingConfig;
}

export function getStakingContract(toToken: string, fromToken?: string) {
    const config = stakingConfigs.find(cfg => {
        const isDirectMatch = toToken === cfg.to && fromToken === cfg.from;
        const isReverseMatch = fromToken === cfg.to && toToken === cfg.from;
        return isDirectMatch || isReverseMatch;
    });
    return config ? config.to : null;
}

export function processStep(step: StepConfig, tickers: Ticker[]): void {
    switch (step.action) {
        case 'SWAP':
            const pool = findPool(tickers, step.fromToken, step.toToken);
            step.toAmount = calculateSwapAmount(pool, step.fromAmount, step.fromToken, step.toToken);
            break;
        case 'STAKE':
            step.toAmount = step.fromAmount / getStakingPair(step.toToken).rate;
            break;
        case 'UNSTAKE':
            console.log(step)
            step.toAmount = step.fromAmount / getStakingPair(step.toToken).rate;
            break;
        default:
            console.warn(`Unknown action: ${step.action}`);
    }
}

export function reverseSwapConfig(swapConfig: SwapConfig) {
    const reversedSteps: StepConfig[] = swapConfig.steps.map(step => ({
        action: step.action === 'STAKE' ? 'UNSTAKE' : step.action === 'UNSTAKE' ? 'STAKE' : step.action,
        fromToken: step.toToken,
        toToken: step.fromToken,
        fromAmount: step.toAmount || 0,
        toAmount: step.fromAmount
    })).reverse();

    return { steps: reversedSteps };
}