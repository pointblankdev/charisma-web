import React, { useEffect, useState } from "react";
import { useConnect } from "@stacks/connect-react";
import { StacksMainnet } from "@stacks/network";
import {
  AnchorMode,
  Pc,
  PostConditionMode,
  uintCV,
} from "@stacks/transactions";
import ConnectWallet from "./stacks-session/connect";
import { Button } from "@components/ui/button";
import millify from "millify";
import { useAccount } from "@micro-stacks/react";

const Deposit = ({
  amount,
  stakingContractName,
  contractPrincipal,
  contractToken,
  tokenTicker
}: {
  amount: number,
  stakingContractName: string,
  contractPrincipal: `${string}.${string}`,
  contractToken: string,
  tokenTicker: string
}) => {
  const { doContractCall } = useConnect();
  const { stxAddress } = useAccount();

  function deposit() {
    doContractCall({
      network: new StacksMainnet(),
      anchorMode: AnchorMode.Any,
      contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
      contractName: stakingContractName,
      functionName: "deposit",
      functionArgs: [uintCV(amount * 1000000)],
      postConditionMode: PostConditionMode.Deny,
      postConditions: [
        Pc.principal(stxAddress as string).willSendEq(amount * 1000000).ft(contractPrincipal, contractToken),
      ],
      onFinish: (data) => {
        console.log("onFinish:", data);
      },
      onCancel: () => {
        console.log("onCancel:", "Transaction was canceled");
      },
    });
  }

  return (
    <Button className='text-md w-full hover:bg-[#ffffffee] hover:text-primary' onClick={deposit}>{millify(amount)} {tokenTicker}</Button>
  );
};

export default Deposit;
