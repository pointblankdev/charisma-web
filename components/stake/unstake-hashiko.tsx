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

interface UnstakeHashikoButtonProps {
  tokens: string;
}

const UnstakeHashikoButton: React.FC<UnstakeHashikoButtonProps> = ({ tokens }) => {
  const { doContractCall } = useConnect();

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true) }, []);

  const tokens0Dec = Number(tokens)

  function unstake() {
    const sender = userSession.loadUserData().profile.stxAddress.mainnet;
    doContractCall({
      network: new StacksMainnet(),
      anchorMode: AnchorMode.Any,
      contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
      contractName: "liquid-staked-hashiko",
      functionName: "unstake",
      functionArgs: [uintCV(tokens0Dec)],
      postConditionMode: PostConditionMode.Allow,
      postConditions: [
        // Pc.principal(sender)
        //   .willSendEq(tokens0Dec)
        //   .ft(
        //     "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-hashiko",
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
      disabled={tokens0Dec <= 0}>
      Unstake {tokens && tokens0Dec > 0 ? millify(Number(tokens)) : 0} sHASHIKO
    </Button>
  );
};

export default UnstakeHashikoButton;
