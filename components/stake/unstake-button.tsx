import React, { useEffect, useState } from "react";
import { useConnect } from "@stacks/connect-react";
import { StacksMainnet } from "@stacks/network";
import {
  AnchorMode,
  Pc,
  PostConditionMode,
  uintCV,
} from "@stacks/transactions";
import ConnectWallet, { userSession } from "../stacks-session/connect";
import { Button } from "@components/ui/button";
import millify from "millify";
import { getDecimals, getStakedTokenExchangeRate } from "@lib/stacks-api";

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

const UnstakeButton: React.FC<UnstakeButtonProps> = ({ tokens,
  contractAddress,
  contractName,
  fungibleTokenName,
  baseTokenContractAddress,
  baseTokenContractName,
  baseFungibleTokenName,
  exchangeRate,
}) => {
  const { doContractCall } = useConnect();

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true) }, []);

  const tokens6Dec = Number(tokens)

  function unstake() {
    const sender = userSession.loadUserData().profile.stxAddress.mainnet;
    const tokensOutMin = (tokens6Dec * exchangeRate).toFixed(0)
    doContractCall({
      network: new StacksMainnet(),
      anchorMode: AnchorMode.Any,
      contractAddress: contractAddress,
      contractName: contractName,
      functionName: "unstake",
      functionArgs: [uintCV(tokens6Dec)],
      postConditionMode: PostConditionMode.Deny,
      postConditions: [
        Pc.principal(sender).willSendEq(tokens6Dec).ft(`${contractAddress}.${contractName}`, fungibleTokenName),
        Pc.principal(`${contractAddress}.${contractName}`).willSendGte(tokensOutMin).ft(`${baseTokenContractAddress}.${baseTokenContractName}`, baseFungibleTokenName),
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
      className='text-primary text-md hover:bg-white hover:text-primary z-30'
      onClick={unstake}
    >
      Unstake
    </Button>
  );
};

export default UnstakeButton;
