import React, { useEffect, useState } from "react";
import { useConnect } from "@stacks/connect-react";
import { StacksMainnet } from "@stacks/network";
import {
  AnchorMode,
  PostConditionMode,
  uintCV,
  boolCV,
  principalCV,
  Pc
} from "@stacks/transactions";
import { DropdownMenuItem } from "@components/ui/dropdown-menu";
import { userSession } from "@components/stacks-session/connect";

const ContractCallVote = ({ proposalPrincipal }: any) => {
  const { doContractCall } = useConnect();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  function vote(pick: boolean) {
    const sender = userSession.loadUserData().profile.stxAddress.mainnet
    console.log(sender)
    doContractCall({
      network: new StacksMainnet(),
      anchorMode: AnchorMode.Any,
      contractAddress: "SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ",
      contractName: "dme001-proposal-voting",
      functionName: "vote",
      functionArgs: [uintCV(1000000), boolCV(pick), principalCV(proposalPrincipal)],
      postConditionMode: PostConditionMode.Deny,
      postConditions: [Pc.principal(sender).willSendEq(1000000).ft("SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme000-governance-token", 'charisma')],
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
    <>
      <DropdownMenuItem
        className="cursor-pointer"
        onClick={() => vote(true)}
      >
        Yes 👍
      </DropdownMenuItem>
      <DropdownMenuItem
        className="cursor-pointer"
        onClick={() => vote(false)}
      >
        No 👎
      </DropdownMenuItem>
    </>
  );
};

export default ContractCallVote;
