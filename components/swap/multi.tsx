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

const MultiSwap = ({ data, lpConfig }: any) => {
  const { doContractCall } = useConnect();

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true) }, []);

  const amountIn = Number(data.steps[0].fromAmount * 1000000)

  let ft = ''
  let sendingContract = ''
  const contractAddress = data.steps[0].fromToken
  const firstAction = data.steps[0].action
  if (contractAddress === "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wrapped-charisma") {
    ft = 'index-token'

    if (firstAction === 'SWAP') {
      sendingContract = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wrapped-charisma'
    } else {
      sendingContract = 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.univ2-core'
    }
  } else if (contractAddress === "SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token") {
    ft = 'welshcorgicoin'
    sendingContract = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-welsh-v2'
  }

  function swap() {
    const sender = userSession.loadUserData().profile.stxAddress.mainnet
    doContractCall({
      network: new StacksMainnet(),
      anchorMode: AnchorMode.Any,
      contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
      contractName: firstAction === 'SWAP' ? 'wcha-arb-lp-1' : 'wcha-arb-lp-2',
      functionName: "execute-strategy",
      functionArgs: [uintCV(amountIn), uintCV(lpConfig.amount0Desired), uintCV(lpConfig.amount1Desired), uintCV(lpConfig.amount0Min), uintCV(lpConfig.amount1Min)],
      postConditionMode: PostConditionMode.Allow,
      postConditions: [
        // Pc.principal(sender).willSendEq(amountIn).ft(contractAddress, ft),
        // Pc.principal('SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.univ2-core').willSendGte(1).ustx(),
        // Pc.principal(sender).willSendGte(1).ustx(),
        // Pc.principal('SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.univ2-core').willSendGte(amountIn).ft("SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-welsh-v2", 'liquid-staked-token'),
        // Pc.principal(sender).willSendEq(amountIn).ft("SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-welsh-v2", 'liquid-staked-token'),
        // Pc.principal(sendingContract).willSendGte(amountIn).ft(contractAddress, ft),
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
    <Button variant="ghost" className='text-primary hover:bg-white hover:text-primary z-30' onClick={swap}>Execute Strategy</Button>
  );
};

export default MultiSwap;
