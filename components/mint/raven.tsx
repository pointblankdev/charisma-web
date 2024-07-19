import React, { useEffect, useState } from "react";
import { useConnect } from "@stacks/connect-react";
import { StacksMainnet } from "@stacks/network";
import {
    AnchorMode,
    PostConditionMode,
    principalCV,
} from "@stacks/transactions";
import ConnectWallet, { userSession } from "../stacks-session/connect";
import { Button } from "@components/ui/button";

const MintRaven = () => {
    const { doContractCall } = useConnect();

    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true) }, []);

    function mint() {
        doContractCall({
            network: new StacksMainnet(),
            anchorMode: AnchorMode.Any,
            contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
            contractName: "odins-raven",
            functionName: "mint",
            functionArgs: [principalCV('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.fenrir-corgi-of-ragnarok')],
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
        <Button disabled variant="ghost" className='text-primary hover:bg-white hover:text-primary z-30' onClick={mint}>Minted Out</Button>
    );
};

export default MintRaven;
