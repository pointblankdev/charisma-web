import React, { useEffect, useState } from "react";
import { useConnect } from "@stacks/connect-react";
import { StacksMainnet } from "@stacks/network";
import {
  AnchorMode,
  PostConditionMode,
} from "@stacks/transactions";
import ConnectWallet, { userSession } from "../stacks-session/connect";
import { Button } from "@components/ui/button";
import { newWallet } from "@lib/user-api";
import millify from "millify";

const ClaimFaucetButton = ({ tokensToClaim }: { tokensToClaim: number }) => {
  const { doContractCall } = useConnect();

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true) }, []);

  function claim() {
    try {
      const profile = userSession.loadUserData().profile
      newWallet({ wallet: profile })
    } catch (error) {
      console.error(error)
    }
    doContractCall({
      network: new StacksMainnet(),
      anchorMode: AnchorMode.Any,
      contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
      contractName: "the-green-room",
      functionName: "claim",
      functionArgs: [],
      postConditionMode: PostConditionMode.Deny,
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
    <Button disabled={tokensToClaim === 0} className='text-md w-full hover:bg-[#ffffffee] hover:text-primary' onClick={claim}>Claim {millify(tokensToClaim)} CHA tokens</Button>
  );
};

export default ClaimFaucetButton;
