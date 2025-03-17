import React, { useState, useMemo } from 'react';
import { Button } from '@components/ui/button';
import { Card, CardContent } from '@components/ui/card';
import { LineChart, ShieldCheck, Wallet } from 'lucide-react';
import Image from 'next/image';
import { uintCV, contractPrincipalCV, PostConditionMode, Pc } from '@stacks/transactions';
import stxLogo from '@public/stx-logo.png';
import chaLogo from '@public/new-charisma-logo-2.png';
import { useGlobal } from '@lib/hooks/global-context';
import { showContractCall } from '@stacks/connect';
import { STACKS_MAINNET } from '@stacks/network';

const OnboardingSwapInterface = ({ data }: any) => {
  const [isLoading, setIsLoading] = useState(false);
  const { stxAddress } = useGlobal();

  // Find the STX/CHA pool
  const stxChaPool = useMemo(
    () => data.pools.find((p: any) => p.contractId.endsWith('.wstx-cha')),
    [data.pools]
  );

  // Calculate estimated CHA output
  const estimatedChaOutput = useMemo(() => {
    if (!stxChaPool) return 0;

    const stxIsToken0 = stxChaPool.token0.metadata.symbol === 'STX';
    const stxReserve = stxIsToken0
      ? stxChaPool.poolData.reserve0 / 10 ** stxChaPool.token0.metadata.decimals
      : stxChaPool.poolData.reserve1 / 10 ** stxChaPool.token1.metadata.decimals;
    const chaReserve = stxIsToken0
      ? stxChaPool.poolData.reserve1 / 10 ** stxChaPool.token1.metadata.decimals
      : stxChaPool.poolData.reserve0 / 10 ** stxChaPool.token0.metadata.decimals;

    const stxAmount = 1;
    const k = stxReserve * chaReserve;
    const newStxReserve = stxReserve + stxAmount;
    const newChaReserve = k / newStxReserve;
    return chaReserve - newChaReserve;
  }, [stxChaPool]);

  const handleFirstSwap = () => {
    if (!stxChaPool) return;
    setIsLoading(true);

    const stxAmount = 1;
    const minChaAmount = BigInt(Math.floor(estimatedChaOutput * 0.99 * 10 ** 6));

    const transaction = {
      network: STACKS_MAINNET,
      contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
      contractName: 'univ2-path2',
      functionName: 'do-swap',
      functionArgs: [
        uintCV(BigInt(stxAmount * 10 ** 6)),
        contractPrincipalCV('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS', 'wstx'),
        contractPrincipalCV('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS', 'charisma-token'),
        contractPrincipalCV('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS', 'univ2-share-fee-to')
      ],
      postConditionMode: PostConditionMode.Deny,
      postConditions: [
        Pc.principal(stxAddress)
          .willSendLte(BigInt(stxAmount * 10 ** 6))
          .ustx(),
        Pc.principal('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.univ2-core')
          .willSendGte(minChaAmount)
          .ft('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token', 'charisma')
      ],
      onFinish: (data: any) => {
        console.log('First swap successful:', data);
        setIsLoading(false);
      },
      onCancel: () => {
        console.log('First swap cancelled');
        setIsLoading(false);
      }
    };

    showContractCall(transaction);
  };

  return (
    <div className="max-w-screen-md px-4 py-8 mx-auto">
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-3xl font-bold text-white">Welcome to Charisma</h1>
        <p className="text-gray-400">Make your first swap to unlock full trading features</p>
      </div>

      <Card className="max-w-screen-sm mx-auto mb-8 bg-accent/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center mb-6 space-x-8">
            <div className="flex flex-col items-center">
              <div className="p-2 border rounded-full bg-accent/10 border-primary/20">
                <Image
                  src={stxLogo}
                  alt="STX"
                  width={48}
                  height={48}
                  className="transition-all rounded-full hover:scale-125"
                />
              </div>
              <div className="mt-2 text-xl font-semibold">1.00 STX</div>
              <div className="text-sm text-gray-400">${(data.prices?.STX || 0).toFixed(2)}</div>
            </div>
            <div className="mb-20 text-5xl text-gray-500 font-extralight animate-pulse">→</div>
            <div className="flex flex-col items-center">
              <div className="p-2 border rounded-full bg-accent/10 border-primary/20">
                <Image
                  src={chaLogo}
                  alt="CHA"
                  width={48}
                  height={48}
                  className="transition-all rounded-full hover:scale-125"
                />
              </div>
              <div className="mt-2 text-xl font-semibold">{estimatedChaOutput.toFixed(2)} CHA</div>
              <div className="text-sm text-gray-400">
                ${(estimatedChaOutput * data.prices?.CHA || 0).toFixed(2)}
              </div>
            </div>
          </div>

          <Button
            className="w-full py-6 text-lg font-bold"
            onClick={handleFirstSwap}
            disabled={isLoading || !stxChaPool}
          >
            {isLoading ? 'Processing...' : 'Make Your First Swap'}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-16">
        {/* AMM Feature */}
        <div className="flex items-center gap-4 px-4 py-6 mt-16 border rounded-lg border-accent-foreground bg-accent-foreground/50">
          <div className="flex items-center justify-center flex-shrink-0 w-20 h-20 p-1 mx-6 rounded-lg bg-primary/10">
            <LineChart className="w-16 h-16 m-4 text-primary" />
          </div>
          <div>
            <h3 className="mb-2 text-xl font-semibold">How AMM Swaps Work</h3>
            <p className="text-gray-400">
              Automated Market Makers (AMMs) use smart contracts to create liquidity pools. When you
              swap STX for CHA, you're trading directly with this pool, getting a fair price based
              on the current ratio of tokens.
            </p>
          </div>
        </div>

        {/* Liquidity Feature */}
        <div className="flex flex-row-reverse items-center gap-4 px-4 py-6 border rounded-lg border-accent-foreground bg-accent-foreground/50">
          <div className="flex items-center justify-center flex-shrink-0 w-20 h-20 p-1 mx-6 rounded-lg bg-primary/10">
            <Wallet className="w-16 h-16 m-4 text-primary" />
          </div>
          <div className="text-right">
            <h3 className="mb-2 text-xl font-semibold">Deposit and Earn</h3>
            <p className="text-gray-400">
              After your first swap, you can provide liquidity to the pool by depositing both STX
              and CHA. You'll earn a share of every swap fee proportional to your contribution.
            </p>
          </div>
        </div>

        {/* Protection Feature */}
        <div className="flex items-center gap-4 px-4 py-6 border rounded-lg border-accent-foreground bg-accent-foreground/50">
          <div className="flex items-center justify-center flex-shrink-0 w-20 h-20 p-1 mx-6 rounded-lg bg-primary/10">
            <ShieldCheck className="w-16 h-16 m-4 text-primary" />
          </div>
          <div>
            <h3 className="mb-2 text-xl font-semibold">Protected Trading</h3>
            <p className="text-gray-400">
              We require users to complete one swap before unlocking advanced features. This
              protects our community from sniper and arbitrage bots– ensuring a better trading
              environment for humans.
            </p>
          </div>
        </div>
      </div>

      {/* Optional: Add this small text at the bottom */}
      <p className="mt-8 text-sm text-center text-gray-500">
        Ready to start trading? Make your first swap above!
      </p>
    </div>
  );
};

export default OnboardingSwapInterface;
