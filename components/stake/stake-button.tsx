import React from "react";
import { useConnect } from "@stacks/connect-react";
import { StacksMainnet } from "@stacks/network";
import {
  AnchorMode,
  FungibleConditionCode,
  makeStandardFungiblePostCondition,
  Pc,
  PostConditionMode,
  uintCV,
} from "@stacks/transactions";
import { Button } from "@components/ui/button";
import { useAccount, useOpenContractCall } from "@micro-stacks/react";

interface StakeButtonProps {
  tokens: number;
  contractAddress: string;
  contractName: string;
  baseTokenContractAddress: string;
  baseTokenContractName: string;
  baseFungibleTokenName: string;
}

const StakeButton: React.FC<StakeButtonProps> = ({
  tokens,
  contractAddress,
  contractName,
  baseTokenContractAddress,
  baseTokenContractName,
  baseFungibleTokenName,
}) => {

  const { openContractCall } = useOpenContractCall();

  const { stxAddress } = useAccount()

  const validTokens = Number(tokens);

  if (isNaN(validTokens) || validTokens <= 0) { // App crashes due to NaaN/undefined token value when using slider
    return null;
  }

  const tokens6Dec = Math.floor(Math.abs(validTokens)); // the token value somehow returns negative value hence the math.abs

  const baseTokenContract = `${baseTokenContractAddress}.${baseTokenContractName}::${baseFungibleTokenName}`

  const postConditions = [
    makeStandardFungiblePostCondition(stxAddress!, FungibleConditionCode.Equal, tokens6Dec, baseTokenContract),
  ];

  function stake() {
    openContractCall({
      contractAddress: contractAddress,
      contractName: contractName,
      functionName: "stake",
      functionArgs: [uintCV(tokens6Dec)],
      postConditions: postConditions as any[]
    });
  }

  return (
    <Button
      disabled={tokens <= 0}
      variant="ghost"
      className='text-primary text-md hover:bg-white hover:text-primary z-30'
      onClick={stake}
    >
      Stake
    </Button>
  );
};

export default StakeButton;
