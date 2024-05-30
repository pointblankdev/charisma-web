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

interface UnstakeButtonProps {
  tokens: string;
}

const UnstakeButton: React.FC<UnstakeButtonProps> = ({ tokens }) => {
  const { doContractCall } = useConnect();

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true) }, []);

  const tokens6Dec = Number(tokens) * 1000000

  function unstake() {
    const sender = userSession.loadUserData().profile.stxAddress.mainnet;
    doContractCall({
      network: new StacksMainnet(),
      anchorMode: AnchorMode.Any,
      contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
      contractName: "liquid-staked-babywelsh",
      functionName: "unstake",
      functionArgs: [uintCV(tokens6Dec)],
      postConditionMode: PostConditionMode.Allow,
      postConditions: [
        // Pc.principal(sender)
        //   .willSendEq(tokens6Dec)
        //   .ft(
        //     "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-babywelsh",
        //     "liquid-staked-token"
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
      variant={'ghost'}
      className='text-md w-full hover:bg-[#ffffffee] hover:text-primary'
      onClick={unstake}
      disabled={tokens6Dec <= 0}>
      Unstake {tokens && tokens6Dec > 0 ? millify(Number(tokens)) : 0} sBABYWELSH
    </Button>
  );
};

export default UnstakeButton;
