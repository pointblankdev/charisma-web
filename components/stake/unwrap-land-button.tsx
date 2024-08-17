import React, { useEffect, useState } from "react";
import { useConnect } from "@stacks/connect-react";
import { StacksMainnet } from "@stacks/network";
import {
  AnchorMode,
  Pc,
  PostConditionMode,
  principalCV,
} from "@stacks/transactions";
import { Button } from "@components/ui/button";
import { useAccount, useAuth, useOpenContractCall } from "@micro-stacks/react";
import { uintCV, contractPrincipalCV } from 'micro-stacks/clarity';
import { makeStandardFungiblePostCondition, FungibleConditionCode } from '@stacks/transactions';

interface UnstakeButtonProps {
  tokens: number;
  metadata: any;
}

const UnwrapLandButton: React.FC<UnstakeButtonProps> = ({
  tokens,
  metadata
}) => {

  const { openContractCall } = useOpenContractCall();

  const { stxAddress } = useAccount();

  const tokens6Dec = Number(tokens)

  const landsContract = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.lands'
  const landsAsset = 'lands'
  const burnTokenContract = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-charisma'
  const burnTokenAsset = 'liquid-staked-token'

  function unstake() {
    const tokensOut = tokens6Dec
    const postConditions = [
      Pc.principal(stxAddress as string).willSendEq(tokens6Dec).ft(landsContract, landsAsset),
      Pc.principal(landsContract).willSendEq(tokensOut).ft(metadata.wraps.ca, metadata.wraps.asset),
      Pc.principal(stxAddress as string).willSendGte(1).ft(burnTokenContract, burnTokenAsset)
    ]
    openContractCall({
      contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
      contractName: 'land-helper-v1',
      functionName: "unwrap",
      functionArgs: [uintCV(tokens6Dec), contractPrincipalCV(metadata.wraps.ca)],
      postConditions: postConditions as any[],
    });
  }

  return (
    <Button
      disabled={tokens <= 0}
      variant="ghost"
      className='z-30 text-primary text-md hover:bg-white hover:text-primary'
      onClick={unstake}
    >
      Unstake
    </Button>
  );
};

export default UnwrapLandButton;
