import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import { Card } from '@components/ui/card';
import { useState } from 'react';
import {
  bufferCV,
  contractPrincipalCV,
  noneCV,
  optionalCVOf,
  PostConditionMode,
  standardPrincipalCV,
  uintCV
} from '@stacks/transactions';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import Layout from '@components/layout/layout';
import { network } from '@components/stacks-session/connect';
import { openContractCall } from '@stacks/connect';
import { hexToBytes } from '@stacks/common';

export default function TransferPage() {
  const meta = {
    title: 'Charisma | Transfer',
    description: META_DESCRIPTION
  };

  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <div className="m-2 sm:container sm:mx-auto sm:py-10 md:max-w-2xl">
          <Card className="p-0 overflow-hidden bg-black text-primary-foreground border-accent-foreground rounded-xl">
            <div className="m-2">
              <div className="space-y-1">
                <Transfer />
              </div>
            </div>
          </Card>
        </div>
      </Layout>
    </Page>
  );
}

const Transfer = () => {
  const [sender, setSender] = useState('');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');

  function transfer() {
    openContractCall(
      {
        network: network,
        contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
        contractName: 'dexterity-token',
        functionName: 'swap',
        functionArgs: [uintCV(1000000), optionalCVOf(bufferCV(hexToBytes('01')))],
        postConditionMode: PostConditionMode.Allow,
        postConditions: []
      }
      // (window as any).AsignaProvider
    );
  }

  return (
    <>
      {/* <Input onChange={e => setAmount(e.target.value)} className="w-full" placeholder="Amount" />
      <Input onChange={e => setSender(e.target.value)} className="w-full" placeholder="Sender" /> */}
      <Input
        onChange={e => setRecipient(e.target.value)}
        className="w-full"
        placeholder="Recipient"
      />
      <Button className="text-md w-full hover:bg-[#ffffffee] hover:text-primary" onClick={transfer}>
        Swap
      </Button>
    </>
  );
};
