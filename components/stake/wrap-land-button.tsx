import React, { useEffect, useState } from "react";
import { useConnect } from "@stacks/connect-react";
import { StacksMainnet } from "@stacks/network";
import {
  AnchorMode,
  Pc,
  PostCondition,
  PostConditionMode,
  principalCV,
  uintCV,
} from "@stacks/transactions";
import ConnectWallet, { userSession } from "../stacks-session/connect";
import { Button } from "@components/ui/button";
import useWallet from "@lib/hooks/use-wallet-balances";

interface StakeButtonProps {
  tokens: number;
  metadata: any;
}

const WrapLandButton: React.FC<StakeButtonProps> = ({
  tokens,
  metadata,
}) => {
  const { doContractCall } = useConnect();
  const { balances } = useWallet()

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const tokens6Dec = Number(tokens)

  const landNftKey = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.lands::land'
  const burnTokenContract = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-charisma'
  const burnTokenAsset = 'liquid-staked-token'

  const hasLands = balances?.non_fungible_tokens?.[landNftKey]

  function stake() {
    const sender = userSession.loadUserData().profile.stxAddress.mainnet;
    const isUsingBurnToken = metadata.wraps.ca === burnTokenContract
    const postConditions: PostCondition[] = [
      Pc.principal(sender).willSendEq(tokens6Dec + (isUsingBurnToken ? 1000000 : 0)).ft(metadata.wraps.ca, metadata.wraps.asset)
    ]
    if (hasLands) postConditions.push(Pc.principal(sender).willSendAsset().nft(landNftKey, uintCV(String(metadata.id))))
    // if (hasLands) postConditions.push(Pc.principal(sender).willNotSendAsset().nft(landNftKey, uintCV(String(metadata.id))))
    if (!isUsingBurnToken) postConditions.push(Pc.principal(sender).willSendEq(1000000).ft(burnTokenContract, burnTokenAsset))
    doContractCall({
      network: new StacksMainnet(),
      anchorMode: AnchorMode.Any,
      contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
      contractName: 'land-helper-v0',
      functionName: "wrap",
      functionArgs: [uintCV(tokens6Dec), principalCV(metadata.wraps.ca)],
      postConditionMode: PostConditionMode.Deny,
      postConditions: postConditions,
      onFinish: (data) => {
        console.log("onFinish:", data);
      },
      onCancel: () => {
        console.log("onCancel:", "Transaction was canceled");
      },
    });
  }

  if (!mounted || !userSession.isUserSignedIn()) {
    return <ConnectWallet />;
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
