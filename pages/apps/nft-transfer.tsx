
import { SkipNavContent } from '@reach/skip-nav';

import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import Layout from '@components/layout';
import { Card } from '@components/ui/card';
import { useEffect, useState } from 'react';
import { StacksMainnet } from "@stacks/network";
import {
  AnchorMode,
  Pc,
  PostConditionMode,
  noneCV,
  principalCV,
  uintCV,
} from "@stacks/transactions";
import ConnectWallet, { userSession } from "@components/stacks-session/connect";
import { Button } from "@components/ui/button";
import { useConnect } from '@stacks/connect-react';
import { Input } from '@components/ui/input';


export default function App() {
  const meta = {
    title: 'Charisma | NFT Transfer',
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
                <Transfer />
              </div>
            </div>
          </Card>
        </div>
      </Layout>
    </Page>
  );
}

// 1 sCHA = 1.071875 CHA

const Transfer = () => {
  const { doContractCall } = useConnect();

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true) }, []);
  const [recipient, setRecipient] = useState('');

  function deposit() {
    doContractCall({
      network: new StacksMainnet(),
      anchorMode: AnchorMode.Any,
      contractAddress: "SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ",
      contractName: 'bitgear-genesis',
      functionName: "transfer",
      functionArgs: [uintCV(3632), principalCV('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS'), principalCV(recipient)],
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

  console.log(recipient);

  if (!mounted || !userSession.isUserSignedIn()) {
    return <ConnectWallet />;
  }

  return (
    <>
      <Input onChange={e => setRecipient(e.target.value)} className='w-full' placeholder='Recipient' />
      <Button className='text-md w-full hover:bg-[#ffffffee] hover:text-primary' onClick={deposit}>Transfer</Button>
    </>
  );
};