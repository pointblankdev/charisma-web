// SwapModal.tsx
import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@components/ui/dialog';
import { Button } from '@components/ui/button';
import { Slider } from '@components/ui/slider';
import { ArrowRightLeft, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@components/ui/alert';
import { Pool } from '../pool-helpers';
import useWallet from '@lib/hooks/wallet-balance-provider';
import { TokenDisplay, BalanceInfo } from '../dexterity-controls';

interface SwapModalProps {
  pool: Pool;
  tokenPrices: Record<string, number>;
  onSwap: (isSwap0: boolean, swapAmount: number) => void;
  isToken0: boolean;
  trigger: React.ReactNode;
}

export const SwapModal: React.FC<SwapModalProps> = ({
  pool,
  tokenPrices,
  onSwap,
  isToken0,
  trigger
}) => {
  const [amount, setAmount] = useState(50);
  const { getBalance } = useWallet();

  const inToken = isToken0 ? pool.token1 : pool.token0;
  const outToken = isToken0 ? pool.token0 : pool.token1;

  const maxAmount = useMemo(() => {
    const balance = getBalance(inToken.contractId) || 0;
    return (balance / 10 ** inToken.metadata.decimals) * tokenPrices[inToken.contractId] * 0.99;
  }, [inToken, tokenPrices, getBalance]);

  const swapAmount = useMemo(() => {
    const baseAmount = Math.min(amount, maxAmount);
    return (baseAmount / tokenPrices[inToken.contractId]) * 10 ** inToken.metadata.decimals;
  }, [amount, maxAmount, inToken, tokenPrices]);

  const isMaxed = amount >= maxAmount;

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Buy {outToken.metadata.symbol}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {isMaxed && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                Amount limited by your {inToken.metadata.symbol} balance
              </AlertDescription>
            </Alert>
          )}
          <div className="space-y-4">
            <TokenDisplay
              amount={swapAmount / 10 ** inToken.metadata.decimals}
              symbol={inToken.metadata.symbol}
              imgSrc={inToken.metadata.image}
              label="You pay"
            />
            <div className="flex justify-center">
              <ArrowRightLeft className="text-muted-foreground" />
            </div>
            <TokenDisplay
              amount={(swapAmount * 0.995) / 10 ** outToken.metadata.decimals}
              symbol={outToken.metadata.symbol}
              imgSrc={outToken.metadata.image}
              label="You receive (estimated)"
            />
            <BalanceInfo
              balance={getBalance(inToken.contractId) || 0}
              symbol={inToken.metadata.symbol}
              price={tokenPrices[inToken.contractId]}
              decimals={inToken.metadata.decimals}
              required={swapAmount}
            />
          </div>
          <Slider
            value={[amount]}
            onValueChange={([val]) => setAmount(val)}
            max={Math.min(100, maxAmount * 1.2)}
            step={0.001}
            className="my-4"
          />
          <Button
            className="w-full"
            onClick={() => onSwap(isToken0, swapAmount)}
            disabled={isMaxed}
          >
            Swap
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
