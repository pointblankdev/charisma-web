import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import { Card } from '@components/ui/card';
import { useState } from 'react';
import { uintCV, contractPrincipalCV, tupleCV, PostConditionMode } from "@stacks/transactions";
import { Button } from "@components/ui/button";
import { Input } from '@components/ui/input';
import Layout from '@components/layout/layout';
import { openContractCall } from '@stacks/connect';
import { network } from '@components/stacks-session/connect';
import dmgLogo from '@public/dmg-logo.gif';
import Image from 'next/image';

export default function AdminDashboard() {
    const meta = {
        title: 'Charisma | Admin Dashboard',
        description: META_DESCRIPTION,
    };

    return (
        <Page meta={meta} fullViewport>
            <SkipNavContent />
            <Layout>
                <div className="m-2 sm:container sm:mx-auto sm:py-10 md:max-w-6xl">
                    <HeroSection />
                    <DexSection />
                    <TokenSection />
                </div>
            </Layout>
        </Page>
    );
}

const HeroSection = () => {
    return (
        <div className='flex flex-col items-center overflow-hidden'>
            <div className='flex w-full pt-24 pb-8 px-8 sm:p-24 sm:pb-0 my-[10vh] bg-[var(--sidebar)] border border-[var(--accents-7)] rounded-lg sm:rounded-lg mt-12'>
                <div className='flex-col items-center hidden w-full space-y-4 sm:w-64 sm:flex'>
                    <Image src={dmgLogo} alt='Charisma Protocol' width={300} height={300} className='transition-all -translate-x-12 -translate-y-20 scale-[1.5]' />
                </div>
                <div className='flex flex-col items-center justify-center w-full px-4 text-lg text-center -translate-y-16 sm:text-md sm:text-start sm:items-start sm:justify-start sm:px-0'>
                    <div className='flex items-baseline justify-center w-full text-center sm:justify-start'>
                        <div className='py-4 text-6xl sm:py-0'>Admin Dashboard</div>
                    </div>
                    <div className='mt-4 text-lg grow text-secondary/80'>Manage Charisma DEX and Token settings</div>
                    <div className='mt-8 text-md text-secondary/80'>
                        Use these controls to adjust various parameters of the Charisma ecosystem.
                    </div>
                </div>
            </div>
        </div>
    );
};

const DexSection = () => {
    return (
        <div>
            <div className='w-full pt-4 text-3xl font-bold text-center uppercase'>Charisma DEX</div>
            <div className='w-full pb-8 text-center text-md text-muted/90'>Manage DEX settings and operations</div>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
                <CreatePool />
                <UpdateSwapFee />
                <UpdateProtocolFee />
                <UpdateShareFee />
                <Mint />
                <Burn />
                <Swap />
                <Collect />
            </div>
        </div>
    );
};

const TokenSection = () => {
    return (
        <div className="mt-20 mb-12">
            <div className='w-full pt-8 text-3xl font-bold text-center uppercase'>Charisma Token</div>
            <div className='w-full pb-8 text-center text-md text-muted/90'>Adjust Charisma Token parameters</div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <SetBlocksPerTx />
                <SetMaxLiquidityFlow />
            </div>
        </div>
    );
};

const CreatePool = () => {
    const [token0, setToken0] = useState('');
    const [token1, setToken1] = useState('');
    const [lpToken, setLpToken] = useState('');
    const [swapFee, setSwapFee] = useState('');
    const [protocolFee, setProtocolFee] = useState('');
    const [shareFee, setShareFee] = useState('');

    function create() {
        openContractCall({
            network: network,
            contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
            contractName: 'univ2-core',
            functionName: "create",
            functionArgs: [
                contractPrincipalCV(token0.split('.')[0], token0.split('.')[1]),
                contractPrincipalCV(token1.split('.')[0], token1.split('.')[1]),
                contractPrincipalCV(lpToken.split('.')[0], lpToken.split('.')[1]),
                tupleCV({ num: uintCV(parseInt(swapFee.split('/')[0])), den: uintCV(parseInt(swapFee.split('/')[1])) }),
                tupleCV({ num: uintCV(parseInt(protocolFee.split('/')[0])), den: uintCV(parseInt(protocolFee.split('/')[1])) }),
                tupleCV({ num: uintCV(parseInt(shareFee.split('/')[0])), den: uintCV(parseInt(shareFee.split('/')[1])) }),
            ],
            postConditionMode: PostConditionMode.Allow,
            postConditions: [],
        }, (window as any).AsignaProvider);
    }

    return (
        <Card className='p-4 flex flex-col h-full'>
            <div>
                <h2 className="text-xl font-bold mb-2">Create Pool</h2>
                <p className="text-sm mb-4">Creates a new liquidity pool for two tokens with specified fee structures.</p>
                <Input className='mb-2' placeholder='Token0' onChange={e => setToken0(e.target.value)} />
                <Input className='mb-2' placeholder='Token1' onChange={e => setToken1(e.target.value)} />
                <Input className='mb-2' placeholder='LP Token' onChange={e => setLpToken(e.target.value)} />
                <Input className='mb-2' placeholder='Swap Fee (e.g. 995/1000)' onChange={e => setSwapFee(e.target.value)} />
                <Input className='mb-2' placeholder='Protocol Fee (e.g. 500/1000)' onChange={e => setProtocolFee(e.target.value)} />
                <Input className='mb-2' placeholder='Share Fee (e.g. 0/1000)' onChange={e => setShareFee(e.target.value)} />
            </div>
            <div className="mt-auto flex justify-end">
                <Button onClick={create}>Create Pool</Button>
            </div>
        </Card>
    );
};

const UpdateSwapFee = () => {
    const [poolId, setPoolId] = useState('');
    const [fee, setFee] = useState('');

    function updateSwapFee() {
        openContractCall({
            network: network,
            contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
            contractName: 'univ2-core',
            functionName: "update-swap-fee",
            functionArgs: [
                uintCV(parseInt(poolId)),
                tupleCV({ num: uintCV(parseInt(fee.split('/')[0])), den: uintCV(parseInt(fee.split('/')[1])) }),
            ],
            postConditionMode: PostConditionMode.Allow,
            postConditions: [],
        }, (window as any).AsignaProvider);
    }

    return (
        <Card className='p-4 flex flex-col h-full'>
            <div>
                <h2 className="text-xl font-bold mb-2">Update Swap Fee</h2>
                <p className="text-sm mb-4">Modifies the swap fee for a specific liquidity pool.</p>
                <Input className='mb-2' placeholder='Pool ID' onChange={e => setPoolId(e.target.value)} />
                <Input className='mb-2' placeholder='New Fee (e.g. 995/1000)' onChange={e => setFee(e.target.value)} />
            </div>
            <div className="mt-auto flex justify-end">
                <Button onClick={updateSwapFee}>Update Swap Fee</Button>
            </div>
        </Card>
    );
};

const UpdateProtocolFee = () => {
    const [poolId, setPoolId] = useState('');
    const [fee, setFee] = useState('');

    function updateProtocolFee() {
        openContractCall({
            network: network,
            contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
            contractName: 'univ2-core',
            functionName: "update-protocol-fee",
            functionArgs: [
                uintCV(parseInt(poolId)),
                tupleCV({ num: uintCV(parseInt(fee.split('/')[0])), den: uintCV(parseInt(fee.split('/')[1])) }),
            ],
            postConditionMode: PostConditionMode.Allow,
            postConditions: [],
        }, (window as any).AsignaProvider);
    }

    return (
        <Card className='p-4 flex flex-col h-full'>
            <div>
                <h2 className="text-xl font-bold mb-2">Update Protocol Fee</h2>
                <p className="text-sm mb-4">Changes the protocol fee for a specific liquidity pool.</p>
                <Input className='mb-2' placeholder='Pool ID' onChange={e => setPoolId(e.target.value)} />
                <Input className='mb-2' placeholder='New Fee (e.g. 500/1000)' onChange={e => setFee(e.target.value)} />
            </div>
            <div className="mt-auto flex justify-end">
                <Button onClick={updateProtocolFee}>Update Protocol Fee</Button>
            </div>
        </Card>
    );
};

const UpdateShareFee = () => {
    const [poolId, setPoolId] = useState('');
    const [fee, setFee] = useState('');

    function updateShareFee() {
        openContractCall({
            network: network,
            contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
            contractName: 'univ2-core',
            functionName: "update-share-fee",
            functionArgs: [
                uintCV(parseInt(poolId)),
                tupleCV({ num: uintCV(parseInt(fee.split('/')[0])), den: uintCV(parseInt(fee.split('/')[1])) }),
            ],
            postConditionMode: PostConditionMode.Allow,
            postConditions: [],
        }, (window as any).AsignaProvider);
    }

    return (
        <Card className='p-4 flex flex-col h-full'>
            <div>
                <h2 className="text-xl font-bold mb-2">Update Share Fee</h2>
                <p className="text-sm mb-4">Adjusts the share fee for a specific liquidity pool.</p>
                <Input className='mb-2' placeholder='Pool ID' onChange={e => setPoolId(e.target.value)} />
                <Input className='mb-2' placeholder='New Fee (e.g. 0/1000)' onChange={e => setFee(e.target.value)} />
            </div>
            <div className="mt-auto flex justify-end">
                <Button onClick={updateShareFee}>Update Share Fee</Button>
            </div>
        </Card>
    );
};

const Mint = () => {
    const [poolId, setPoolId] = useState('');
    const [token0, setToken0] = useState('');
    const [token1, setToken1] = useState('');
    const [lpToken, setLpToken] = useState('');
    const [amt0, setAmt0] = useState('');
    const [amt1, setAmt1] = useState('');

    function mint() {
        openContractCall({
            network: network,
            contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
            contractName: 'univ2-core',
            functionName: "mint",
            functionArgs: [
                uintCV(parseInt(poolId)),
                contractPrincipalCV(token0.split('.')[0], token0.split('.')[1]),
                contractPrincipalCV(token1.split('.')[0], token1.split('.')[1]),
                contractPrincipalCV(lpToken.split('.')[0], lpToken.split('.')[1]),
                uintCV(parseInt(amt0)),
                uintCV(parseInt(amt1)),
            ],
            postConditionMode: PostConditionMode.Allow,
            postConditions: [],
        }, (window as any).AsignaProvider);
    }

    return (
        <Card className='p-4 flex flex-col h-full'>
            <div>
                <h2 className="text-xl font-bold mb-2">Mint</h2>
                <p className="text-sm mb-4">Adds liquidity to a pool and mints LP tokens in return.</p>
                <Input className='mb-2' placeholder='Pool ID' onChange={e => setPoolId(e.target.value)} />
                <Input className='mb-2' placeholder='Token0' onChange={e => setToken0(e.target.value)} />
                <Input className='mb-2' placeholder='Token1' onChange={e => setToken1(e.target.value)} />
                <Input className='mb-2' placeholder='LP Token' onChange={e => setLpToken(e.target.value)} />
                <Input className='mb-2' placeholder='Amount0' onChange={e => setAmt0(e.target.value)} />
                <Input className='mb-2' placeholder='Amount1' onChange={e => setAmt1(e.target.value)} />
            </div>
            <div className="mt-auto flex justify-end">
                <Button onClick={mint}>Mint</Button>
            </div>
        </Card>
    );
};

const Burn = () => {
    const [poolId, setPoolId] = useState('');
    const [token0, setToken0] = useState('');
    const [token1, setToken1] = useState('');
    const [lpToken, setLpToken] = useState('');
    const [liquidity, setLiquidity] = useState('');

    function burn() {
        openContractCall({
            network: network,
            contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
            contractName: 'univ2-core',
            functionName: "burn",
            functionArgs: [
                uintCV(parseInt(poolId)),
                contractPrincipalCV(token0.split('.')[0], token0.split('.')[1]),
                contractPrincipalCV(token1.split('.')[0], token1.split('.')[1]),
                contractPrincipalCV(lpToken.split('.')[0], lpToken.split('.')[1]),
                uintCV(parseInt(liquidity)),
            ],
            postConditionMode: PostConditionMode.Allow,
            postConditions: [],
        }, (window as any).AsignaProvider);
    }

    return (
        <Card className='p-4 flex flex-col h-full'>
            <div>
                <h2 className="text-xl font-bold mb-2">Burn</h2>
                <p className="text-sm mb-4">Removes liquidity from a pool by burning LP tokens.</p>
                <Input className='mb-2' placeholder='Pool ID' onChange={e => setPoolId(e.target.value)} />
                <Input className='mb-2' placeholder='Token0' onChange={e => setToken0(e.target.value)} />
                <Input className='mb-2' placeholder='Token1' onChange={e => setToken1(e.target.value)} />
                <Input className='mb-2' placeholder='LP Token' onChange={e => setLpToken(e.target.value)} />
                <Input className='mb-2' placeholder='Liquidity' onChange={e => setLiquidity(e.target.value)} />
            </div>
            <div className="mt-auto flex justify-end">
                <Button onClick={burn}>Burn</Button>
            </div>
        </Card>
    );
};

const Swap = () => {
    const [poolId, setPoolId] = useState('');
    const [tokenIn, setTokenIn] = useState('');
    const [tokenOut, setTokenOut] = useState('');
    const [shareFee0, setShareFee0] = useState('');
    const [amtIn, setAmtIn] = useState('');
    const [amtOut, setAmtOut] = useState('');

    function swap() {
        openContractCall({
            network: network,
            contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
            contractName: 'univ2-core',
            functionName: "swap",
            functionArgs: [
                uintCV(parseInt(poolId)),
                contractPrincipalCV(tokenIn.split('.')[0], tokenIn.split('.')[1]),
                contractPrincipalCV(tokenOut.split('.')[0], tokenOut.split('.')[1]),
                contractPrincipalCV(shareFee0.split('.')[0], shareFee0.split('.')[1]),
                uintCV(parseInt(amtIn)),
                uintCV(parseInt(amtOut)),
            ],
            postConditionMode: PostConditionMode.Allow,
            postConditions: [],
        }, (window as any).AsignaProvider);
    }

    return (
        <Card className='p-4 flex flex-col h-full'>
            <div>
                <h2 className="text-xl font-bold mb-2">Swap</h2>
                <p className="text-sm mb-4">Executes a token swap in a specific liquidity pool.</p>
                <Input className='mb-2' placeholder='Pool ID' onChange={e => setPoolId(e.target.value)} />
                <Input className='mb-2' placeholder='Token In' onChange={e => setTokenIn(e.target.value)} />
                <Input className='mb-2' placeholder='Token Out' onChange={e => setTokenOut(e.target.value)} />
                <Input className='mb-2' placeholder='Share Fee To' onChange={e => setShareFee0(e.target.value)} />
                <Input className='mb-2' placeholder='Amount In' onChange={e => setAmtIn(e.target.value)} />
                <Input className='mb-2' placeholder='Amount Out' onChange={e => setAmtOut(e.target.value)} />
            </div>
            <div className="mt-auto flex justify-end">
                <Button onClick={swap}>Swap</Button>
            </div>
        </Card>
    );
};

const Collect = () => {
    const [poolId, setPoolId] = useState('');
    const [token0, setToken0] = useState('');
    const [token1, setToken1] = useState('');

    function collect() {
        openContractCall({
            network: network,
            contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
            contractName: 'univ2-core',
            functionName: "collect",
            functionArgs: [
                uintCV(parseInt(poolId)),
                contractPrincipalCV(token0.split('.')[0], token0.split('.')[1]),
                contractPrincipalCV(token1.split('.')[0], token1.split('.')[1]),
            ],
            postConditionMode: PostConditionMode.Allow,
            postConditions: [],
        }, (window as any).AsignaProvider);
    }

    return (
        <Card className='p-4 flex flex-col h-full'>
            <div>
                <h2 className="text-xl font-bold mb-2">Collect</h2>
                <p className="text-sm mb-4">Collects accumulated protocol fees from a specific liquidity pool. Only callable by the protocol fee recipient.</p>
                <Input className='mb-2' placeholder='Pool ID' onChange={e => setPoolId(e.target.value)} />
                <Input className='mb-2' placeholder='Token0' onChange={e => setToken0(e.target.value)} />
                <Input className='mb-2' placeholder='Token1' onChange={e => setToken1(e.target.value)} />
            </div>
            <div className="mt-auto flex justify-end">
                <Button onClick={collect}>Collect</Button>
            </div>
        </Card>
    );
};

const SetBlocksPerTx = () => {
    const [newBlocksPerTx, setNewBlocksPerTx] = useState('');

    function setBlocksPerTx() {
        openContractCall({
            network: network,
            contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
            contractName: 'charisma-token',
            functionName: "set-blocks-per-tx",
            functionArgs: [
                uintCV(parseInt(newBlocksPerTx)),
            ],
            postConditionMode: PostConditionMode.Allow,
            postConditions: [],
        }, (window as any).AsignaProvider);
    }

    return (
        <Card className='p-4 flex flex-col h-full'>
            <div>
                <h2 className="text-xl font-bold mb-2">Set Blocks Per Transaction</h2>
                <p className="text-sm mb-4">Sets the number of blocks that must pass between transactions. Min: 1, Max: 100,000.</p>
                <Input
                    className='mb-2'
                    type="number"
                    placeholder='New Blocks Per Tx'
                    min="1"
                    max="100000"
                    onChange={e => setNewBlocksPerTx(e.target.value)}
                />
            </div>
            <div className="mt-auto flex justify-end">
                <Button onClick={setBlocksPerTx}>Set Blocks Per Tx</Button>
            </div>
        </Card>
    );
};

const SetMaxLiquidityFlow = () => {
    const [newMaxLiquidityFlow, setNewMaxLiquidityFlow] = useState('');

    function setMaxLiquidityFlow() {
        openContractCall({
            network: network,
            contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
            contractName: 'charisma-token',
            functionName: "set-max-liquidity-flow",
            functionArgs: [
                uintCV(parseInt(newMaxLiquidityFlow) * 1000000), // Convert to microtokens
            ],
            postConditionMode: PostConditionMode.Allow,
            postConditions: [],
        }, (window as any).AsignaProvider);
    }

    return (
        <Card className='p-4 flex flex-col h-full'>
            <div>
                <h2 className="text-xl font-bold mb-2">Set Max Liquidity Flow</h2>
                <p className="text-sm mb-4">Sets the maximum amount of tokens that can be wrapped or unwrapped in a single transaction. Min: 1, Max: 1,000.</p>
                <Input
                    className='mb-2'
                    type="number"
                    placeholder='New Max Liquidity Flow'
                    min="1"
                    max="1000"
                    onChange={e => setNewMaxLiquidityFlow(e.target.value)}
                />
            </div>
            <div className="mt-auto flex justify-end">
                <Button onClick={setMaxLiquidityFlow}>Set Max Liquidity Flow</Button>
            </div>
        </Card>
    );
};