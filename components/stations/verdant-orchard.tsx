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

export default function VerdantOrchardCard({ data }: any) {

    const [descriptionVisible, setDescriptionVisible] = useState(false);

    useEffect(() => {
        setDescriptionVisible(true);
    }, []);

    const [farmers, setFarmers] = useState(0)
    const [power, setPower] = useState(0)

    const sender = userSession.isUserSignedIn() && userSession.loadUserData().profile.stxAddress.mainnet

    useEffect(() => {
        sender && callReadOnlyFunction({
            network: new StacksMainnet(),
            contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
            contractName: 'creatures',
            functionName: "get-creature-power",
            functionArgs: [uintCV(1)],
            senderAddress: sender
        }).then(response => setPower(Number(cvToJSON(response).value)))
    }, [sender])

    useEffect(() => {
        sender && callReadOnlyFunction({
            network: new StacksMainnet(),
            contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
            contractName: 'creatures',
            functionName: "get-balance",
            functionArgs: [uintCV(1), principalCV(sender)],
            senderAddress: sender
        }).then(response => setFarmers(Number(cvToJSON(response).value.value)))

    }, [sender])

    return (
        <Card className="h-80 flex flex-col bg-black text-primary-foreground border-accent-foreground p-0 relative overflow-hidden rounded-md group/card w-full max-w-2xl opacity-[0.99] shadow-black shadow-2xl">
            <CardHeader className="z-20 p-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="z-30 text-sm font-semibold">
                        Bountiful Orchard
                    </CardTitle>
                    {farmers > 0 && <div className="flex space-x-3 items-center">
                        <div className="z-30 bg-background border border-primary/40 rounded-full px-2">
                            {numeral(data.tokenPrice * farmers * 20000000 * 2 * power * 6 * 24 / Math.pow(10, data.decimals)).format('($0.00a)')} / day
                        </div>
                        <div className="text-lg">{numeral(farmers).format('(0a)')}</div>
                        <ActiveFarmIndicator
                            active={true}
                            blocksUntilUnlock={0}
                        />
                    </div>}
                </div>
                <CardDescription className="z-30 text-xs sm:text-sm font-fine text-secondary/40 space-y-1">
                    <p>Farmers can harvest 2x more apples than other creature types in the bountiful orchard.</p>
                    {/* <p>Apples begin to rot after 1 million energy, so make sure to harvest them by then.</p> */}
                </CardDescription>
                <div className="z-20">
                    {/* <CardTitle className="z-30 mt-2 text-xl font-semibold">Yield Farming</CardTitle> */}
                    {descriptionVisible && (
                        <Link href={`https://explorer.hiro.so/txid/SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.bountiful-orchard?chain=mainnet`} target='_blank'>
                            <CardDescription className="z-30 mb-4 text-sm font-fine text-foreground flex items-end space-x-1">
                                <div>Bountiful Orchard</div> <Link1Icon className="mb-0.5" />
                            </CardDescription>
                        </Link>
                    )}
                </div>
            </CardHeader>
            <CardFooter className="z-20 flex justify-between pb-4 px-4 items-end mt-auto flex-1">
                {farmers > 0 &&
                    <SelectCreatureDialog data={data} />
                }
            </CardFooter>
            <Image
                src={farmersImg}
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
                    <div className={`pb-1 rounded-full ${active ? 'animate-pulse' : 'bg-yellow-500'}`}>🧑‍🌾</div>
                </TooltipTrigger>
                <TooltipContent
                    className={`overflow-scroll bg-black text-white border-primary leading-tight shadow-2xl max-w-prose`}
                >
                    {active
                        ? 'Creatures are working the farm'
                        : `No creatures availabe to work the farm.`
                    }
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

export function SelectCreatureDialog({ data }: any) {

    const { doContractCall } = useConnect();

    const sender = userSession.isUserSignedIn() && userSession.loadUserData().profile.stxAddress.mainnet

    async function harvest(creatureId: number) {
        const response = await callReadOnlyFunction({
            network: new StacksMainnet(),
            contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
            contractName: 'bountiful-orchard',
            functionName: "get-claimable-amount",
            functionArgs: [uintCV(creatureId)],
            senderAddress: sender
        })
        const claimableTokens = Number(cvToJSON(response).value)
        doContractCall({
            network: new StacksMainnet(),
            anchorMode: AnchorMode.Any,
            contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
            contractName: 'bountiful-orchard',
            functionName: "harvest",
            functionArgs: [uintCV(creatureId)],
            postConditionMode: PostConditionMode.Deny,
            postConditions: [Pc.principal('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.bountiful-orchard').willSendGte(0).ft("SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.fuji-apples", "index-token")],
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
                <Button size={'sm'} className={`z-30 w-full`}>Harvest Fuji Apples</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <AlertDialogHeader>
                    <DialogTitle>Which creatures should harvest the Fuji Apples?</DialogTitle>
                </AlertDialogHeader>

                <DialogDescription className='grid gap-2 grid-cols-4 space-x-4 py-4'>
                    <div className='flex flex-col items-center space-y-2'>
                        <Image
                            alt={'asd'}
                            src={farmersImg}
                            width={100}
                            height={100}
                            onClick={() => harvest(1)}
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
                            onClick={() => harvest(2)}
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
                            onClick={() => harvest(3)}
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
                            onClick={() => harvest(4)}
                            className="z-30 border rounded-full h-32 w-32 hover:scale-110 transition-all cursor-pointer"
                        />
                        <h2 className='text-base text-primary-foreground'>Alchemists</h2>
                    </div>
                </DialogDescription>
            </DialogContent>
        </Dialog >
    )
}