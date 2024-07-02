import React, { useEffect, useState } from "react";
import { useConnect } from "@stacks/connect-react";
import { StacksMainnet } from "@stacks/network";
import {
  AnchorMode,
  PostConditionMode,
} from "@stacks/transactions";
import ConnectWallet, { userSession } from "../stacks-session/connect";
import { Button } from "@components/ui/button";
import { newWallet } from "@lib/user-api";
import millify from "millify";
import { getGuestlist } from "@lib/stacks-api";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@components/ui/tooltip";

const ClaimFaucetButton = ({ tokensToClaim }: { tokensToClaim: number }) => {
  const { doContractCall } = useConnect();

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true) }, []);

  // see if the user is on the guestlist
  const signedIn = userSession.isUserSignedIn()
  const [isGuestlisted, setIsGuestlisted] = useState(false)
  useEffect(() => {
    const address: string = userSession.loadUserData().profile.stxAddress.mainnet
    getGuestlist(address).then((isGuest) => {
      setIsGuestlisted(isGuest)
    })
  }, [signedIn])

  function claim() {
    const profile = userSession.loadUserData().profile
    try {
      newWallet({ wallet: profile })
    } catch (error) {
      console.error(error)
    }
    doContractCall({
      network: new StacksMainnet(),
      anchorMode: AnchorMode.Any,
      contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
      contractName: "green-room",
      functionName: "claim",
      functionArgs: [],
      postConditionMode: PostConditionMode.Deny,
      postConditions: [],
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

    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="w-full">
          <Button disabled={tokensToClaim === 0 || !isGuestlisted} className='text-md w-full hover:bg-[#ffffffee] hover:text-primary' onClick={claim}>Claim {millify(tokensToClaim)} CHA tokens</Button>
        </TooltipTrigger>
        <TooltipContent className={`overflow-scroll bg-black text-white border-primary leading-tight shadow-2xl max-w-prose`}>
          <div>Access to this faucet is limited to guestlist members. Guestlists are curated through community voting, ensuring all members contribute meaningfully to the project.</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>

  );
};

export default ClaimFaucetButton;
