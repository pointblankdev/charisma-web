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
import { Check } from 'lucide-react';
import { Checkbox } from '@components/ui/checkbox';


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

    const [questContractName, setQuestContractName] = useState('adventure-v0');
    const [edkContractAddress, setEDKContractAddress] = useState('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.land-helper-v2');
    const [whitelist, setWhitelist] = useState(false);

    function setExtension() {
        openContractCall({
            contractAddress: questContractName.split('.')[0],
            contractName: questContractName.split('.')[1],
            functionName: "set-whitelisted-edk",
            functionArgs: [contractPrincipalCV(edkContractAddress), boolCV(whitelist)],
            postConditionMode: PostConditionMode.Allow,
            postConditions: [],
        });
    }

    return (
        <>
            <div className='flex items-center'>
                <div className='w-full items-stretch'>
                    <Input onChange={e => setQuestContractName(e.target.value)} className='w-full' placeholder='ContractName' />
                    <Input onChange={e => setEDKContractAddress(e.target.value)} className='w-full' placeholder='ContractAddress' />
                </div>
                <Checkbox onCheckedChange={e => setWhitelist(e as any)} className='w-16 h-16 m-2'>Whitelist</Checkbox>
            </div>
            <Button className='text-md w-full hover:bg-[#ffffffee] hover:text-primary' onClick={setExtension}>Whitelist EDK</Button>
        </>
    );
};