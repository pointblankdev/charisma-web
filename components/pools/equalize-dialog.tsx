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

type EqualizeDialogProps = {
    pool: PoolInfo | null;
    onClose: () => void;
};

const EqualizeDialog: React.FC<EqualizeDialogProps> = ({ pool, onClose }) => {
    const [isLoading, setIsLoading] = useState(false);
    const { openContractCall } = useOpenContractCall();
    const { stxAddress } = useAccount();

    const calculateEqualizeTrade = useCallback(() => {
        if (!pool) return null;

        const baseToken = pool.token0.symbol.startsWith('iou') ? pool.token1 : pool.token0;
        const iouToken = pool.token0.symbol.startsWith('iou') ? pool.token0 : pool.token1;

        const baseReserve = baseToken === pool.token0 ? pool.reserves.token0 : pool.reserves.token1;
        const iouReserve = iouToken === pool.token0 ? pool.reserves.token0 : pool.reserves.token1;

        const baseAmount = baseReserve / 10 ** baseToken.decimals;
        const iouAmount = iouReserve / 10 ** iouToken.decimals;

        const totalValue = baseAmount * baseToken.price + iouAmount * iouToken.price;
        const targetValue = totalValue / 2;

        const targetIouAmount = targetValue / iouToken.price;
        const iouToBuy = targetIouAmount - iouAmount;

        return {
            buyToken: iouToken.symbol,
            buyAmount: Math.abs(iouToBuy),
            sellToken: baseToken.symbol,
            sellAmount: Math.abs(iouToBuy * (iouToken.price / baseToken.price)),
        };
    }, [pool]);

    const trade = calculateEqualizeTrade();

    const handleEqualize = useCallback(() => {
        if (!pool || !stxAddress || !trade) return;

        setIsLoading(true);

        const sellToken = pool.token0.symbol === trade.sellToken ? pool.token0 : pool.token1;
        const buyToken = pool.token0.symbol === trade.buyToken ? pool.token0 : pool.token1;

        const sellAmount = BigInt(Math.floor(trade.sellAmount * 0.9 * 10 ** sellToken.decimals));
        const minBuyAmount = BigInt(Math.floor(trade.buyAmount * 0.8 * 10 ** buyToken.decimals)); // 1% slippage tolerance

        const postConditions = [
            // Condition for the token being sent
            Pc.principal(stxAddress)
                .willSendLte(sellAmount)
                .ft(sellToken.contractAddress as any, sellToken.tokenId as string) as any,
            // Condition for the token being received from univ2-core
            Pc.principal('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.univ2-core')
                .willSendGte(minBuyAmount)
                .ft(buyToken.contractAddress as any, buyToken.tokenId as string) as any,
        ];

        openContractCall({
            contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
            contractName: "univ2-path2",
            functionName: "do-swap",
            functionArgs: [
                uintCV(sellAmount),
                contractPrincipalCV(sellToken.contractAddress.split('.')[0], sellToken.contractAddress.split('.')[1]),
                contractPrincipalCV(buyToken.contractAddress.split('.')[0], buyToken.contractAddress.split('.')[1]),
                contractPrincipalCV("SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS", "univ2-share-fee-to"),
            ],
            postConditionMode: PostConditionMode.Deny,
            postConditions,
            onFinish: (data) => {
                console.log('Equalize transaction successful', data);
                setIsLoading(false);
                onClose();
            },
            onCancel: () => {
                console.log('Equalize transaction cancelled');
                setIsLoading(false);
            },
        });
    }, [pool, stxAddress, trade, openContractCall, onClose]);

    if (!pool || !trade) return null;

    return (
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Equalize Pool</DialogTitle>
                <DialogDescription>
                    Equalize the {pool.token0.symbol}/{pool.token1.symbol} pool to a 50/50 ratio.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <p>Current Ratio: {numeral(pool.reserves.token0 / pool.reserves.token1).format('0,0.0000')}</p>
                <p>Required Action: Buy {numeral(trade.buyAmount).format('0,0.0000')} {trade.buyToken}</p>
                <p className="text-sm text-gray-500">
                    (This will sell approximately {numeral(trade.sellAmount).format('0,0.0000')} {trade.sellToken})
                </p>
            </div>
            <DialogFooter>
                <Button type="submit" onClick={handleEqualize} disabled={isLoading}>
                    {isLoading ? 'Equalizing...' : 'Execute Equalize'}
                </Button>
            </DialogFooter>
        </DialogContent>
    );
};

export default EqualizeDialog;