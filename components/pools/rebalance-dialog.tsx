import React, { useState, useCallback, useEffect } from 'react';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@components/ui/dialog';
import { Button } from '@components/ui/button';
import { Slider } from '@components/ui/slider';
import { contractPrincipalCV, Pc, PostConditionMode, uintCV } from '@stacks/transactions';
import numeral from 'numeral';
import useWallet from '@lib/hooks/wallet-balance-provider';
import { useConnect } from '@stacks/connect-react';
import { useGlobalState } from '@lib/hooks/global-state-context';
import { network } from '@components/stacks-session/connect';
import { PoolInfo } from '@lib/server/pools/pool-service';

type RebalanceDialogProps = {
  pool: PoolInfo | null;
  referenceChaPrice: number;
  onClose: () => void;
};

const RebalanceDialog: React.FC<RebalanceDialogProps> = ({ pool, referenceChaPrice, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [sliderValue, setSliderValue] = useState(90);
  const [exceedsBalance, setExceedsBalance] = useState(false);
  const { doContractCall } = useConnect();
  const { stxAddress } = useGlobalState();
  const { getBalanceByKey, balances, getKeyByContractAddress } = useWallet();

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
        sellToken: otherToken,
        buyToken: chaToken,
        currentPrice,
        chaAmount,
        otherAmount
      };
    } else {
      // Need to sell CHA
      const chaToSell = chaAmount * (1 - Math.sqrt(referenceChaPrice / currentPrice));
      const otherToReceive = otherAmount * (Math.sqrt(currentPrice / referenceChaPrice) - 1);
      return {
        action: 'sell',
        amount: chaToSell,
        sellAmount: chaToSell,
        sellToken: chaToken,
        buyToken: otherToken,
        receiveAmount: otherToReceive,
        currentPrice,
        chaAmount,
        otherAmount
      };
    }
  }, [pool, referenceChaPrice]);

  const trade = calculateTrade();

  const calculateSimulatedPrice = useCallback(() => {
    if (!trade) return null;

    const percentageToExecute = sliderValue / 100;
    let newChaAmount, newOtherAmount;

    if (trade.action === 'buy') {
      newChaAmount = trade.chaAmount + trade.amount * percentageToExecute;
      newOtherAmount = trade.otherAmount - trade.sellAmount * percentageToExecute;
    } else {
      newChaAmount = trade.chaAmount - trade.amount * percentageToExecute;
      newOtherAmount = trade.otherAmount + trade.receiveAmount! * percentageToExecute;
    }

    const simulatedPrice = (trade.sellToken.price * newOtherAmount) / newChaAmount;

    // Interpolate between current price and reference price based on slider value
    return trade.currentPrice + (referenceChaPrice - trade.currentPrice) * percentageToExecute;
  }, [trade, sliderValue, referenceChaPrice]);

  const simulatedPrice = calculateSimulatedPrice();

  useEffect(() => {
    if (trade && stxAddress) {
      const tokenToSell = trade.sellToken;
      let balance;
      if (tokenToSell.symbol === 'STX') {
        balance = Number(balances.stx.balance) / 10 ** tokenToSell.decimals;
      } else {
        balance =
          getBalanceByKey(getKeyByContractAddress(tokenToSell.contractAddress)) /
          10 ** tokenToSell.decimals;
      }
      setExceedsBalance(trade.sellAmount * (sliderValue / 100) > balance);
    }
  }, [trade, stxAddress, sliderValue, balances, getBalanceByKey, getKeyByContractAddress]);

  const handleRebalance = useCallback(() => {
    if (!pool || !stxAddress || !trade) return;

    setIsLoading(true);

    const tokenIn = trade.sellToken;
    const tokenOut = trade.buyToken;

    const amountIn = BigInt(
      Math.floor(trade.sellAmount * (sliderValue / 100) * 10 ** tokenIn.decimals)
    );
    const minAmountOut = BigInt(
      Math.floor(
        ((trade.action === 'buy' ? trade.amount : trade.receiveAmount) as any) *
        (sliderValue / 100) *
        0.8 *
        10 ** tokenOut.decimals
      )
    ); // 1% slippage

    const postConditions = [
      Pc.principal(stxAddress)
        .willSendLte(amountIn)
        .ft(tokenIn.contractAddress as any, tokenIn.tokenId as string) as any,
      Pc.principal('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.univ2-core')
        .willSendGte(minAmountOut)
        .ft(tokenOut.contractAddress as any, tokenOut.tokenId as string) as any
    ];

    doContractCall({
      network: network,
      contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
      contractName: 'univ2-path2',
      functionName: 'do-swap',
      functionArgs: [
        uintCV(amountIn),
        contractPrincipalCV(
          tokenIn.contractAddress.split('.')[0],
          tokenIn.contractAddress.split('.')[1]
        ),
        contractPrincipalCV(
          tokenOut.contractAddress.split('.')[0],
          tokenOut.contractAddress.split('.')[1]
        ),
        contractPrincipalCV('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS', 'univ2-share-fee-to')
      ],
      postConditionMode: PostConditionMode.Deny,
      postConditions,
      onFinish: data => {
        console.log('Rebalance transaction successful', data);
        setIsLoading(false);
        onClose();
      },
      onCancel: () => {
        console.log('Rebalance transaction cancelled');
        setIsLoading(false);
      }
    });
  }, [pool, stxAddress, trade, sliderValue, doContractCall, onClose]);

  if (!pool || !trade) return null;

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Rebalance Pool</DialogTitle>
        <DialogDescription>
          Rebalance the {pool.token0.symbol}/{pool.token1.symbol} pool to match the STX-CHA price.
        </DialogDescription>
      </DialogHeader>
      <div className="py-4">
        <p>Current CHA Price: ${numeral(trade.currentPrice).format('0,0.0000')}</p>
        <p>Reference CHA Price: ${numeral(referenceChaPrice).format('0,0.0000')}</p>
        <p>Simulated Target Price: ${numeral(simulatedPrice).format('0,0.0000')}</p>
        <p>
          Required Action: {trade.action === 'buy' ? 'Buy' : 'Sell'}{' '}
          {numeral(trade.amount * (sliderValue / 100)).format('0,0.0000')} CHA
        </p>
        <p className="text-sm text-gray-500">
          (You will {trade.action === 'buy' ? 'sell' : 'receive'} approximately{' '}
          {numeral(
            (trade.action === 'buy' ? trade.sellAmount : trade.receiveAmount ?? 0) *
            (sliderValue / 100)
          ).format('0,0.0000')}{' '}
          {trade.action === 'buy' ? trade.sellToken.symbol : trade.buyToken.symbol})
        </p>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-200">Rebalance Amount (%)</label>
          <Slider
            value={[sliderValue]}
            onValueChange={value => setSliderValue(value[0])}
            max={100}
            step={1}
          />
          <span className="text-sm text-gray-300">{sliderValue}%</span>
        </div>
        {exceedsBalance && (
          <p className="mt-2 text-sm text-red-600">
            Warning: The selected amount exceeds your balance.
          </p>
        )}
      </div>
      <DialogFooter>
        <Button type="submit" onClick={handleRebalance} disabled={isLoading || exceedsBalance}>
          {isLoading ? 'Rebalancing...' : 'Execute Rebalance'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default RebalanceDialog;
