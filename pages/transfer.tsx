import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import { Card } from '@components/ui/card';
import { useState } from 'react';
import { PostConditionMode } from "@stacks/transactions";
import { Button } from "@components/ui/button";
import { Input } from '@components/ui/input';
import Layout from '@components/layout/layout';
import { useOpenContractCall } from '@micro-stacks/react';
import { uintCV, standardPrincipalCV } from 'micro-stacks/clarity';


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

    const { openContractCall } = useOpenContractCall();

    const [recipient, setRecipient] = useState('');

    function transfer() {
        openContractCall({
            contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
            contractName: 'lands',
            functionName: "transfer",
            functionArgs: [uintCV(1), uintCV(4000000), standardPrincipalCV('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS'), standardPrincipalCV(recipient)],
            postConditionMode: PostConditionMode.Allow,
            postConditions: [],
        });
    }

    return (
        <>
            <Input onChange={e => setRecipient(e.target.value)} className='w-full' placeholder='Recipient' />
            <Button className='text-md w-full hover:bg-[#ffffffee] hover:text-primary' onClick={transfer}>Transfer</Button>
        </>
    );
};