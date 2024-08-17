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
import { contractPrincipalCV, boolCV } from 'micro-stacks/clarity';


export default function WhitelistEDKPage() {
    const meta = {
        title: 'Charisma | Whitelist EDK',
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
                                <WhitelistEDK />
                            </div>
                        </div>
                    </Card>
                </div>
            </Layout>
        </Page>
    );
}

const WhitelistEDK = () => {

    const { openContractCall } = useOpenContractCall();

    const [contractAddress, setContractAddress] = useState('');

    function setExtension() {
        openContractCall({
            contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
            contractName: 'adventure-v0',
            functionName: "set-whitelisted-edk",
            functionArgs: [contractPrincipalCV(contractAddress), boolCV(false)],
            postConditionMode: PostConditionMode.Allow,
            postConditions: [],
        });
    }

    return (
        <>
            <Input onChange={e => setContractAddress(e.target.value)} className='w-full' placeholder='ContractAddress' />
            <Button className='text-md w-full hover:bg-[#ffffffee] hover:text-primary' onClick={setExtension}>Whitelist EDK</Button>
        </>
    );
};