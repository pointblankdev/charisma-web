import React, { useEffect, useState } from "react";
import { useConnect } from "@stacks/connect-react";
import { StacksMainnet } from "@stacks/network";
import {
  AnchorMode,
  PostConditionMode,
} from "@stacks/transactions";
import { userSession } from "../hms/stacks-session/connect";
import Button from "@components/hms/Button";
import { Container, HandIcon, Wallet } from "lucide-react";
import IconLogo from "@components/icons/icon-logo";

const ClaimFaucetButton = () => {
  const { doContractCall } = useConnect();

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true) }, []);

  function claim() {
    doContractCall({
      network: new StacksMainnet(),
      anchorMode: AnchorMode.Any,
      contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
      contractName: "dme005-token-faucet-v0",
      functionName: "claim",
      functionArgs: [],
      postConditionMode: PostConditionMode.Deny,
      postConditions: [],
      onFinish: (data) => {
        console.log("onFinish:", data);
        (window as any)
          .open(
            `https://explorer.hiro.so/txid/${data.txId}?chain=mainnet`,
            "_blank"
          )
          .focus();
      },
      onCancel: () => {
        console.log("onCancel:", "Transaction was canceled");
      },
    });
  }

  if (!mounted || !userSession.isUserSignedIn()) {
    return null;
  }

  return (
    <div className="container mx-auto text-lg">
      <h1 className="text-2xl font-bold mb-4">Charisma Token Faucet </h1>
      <h1 className="text-lg font-bold mb-2">How It Works</h1>

      <p className="mb-8">
        The Charisma Token Faucet is a contract (a piece of blockchain code) that automatically releases ("drips") Charisma tokens over time, a process similar to how a real-world faucet drips water. This process is also known as "token minting". The rate of these drips, i.e., the number of tokens released per Bitcoin block, is called the "drip amount".
      </p>

      <h2 className="text-lg font-bold mb-2">Interacting with the faucet:</h2>

      <ul className="list-disc pl-5 mb-4 text-md space-y-2">
        <li>
          <b>Claim Tokens</b>: As a user, you can claim tokens. The amount you'll receive is determined by multiplying the drip amount by the number of blocks that have passed since the last claim was made. For example, if the drip amount is 2 tokens per block, and 10 blocks have passed since the last claim, you could claim 20 tokens. However, this can only happen if there are enough tokens available in the faucet at that moment.
        </li>
        <li>
          <b>Check Availability</b>: You can check the current drip amount (i.e., how many tokens are released per block) and also see when the last claim was made (this is expressed as a 'block height' - a specific block in the blockchain).
        </li>
      </ul>

      <p className="mb-4">
        Please note that you can't change the drip amount yourself - this is something only the DAO (Decentralized Autonomous Organization) or authorized extensions can do. This measure is in place to ensure that the faucet isn't misused and that the token issuance process remains under control.
      </p>

      <p className="mb-4">
        If you try to claim tokens and there aren't any available, you'll see an error message. No fees are charged when the faucet is empty, and you can always try again the next block.
      </p>

      <p className="mb-4">
        The goal of the Charisma Token Faucet is to maintain a slow, steady and controlled issuance of tokens. It also promotes transparency as all transactions and balances can be publicly tracked on-chain.
      </p>

      <Button className='text-md w-full my-8' onClick={claim}>Claim </Button>
    </div>

  );
};

export default ClaimFaucetButton;
