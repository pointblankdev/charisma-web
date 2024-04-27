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

  function craft() {
    const sender = userSession.loadUserData().profile.stxAddress.mainnet
    doContractCall({
      network: new StacksMainnet(),
      anchorMode: AnchorMode.Any,
      contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
      contractName: "dme021-wooo-token",
      functionName: "craft",
      functionArgs: [uintCV(amount), principalCV(sender)],
      postConditionMode: PostConditionMode.Deny,
      postConditions: [
        // unstake
        Pc.principal("SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-welsh").willSendLte(amount * 100).ft(sender, 'welshcorgicoin'),
        Pc.principal("SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-roo").willSendLte(amount * 0.42).ft(sender, 'kangaroo'),
        // deposit
        Pc.principal(sender).willSendLte(amount * 100).ft("SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token", 'welshcorgicoin'),
        Pc.principal(sender).willSendLte(amount * 0.42).ft("SP2C1WREHGM75C7TGFAEJPFKTFTEGZKF6DFT6E2GE.kangaroo", 'kangaroo'),
        // craft
        Pc.principal(sender).willSendLte(amount * 10000).ft("SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-welsh", 'liquid-staked-welsh'),
        Pc.principal(sender).willSendLte(amount * 42).ft("SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-roo", 'liquid-staked-roo'),
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
    // <Button className='text-md w-full hover:bg-[#ffffffee] hover:text-primary' onClick={craft}>Craft {(amount / 10000)} WOOO</Button>
    <Button className='text-md w-full hover:bg-[#ffffffee] hover:text-primary' onClick={craft}>🔨 Craft</Button>
  );
};

export default CraftWoo;
