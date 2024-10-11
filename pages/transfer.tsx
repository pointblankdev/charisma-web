import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import { Card } from '@components/ui/card';
import { useState } from 'react';
import { PostConditionMode, standardPrincipalCV, uintCV } from "@stacks/transactions";
import { Button } from "@components/ui/button";
import { Input } from '@components/ui/input';
import Layout from '@components/layout/layout';
import { useConnect } from '@stacks/connect-react';
import { network } from '@components/stacks-session/connect';


export default function TransferPage() {
    const meta = {
        title: 'Charisma | Transfer',
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

const Transfer = () => {

    const { doContractCall } = useConnect();

    const [sender, setSender] = useState('');
    const [recipient, setRecipient] = useState('');

    function transfer() {
        doContractCall({
            network: network,
            contractAddress: "SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ",
            contractName: 'dungeon-master',
            functionName: "dmg-transfer",
            functionArgs: [uintCV(1), standardPrincipalCV(sender), standardPrincipalCV(recipient)],
            postConditionMode: PostConditionMode.Allow,
            postConditions: [],
        });
    }

    return (
        <>
            <Input onChange={e => setSender(e.target.value)} className='w-full' placeholder='Sender' />
            <Input onChange={e => setRecipient(e.target.value)} className='w-full' placeholder='Recipient' />
            <Button className='text-md w-full hover:bg-[#ffffffee] hover:text-primary' onClick={transfer}>Transfer</Button>
        </>
    );
};