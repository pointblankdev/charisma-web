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
import fujiApplesImg from '@public/stations/fuji-apples.png'
import { motion } from 'framer-motion';




export default function AbundantOrchardCard({ data }: any) {

    const fadeIn = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
    };

    const [linkVisible, setLinkVisible] = useState(false);

    useEffect(() => {
        setLinkVisible(true);
    }, []);

    const [orchardBalance, setOrchardBalance] = useState(0)

    const [creatureSelected, setCreatureSelected] = useState(1)
    const [energyPerBlock, setEnergyPerBlock] = useState(0)
    const [factor, setFactor] = useState(1)

    const sender = userSession.isUserSignedIn() && userSession.loadUserData().profile.stxAddress.mainnet

    useEffect(() => {
        sender && callReadOnlyFunction({
            network: new StacksMainnet(),
            contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
            contractName: 'creatures-kit',
            functionName: "get-energy-per-block",
            functionArgs: [uintCV(creatureSelected), principalCV(sender)],
            senderAddress: sender
        }).then(response => setEnergyPerBlock(Number(cvToJSON(response).value)))
    }, [sender, creatureSelected])

    useEffect(() => {
        sender && callReadOnlyFunction({
            network: new StacksMainnet(),
            contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
            contractName: 'abundant-orchard',
            functionName: "get-factor",
            functionArgs: [],
            senderAddress: sender
        }).then(response => setFactor(Number(cvToJSON(response).value)))

        sender && callReadOnlyFunction({
            network: new StacksMainnet(),
            contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
            contractName: 'fuji-apples',
            functionName: "get-balance",
            functionArgs: [principalCV('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.abundant-orchard')],
            senderAddress: sender
        }).then((response: any) => setOrchardBalance(Number(cvToJSON(response.value).value / 1000000)))
    }, [sender])

    const farmerCreatureTypeId = 1
    const creatureFactor = creatureSelected === farmerCreatureTypeId ? 2 : 1

    const energyPerDay = energyPerBlock * 6 * 24
    const tokensPerDay = energyPerDay * factor * creatureFactor / Math.pow(10, data.decimals)
    const dollarsPerDay = tokensPerDay * data.tokenPrice

    const handleCreatureSwitch = () => {
        setCreatureSelected(creature => (creature >= 4 ? 1 : ++creature))
    }

    const creatureIcon = creatureSelected === 1 ? farmersImg : creatureSelected === 2 ? blacksmithsImg : creatureSelected === 3 ? corgiSoldiersImg : alchemistsImg


    return (
        <motion.div initial="hidden" animate="visible" variants={fadeIn}>
            {linkVisible && <Card className="flex flex-col bg-black text-primary-foreground border-accent-foreground p-0 relative overflow-hidden rounded-md group/card w-full max-w-3xl opacity-[0.99] shadow-black shadow-2xl">
                <CardHeader className="z-20 p-4">
                    <div className="flex items-start justify-between flex-row">
                        <div>
                            <CardTitle className="z-30 text-lg font-semibold">
                                <Link href={`https://explorer.hiro.so/txid/SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.abundant-orchard?chain=mainnet`} target='_blank'>
                                    <div className="z-30 text-primary-foreground flex items-center space-x-2">
                                        <div>Quest: Abundant Orchard</div> <Link1Icon className="mt-0.5 text-primary-foreground/50" />
                                    </div>
                                </Link>
                            </CardTitle>
                            <div className='text-sm font-semibold text-secondary/70'>{numeral(orchardBalance).format('(0.00a)')} FUJI available in supply</div>
                        </div>
                        <div className="flex  space-x-3 items-center">
                            <div className="z-30 bg-background border border-primary/40 rounded-full px-2">
                                {numeral(dollarsPerDay).format('($0.00a)')} / day
                            </div>
                            <div onClick={handleCreatureSwitch} className='transition-all hover: cursor-pointer overflow-hidden border rounded-full hover:scale-110'><Image alt='creature icon' src={creatureIcon} className='rounded-full h-8 w-8' /></div>
                        </div>
                    </div>
                    <CardDescription className="z-30 text-xs space-y-2 py-4">
                        <div className='text-base text-primary-foreground'>Quest Details</div>
                        <ul className='list-inside list-disc sm:text-sm font-fine text-primary-foreground/60 space-y-2'>
                            <li className='leading-tight'>You can claim Fuji Apples by spending your creatures energy, which will reset it back to zero.</li>
                            <li className='leading-tight'>You can spend your creatures energy to claim Fuji Apples on each and every block.</li>
                            <li className='leading-tight'>There is no limit to the amount of Fuji Apples you get per each claim.</li>
                            <li className='leading-tight'>Farmers harvest 2x more apples than other creature types on this quest.</li>
                        </ul>
                    </CardDescription>
                    <div className="z-20">
                        {/* <CardTitle className="z-30 mt-2 text-xl font-semibold">Yield Farming</CardTitle> */}

                    </div>
                </CardHeader>
                <CardFooter className="z-20 flex justify-between pb-4 px-4 items-end mt-auto flex-1">
                    <SelectCreatureDialog data={data} />
                </CardFooter>
                <Image
                    src={farmersImg}
                    width={800}
                    height={1600}
                    alt={'quest-background-image'}
                    className={cn(
                        'object-bottom',
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
            </Card>}
        </motion.div>
    )
}

export function SelectCreatureDialog({ data }: any) {

    const { doContractCall } = useConnect();

    const sender = userSession.isUserSignedIn() && userSession.loadUserData().profile.stxAddress.mainnet

    const [farmerClaimableAmount, setFarmerClaimableAmount] = useState(0)
    const [blacksmithClaimableAmount, setBlacksmithClaimableAmount] = useState(0)
    const [corgiSoldierClaimableAmount, setCorgiSoldierClaimableAmount] = useState(0)
    const [alchemistClaimableAmount, setAlchemistClaimableAmount] = useState(0)

    useEffect(() => {

        callReadOnlyFunction({
            network: new StacksMainnet(),
            contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
            contractName: 'abundant-orchard',
            functionName: "get-claimable-amount",
            functionArgs: [uintCV(1)],
            senderAddress: sender
        }).then(response => setFarmerClaimableAmount(Number(cvToJSON(response).value) / 1000000))

        callReadOnlyFunction({
            network: new StacksMainnet(),
            contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
            contractName: 'abundant-orchard',
            functionName: "get-claimable-amount",
            functionArgs: [uintCV(2)],
            senderAddress: sender
        }).then(response => setBlacksmithClaimableAmount(Number(cvToJSON(response).value) / 1000000))

        callReadOnlyFunction({
            network: new StacksMainnet(),
            contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
            contractName: 'abundant-orchard',
            functionName: "get-claimable-amount",
            functionArgs: [uintCV(3)],
            senderAddress: sender
        }).then(response => setCorgiSoldierClaimableAmount(Number(cvToJSON(response).value) / 1000000))

        callReadOnlyFunction({
            network: new StacksMainnet(),
            contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
            contractName: 'abundant-orchard',
            functionName: "get-claimable-amount",
            functionArgs: [uintCV(4)],
            senderAddress: sender
        }).then(response => setAlchemistClaimableAmount(Number(cvToJSON(response).value) / 1000000))

    }, [sender])

    async function harvest(creatureId: number) {
        const response = await callReadOnlyFunction({
            network: new StacksMainnet(),
            contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
            contractName: 'abundant-orchard',
            functionName: "get-claimable-amount",
            functionArgs: [uintCV(creatureId)],
            senderAddress: sender
        })
        const claimableTokens = Number(cvToJSON(response).value)
        doContractCall({
            network: new StacksMainnet(),
            anchorMode: AnchorMode.Any,
            contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
            contractName: 'abundant-orchard',
            functionName: "harvest",
            functionArgs: [uintCV(creatureId)],
            postConditionMode: PostConditionMode.Deny,
            postConditions: [Pc.principal('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.abundant-orchard').willSendGte(1).ft("SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.fuji-apples", "index-token")],
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
                    <DialogTitle>Which creatures should harvest Fuji Apples?</DialogTitle>
                </AlertDialogHeader>

                <DialogDescription className='grid gap-2 grid-cols-2 sm:grid-cols-4 space-x-4 py-4'>
                    <div className='flex flex-col items-center space-y-2'>
                        <Image
                            alt={'asd'}
                            src={farmersImg}
                            width={100}
                            height={100}
                            onClick={() => harvest(1)}
                            className="z-30 border rounded-lg h-32 w-32 hover:scale-110 transition-all cursor-pointer"
                        />
                        <h2 className='text-base text-primary-foreground'>Farmers</h2>
                        <div className='flex items-center gap-2 text-lg text-muted/80 font-semibold mr-4'>
                            <Image
                                alt={'Apples Icon'}
                                src={fujiApplesImg}
                                width={100}
                                height={100}
                                className={`z-30 border rounded-full h-6 w-6`}
                            />
                            <div>{numeral(farmerClaimableAmount).format('0a')}</div>
                        </div>
                    </div>
                    <div className='flex flex-col items-center space-y-2'>
                        <Image
                            alt={'asd'}
                            src={blacksmithsImg}
                            width={100}
                            height={100}
                            onClick={() => harvest(2)}
                            className="z-30 border rounded-lg h-32 w-32 hover:scale-110 transition-all cursor-pointer"
                        />
                        <h2 className='text-base text-primary-foreground'>Blacksmiths</h2>
                        <div className='flex items-center gap-2 text-lg text-muted/80 font-semibold mr-4'>
                            <Image
                                alt={'Apples Icon'}
                                src={fujiApplesImg}
                                width={100}
                                height={100}
                                className={`z-30 border rounded-full h-6 w-6`}
                            />
                            <div>{numeral(blacksmithClaimableAmount).format('0a')}</div>
                        </div>
                    </div>
                    <div className='flex flex-col items-center space-y-2'>
                        <Image
                            alt={'asd'}
                            src={corgiSoldiersImg}
                            width={100}
                            height={100}
                            onClick={() => harvest(3)}
                            className="z-30 border rounded-lg h-32 w-32 hover:scale-110 transition-all cursor-pointer"
                        />
                        <h2 className='text-base text-primary-foreground'>Corgi Soldiers</h2>
                        <div className='flex items-center gap-2 text-lg text-muted/80 font-semibold mr-4'>
                            <Image
                                alt={'Apples Icon'}
                                src={fujiApplesImg}
                                width={100}
                                height={100}
                                className={`z-30 border rounded-full h-6 w-6`}
                            />
                            <div>{numeral(corgiSoldierClaimableAmount).format('0a')}</div>
                        </div>
                    </div>
                    <div className='flex flex-col items-center space-y-2'>
                        <Image
                            alt={'asd'}
                            src={alchemistsImg}
                            width={100}
                            height={100}
                            onClick={() => harvest(4)}
                            className="z-30 border rounded-lg h-32 w-32 hover:scale-110 transition-all cursor-pointer"
                        />
                        <h2 className='text-base text-primary-foreground'>Alchemists</h2>
                        <div className='flex items-center gap-2 text-lg text-muted/80 font-semibold mr-4'>
                            <Image
                                alt={'Apples Icon'}
                                src={fujiApplesImg}
                                width={100}
                                height={100}
                                className={`z-30 border rounded-full h-6 w-6`}
                            />
                            <div>{numeral(alchemistClaimableAmount).format('0a')}</div>
                        </div>
                    </div>
                </DialogDescription>
            </DialogContent>
        </Dialog >
    )
}