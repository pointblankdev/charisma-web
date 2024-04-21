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

const Deposit = ({ amount }: { amount: number }) => {
  const { doContractCall } = useConnect();

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true) }, []);

  function deposit() {
    const sender = userSession.loadUserData().profile.stxAddress.mainnet
    doContractCall({
      network: new StacksMainnet(),
      anchorMode: AnchorMode.Any,
      contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
      contractName: "liquid-staked-welsh",
      functionName: "deposit",
      functionArgs: [uintCV(amount * 1000000)],
      postConditionMode: PostConditionMode.Deny,
      postConditions: [
        Pc.principal(sender).willSendEq(amount * 1000000).ft("SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token", 'welshcorgicoin'),
      ],
      onFinish: (data) => {
        console.log("onFinish:", data);
        (window as any)
          .open(
            `https://explorer.hiro.so/txid/${data.txId}?chain=mainnet`,
            "_blank"
          )
          .focus();
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
    <Button disabled className='text-md w-full hover:bg-[#ffffffee] hover:text-primary' onClick={deposit}>{amount} WELSH</Button>
  );
};

export default Deposit;
