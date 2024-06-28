import React, { useEffect, useState } from "react";
import { useConnect } from "@stacks/connect-react";
import { StacksMainnet } from "@stacks/network";
import {
  AnchorMode,
  Pc,
  PostConditionMode,
  uintCV,
} from "@stacks/transactions";
import ConnectWallet, { userSession } from "../stacks-session/connect";
import { Button } from "@components/ui/button";
import millify from "millify";

interface UnstakeWelshButtonProps {
  tokens: number;
}

const UnstakeWelshButton: React.FC<UnstakeWelshButtonProps> = ({ tokens }) => {
  const { doContractCall } = useConnect();

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true) }, []);

  const tokens6Dec = Number(tokens)

  function unstake() {
    const sender = userSession.loadUserData().profile.stxAddress.mainnet;
    doContractCall({
      network: new StacksMainnet(),
      anchorMode: AnchorMode.Any,
      contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
      contractName: "liquid-staked-welsh",
      functionName: "unstake",
      functionArgs: [uintCV(tokens6Dec)],
      postConditionMode: PostConditionMode.Allow,
      postConditions: [
        // Pc.principal(sender)
        //   .willSendEq(tokens6Dec)
        //   .ft(
        //     "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-welsh",
        //     "liquid-staked-welsh"
        //   ),
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
    <Button
      className='text-md w-full hover:bg-[#ffffffee] hover:text-primary'
      onClick={unstake}
      disabled={tokens6Dec <= 0}>
      Unstake All
    </Button>
  );
};

export default UnstakeWelshButton;
