import React, { useEffect, useState } from "react";
import { useConnect } from "@stacks/connect-react";
import { StacksMainnet } from "@stacks/network";
import {
  AnchorMode,
  Pc,
  PostConditionMode,
  principalCV,
  tupleCV,
} from "@stacks/transactions";
import { Button } from "@components/ui/button";
import { useAccount, useAuth, useOpenContractCall } from "@micro-stacks/react";
import { uintCV, contractPrincipalCV } from 'micro-stacks/clarity';
import { makeStandardFungiblePostCondition, FungibleConditionCode } from '@stacks/transactions';
import { useToast } from "@components/ui/use-toast";

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
  const { toast } = useToast()

  const tokens6Dec = Number(tokens)

  const landsContract = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.lands'
  const landsAsset = 'lands'
  const burnTokenContract = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-charisma'
  const burnTokenAsset = 'liquid-staked-token'
  const landNftKey = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.lands::land'

  function unstake() {
    const tokensOut = tokens6Dec
    const postConditions = [
      Pc.principal(stxAddress!).willSendEq(tokens6Dec).ft(landsContract, landsAsset),
      Pc.principal(landsContract).willSendEq(tokensOut).ft(metadata.wraps.ca, metadata.wraps.asset),
      Pc.principal(stxAddress!).willSendGte(1).ft(burnTokenContract, burnTokenAsset),
      // Pc.principal(stxAddress!).willSendAsset().nft(landNftKey, tupleCV({ 'land-id': uintCV(metadata.id), owner: principalCV(stxAddress!) }))
    ]
    openContractCall({
      contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
      contractName: 'land-helper-v2',
      functionName: "unwrap",
      functionArgs: [uintCV(tokens6Dec), contractPrincipalCV(metadata.wraps.ca)],
      postConditions: postConditions as any[],
      onCancel: () => {
        toast({
          title: "Transaction Canceled",
          description: 'You canceled the transaction.',
        })
      },
      onFinish: (result) => {
        toast({
          title: "Transaction Broadcasted",
          description: result.txId,
        })
      }
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
