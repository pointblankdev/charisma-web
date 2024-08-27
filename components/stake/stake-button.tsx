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

  const tokens6Dec = Number(tokens)

  const baseTokenContract = `${baseTokenContractAddress}.${baseTokenContractName}::${baseFungibleTokenName}`

  const postConditions: any[] = [];

  if (stxAddress) postConditions.push(makeStandardFungiblePostCondition(stxAddress, FungibleConditionCode.Equal, tokens6Dec, baseTokenContract))

  function stake() {
    openContractCall({
      contractAddress: contractAddress,
      contractName: contractName,
      functionName: "stake",
      functionArgs: [uintCV(tokens6Dec)],
      postConditions: postConditions
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
