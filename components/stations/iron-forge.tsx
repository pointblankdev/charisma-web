import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import Layout from '@components/layout';
import Image from 'next/image';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from '@components/ui/card';
import { Button } from '@components/ui/button';
import { useEffect, useState } from 'react';
import { cn } from '@lib/utils';
import Link from 'next/link';
import { Link1Icon } from '@radix-ui/react-icons';
import { useConnect } from '@stacks/connect-react';
import { AnchorMode, callReadOnlyFunction, cvToJSON, Pc, PostConditionMode, principalCV, uintCV } from '@stacks/transactions';
import { StacksMainnet } from "@stacks/network";
import { userSession } from '@components/stacks-session/connect';
import numeral from 'numeral';
import farmersImg from '@public/creatures/img/farmers.png'
import blacksmithsImg from '@public/creatures/img/blacksmiths.png'
import corgiSoldiersImg from '@public/creatures/img/corgi-soldiers.png'
import alchemistsImg from '@public/creatures/img/alchemists.png'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@components/ui/dialog';
import { AlertDialogHeader } from '@components/ui/alert-dialog';
import energyIcon from '@public/creatures/img/energy.png'
import ironIngots from '@public/indexes/iron-ingots-logo.png'

export default function IronForgeCard({ data }: any) {

    const [descriptionVisible, setDescriptionVisible] = useState(false);

    const [creatureSelected, setCreatureSelected] = useState(1)

    const [blocksPerEpoch, setBlocksPerEpoch] = useState(0);
    const [supplyPerEpoch, setSupplyPerEpoch] = useState(0);
    const [currentEpoch, setCurrentEpoch] = useState(0);
    const [blocksUntilNextEpoch, setBlocksUntilNextEpoch] = useState(0);
    const [epochProgress, setEpochProgress] = useState(0);
    const [supplyUtilization, setSupplyUtilization] = useState(0);
    const [epochPassed, setEpochPassed] = useState(false);
    const [ingotBalance, setIngotBalance] = useState(0);

    const sender = userSession.isUserSignedIn() && userSession.loadUserData().profile.stxAddress.mainnet

    useEffect(() => {
        setDescriptionVisible(true);
    }, []);

    useEffect(() => {
        sender && callReadOnlyFunction({
            network: new StacksMainnet(),
            contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
            contractName: 'ironworks-forge',
            functionName: "get-blocks-per-epoch",
            functionArgs: [],
            senderAddress: sender
        }).then(response => setBlocksPerEpoch(Number(cvToJSON(response).value)))
    }, [sender])

    useEffect(() => {
        sender && callReadOnlyFunction({
            network: new StacksMainnet(),
            contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
            contractName: 'ironworks-forge',
            functionName: "get-supply-per-epoch",
            functionArgs: [],
            senderAddress: sender
        }).then(response => setSupplyPerEpoch(Number(cvToJSON(response).value)))
    }, [sender])

    useEffect(() => {
        sender && callReadOnlyFunction({
            network: new StacksMainnet(),
            contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
            contractName: 'ironworks-forge',
            functionName: "get-current-epoch",
            functionArgs: [],
            senderAddress: sender
        }).then(response => setCurrentEpoch(Number(cvToJSON(response).value)))
    }, [sender])

    useEffect(() => {
        sender && callReadOnlyFunction({
            network: new StacksMainnet(),
            contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
            contractName: 'ironworks-forge',
            functionName: "get-epoch-ended",
            functionArgs: [],
            senderAddress: sender
        }).then(response => setBlocksUntilNextEpoch(Number(cvToJSON(response).value)))
    }, [sender])

    useEffect(() => {
        sender && callReadOnlyFunction({
            network: new StacksMainnet(),
            contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
            contractName: 'ironworks-forge',
            functionName: "get-epoch-progress",
            functionArgs: [],
            senderAddress: sender
        }).then(response => setEpochProgress(Number(cvToJSON(response).value)))
    }, [sender])

    useEffect(() => {
        sender && callReadOnlyFunction({
            network: new StacksMainnet(),
            contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
            contractName: 'ironworks-forge',
            functionName: "get-supply-utilization",
            functionArgs: [],
            senderAddress: sender
        }).then(response => setSupplyUtilization(Number(cvToJSON(response).value)))
    }, [sender])

    useEffect(() => {
        sender && callReadOnlyFunction({
            network: new StacksMainnet(),
            contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
            contractName: 'ironworks-forge',
            functionName: "epoch-passed",
            functionArgs: [],
            senderAddress: sender
        }).then(response => setEpochPassed(cvToJSON(response).value))
    }, [sender])

    useEffect(() => {
        sender && callReadOnlyFunction({
            network: new StacksMainnet(),
            contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
            contractName: 'iron-ingots',
            functionName: "get-balance",
            functionArgs: [principalCV('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.ironworks-forge')],
            senderAddress: sender
        }).then((response: any) => setIngotBalance(Number(cvToJSON(response.value).value / 1000000)))
    }, [sender])

    return (
        <Card className="flex flex-col bg-black text-primary-foreground border-accent-foreground p-0 relative overflow-hidden rounded-md group/card w-full max-w-3xl opacity-[0.99] shadow-black shadow-2xl">
            <CardHeader className="z-20 p-4">
                <div className="flex items-start justify-between flex-row">
                    <div>
                        <CardTitle className="z-30 text-lg font-semibold">
                            <Link href={`https://explorer.hiro.so/txid/SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.ironworks-forge?chain=mainnet`} target='_blank'>
                                <div className="z-30 text-primary-foreground flex items-center space-x-2">
                                    <div>Quest: Forge Iron Ingots</div> <Link1Icon className="mt-0.5 text-primary-foreground/50" />
                                </div>
                            </Link>
                        </CardTitle>
                        <div className='text-sm font-semibold text-secondary/70'>{numeral(ingotBalance).format('(0.00a)')} IRON available in supply</div>
                    </div>
                    <ActiveFarmIndicator active={!(supplyUtilization >= 100 && !epochPassed)} blocksUntilUnlock={blocksUntilNextEpoch} />
                </div>
                <CardDescription className="z-30 text-xs space-y-2 py-4">
                    <div className='text-base text-primary-foreground'>Quest Details</div>
                    <ul className='list-inside list-disc sm:text-sm font-fine text-primary-foreground/60 space-y-2'>
                        <li className='leading-tight'>Only {supplyPerEpoch / 1000000} Iron Ingots can be forged during each epoch.</li>
                        <li className='leading-tight'>Each epoch is {blocksPerEpoch} blocks long, and it's currently epoch {currentEpoch}.</li>
                        <li className='leading-tight'>The current epoch is {epochProgress}% complete, with {blocksUntilNextEpoch} blocks remaining.</li>
                        <li className='leading-tight'>Blacksmiths forge 10x more Iron Ingots than other creatures.</li>
                        {supplyUtilization < 100 && <li className='leading-tight'>{`So far this epoch, ${supplyUtilization}% of the Iron Ingots has been forged.`}</li>}
                    </ul>
                </CardDescription>
                <div className="z-20">
                    {/* <CardTitle className="z-30 mt-2 text-xl font-semibold">Yield Farming</CardTitle> */}

                </div>
            </CardHeader>
            <CardFooter className="z-20 flex justify-between pb-4 px-4 items-end mt-auto flex-1">
                <SelectCreatureDialog data={data} disabled={supplyUtilization >= 100 && !epochPassed} />
            </CardFooter>
            <Image
                src={blacksmithsImg}
                width={800}
                height={1600}
                alt={'quest-background-image'}
                className={cn(
                    'object-cover',
                    'lg:aspect-square',
                    'sm:aspect-[2/3]',
                    'aspect-[1/2]',
                    'opacity-10',
                    'flex',
                    'z-10',
                    'absolute',
                    'inset-0',
                    'pointer-events-none'
                )}
            />
        </Card>
    );
}

export function SelectCreatureDialog({ disabled }: any) {

    const { doContractCall } = useConnect();

    const sender = userSession.isUserSignedIn() && userSession.loadUserData().profile.stxAddress.mainnet

    const [farmerClaimableAmount, setFarmerClaimableAmount] = useState(0)
    const [blacksmithClaimableAmount, setBlacksmithClaimableAmount] = useState(0)
    const [corgiSoldierClaimableAmount, setCorgiSoldierClaimableAmount] = useState(0)
    const [alchemistClaimableAmount, setAlchemistClaimableAmount] = useState(0)

    useEffect(() => {

        if (sender) {
            callReadOnlyFunction({
                network: new StacksMainnet(),
                contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
                contractName: 'ironworks-forge',
                functionName: "get-claimable-amount",
                functionArgs: [uintCV(1)],
                senderAddress: sender
            }).then(response => setFarmerClaimableAmount(Number(cvToJSON(response).value) / 1000000))

            callReadOnlyFunction({
                network: new StacksMainnet(),
                contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
                contractName: 'ironworks-forge',
                functionName: "get-claimable-amount",
                functionArgs: [uintCV(2)],
                senderAddress: sender
            }).then(response => setBlacksmithClaimableAmount(Number(cvToJSON(response).value) / 1000000))

            callReadOnlyFunction({
                network: new StacksMainnet(),
                contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
                contractName: 'ironworks-forge',
                functionName: "get-claimable-amount",
                functionArgs: [uintCV(3)],
                senderAddress: sender
            }).then(response => setCorgiSoldierClaimableAmount(Number(cvToJSON(response).value) / 1000000))

            callReadOnlyFunction({
                network: new StacksMainnet(),
                contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
                contractName: 'ironworks-forge',
                functionName: "get-claimable-amount",
                functionArgs: [uintCV(4)],
                senderAddress: sender
            }).then(response => setAlchemistClaimableAmount(Number(cvToJSON(response).value) / 1000000))
        }

    }, [sender])

    async function forge(creatureId: number) {
        const response = await callReadOnlyFunction({
            network: new StacksMainnet(),
            contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
            contractName: 'ironworks-forge',
            functionName: "get-claimable-amount",
            functionArgs: [uintCV(creatureId)],
            senderAddress: sender
        })
        const claimableTokens = Number(cvToJSON(response).value)
        doContractCall({
            network: new StacksMainnet(),
            anchorMode: AnchorMode.Any,
            contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
            contractName: 'ironworks-forge',
            functionName: "forge",
            functionArgs: [uintCV(creatureId)],
            postConditionMode: PostConditionMode.Deny,
            postConditions: [Pc.principal('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.ironworks-forge').willSendGte(1).ft("SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.iron-ingots", "index-token")],
            onFinish: (data) => {
                console.log("onFinish:", data);
            },
            onCancel: () => {
                console.log("onCancel:", "Transaction was canceled");
            },
        });
    }


    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button disabled={disabled} size={'sm'} className={`z-30 w-full`}>{disabled ? 'No more Iron Ingots can be forged this epoch' : 'Forge Iron Ingots'}</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <AlertDialogHeader>
                    <DialogTitle>Which creatures should forge Iron Ingots?</DialogTitle>
                </AlertDialogHeader>

                <DialogDescription className='grid gap-2 grid-cols-2 sm:grid-cols-4 space-x-4 py-4'>
                    <div className='flex flex-col items-center space-y-2'>
                        <Image
                            alt={'asd'}
                            src={farmersImg}
                            width={100}
                            height={100}
                            onClick={() => forge(1)}
                            className="z-30 border rounded-lg h-32 w-32 hover:scale-110 transition-all cursor-pointer"
                        />
                        <h2 className='text-base text-primary-foreground'>Farmers</h2>
                        <div className='flex items-center gap-2 text-lg text-muted/80 font-semibold mr-4'>
                            <Image
                                alt={'Ingots Icon'}
                                src={ironIngots}
                                width={100}
                                height={100}
                                className={`z-30 border rounded-full h-6 w-6`}
                            />
                            <div>{farmerClaimableAmount}</div>
                        </div>
                    </div>
                    <div className='flex flex-col items-center space-y-2'>
                        <Image
                            alt={'asd'}
                            src={blacksmithsImg}
                            width={100}
                            height={100}
                            onClick={() => forge(2)}
                            className="z-30 border rounded-lg h-32 w-32 hover:scale-110 transition-all cursor-pointer"
                        />
                        <h2 className='text-base text-primary-foreground'>Blacksmiths</h2>
                        <div className='flex items-center gap-2 text-lg text-muted/80 font-semibold mr-4'>
                            <Image
                                alt={'Ingots Icon'}
                                src={ironIngots}
                                width={100}
                                height={100}
                                className={`z-30 border rounded-full h-6 w-6`}
                            />
                            <div>{blacksmithClaimableAmount}</div>
                        </div>
                    </div>
                    <div className='flex flex-col items-center space-y-2'>
                        <Image
                            alt={'asd'}
                            src={corgiSoldiersImg}
                            width={100}
                            height={100}
                            onClick={() => forge(3)}
                            className="z-30 border rounded-lg h-32 w-32 hover:scale-110 transition-all cursor-pointer"
                        />
                        <h2 className='text-base text-primary-foreground'>Corgi Soldiers</h2>
                        <div className='flex items-center gap-2 text-lg text-muted/80 font-semibold mr-4'>
                            <Image
                                alt={'Ingots Icon'}
                                src={ironIngots}
                                width={100}
                                height={100}
                                className={`z-30 border rounded-full h-6 w-6`}
                            />
                            <div>{corgiSoldierClaimableAmount}</div>
                        </div>
                    </div>
                    <div className='flex flex-col items-center space-y-2'>
                        <Image
                            alt={'asd'}
                            src={alchemistsImg}
                            width={100}
                            height={100}
                            onClick={() => forge(4)}
                            className="z-30 border rounded-lg h-32 w-32 hover:scale-110 transition-all cursor-pointer"
                        />
                        <h2 className='text-base text-primary-foreground'>Alchemists</h2>
                        <div className='flex items-center gap-2 text-lg text-muted/80 font-semibold mr-4'>
                            <Image
                                alt={'Ingots Icon'}
                                src={ironIngots}
                                width={100}
                                height={100}
                                className={`z-30 border rounded-full h-6 w-6`}
                            />
                            <div>{alchemistClaimableAmount}</div>
                        </div>
                    </div>
                </DialogDescription>
            </DialogContent>
        </Dialog >
    )
}



const ActiveFarmIndicator = ({
    active,
    blocksUntilUnlock
}: {
    active: boolean;
    blocksUntilUnlock: number;
}) => {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger>
                    <div className="relative w-4 h-4">
                        <div className={`absolute top-0 left-0 w-4 h-4 rounded-full ${active ? 'bg-green-500 animate-ping' : 'bg-yellow-500'}`} />
                        <div className={`absolute top-0 left-0 w-4 h-4 rounded-full ${active ? 'bg-green-500' : 'bg-yellow-500 animate-ping'}`} />
                    </div>
                </TooltipTrigger>
                <TooltipContent className={`overflow-scroll bg-black text-white border-primary leading-tight shadow-2xl max-w-prose`}                >
                    {active
                        ? 'Iron Ingots can be forged during this epoch.'
                        : `No more Iron Ingots can be forged this epoch. ${blocksUntilUnlock} blocks remaining.`}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

