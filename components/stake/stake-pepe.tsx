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

interface StakeButtonProps {
  tokens: string;
}

const StakeButton: React.FC<StakeButtonProps> = ({ tokens }) => {
  const { doContractCall } = useConnect();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const tokens3Dec = Number(tokens) * 1000

  function stake() {
    const sender = userSession.loadUserData().profile.stxAddress.mainnet;
    doContractCall({
      network: new StacksMainnet(),
      anchorMode: AnchorMode.Any,
      contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
      contractName: "liquid-staked-pepe",
      functionName: "stake",
      functionArgs: [uintCV(tokens3Dec)],
      postConditionMode: PostConditionMode.Deny,
      postConditions: [
        Pc.principal(sender)
          .willSendEq(tokens3Dec)
          .ft(
            "SP1Z92MPDQEWZXW36VX71Q25HKF5K2EPCJ304F275.tokensoft-token-v4k68639zxz",
            "tokensoft-token"
          ),
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
      className="text-md w-full hover:bg-[#ffffffee] hover:text-primary"
      onClick={stake}
      disabled={Number(tokens) <= 0}
    >
      Stake {tokens && Number(tokens) > 0 ? millify(Number(tokens)) : 0} PEPE
    </Button>
  );
};

export default StakeButton;
