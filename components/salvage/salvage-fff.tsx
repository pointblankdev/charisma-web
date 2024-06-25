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

const SalvageIndex = ({ amount }: { amount: number }) => {
  const { doContractCall } = useConnect();

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true) }, []);

  const tokens = Number(amount) * 1000000

  function salvage() {
    const sender = userSession.loadUserData().profile.stxAddress.mainnet
    doContractCall({
      network: new StacksMainnet(),
      anchorMode: AnchorMode.Any,
      contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
      contractName: "feather-fall-fund",
      functionName: "remove-liquidity",
      functionArgs: [uintCV(tokens)],
      postConditionMode: PostConditionMode.Deny,
      postConditions: [
        Pc.principal(sender).willSendEq(tokens).ft("SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.feather-fall-fund-v1", 'fff'),
      ],
      onFinish: (data) => {
        console.log("onFinish:", data);
      },
      onCancel: () => {
        console.log("onCancel:", "Transaction was canceled");
      },
    });
  }

  // function salvage() {
  //   const sender = userSession.loadUserData().profile.stxAddress.mainnet
  //   doContractCall({
  //     network: new StacksMainnet(),
  //     anchorMode: AnchorMode.Any,
  //     contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
  //     contractName: "fenrir-token",
  //     functionName: "salvage",
  //     functionArgs: [uintCV(90000000), principalCV('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS')],
  //     postConditionMode: PostConditionMode.Allow,
  //     postConditions: [
  //       // Pc.principal(sender).willSendEq(amount).ft("SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.fenrir-corgi-of-ragnarok", 'fenrir'),
  //     ],
  //     onFinish: (data) => {
  //       console.log("onFinish:", data);
  //     },
  //     onCancel: () => {
  //       console.log("onCancel:", "Transaction was canceled");
  //     },
  //   });
  // }

  if (!mounted || !userSession.isUserSignedIn()) {
    return <ConnectWallet />;
  }

  return (
    <Button variant="ghost" className='text-primary hover:bg-white hover:text-primary z-30' onClick={salvage}>Remove Liquidity</Button>
  );
};

export default SalvageIndex;
