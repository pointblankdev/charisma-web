import React, { useEffect, useState } from "react";
import { useConnect } from "@stacks/connect-react";
import { StacksMainnet } from "@stacks/network";
import {
  AnchorMode,
  PostConditionMode,
  principalCV,
  Pc
} from "@stacks/transactions";
import { userSession } from "@components/stacks-session/connect";
import { Button } from "@components/ui/button";

type Props = {
  proposalPrincipal: string;
};

const ReclaimVotes = ({ proposalPrincipal }: Props) => {
  const { doContractCall } = useConnect();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  function reclaimVotes() {
    const sender = userSession.loadUserData().profile.stxAddress.mainnet
    console.log(sender)
    doContractCall({
      network: new StacksMainnet(),
      anchorMode: AnchorMode.Any,
      contractAddress: "SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ",
      contractName: "dme001-proposal-voting",
      functionName: "reclaim-votes",
      functionArgs: [principalCV(proposalPrincipal)],
      postConditionMode: PostConditionMode.Deny,
      postConditions: [Pc.principal(sender).willSendEq(1).ft("SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme000-governance-token", 'charisma-locked')],
      onFinish: (data) => {
        console.log("onFinish:", data);
      },
      onCancel: () => {
        console.log("onCancel:", "Transaction was canceled");
      },
    });
  }

  if (!mounted || !userSession.isUserSignedIn()) {
    return null;
  }

  return (
    <Button variant="ghost" onClick={reclaimVotes}>
      Reclaim
    </Button>
  );
};

export default ReclaimVotes;
