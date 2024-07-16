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

export default function IronForgeCard({ data }: any) {

    const [descriptionVisible, setDescriptionVisible] = useState(false);

    const [blocksPerEpoch, setBlocksPerEpoch] = useState(0);
    const [supplyPerEpoch, setSupplyPerEpoch] = useState(0);
    const [currentEpoch, setCurrentEpoch] = useState(0);
    const [blocksUntilNextEpoch, setBlocksUntilNextEpoch] = useState(0);
    const [epochProgress, setEpochProgress] = useState(0);
    const [supplyUtilization, setSupplyUtilization] = useState(0);

    const sender = userSession.isUserSignedIn() && userSession.loadUserData().profile.stxAddress.mainnet

    useEffect(() => {
        setDescriptionVisible(true);
    }, []);

    useEffect(() => {
        sender && callReadOnlyFunction({
            network: new StacksMainnet(),
            contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
            contractName: 'iron-forge',
            functionName: "get-blocks-per-epoch",
            functionArgs: [],
            senderAddress: sender
        }).then(response => setBlocksPerEpoch(Number(cvToJSON(response).value)))
    }, [sender])

    useEffect(() => {
        sender && callReadOnlyFunction({
            network: new StacksMainnet(),
            contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
            contractName: 'iron-forge',
            functionName: "get-supply-per-epoch",
            functionArgs: [],
            senderAddress: sender
        }).then(response => setSupplyPerEpoch(Number(cvToJSON(response).value)))
    }, [sender])

    useEffect(() => {
        sender && callReadOnlyFunction({
            network: new StacksMainnet(),
            contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
            contractName: 'iron-forge',
            functionName: "get-current-epoch",
            functionArgs: [],
            senderAddress: sender
        }).then(response => setCurrentEpoch(Number(cvToJSON(response).value)))
    }, [sender])

    useEffect(() => {
        sender && callReadOnlyFunction({
            network: new StacksMainnet(),
            contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
            contractName: 'iron-forge',
            functionName: "get-blocks-until-next-epoch",
            functionArgs: [],
            senderAddress: sender
        }).then(response => setBlocksUntilNextEpoch(Number(cvToJSON(response).value)))
    }, [sender])

    useEffect(() => {
        sender && callReadOnlyFunction({
            network: new StacksMainnet(),
            contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
            contractName: 'iron-forge',
            functionName: "get-epoch-progress",
            functionArgs: [],
            senderAddress: sender
        }).then(response => setEpochProgress(Number(cvToJSON(response).value)))
    }, [sender])

    useEffect(() => {
        sender && callReadOnlyFunction({
            network: new StacksMainnet(),
            contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
            contractName: 'iron-forge',
            functionName: "get-supply-utilization",
            functionArgs: [],
            senderAddress: sender
        }).then(response => setSupplyUtilization(Number(cvToJSON(response).value)))
    }, [sender])

    return (
        <Card className="h-80 flex flex-col bg-black text-primary-foreground border-accent-foreground p-0 relative overflow-hidden rounded-md group/card w-full max-w-3xl opacity-[0.99] shadow-black shadow-2xl">
            <CardHeader className="z-20 p-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="z-30 text-sm font-semibold">
                        <div className="z-20">
                            {descriptionVisible && (
                                <Link href={`https://explorer.hiro.so/txid/SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.bountiful-orchard?chain=mainnet`} target='_blank'>
                                    <CardDescription className="z-30 text-base font-fine text-primary-foreground flex items-end space-x-1">
                                        <div>Iron Forge</div> <Link1Icon className="mb-0.5" />
                                    </CardDescription>
                                </Link>
                            )}
                        </div>
                    </CardTitle>
                </div>
                <CardDescription className="z-30 text-md font-fine text-secondary/40 space-y-1 pb-4">
                    <p>Only a certain amount of Iron Ingots can be forged per epoch.</p>
                    <p>Once they have all been forged, you must wait until the next epoch to start.</p>
                </CardDescription>


                <div className="flex space-x-3 items-center text-sm pb-2">
                    <div className="z-30 bg-background border border-primary/40 rounded-full px-2">
                        Blocks Per Epoch: {blocksPerEpoch}
                    </div>
                    <div className="z-30 bg-background border border-primary/40 rounded-full px-2">
                        Supply Per Epoch: {supplyPerEpoch / 1000000} IRON
                    </div>
                </div>

                <div className="flex space-x-3 items-center text-sm pb-2">
                    <div className="z-30 bg-background border border-primary/40 rounded-full px-2">
                        Current Epoch: {currentEpoch}
                    </div>
                    <div className="z-30 bg-background border border-primary/40 rounded-full px-2">
                        Blocks Until Next Epoch: {blocksUntilNextEpoch}
                    </div>
                </div>

                <div className="flex space-x-3 items-center text-sm pb-2">
                    <div className="z-30 bg-background border border-primary/40 rounded-full px-2">
                        Epoch Progress: {epochProgress}%
                    </div>
                    <div className="z-30 bg-background border border-primary/40 rounded-full px-2">
                        Supply Utilization: {supplyUtilization}%
                    </div>
                </div>
            </CardHeader>
            <CardFooter className="z-20 flex justify-between pb-4 px-4 items-end mt-auto flex-1">
                <SelectCreatureDialog data={data} />
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

export function SelectCreatureDialog({ data }: any) {

    const { doContractCall } = useConnect();

    const sender = userSession.isUserSignedIn() && userSession.loadUserData().profile.stxAddress.mainnet

    async function forge(creatureId: number) {
        const response = await callReadOnlyFunction({
            network: new StacksMainnet(),
            contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
            contractName: 'iron-forge',
            functionName: "get-claimable-amount",
            functionArgs: [uintCV(creatureId)],
            senderAddress: sender
        })
        const claimableTokens = Number(cvToJSON(response).value)
        doContractCall({
            network: new StacksMainnet(),
            anchorMode: AnchorMode.Any,
            contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
            contractName: 'iron-forge',
            functionName: "forge",
            functionArgs: [uintCV(creatureId)],
            postConditionMode: PostConditionMode.Deny,
            postConditions: [Pc.principal('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.iron-forge').willSendGte(1).ft("SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.iron-ingots", "index-token")],
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
                <Button size={'sm'} className={`z-30 w-full`}>Forge Iron Ingots</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <AlertDialogHeader>
                    <DialogTitle>Which creatures should forge Iron Ingots?</DialogTitle>
                </AlertDialogHeader>

                <DialogDescription className='grid gap-2 grid-cols-4 space-x-4 py-4'>
                    <div className='flex flex-col items-center space-y-2'>
                        <Image
                            alt={'asd'}
                            src={farmersImg}
                            width={100}
                            height={100}
                            onClick={() => forge(1)}
                            className="z-30 border rounded-full h-32 w-32 hover:scale-110 transition-all cursor-pointer"
                        />
                        <h2 className='text-base text-primary-foreground'>Farmers</h2>
                    </div>
                    <div className='flex flex-col items-center space-y-2'>
                        <Image
                            alt={'asd'}
                            src={blacksmithsImg}
                            width={100}
                            height={100}
                            onClick={() => forge(2)}
                            className="z-30 border rounded-full h-32 w-32 hover:scale-110 transition-all cursor-pointer"
                        />
                        <h2 className='text-base text-primary-foreground'>Blacksmiths</h2>
                    </div>
                    <div className='flex flex-col items-center space-y-2'>
                        <Image
                            alt={'asd'}
                            src={corgiSoldiersImg}
                            width={100}
                            height={100}
                            onClick={() => forge(3)}
                            className="z-30 border rounded-full h-32 w-32 hover:scale-110 transition-all cursor-pointer"
                        />
                        <h2 className='text-base text-primary-foreground'>Corgi Soldiers</h2>
                    </div>
                    <div className='flex flex-col items-center space-y-2'>
                        <Image
                            alt={'asd'}
                            src={alchemistsImg}
                            width={100}
                            height={100}
                            onClick={() => forge(4)}
                            className="z-30 border rounded-full h-32 w-32 hover:scale-110 transition-all cursor-pointer"
                        />
                        <h2 className='text-base text-primary-foreground'>Alchemists</h2>
                    </div>
                </DialogDescription>
            </DialogContent>
        </Dialog >
    )
}