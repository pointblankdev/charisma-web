import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import Image from 'next/image';
import deployProposal from '@public/governance/deploy-proposal.png'
import { Button } from '@components/ui/button';
import Link from 'next/link';

export default function GovernanceGuidePage() {
    const meta = {
        title: 'Charisma | How to Contribute',
        description: META_DESCRIPTION
    };

    return (
        <Page meta={meta} fullViewport>
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <h1 className="text-4xl font-bold mb-4">How to Contribute to Charisma DAO</h1>
                <p className="text-lg mb-6">Welcome to the Charisma DAO contribution guide. By following the steps below, you can seamlessly contribute by proposing and enabling extensions.</p>

                <div className="mb-6">
                    <h2 className="text-2xl font-semibold mb-3">Step 1: Create an "extension" contract that does cool stuff</h2>
                    <p className="text-lg">
                        Start by creating your Clarity smart contract.
                        I recommend looking at the existing DAO extentions for reference.
                        Also feel free to join the Discord server if you need help.
                        Deploy the extension to Stacks mainnet using the <Link href="https://explorer.hiro.so/sandbox/deploy?chain=mainnet">sandbox</Link> once you've tested that it works.</p>
                    <p className="text-lg"></p>
                </div>

                <div className="mb-6">
                    <h2 className="text-2xl font-semibold mb-3">Step 2: Create a "proposal" contract that enables the extension</h2>
                    <p className="text-lg">Now, craft another smart contract that integrates and enables your primary "extension" contract.</p>
                    <p className="text-lg">Deploy the proposal to Stacks mainnet once you have tested that it works.</p>
                    <Image className="my-2 rounded overflow-hidden" src={deployProposal} alt='deploy a proposal' />
                </div>

                <div className="mb-6">
                    <h2 className="text-2xl font-semibold mb-3">Step 3: Propose the new contract</h2>
                    <p className="text-lg">Utilize the "propose" function of the <code className="bg-gray-900 p-1 rounded">dme002-proposal-submission</code> contract to introduce your new proposal. Remember to set the start-block-height a minimum of 144 blocks ahead of the current block.</p>
                </div>

                <div className="mb-6">
                    <h2 className="text-2xl font-semibold mb-3">Step 4: Wait the voting period (~10 days)</h2>
                    <p className="text-lg">After proposing, you must wait for 144 blocks. Following this period, the community will vote on your proposal. This voting process will span roughly 10 days. Engage with the community during this period to gather support for your proposal!</p>
                </div>

                <div className="mb-6">
                    <h2 className="text-2xl font-semibold mb-3">Step 5: Concluding the proposal</h2>
                    <p className="text-lg">If your proposal garners enough votes and passes, you can use the "conclude" function on the <code className="bg-gray-900 p-1 rounded">dme001-proposal-voting</code> contract. This will execute your contract and enable the extension.</p>
                </div>

                <p className="mb-6 text-lg">Thank you for your interest in contributing to Charisma DAO. Your involvement ensures a dynamic and evolving platform for all users!</p>
                <Link href='/governance'><Button variant='secondary'>Back</Button></Link>
            </div>
        </Page>
    );
}
