import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import numeral from 'numeral';
import { contractPrincipalCV, uintCV } from 'micro-stacks/clarity';
import { Pc, PostConditionMode } from "@stacks/transactions";
import { useOpenContractCall } from '@micro-stacks/react';
import { Button } from '@components/ui/button';
import {
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@components/ui/dialog';
import { Label } from '@components/ui/label';
import { Slider } from "@components/ui/slider";
import { useAccount } from '@micro-stacks/react';
import useWallet from '@lib/hooks/wallet-balance-provider';
import { PoolInfo, TokenInfo } from 'pages/pools';

const LiquidityDialog = ({ pool, isAdd, onClose }: { pool: PoolInfo | null, isAdd: boolean, onClose: () => void }) => {
    const [sliderValue, setSliderValue] = useState(0);
    const [amount0, setAmount0] = useState('0');
    const [amount1, setAmount1] = useState('0');
    const [maxSliderValue, setMaxSliderValue] = useState(100);
    const [selectedLpAmount, setSelectedLpAmount] = useState(0);
    const [limitingToken, setLimitingToken] = useState<'token0' | 'token1' | null>(null);
    const [animate, setAnimate] = useState(false);
    const { openContractCall } = useOpenContractCall();
    const { stxAddress } = useAccount();
    const { getBalanceByKey, balances, getKeyByContractAddress } = useWallet();

    const calculateUsdValue = (amount: string, price: number) => {
        const numericAmount = parseFloat(amount) || 0;
        return Number((numericAmount * price).toFixed(2));
    };

    const getLpTokenBalance = useCallback(() => {
        if (!pool) return 0;
        return getBalanceByKey(getKeyByContractAddress(pool.contractAddress)) || 0;
    }, [pool, getBalanceByKey, getKeyByContractAddress]);

    const getTokenBalance = useCallback((token: TokenInfo) => {
        if (token.symbol === 'STX') {
            return Number(balances.stx.balance) / 10 ** token.decimals;
        } else {
            return getBalanceByKey(getKeyByContractAddress(token.contractAddress)) / 10 ** token.decimals;
        }
    }, [balances.stx.balance, getBalanceByKey, getKeyByContractAddress]);

    useEffect(() => {
        if (pool && isAdd) {
            const balance0 = getTokenBalance(pool.token0);
            const balance1 = getTokenBalance(pool.token1);
            const reserve0 = pool.reserves.token0 / 10 ** pool.token0.decimals;
            const reserve1 = pool.reserves.token1 / 10 ** pool.token1.decimals;

            // Calculate the maximum amounts that can be added based on the current pool ratio
            const maxAmount0ByBalance = balance0;
            const maxAmount1ByBalance = balance1;
            const maxAmount0ByRatio = (maxAmount1ByBalance * reserve0) / reserve1;
            const maxAmount1ByRatio = (maxAmount0ByBalance * reserve1) / reserve0;

            // Determine the limiting factor and token
            let maxAmount0, maxAmount1;
            if (maxAmount0ByRatio <= maxAmount0ByBalance) {
                maxAmount0 = maxAmount0ByRatio;
                maxAmount1 = maxAmount1ByBalance;
                setLimitingToken('token1');
            } else {
                maxAmount0 = maxAmount0ByBalance;
                maxAmount1 = maxAmount1ByRatio;
                setLimitingToken('token0');
            }

            // Set the max slider value to 100 (representing 100% of the limiting amount)
            setMaxSliderValue(100);

            // Calculate amounts based on the slider value
            const amount0 = (maxAmount0 * sliderValue / 100);
            const amount1 = (maxAmount1 * sliderValue / 100);

            setAmount0(amount0.toFixed(pool.token0.decimals));
            setAmount1(amount1.toFixed(pool.token1.decimals));

            // Trigger animation if slider is at max
            if (sliderValue === 100 && !animate) {
                setAnimate(true);
                setTimeout(() => setAnimate(false), 1000);
            }
        } else if (pool) {
            const lpTokenBalance = getLpTokenBalance();
            setMaxSliderValue(100);

            const share = lpTokenBalance > 0 ? sliderValue / 100 : 0;
            const newAmount0 = (share * pool.reserves.token0 / 10 ** pool.token0.decimals).toFixed(pool.token0.decimals);
            const newAmount1 = (share * pool.reserves.token1 / 10 ** pool.token1.decimals).toFixed(pool.token1.decimals);

            setAmount0(newAmount0);
            setAmount1(newAmount1);
            setSelectedLpAmount(Math.floor(lpTokenBalance * share));
            setLimitingToken(null);

        }
    }, [pool, isAdd, sliderValue, getLpTokenBalance, getTokenBalance, animate]);

    const handleAddLiquidity = useCallback(() => {
        if (!pool || !stxAddress) return;

        const postConditions: any = []
        if (pool.token0.symbol !== 'STX') {
            const amount0BigInt = BigInt(Math.floor(parseFloat(amount0) * 10 ** pool.token0.decimals));
            postConditions.push(Pc.principal(stxAddress).willSendLte(amount0BigInt).ft(pool.token0.contractAddress as any, pool.token0.tokenId as string) as any);
        } else {
            const amount0BigInt = BigInt(Math.floor(parseFloat(amount0) * 10 ** pool.token0.decimals));
            postConditions.push(Pc.principal(stxAddress).willSendLte(amount0BigInt).ustx() as any);
        }
        if (pool.token1.symbol !== 'STX') {
            const amount1BigInt = BigInt(Math.floor(parseFloat(amount1) * 10 ** pool.token1.decimals));
            postConditions.push(Pc.principal(stxAddress).willSendLte(amount1BigInt).ft(pool.token1.contractAddress as any, pool.token1.tokenId as string) as any);
        } else {
            const amount1BigInt = BigInt(Math.floor(parseFloat(amount1) * 10 ** pool.token1.decimals));
            postConditions.push(Pc.principal(stxAddress).willSendLte(amount1BigInt).ustx() as any);
        }

        openContractCall({
            contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
            contractName: "univ2-router",
            functionName: "add-liquidity",
            functionArgs: [
                uintCV(pool.id),
                contractPrincipalCV(pool.token0.contractAddress.split('.')[0], pool.token0.contractAddress.split('.')[1]),
                contractPrincipalCV(pool.token1.contractAddress.split('.')[0], pool.token1.contractAddress.split('.')[1]),
                contractPrincipalCV(pool.contractAddress.split('.')[0], pool.contractAddress.split('.')[1]),
                uintCV(BigInt(Math.floor(parseFloat(amount0) * 10 ** pool.token0.decimals))),
                uintCV(BigInt(Math.floor(parseFloat(amount1) * 10 ** pool.token1.decimals))),
                uintCV(1),
                uintCV(1)
            ],
            postConditionMode: PostConditionMode.Deny,
            postConditions,
            onFinish: (data) => {
                console.log('Transaction successful', data);
                onClose();
            },
            onCancel: () => {
                console.log('Transaction cancelled');
            }
        });
    }, [pool, amount0, amount1, stxAddress, openContractCall, onClose]);

    const handleRemoveLiquidity = useCallback(() => {
        if (!pool || !stxAddress) return;

        const lpTokenBalance = getLpTokenBalance();
        const lpTokensToRemove = Math.floor(lpTokenBalance * sliderValue / 100);

        // Calculate the minimum amounts of tokens to receive
        const minAmount0 = BigInt(Math.floor(parseFloat(amount0) * 0.80 * 10 ** pool.token0.decimals)); // 20% slippage
        const minAmount1 = BigInt(Math.floor(parseFloat(amount1) * 0.80 * 10 ** pool.token1.decimals)); // 20% slippage

        const postConditions: any = [
            // Post condition for sending LP tokens
            Pc.principal(stxAddress).willSendLte(lpTokensToRemove).ft(pool.contractAddress as any, 'lp-token') as any,

            // Post condition for receiving token0
            pool.token0.symbol !== 'STX'
                ? Pc.principal('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.univ2-core').willSendGte(minAmount0).ft(pool.token0.contractAddress as any, pool.token0.tokenId as string) as any
                : Pc.principal('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.univ2-core').willSendGte(minAmount0).ustx() as any,

            // Post condition for receiving token1
            pool.token1.symbol !== 'STX'
                ? Pc.principal('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.univ2-core').willSendGte(minAmount1).ft(pool.token1.contractAddress as any, pool.token1.tokenId as string) as any
                : Pc.principal('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.univ2-core').willSendGte(minAmount1).ustx() as any,
        ];

        openContractCall({
            contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
            contractName: "univ2-router",
            functionName: "remove-liquidity",
            functionArgs: [
                uintCV(pool.id),
                contractPrincipalCV(pool.token0.contractAddress.split('.')[0], pool.token0.contractAddress.split('.')[1]),
                contractPrincipalCV(pool.token1.contractAddress.split('.')[0], pool.token1.contractAddress.split('.')[1]),
                contractPrincipalCV(pool.contractAddress.split('.')[0], pool.contractAddress.split('.')[1]),
                uintCV(lpTokensToRemove),
                uintCV(minAmount0),  // Minimum amount of token0 to receive
                uintCV(minAmount1),  // Minimum amount of token1 to receive
            ],
            postConditionMode: PostConditionMode.Deny,
            postConditions,
            onFinish: (data) => {
                console.log('Transaction successful', data);
                onClose();
            },
            onCancel: () => {
                console.log('Transaction cancelled');
            }
        });
    }, [pool, stxAddress, getLpTokenBalance, sliderValue, amount0, amount1, openContractCall, onClose]);

    if (!pool) return null;

    const lpTokenBalance = getLpTokenBalance();

    return (
        <DialogContent className="sm:max-w-lg">
            <DialogHeader>
                <DialogTitle>{isAdd ? 'Add Liquidity' : 'Remove Liquidity'}</DialogTitle>
                <DialogDescription>
                    {isAdd ? `Add liquidity to the ${pool.token0.symbol}/${pool.token1.symbol} pool` : `Remove liquidity from the ${pool.token0.symbol}/${pool.token1.symbol} pool`}
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                    <Label>{isAdd ? 'Liquidity to add (%)' : 'Liquidity to remove (%)'}</Label>
                    <Slider
                        value={[sliderValue]}
                        onValueChange={(value) => {
                            setSliderValue(value[0]);
                            if (value[0] === 100 && !animate) {
                                setAnimate(true);
                                setTimeout(() => setAnimate(false), 1000);
                            }
                        }}
                        max={100}
                        step={0.1}  // Increased precision
                    />
                    <div className="text-right text-sm text-gray-500">{sliderValue.toFixed(2)}%</div>
                </div>
                <div className="grid items-center grid-cols-4 gap-4">
                    <div className="flex justify-end">
                        <Image
                            src={pool.token0.image}
                            alt={pool.token0.symbol}
                            width={24}
                            height={24}
                            className={`rounded-full ${animate && limitingToken === 'token0' ? 'shake' : ''}`}
                        />
                    </div>
                    <div className="col-span-3">
                        <div className="flex justify-between">
                            <span>{parseFloat(amount0).toFixed(pool.token0.decimals)} {pool.token0.symbol}</span>
                            <span className="text-sm text-gray-500">
                                ${calculateUsdValue(amount0, pool.token0.price).toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="grid items-center grid-cols-4 gap-4">
                    <div className="flex justify-end">
                        <Image
                            src={pool.token1.image}
                            alt={pool.token1.symbol}
                            width={24}
                            height={24}
                            className={`rounded-full ${animate && limitingToken === 'token1' ? 'shake' : ''}`}
                        />
                    </div>
                    <div className="col-span-3">
                        <div className="flex justify-between">
                            <span>{parseFloat(amount1).toFixed(pool.token1.decimals)} {pool.token1.symbol}</span>
                            <span className="text-sm text-gray-500">
                                ${calculateUsdValue(amount1, pool.token1.price).toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <DialogFooter className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                    {isAdd
                        ? `Your balance: ${numeral(getTokenBalance(pool.token0)).format('0,0.00')} ${pool.token0.symbol} / ${numeral(getTokenBalance(pool.token1)).format('0,0.00')} ${pool.token1.symbol}`
                        : `Your balance: ${numeral(lpTokenBalance).format('0,0')} → ${numeral(lpTokenBalance - selectedLpAmount).format('0,0')}`
                    }
                </span>
                <Button
                    type="submit"
                    onClick={isAdd ? handleAddLiquidity : handleRemoveLiquidity}
                    disabled={sliderValue === 0}
                >
                    {isAdd ? 'Add Liquidity' : 'Remove Liquidity'}
                </Button>
            </DialogFooter>
        </DialogContent>
    );
};

export default LiquidityDialog;