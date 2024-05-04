import React, { useEffect, useState } from "react";
import { useConnect } from "@stacks/connect-react";
import { StacksMainnet } from "@stacks/network";
import {
  AnchorMode,
  Pc,
  PostConditionMode,
  noneCV,
  principalCV,
  uintCV,
} from "@stacks/transactions";
import ConnectWallet, { userSession } from "./stacks-session/connect";
import { Button } from "@components/ui/button";

const MicroDeposit = () => {
  const { doContractCall } = useConnect();

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true) }, []);

  function deposit() {
    doContractCall({
      network: new StacksMainnet(),
      anchorMode: AnchorMode.Any,
      contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
      contractName: 'liquid-staked-roo-v2',
      functionName: "transfer",
      functionArgs: [uintCV(1), principalCV('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS'), principalCV('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.woo-meme-world-champion'), noneCV()],
      postConditionMode: PostConditionMode.Allow,
      postConditions: [],
      onFinish: (data) => {
        console.log("onFinish:", data);
      },
      onCancel: () => {
        console.log("onCancel:", "Transaction was canceled");
      },
    });
  }

  if (!mounted || !userSession.isUserSignedIn()) {
    return <ConnectWallet />;
  }

  return (
    <Button className='text-md w-full hover:bg-[#ffffffee] hover:text-primary' onClick={deposit}>Micro-Deposit</Button>
  );
};

export default MicroDeposit;
