import React, { useEffect, useState } from "react";
import { useConnect } from "@stacks/connect-react";
import { StacksMainnet } from "@stacks/network";
import {
  AnchorMode,
  PostConditionMode,
  principalCV,
  Pc,
  makeStandardFungiblePostCondition,
  FungibleConditionCode
} from "@stacks/transactions";
import { Button } from "@components/ui/button";
import { useAccount, useOpenContractCall } from "@micro-stacks/react";
import { contractPrincipalCV } from 'micro-stacks/clarity';

type Props = {
  proposalPrincipal: string;
};

const ReclaimVotes = ({ proposalPrincipal }: Props) => {
  const proposal = proposalPrincipal.split('.')

  const { openContractCall } = useOpenContractCall();
  const { stxAddress } = useAccount();

  if (!stxAddress) {
    return null;
  }

  const burnTokenContract = 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme000-governance-token::charisma-locked'

  const postConditions = [
    makeStandardFungiblePostCondition(stxAddress, FungibleConditionCode.GreaterEqual, '1000000', burnTokenContract),
  ];

  function reclaimVotes() {
    openContractCall({
      contractAddress: "SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ",
      contractName: "dme001-proposal-voting",
      functionName: "reclaim-votes",
      functionArgs: [contractPrincipalCV(proposal[0], proposal[1])],
      postConditions: postConditions as any[],
      onFinish: (data) => {
        console.log("onFinish:", data);
      },
      onCancel: () => {
        console.log("onCancel:", "Transaction was canceled");
      },
    });
  }

  return (
    <Button variant="ghost" onClick={reclaimVotes}>
      Reclaim
    </Button>
  );
};

export default ReclaimVotes;
