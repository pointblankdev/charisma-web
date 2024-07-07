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

const RemoveLiquidityFromIndex = ({ amount, address, metadata, indexWeight }: { amount: number, address: `${string}.${string}`, metadata: any, indexWeight: number }) => {
  const { doContractCall } = useConnect();

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true) }, []);

  const sender = userSession.loadUserData().profile.stxAddress.mainnet;

  const [contractAddress, contractName] = address.split('.');

  const tokens = Math.floor(amount);

  function combinePostConditions(postConditions: any[]) {
    const combined: any = {};

    postConditions.forEach((pc: { principal: any; assetInfo: any; amount: any; }) => {
      const key = `${pc.principal.address.hash160}-${pc.assetInfo.contractName.content}-${pc.assetInfo.assetName.content}`;
      if (combined[key]) {
        combined[key].amount += pc.amount;
      } else {
        combined[key] = { ...pc };
      }
    });

    return Object.values(combined);
  }

  function salvage() {
    const postConditions = [
      Pc.principal(sender).willSendEq(Number(tokens) * Number(indexWeight)).ft(address, metadata.ft),
      ...metadata.contains.map((item: any) => Pc.principal(address).willSendEq(Number(tokens) * Number(item.weight)).ft(item.address, item.ft))
    ]
    const combinedPostConditions: any[] = combinePostConditions(postConditions);

    doContractCall({
      network: new StacksMainnet(),
      anchorMode: AnchorMode.Any,
      contractAddress,
      contractName,
      functionName: "remove-liquidity",
      functionArgs: [uintCV(tokens)],
      postConditionMode: PostConditionMode.Deny,
      postConditions: combinedPostConditions,
      onFinish: (data) => { console.log("onFinish:", data) },
      onCancel: () => { console.log("onCancel:", "Transaction was canceled") },
    });
  }

  if (!mounted || !userSession.isUserSignedIn()) {
    return <ConnectWallet />;
  }

  return (
    <Button disabled={tokens <= 0} variant="ghost" className='text-primary hover:bg-white hover:text-primary z-30' onClick={salvage}>Unwrap</Button>
  );
};

export default RemoveLiquidityFromIndex;
