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

const CraftWoo = ({ amount }: { amount: number }) => {
  const { doContractCall } = useConnect();

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true) }, []);

  const tokens = Number(amount)

  function craft() {
    const sender = userSession.loadUserData().profile.stxAddress.mainnet
    doContractCall({
      network: new StacksMainnet(),
      anchorMode: AnchorMode.Any,
      contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
      contractName: "fenrir-corgi-of-ragnarok",
      functionName: "craft",
      functionArgs: [uintCV(tokens), principalCV(sender)],
      postConditionMode: PostConditionMode.Deny,
      postConditions: [
        Pc.principal(sender).willSendLte(tokens).ft("SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-welsh-v2", 'liquid-staked-token'),
        Pc.principal(sender).willSendLte(tokens).ft("SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-odin", 'liquid-staked-odin'),
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
    <Button disabled={amount <= 0} variant={'outline'} className='text-md w-full hover:bg-[#ffffffee] hover:text-primary w-20' onClick={craft}>{amount}x</Button>
  );
};

export default CraftWoo;
