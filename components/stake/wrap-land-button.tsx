import React from "react";
import {
  Pc,
  PostCondition,
  PostConditionMode,
  principalCV,
  tupleCV,
} from "@stacks/transactions";
import { Button } from "@components/ui/button";
import { useAccount, useOpenContractCall } from "@micro-stacks/react";
import { uintCV, contractPrincipalCV } from 'micro-stacks/clarity';
import { useToast } from "@components/ui/use-toast";

interface StakeButtonProps {
  tokens: number;
  metadata: any;
  hadLand: boolean;
}

const WrapLandButton: React.FC<StakeButtonProps> = ({
  tokens,
  metadata,
  hadLand
}) => {
  const { openContractCall } = useOpenContractCall();
  const { stxAddress } = useAccount()
  const { toast } = useToast()

  const tokens6Dec = Number(tokens)
  const landNftKey = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.lands::land'
  const burnTokenContract = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-charisma'
  const burnTokenAsset = 'liquid-staked-token'

  function stake() {
    const isUsingBurnToken = metadata.wraps.ca === burnTokenContract
    const postConditions: PostCondition[] = [
      Pc.principal(stxAddress!).willSendGte(tokens6Dec).ft(metadata.wraps.ca, metadata.wraps.asset)
    ]
    if (hadLand) postConditions.push(Pc.principal(stxAddress!).willSendAsset().nft(landNftKey, tupleCV({ 'land-id': uintCV(metadata.id), owner: principalCV(stxAddress!) })))
    if (!isUsingBurnToken) postConditions.push(Pc.principal(stxAddress!).willSendGte(1).ft(burnTokenContract, burnTokenAsset))
    openContractCall({
      contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
      contractName: 'land-helper-v2',
      functionName: "wrap",
      functionArgs: [uintCV(tokens6Dec), contractPrincipalCV(metadata.wraps.ca)],
      postConditionMode: PostConditionMode.Deny,
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
          description: JSON.stringify(result, null, 2),
        })
      }
    });
  }

  return (
    <Button
      disabled={tokens <= 0}
      variant="ghost"
      className='z-30 text-primary text-md hover:bg-white hover:text-primary'
      onClick={stake}
    >
      Stake
    </Button>
  );
};

export default WrapLandButton;
