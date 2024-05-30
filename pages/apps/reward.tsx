
import { SkipNavContent } from '@reach/skip-nav';
import React, { useEffect, useState } from "react";
import { useConnect } from "@stacks/connect-react";
import { StacksMainnet } from "@stacks/network";
import {
  AnchorMode,
  PostConditionMode,
  principalCV,
  uintCV,
} from "@stacks/transactions";
import { Button } from "@components/ui/button";
import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import Layout from '@components/layout';
import { Card } from '@components/ui/card';
import ConnectWallet, { userSession } from '@components/stacks-session/connect';

export default function App() {
  const meta = {
    title: 'Charisma | Reward',
    description: META_DESCRIPTION,
  };

  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <div className="m-2 sm:container sm:mx-auto sm:py-10 md:max-w-2xl">

          <Card className='p-0 overflow-hidden bg-black text-primary-foreground border-accent-foreground rounded-xl'>
            <div className='m-2'>
              <div className='space-y-1'>
                <Reward />
              </div>
            </div>
          </Card>
        </div>
      </Layout>
    </Page>
  );
}

const Reward = () => {
  const { doContractCall } = useConnect();

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true) }, []);

  function reward() {
    doContractCall({
      network: new StacksMainnet(),
      anchorMode: AnchorMode.Any,
      contractAddress: "SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ",
      contractName: 'bitgear-genesis',
      functionName: "reward",
      functionArgs: [uintCV(2650000000), principalCV('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS')],
      postConditionMode: PostConditionMode.Allow,
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
    <Button className='text-md w-full hover:bg-[#ffffffee] hover:text-primary' onClick={reward}>Reward</Button>
  );
};