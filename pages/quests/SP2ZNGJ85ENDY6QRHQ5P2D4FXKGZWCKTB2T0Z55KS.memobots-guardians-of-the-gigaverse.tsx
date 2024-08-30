import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import Layout from '@components/layout/layout';
import Image from 'next/image';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from '@components/ui/card';
import { Button } from '@components/ui/button';
import { GetServerSidePropsContext, GetStaticProps } from 'next';
import { memo, useEffect, useState } from 'react';
import { cn } from '@lib/utils';
import Link from 'next/link';
import Typewriter from 'typewriter-effect';
import { motion } from 'framer-motion';
import journeyOfDiscovery from '@public/quests/journey-of-discovery.png'
import experience from '@public/experience.png'
import schaImg from '@public/liquid-staked-charisma.png'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@components/ui/dialog';
import { AlertDialogHeader } from '@components/ui/alert-dialog';
import { getLand, getLands, getNftCollectionMetadata } from '@lib/db-providers/kv';
import { useAccount, useOpenContractCall } from '@micro-stacks/react';
import { uintCV, contractPrincipalCV } from 'micro-stacks/clarity';
import { FungibleConditionCode, makeStandardFungiblePostCondition, makeStandardSTXPostCondition, noneCV, optionalCVOf } from '@stacks/transactions';
import { getDehydratedStateFromSession, parseAddress } from '@components/stacks-session/session-helpers';
import { getTokenBalance } from '@lib/stacks-api';
import mooningSharkIcon from '@public/quests/mooning-shark/mooningshark-icon.jpeg'
import mooningSharkCard from '@public/quests/mooning-shark/mooning-shark-card.png'
import stxIcon from '@public/stx-logo.png'
import energyIcon from '@public/lands/img/energy.png'
import TokenSelectDialog from '@components/quest/token-select-dialog';
import useWallet from '@lib/hooks/wallet-balance-provider';
import { useGlobalState } from '@lib/hooks/global-state-context';
import { Input } from '@components/ui/input';
import { Slider } from '@components/ui/slider';
import { Label } from '@components/ui/label';
import memobotsCard from '@public/quests/memobots/card-bg.gif'
import memobotsCard2 from '@public/quests/memobots/card-bg2.gif'
import hiddenMemobot from '@public/quests/memobots/hidden-memobot.png'


export async function getServerSideProps(ctx: GetServerSidePropsContext) {

    const nftCollectionMetadata = await getNftCollectionMetadata('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.memobots-guardians-of-the-gigaverse')

    const dehydratedState = await getDehydratedStateFromSession(ctx) as string
    const stxAddress = await parseAddress(dehydratedState)

    return {
        props: {
            dehydratedState,
            stxAddress,
            nftCollectionMetadata,
        }
    };
};

type Props = {
    stxAddress: string;
    nftCollectionMetadata: any;
};

export default function Memobots({ stxAddress, nftCollectionMetadata }: Props) {
    const meta = {
        title: "Charisma | MemoBots",
        description: 'Guardians of the Gigaverse',
        image: '/quests/memobots/hidden-memobot.png'
    };
    const title = "MemoBots";
    const subtitle = 'Guardians of the Gigaverse';

    const fadeIn = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
    };

    // const { wallet } = useWallet()
    const { token, block, storedEnergy } = useGlobalState()

    const isMintedOut = nftCollectionMetadata?.properties.minted === nftCollectionMetadata?.properties.total_supply

    // const extraPostConditions = []
    // if (stxAddress) extraPostConditions.push(makeStandardSTXPostCondition(stxAddress, FungibleConditionCode.LessEqual, 4000000))

    const [mintAmountSelected, setMintAmountSelected] = useState<number>(1)
    const [energySpend, setEnergySpend] = useState<number>(0)

    const { openContractCall } = useOpenContractCall();

    const handleMintClick = () => {
        const postConditions: any[] = [
            makeStandardFungiblePostCondition(stxAddress, FungibleConditionCode.GreaterEqual, 1, 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-charisma::liquid-staked-token'),
            makeStandardSTXPostCondition(stxAddress, FungibleConditionCode.LessEqual, 5000000 * mintAmountSelected),
        ];

        // uintCV(mintAmountSelected),
        openContractCall({
            contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
            contractName: 'memobot-minter',
            functionName: "mint",
            functionArgs: [uintCV(token.metadata.id), uintCV(mintAmountSelected), optionalCVOf(uintCV(Number(energySpend)))],
            postConditions,
        });
    }

    const handleWhitelistMintClick = () => {
        const postConditions: any[] = [
            makeStandardSTXPostCondition(stxAddress, FungibleConditionCode.Equal, 1),
        ];

        // uintCV(mintAmountSelected),
        openContractCall({
            contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
            contractName: 'memobots-helper-v2',
            functionName: "whitelist-mint",
            functionArgs: [],
            postConditions,
        });
    }

    const availableEnergy = Number(token?.energy) + storedEnergy
    const energyDiscount = energySpend * 10 / 1000000
    const stxCost = (5 * mintAmountSelected) - energyDiscount
    const mintCost = stxCost > 0 ? `${(stxCost).toFixed(2)} STX` : `Free Mint`

    return (
        <Page meta={meta} fullViewport>
            <Image src={memobotsCard} alt="background-image" layout="fill" objectFit="cover" priority />
            <SkipNavContent />
            <Layout>
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeIn}
                    className="m-2 sm:container sm:mx-auto sm:py-10 md:max-w-3xl"
                >
                    <Card className="min-h-[600px] flex flex-col bg-black text-primary-foreground border-accent-foreground p-0 relative overflow-hidden rounded-md group/card w-full max-w-3xl opacity-[0.99] shadow-black shadow-2xl">
                        <CardHeader className="z-20 p-4 space-y-0">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="z-30 text-xl font-semibold">{title}</CardTitle>
                                    <CardDescription className="z-30 text-sm sm:text-md font-fine text-muted-foreground">
                                        {subtitle}
                                    </CardDescription>
                                </div>
                                <div className='leading-snug sm:mr-4'>
                                    <div className={`font-medium text-md whitespace-nowrap ${!isMintedOut ? `animate-pulse` : `text-primary`}`}>{isMintedOut ? `Minted Out` : `Minting Now`}</div>
                                    <div className='font-medium text-sm text-center text-primary-foreground/80'>{nftCollectionMetadata?.properties.minted} / {nftCollectionMetadata?.properties.total_supply}</div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="z-20 flex flex-col flex-grow p-4 items-center space-y-8">
                            <div className="relative w-60 hover:scale-125 hover:shadow-2xl transition-all">
                                <Image
                                    alt="NFT Icon"
                                    src={hiddenMemobot}
                                    quality={10}
                                    className="z-30 w-full rounded-md border shadow-lg"
                                />
                                <div className="absolute px-1 font-bold rounded-full -top-1 -right-3 text-sm bg-accent text-accent-foreground">
                                    NFT
                                </div>
                            </div>
                            <Label className='my-4 w-60'>
                                <div className='flex justify-between'>
                                    <div>Mint how many?</div>
                                    <div className={`text-sm text-right ${stxCost > 0 ? '' : 'text-yellow-500 animate-bounce'}`}>{mintCost}</div>
                                </div>
                                <Slider title='Mint how many?' onValueChange={(e: any) => setMintAmountSelected(e[0])} className='my-2' defaultValue={[1]} min={1} max={4} step={1} />
                                <div className='flex justify-between px-2 text-muted-foreground'>
                                    <div className={`${mintAmountSelected === 1 ? 'text-primary-foreground' : ''}`}>1</div>
                                    <div className={`${mintAmountSelected === 2 ? 'text-primary-foreground' : ''}`}>2</div>
                                    <div className={`${mintAmountSelected === 3 ? 'text-primary-foreground' : ''}`}>3</div>
                                    <div className={`${mintAmountSelected === 4 ? 'text-primary-foreground' : ''}`}>4</div>
                                </div>
                                <div className='mt-4 flex justify-between'>
                                    <div>Pay mint fees with energy?</div>
                                    <div className={`text-sm text-right`}>{energySpend}</div>
                                </div>
                                <Slider title='Spend how much energy?' onValueChange={(e: any) => setEnergySpend(e[0])} className='my-2' defaultValue={[0]} min={0} max={availableEnergy} step={1} />
                            </Label>

                        </CardContent>

                        <CardFooter className="z-20 flex justify-between p-4 items-end">
                            <Link href="/quests">
                                <Button variant="ghost" className="z-30">
                                    Back
                                </Button>
                            </Link>


                            {!isMintedOut && stxAddress &&
                                <div className='flex flex-col space-y-1'>
                                    <div className='text-xs text-center'>Have a GigaPepe v2?</div>
                                    <Button onClick={handleWhitelistMintClick} size={'sm'} className={`z-30 leading-none`} variant={'secondary'}>Whitelist Mint (Max 1)</Button>
                                    <Button onClick={handleMintClick} size={'sm'} className={`z-30`}>Mint MemoBots</Button>
                                </div>
                            }
                        </CardFooter>
                        <Image
                            src={memobotsCard2}
                            width={800}
                            height={1600}
                            alt={'quest-background-image'}
                            className={cn(
                                'object-cover',
                                'opacity-10',
                                'aspect-[2/5]',
                                'sm:aspect-square',
                                'flex',
                                'z-10',
                                'absolute',
                                'inset-0',
                                'pointer-events-none'
                            )}
                        />
                        <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-white to-black opacity-10" />
                    </Card>
                </motion.div>
            </Layout>
        </Page>
    );
}