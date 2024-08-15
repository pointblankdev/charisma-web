import React, { useEffect, useState } from "react";
import { useConnect } from "@stacks/connect-react";
import { StacksMainnet } from "@stacks/network";
import {
    AnchorMode,
    Pc,
    PostConditionMode,
    uintCV,
} from "@stacks/transactions";
import { Button } from "@components/ui/button";
import { useAccount, useOpenContractCall } from "@micro-stacks/react";
import ConnectWallet from "@components/stacks-session/connect";

const AddLiquidityToIndex = ({ amount, address, metadata }: { amount: number, address: `${string}.${string}`, metadata: any }) => {

    const { openContractCall } = useOpenContractCall();

    const { stxAddress } = useAccount()

    const [contractAddress, contractName] = address.split('.');

    const tokens = Math.floor(amount);

    if (!stxAddress) {
        return <ConnectWallet />;
    }

    function combinePostConditions(postConditions: any[]) {
        const combined: any = {};

        postConditions.forEach((pc: { principal: any; assetInfo: any; amount: any; }) => {
            const key = `${pc.principal.address.hash160}-${pc.assetInfo.contractName.content}-${pc.assetInfo.assetName.content}`;
            if (combined[key]) {
                combined[key].amount += pc.amount;
            } else {
                combined[key] = { ...pc };
            }
        });

        return Object.values(combined);
    }

    function addLiquidity() {
        const postConditions = metadata.contains.map((item: any) => Pc.principal(stxAddress!).willSendLte(Number(tokens) * Number(item.weight)).ft(item.address, item.ft));
        const combinedPostConditions: any[] = combinePostConditions(postConditions);

        openContractCall({
            contractAddress,
            contractName,
            functionName: "add-liquidity",
            functionArgs: [uintCV(tokens)],
            postConditionMode: PostConditionMode.Deny,
            postConditions: combinedPostConditions
        });
    }


    return (
        <Button disabled={tokens <= 0} variant="ghost" className='text-primary hover:bg-white hover:text-primary z-30 w-full' onClick={addLiquidity}>Wrap</Button>
    );
};

export default AddLiquidityToIndex;
