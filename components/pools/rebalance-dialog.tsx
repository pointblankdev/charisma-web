import React, { useState, useCallback } from 'react';
import {
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@components/ui/dialog';
import { Button } from '@components/ui/button';
import { useOpenContractCall } from '@micro-stacks/react';
import { contractPrincipalCV, uintCV } from 'micro-stacks/clarity';
import { Pc, PostConditionMode } from "@stacks/transactions";
import { useAccount } from '@micro-stacks/react';
import numeral from 'numeral';
import { PoolInfo } from 'pages/pools';

type RebalanceDialogProps = {
    pool: PoolInfo | null;
    referenceChaPrice: number;
    onClose: () => void;
};

const RebalanceDialog: React.FC<RebalanceDialogProps> = ({ pool, referenceChaPrice, onClose }) => {
    const [isLoading, setIsLoading] = useState(false);
    const { openContractCall } = useOpenContractCall();
    const { stxAddress } = useAccount();

    const calculateTrade = useCallback(() => {
        if (!pool) return null;

        const chaToken = pool.token0.symbol === 'CHA' ? pool.token0 : pool.token1;
        const otherToken = pool.token0.symbol === 'CHA' ? pool.token1 : pool.token0;
        const chaReserve = pool.token0.symbol === 'CHA' ? pool.reserves.token0 : pool.reserves.token1;
        const otherReserve = pool.token0.symbol === 'CHA' ? pool.reserves.token1 : pool.reserves.token0;

        const chaAmount = chaReserve / 10 ** chaToken.decimals;
        const otherAmount = otherReserve / 10 ** otherToken.decimals;

        const currentPrice = (otherToken.price * otherAmount) / chaAmount;
        const priceDifference = referenceChaPrice - currentPrice;

        if (priceDifference > 0) {
            // Need to buy CHA (sell other token)
            const otherToSell = otherAmount * (1 - Math.sqrt(currentPrice / referenceChaPrice));
            const chaToReceive = chaAmount * (Math.sqrt(referenceChaPrice / currentPrice) - 1);
            return {
                action: 'buy',
                amount: chaToReceive,
                sellAmount: otherToSell,
                sellToken: otherToken.symbol,
                buyToken: 'CHA',
                currentPrice
            };
        } else {
            // Need to sell CHA
            const chaToSell = chaAmount * (1 - Math.sqrt(referenceChaPrice / currentPrice));
            const otherToReceive = otherAmount * (Math.sqrt(currentPrice / referenceChaPrice) - 1);
            return {
                action: 'sell',
                amount: chaToSell,
                sellAmount: chaToSell,
                sellToken: 'CHA',
                buyToken: otherToken.symbol,
                receiveAmount: otherToReceive,
                currentPrice
            };
        }
    }, [pool, referenceChaPrice]);

    const trade = calculateTrade();

    const handleRebalance = useCallback(() => {
        if (!pool || !stxAddress || !trade) return;

        setIsLoading(true);

        const isChaToken0 = pool.token0.symbol === 'CHA';
        const tokenIn = trade.action === 'buy' ? (isChaToken0 ? pool.token1 : pool.token0) : (isChaToken0 ? pool.token0 : pool.token1);
        const tokenOut = trade.action === 'buy' ? (isChaToken0 ? pool.token0 : pool.token1) : (isChaToken0 ? pool.token1 : pool.token0);

        const amountIn = BigInt(Math.floor(trade.sellAmount * 10 ** tokenIn.decimals));
        const minAmountOut = BigInt(Math.floor((trade.action === 'buy' ? trade.amount : trade.receiveAmount) as any * 0.90 * 10 ** tokenOut.decimals)); // 1% slippage

        const postConditions = [
            // Condition for the token being sent
            Pc.principal(stxAddress)
                .willSendLte(amountIn)
                .ft(tokenIn.contractAddress as any, tokenIn.tokenId as string) as any,
            // Condition for the token being received
            Pc.principal('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.univ2-core')
                .willSendGte(minAmountOut)
                .ft(tokenOut.contractAddress as any, tokenOut.tokenId as string) as any,
        ];

        openContractCall({
            contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
            contractName: "univ2-path2",
            functionName: "do-swap",
            functionArgs: [
                uintCV(amountIn),
                contractPrincipalCV(tokenIn.contractAddress.split('.')[0], tokenIn.contractAddress.split('.')[1]),
                contractPrincipalCV(tokenOut.contractAddress.split('.')[0], tokenOut.contractAddress.split('.')[1]),
                contractPrincipalCV("SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS", "univ2-share-fee-to"),
            ],
            postConditionMode: PostConditionMode.Deny,
            postConditions,
            onFinish: (data) => {
                console.log('Rebalance transaction successful', data);
                setIsLoading(false);
                onClose();
            },
            onCancel: () => {
                console.log('Rebalance transaction cancelled');
                setIsLoading(false);
            },
        });
    }, [pool, stxAddress, trade, openContractCall, onClose]);

    if (!pool || !trade) return null;

    return (
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Rebalance Pool</DialogTitle>
                <DialogDescription>
                    Rebalance the {pool.token0.symbol}/{pool.token1.symbol} pool to match the reference CHA price.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <p>Current CHA Price: ${numeral(trade.currentPrice).format('0,0.0000')}</p>
                <p>Reference CHA Price: ${numeral(referenceChaPrice).format('0,0.0000')}</p>
                <p>Required Action: {trade.action === 'buy' ? 'Buy' : 'Sell'} {numeral(trade.amount).format('0,0.0000')} CHA</p>
                <p className="text-sm text-gray-500">
                    (This will {trade.action === 'buy' ? 'sell' : 'receive'} approximately{' '}
                    {numeral(trade.action === 'buy' ? trade.sellAmount : trade.receiveAmount).format('0,0.0000')}{' '}
                    {trade.action === 'buy' ? trade.sellToken : trade.buyToken})
                </p>
            </div>
            <DialogFooter>
                <Button type="submit" onClick={handleRebalance} disabled={isLoading}>
                    {isLoading ? 'Rebalancing...' : 'Execute Rebalance'}
                </Button>
            </DialogFooter>
        </DialogContent>
    );
};

export default RebalanceDialog;