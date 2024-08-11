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
  baseTokenContractAddress: `${string}.${string}`;
  baseFungibleTokenName: string;
}

const UnwrapLandButton: React.FC<UnstakeButtonProps> = ({
  tokens,
  baseTokenContractAddress,
  baseFungibleTokenName,
}) => {
  const { doContractCall } = useConnect();

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true) }, []);

  const tokens6Dec = Number(tokens)

  function unstake() {
    const sender = userSession.loadUserData().profile.stxAddress.mainnet;
    const tokensOut = tokens6Dec
    const postConditions = [
      Pc.principal(sender).willSendEq(tokens6Dec).ft('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.lands', 'lands'),
      Pc.principal('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.lands').willSendEq(tokensOut).ft(baseTokenContractAddress, baseFungibleTokenName),
      Pc.principal(sender).willSendEq(1000000).ft('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-charisma', 'liquid-staked-token')
    ]
    doContractCall({
      network: new StacksMainnet(),
      anchorMode: AnchorMode.Any,
      contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
      contractName: 'land-helper-v0',
      functionName: "unwrap",
      functionArgs: [uintCV(tokens6Dec), principalCV(baseTokenContractAddress)],
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
