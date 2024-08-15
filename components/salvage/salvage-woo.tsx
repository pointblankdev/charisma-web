import React, { useEffect, useState } from "react";
import { useConnect } from "@stacks/connect-react";
import { StacksMainnet } from "@stacks/network";
import {
  AnchorMode,
  Pc,
  PostConditionMode,
  principalCV,
  uintCV,
} from "@stacks/transactions";
import { Button } from "@components/ui/button";
import millify from "millify";

const SalvageWoo = ({ amount }: { amount: number }) => {
  const { doContractCall } = useConnect();

  function salvage() {
    const sender = ''
    doContractCall({
      network: new StacksMainnet(),
      anchorMode: AnchorMode.Any,
      contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
      contractName: "dme021-wooo-token",
      functionName: "salvage",
      functionArgs: [uintCV(amount), principalCV(sender)],
      // postConditionMode: PostConditionMode.Deny,
      postConditionMode: PostConditionMode.Allow,
      postConditions: [
        // Pc.principal(sender).willSendLte(amount * 100).ft("SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token", 'welshcorgicoin'),
        // Pc.principal(sender).willSendLte(amount * 0.42).ft("SP2C1WREHGM75C7TGFAEJPFKTFTEGZKF6DFT6E2GE.kangaroo", 'kangaroo'),
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
    <Button disabled={amount <= 0} variant='outline' className='text-md w-full hover:bg-[#ffffffee] hover:text-primary' onClick={salvage}>⛏️ Salvage</Button>
  );
};

export default SalvageWoo;
