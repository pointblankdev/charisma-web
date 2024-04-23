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
import { toInteger } from "lodash";

interface UnstakeRooButtonProps {
  tokens: string;
}

const UnstakeRooButton: React.FC<UnstakeRooButtonProps> = ({ tokens }) => {
  const { doContractCall } = useConnect();

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true) }, []);

  const tokens6Dec = Number(tokens) * 1000000

  function unstake() {
    doContractCall({
      network: new StacksMainnet(),
      anchorMode: AnchorMode.Any,
      contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
      contractName: "liquid-staked-welsh",
      functionName: "unstake",
      functionArgs: [uintCV(tokens6Dec)],
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
    <Button
      variant={'ghost'}
      className='text-md w-full hover:bg-[#ffffffee] hover:text-primary'
      onClick={unstake}
      disabled={toInteger(tokens) <= 0}>
      Unstake {tokens && toInteger(tokens) > 0 ? tokens : 0} sWELSH
    </Button>
  );
};

export default UnstakeRooButton;
