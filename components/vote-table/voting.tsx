import React, { useEffect, useState } from "react";
import { StacksMainnet } from "@stacks/network";
import {
  PostConditionMode,
  makeStandardFungiblePostCondition,
  FungibleConditionCode
} from "@stacks/transactions";
import { DropdownMenuItem } from "@components/ui/dropdown-menu";
import { useAccount, useOpenContractCall } from "@micro-stacks/react";
import { uintCV, boolCV, contractPrincipalCV } from 'micro-stacks/clarity';

const ContractCallVote = ({ proposalPrincipal }: any) => {

  const { openContractCall } = useOpenContractCall();
  const { stxAddress } = useAccount();

  function vote(pick: boolean) {

    const tokenContract = 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme000-governance-token::charisma'

    const postConditions = [
      makeStandardFungiblePostCondition(stxAddress!, FungibleConditionCode.Equal, '1000000', tokenContract),
    ];

    openContractCall({
      contractAddress: "SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ",
      contractName: "dme001-proposal-voting",
      functionName: "vote",
      functionArgs: [uintCV(1000000), boolCV(pick), contractPrincipalCV(proposalPrincipal)],
      postConditions: postConditions as any[],
    });
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
