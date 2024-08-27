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

  const tokens6Dec = Math.floor(Math.abs(Number(tokens)));

  console.log(tokens6Dec)

  const tokenContract = `${contractAddress}.${contractName}::${fungibleTokenName}`

  if (!stxAddress) {
    return <Button disabled variant="ghost" className='text-primary text-md hover:bg-white hover:text-primary z-30'>Sign in to Unstake</Button>;
  }

  const postConditions = stxAddress ? [
    makeStandardFungiblePostCondition(stxAddress, FungibleConditionCode.Equal, tokens6Dec, tokenContract),
    // makeStandardFungiblePostCondition(`${contractAddress}.${contractName}`, FungibleConditionCode.GreaterEqual, (tokens6Dec / exchangeRate).toFixed(0), `${baseTokenContractAddress}.${baseTokenContractName}::${baseFungibleTokenName}`),
  ] : []
  

  function unstake() {
    openContractCall({
      contractAddress: contractAddress,
      contractName: contractName,
      functionName: "unstake",
      functionArgs: [uintCV(tokens6Dec)],
      postConditions: postConditions as any[],
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
