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

const RemoveLiquidityFromIndex = ({ amount, address, metadata }: { amount: number, address: `${string}.${string}`, metadata: any }) => {
  const { doContractCall } = useConnect();

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true) }, []);

  const [contractAddress, contractName] = address.split('.')

  const tokens = (Number(amount) * 1000000).toFixed(0)

  function salvage() {
    const sender = userSession.loadUserData().profile.stxAddress.mainnet
    doContractCall({
      network: new StacksMainnet(),
      anchorMode: AnchorMode.Any,
      contractAddress,
      contractName,
      functionName: "remove-liquidity",
      functionArgs: [uintCV(tokens)],
      postConditionMode: PostConditionMode.Deny,
      postConditions: [
        Pc.principal(sender).willSendEq(tokens).ft(address, metadata.ft),
        ...metadata.contains.map((item: any) => Pc.principal(address).willSendEq(Number(tokens) * Number(item.weight)).ft(item.address, item.ft))
      ],
      onFinish: (data) => { console.log("onFinish:", data) },
      onCancel: () => { console.log("onCancel:", "Transaction was canceled") },
    });
  }

  if (!mounted || !userSession.isUserSignedIn()) {
    return <ConnectWallet />;
  }

  return (
    <Button variant="ghost" className='text-primary hover:bg-white hover:text-primary z-30' onClick={salvage}>Remove Liquidity</Button>
  );
};

export default RemoveLiquidityFromIndex;
