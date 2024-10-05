import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import numeral from 'numeral';
import { contractPrincipalCV, boolCV } from 'micro-stacks/clarity';
import { callReadOnlyFunction, cvToJSON, Pc, PostConditionMode, principalCV, uintCV } from "@stacks/transactions";
import { useOpenContractCall } from '@micro-stacks/react';
import { Button } from '@components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
    const { openContractCall } = useOpenContractCall();
    const { stxAddress } = useAccount();
    const { getBalanceByKey, balances, getKeyByContractAddress } = useWallet();

    const calculateUsdValue = (amount: string, price: number) => {
        const numericAmount = parseFloat(amount) || 0;
        return Number((numericAmount * price).toFixed(2));
    };

    useEffect(() => {
        if (pool && isAdd) {
            const maxAmount0 = pool.reserves.token0 / 10 ** pool.token0.decimals;
            const maxAmount1 = pool.reserves.token1 / 10 ** pool.token1.decimals;

            const newAmount0 = (maxAmount0 * sliderValue / 100).toFixed(pool.token0.decimals);
            const newAmount1 = (maxAmount1 * sliderValue / 100).toFixed(pool.token1.decimals);

            setAmount0(newAmount0);
            setAmount1(newAmount1);
        }
    }, [sliderValue, pool, isAdd]);

    const checkBalances = () => {
        if (!pool || !stxAddress) return true;

        const getBalance = (token: TokenInfo) => {
            if (token.symbol === 'STX') {
                return Number(balances.stx.balance) / 10 ** token.decimals;
            } else {
                return getBalanceByKey(getKeyByContractAddress(token.contractAddress)) / 10 ** token.decimals;
            }
        };

        const balance0 = getBalance(pool.token0);
        const balance1 = getBalance(pool.token1);
        return parseFloat(amount0) <= balance0 && parseFloat(amount1) <= balance1;
    };

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
        if (!pool) return;

        openContractCall({
            contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
            contractName: "univ2-router",
            functionName: "remove-liquidity",
            functionArgs: [
                uintCV(pool.id),
                contractPrincipalCV(pool.token0.contractAddress.split('.')[0], pool.token0.contractAddress.split('.')[1]),
                contractPrincipalCV(pool.token1.contractAddress.split('.')[0], pool.token1.contractAddress.split('.')[1]),
                contractPrincipalCV(pool.contractAddress.split('.')[0], pool.contractAddress.split('.')[1]),
                uintCV(parseFloat(amount0) * 1000000),
                uintCV(0),
                uintCV(0)
            ],
            onFinish: (data) => {
                console.log('Transaction successful', data);
                onClose();
            },
            onCancel: () => {
                console.log('Transaction cancelled');
            }
        });
    }, [pool, amount0, openContractCall, onClose]);

    if (!pool) return null;

    const hasEnoughBalance = checkBalances();

    return (
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>{isAdd ? 'Add Liquidity' : 'Remove Liquidity'}</DialogTitle>
                <DialogDescription>
                    {isAdd
                        ? `Add liquidity to the ${pool.token0.symbol}/${pool.token1.symbol} pool`
                        : `Remove liquidity from the ${pool.token0.symbol}/${pool.token1.symbol} pool`}
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                {isAdd && (
                    <div className="grid gap-2">
                        <Label>Liquidity to add (%)</Label>
                        <Slider
                            value={[sliderValue]}
                            onValueChange={(value) => setSliderValue(value[0])}
                            max={100}
                            step={1}
                        />
                    </div>
                )}
                <div className="grid items-center grid-cols-4 gap-4">
                    <div className="flex justify-end">
                        <Image
                            src={pool.token0.image}
                            alt={pool.token0.symbol}
                            width={24}
                            height={24}
                            className="rounded-full"
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
                            className="rounded-full"
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
                {isAdd && (
                    <span className={`text-sm ${hasEnoughBalance ? 'text-green-500' : 'text-red-500'}`}>
                        {hasEnoughBalance ? 'Sufficient balance' : 'Insufficient balance'}
                    </span>
                )}
                <Button
                    type="submit"
                    onClick={isAdd ? handleAddLiquidity : handleRemoveLiquidity}
                    disabled={isAdd && !hasEnoughBalance}
                >
                    {isAdd ? 'Add Liquidity' : 'Remove Liquidity'}
                </Button>
            </DialogFooter>
        </DialogContent>
    );
};

export default LiquidityDialog;