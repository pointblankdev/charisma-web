import React, { useEffect, useState } from "react";
import { useConnect } from "@stacks/connect-react";
import { StacksMainnet } from "@stacks/network";
import {
  AnchorMode,
  PostConditionMode,
  principalCV,
  Pc
} from "@stacks/transactions";
import { Button } from "@components/ui/button";
import { useOpenContractCall } from "@micro-stacks/react";
import { uintCV, contractPrincipalCV } from 'micro-stacks/clarity';
type Props = {
  proposalPrincipal: string;
};

const Conclude = ({ proposalPrincipal }: Props) => {
  const proposal = proposalPrincipal.split('.')

  const { openContractCall } = useOpenContractCall();

  const [mounted, setMounted] = useState(false);

  function conclude() {
    openContractCall({
      contractAddress: "SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ",
      contractName: "dme001-proposal-voting",
      functionName: "conclude",
      functionArgs: [contractPrincipalCV(proposal[0], proposal[1])],
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

  return (
    <Button variant="ghost" onClick={conclude}>
      Conclude
    </Button>
  );
};

export default Conclude;
