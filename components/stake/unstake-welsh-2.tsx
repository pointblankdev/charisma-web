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
import { getStakedTokenExchangeRate } from "@lib/stacks-api";

interface UnstakeButtonProps {
  tokens: number;
}

const UnstakeButton: React.FC<UnstakeButtonProps> = ({ tokens }) => {
  const { doContractCall } = useConnect();

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true) }, []);

  useEffect(() => {
    async function fetchExchangeRate() {
      const { value } = await getStakedTokenExchangeRate('liquid-staked-welsh-v2')
      setExchangeRate(value / 1000000)
    }
    fetchExchangeRate()
  }, [])

  const [exchangeRate, setExchangeRate] = useState(0);

  const tokens6Dec = Number(tokens)

  function unstake() {
    const sender = userSession.loadUserData().profile.stxAddress.mainnet;
    const tokensOutMin = (tokens6Dec * exchangeRate).toFixed(0)
    doContractCall({
      network: new StacksMainnet(),
      anchorMode: AnchorMode.Any,
      contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
      contractName: "liquid-staked-welsh-v2",
      functionName: "unstake",
      functionArgs: [uintCV(tokens6Dec)],
      postConditionMode: PostConditionMode.Deny,
      postConditions: [
        Pc.principal(sender).willSendEq(tokens6Dec).ft("SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-welsh-v2", "liquid-staked-token"),
        Pc.principal('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-welsh-v2').willSendGte(tokensOutMin).ft("SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token", 'welshcorgicoin'),
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
      variant={'ghost'}
      className='text-md w-full hover:bg-[#ffffffee] hover:text-primary'
      onClick={unstake}
      disabled={tokens6Dec <= 0}>
      Unstake {(tokens6Dec * exchangeRate / 1000000).toFixed(6)} WELSH
    </Button>
  );
};

export default UnstakeButton;
