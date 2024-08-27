import React from "react";
import {
  FungibleConditionCode,
  makeStandardFungiblePostCondition,
  uintCV,
} from "@stacks/transactions";
import { Button } from "@components/ui/button";
import { useAccount, useOpenContractCall } from "@micro-stacks/react";

interface UnstakeButtonProps {
  tokens: number;
  contractAddress: string;
  contractName: string;
  fungibleTokenName: string;
  baseTokenContractAddress: string;
  baseTokenContractName: string;
  baseFungibleTokenName: string;
  exchangeRate: number;
}

const UnstakeButton: React.FC<UnstakeButtonProps> = ({
  tokens,
  contractAddress,
  contractName,
  fungibleTokenName,
  baseTokenContractAddress,
  baseTokenContractName,
  baseFungibleTokenName,
  exchangeRate,
}) => {

  const { openContractCall } = useOpenContractCall();

  const { stxAddress } = useAccount()

  const tokens6Dec = Number(tokens)

  const tokenContract = `${contractAddress}.${contractName}::${fungibleTokenName}`

  const postConditions: any[] = [];

  if (stxAddress) postConditions.push(makeStandardFungiblePostCondition(stxAddress, FungibleConditionCode.Equal, tokens6Dec, tokenContract))

  function unstake() {
    openContractCall({
      contractAddress: contractAddress,
      contractName: contractName,
      functionName: "unstake",
      functionArgs: [uintCV(tokens6Dec)],
      postConditions: postConditions,
    });
  }

  return (
    <Button
      disabled={tokens <= 0}
      variant="ghost"
      className='text-primary text-md hover:bg-white hover:text-primary z-30'
      onClick={unstake}
    >
      Unstake
    </Button>
  );
};

export default UnstakeButton;
