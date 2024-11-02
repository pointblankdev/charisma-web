import React from 'react';
import { useConnect } from '@stacks/connect-react';
import { AnchorMode, Pc, PostConditionMode, uintCV } from '@stacks/transactions';
import { Button } from '@components/ui/button';
import millify from 'millify';
import { useGlobalState } from '@lib/hooks/global-state-context';
import { network } from './stacks-session/connect';

const Deposit = ({
  amount,
  stakingContractName,
  contractPrincipal,
  contractToken,
  tokenTicker
}: {
  amount: number;
  stakingContractName: string;
  contractPrincipal: `${string}.${string}`;
  contractToken: string;
  tokenTicker: string;
}) => {
  const { doContractCall } = useConnect();
  const { stxAddress } = useGlobalState();

  function deposit() {
    doContractCall({
      network: network,
      anchorMode: AnchorMode.Any,
      contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
      contractName: stakingContractName,
      functionName: 'deposit',
      functionArgs: [uintCV(amount * 1000000) as any],
      postConditionMode: PostConditionMode.Deny,
      postConditions: [
        Pc.principal(stxAddress)
          .willSendEq(amount * 1000000)
          .ft(contractPrincipal, contractToken)
      ],
      onFinish: data => {
        console.log('onFinish:', data);
      },
      onCancel: () => {
        console.log('onCancel:', 'Transaction was canceled');
      }
    });
  }

  return (
    <Button className="text-md w-full hover:bg-[#ffffffee] hover:text-primary" onClick={deposit}>
      {millify(amount)} {tokenTicker}
    </Button>
  );
};

export default Deposit;
