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

const Conclude = ({ proposalPrincipal }: Props) => {
  const { doContractCall } = useConnect();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  function conclude() {
    doContractCall({
      network: new StacksMainnet(),
      anchorMode: AnchorMode.Any,
      contractAddress: "SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ",
      contractName: "dme001-proposal-voting",
      functionName: "conclude",
      functionArgs: [principalCV(proposalPrincipal)],
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
    return null;
  }

  return (
    <Button variant="ghost" onClick={conclude}>
      Conclude
    </Button>
  );
};

export default Conclude;
