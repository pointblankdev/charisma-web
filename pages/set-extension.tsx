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


export default function SetExtensionPage() {
    const meta = {
        title: 'Charisma | Set Extension',
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
                                <SetExtension />
                            </div>
                        </div>
                    </Card>
                </div>
            </Layout>
        </Page>
    );
}

const SetExtension = () => {

    const { openContractCall } = useOpenContractCall();

    const [contractAddress, setContractAddress] = useState('');

    function setExtension() {
        openContractCall({
            contractAddress: "SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ",
            contractName: 'dungeon-master',
            functionName: "set-extension",
            functionArgs: [contractPrincipalCV(contractAddress), boolCV(true)],
            postConditionMode: PostConditionMode.Allow,
            postConditions: [],
        });
    }

    return (
        <>
            <Input onChange={e => setContractAddress(e.target.value)} className='w-full' placeholder='ContractAddress' />
            <Button className='text-md w-full hover:bg-[#ffffffee] hover:text-primary' onClick={setExtension}>Set Extension</Button>
        </>
    );
};