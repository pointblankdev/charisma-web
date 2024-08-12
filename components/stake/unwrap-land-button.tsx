import React, { useEffect, useState } from "react";
import { useConnect } from "@stacks/connect-react";
import { StacksMainnet } from "@stacks/network";
import {
  AnchorMode,
  Pc,
  PostConditionMode,
  principalCV,
  uintCV,
} from "@stacks/transactions";
import ConnectWallet, { userSession } from "../stacks-session/connect";
import { Button } from "@components/ui/button";

interface UnstakeButtonProps {
  tokens: number;
  metadata: any;
}

const UnwrapLandButton: React.FC<UnstakeButtonProps> = ({
  tokens,
  metadata
}) => {
  const { doContractCall } = useConnect();

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true) }, []);

  const tokens6Dec = Number(tokens)

  const landsContract = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.lands'
  const landsAsset = 'lands'
  const burnTokenContract = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-charisma'
  const burnTokenAsset = 'liquid-staked-token'

  function unstake() {
    const sender = userSession.loadUserData().profile.stxAddress.mainnet;
    const tokensOut = tokens6Dec
    const postConditions = [
      Pc.principal(sender).willSendEq(tokens6Dec).ft(landsContract, landsAsset),
      Pc.principal(landsContract).willSendEq(tokensOut).ft(metadata.wraps.ca, metadata.wraps.asset),
      Pc.principal(sender).willSendEq(1000000).ft(burnTokenContract, burnTokenAsset)
    ]
    doContractCall({
      network: new StacksMainnet(),
      anchorMode: AnchorMode.Any,
      contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
      contractName: 'land-helper-v0',
      functionName: "unwrap",
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
      onClick={unstake}
    >
      Unstake
    </Button>
  );
};

export default UnwrapLandButton;
