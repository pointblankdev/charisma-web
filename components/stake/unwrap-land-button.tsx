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
import millify from "millify";
import { getDecimals, getStakedTokenExchangeRate } from "@lib/stacks-api";

interface UnstakeButtonProps {
  tokens: number;
  contractAddress: `${string}.${string}`;
  fungibleTokenName: string;
  baseTokenContractAddress: `${string}.${string}`;
  baseFungibleTokenName: string;
}

const UnwrapLandButton: React.FC<UnstakeButtonProps> = ({
  tokens,
  contractAddress,
  fungibleTokenName,
  baseTokenContractAddress,
  baseFungibleTokenName,
}) => {
  const { doContractCall } = useConnect();

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true) }, []);

  const tokens6Dec = Number(tokens)

  function unstake() {
    const sender = userSession.loadUserData().profile.stxAddress.mainnet;
    const tokensOutMin = (tokens6Dec).toFixed(0)
    doContractCall({
      network: new StacksMainnet(),
      anchorMode: AnchorMode.Any,
      contractAddress: contractAddress.split('.')[0],
      contractName: contractAddress.split('.')[1],
      functionName: "unwrap",
      functionArgs: [uintCV(tokens6Dec), principalCV(baseTokenContractAddress)],
      postConditionMode: PostConditionMode.Deny,
      postConditions: [
        Pc.principal(sender).willSendEq(tokens6Dec).ft(contractAddress, fungibleTokenName),
        Pc.principal(contractAddress).willSendGte(tokensOutMin).ft(baseTokenContractAddress, baseFungibleTokenName),
        Pc.principal(sender).willSendEq(1000000).ft('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-charisma', 'liquid-staked-token'),
      ],
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
