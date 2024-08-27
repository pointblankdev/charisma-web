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

  if (!stxAddress) {
    return <Button disabled variant="ghost" className='text-primary text-md hover:bg-white hover:text-primary z-30'>Sign in to Unstake</Button>;
  }

  const postConditions = stxAddress ? [
    makeStandardFungiblePostCondition(stxAddress, FungibleConditionCode.Equal, tokens6Dec, baseTokenContract),
    // makeStandardFungiblePostCondition(`${contractAddress}.${contractName}`, FungibleConditionCode.GreaterEqual, (tokens6Dec / exchangeRate).toFixed(0), `${baseTokenContractAddress}.${baseTokenContractName}::${baseFungibleTokenName}`),
  ] : []

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
