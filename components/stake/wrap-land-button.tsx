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

interface StakeButtonProps {
  tokens: number;
  contractAddress: `${string}.${string}`;
  baseTokenContractAddress: `${string}.${string}`;
  baseFungibleTokenName: string;
}

const WrapLandButton: React.FC<StakeButtonProps> = ({
  tokens,
  contractAddress,
  baseTokenContractAddress,
  baseFungibleTokenName,
}) => {
  const { doContractCall } = useConnect();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const tokens6Dec = Number(tokens)


  function stake() {
    const sender = userSession.loadUserData().profile.stxAddress.mainnet;
    const isUsingBurnToken = baseTokenContractAddress === 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-charisma'
    const postConditions = [Pc.principal(sender).willSendEq(tokens6Dec + (isUsingBurnToken ? 1000000 : 0)).ft(baseTokenContractAddress, baseFungibleTokenName)]
    if (!isUsingBurnToken) postConditions.push(Pc.principal(sender).willSendEq(1000000).ft('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-charisma', 'liquid-staked-token'))
    doContractCall({
      network: new StacksMainnet(),
      anchorMode: AnchorMode.Any,
      contractAddress: contractAddress.split('.')[0],
      contractName: contractAddress.split('.')[1],
      functionName: "wrap",
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
      onClick={stake}
    >
      Stake
    </Button>
  );
};

export default WrapLandButton;
