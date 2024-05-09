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
import ConnectWallet, { userSession } from "../stacks-session/connect";
import { Button } from "@components/ui/button";

const SwapFenrirForStx = ({ amountFenrir }: { amountFenrir: number }) => {
  const { doContractCall } = useConnect();

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true) }, []);


  function swap() {
    const sender = userSession.loadUserData().profile.stxAddress.mainnet
    doContractCall({
      network: new StacksMainnet(),
      anchorMode: AnchorMode.Any,
      contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
      contractName: "swap-wrapper-v3",
      functionName: "swap-fenrir-for-stx",
      functionArgs: [uintCV(amountFenrir)],
      postConditionMode: PostConditionMode.Allow,
      postConditions: [
        // Pc.principal(sender).willSendEq(amountFenrir).ft("SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.fenrir-corgi-of-ragnarok", 'fenrir'),
      ],
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
    <Button disabled variant="ghost" className='text-primary hover:bg-white hover:text-primary z-30' onClick={swap}>Swap</Button>
  );
};

export default SwapFenrirForStx;
