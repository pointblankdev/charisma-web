import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import Layout from '@components/layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@lib/utils';
import React, { useEffect } from 'react';
import charismaToken from '@public/charisma.png'
import stxToken from '@public/stacks-stx-logo.png'
import { GetStaticProps } from 'next';
import Typewriter from 'typewriter-effect';
import { motion } from "framer-motion"
import { checkQuestActivatedAndUnexpired, checkQuestCompleteAndUnlocked, checkQuestStxRewards } from '@lib/stacks-api';
import { userSession } from '@components/stacks-session/connect';
import { useConnect } from "@stacks/connect-react";
import { StacksMainnet } from "@stacks/network";
import {
    AnchorMode,
    PostConditionMode,
    callReadOnlyFunction,
    uintCV,
} from "@stacks/transactions";
import { getAllWallets, getQuestBySlug } from '@lib/cms-providers/dato';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip';
import { createQuestSession } from '@lib/user-api';


type Props = any

export default function QuestDetail(props: Props) {
    const meta = {
        title: 'Charisma | Quest-to-Earn',
        description: META_DESCRIPTION
    };

    const charismaRewards = props?.charismaRewards || 0
    const wallets = props.wallets

    const { doContractCall } = useConnect();
    const [questAccepted, setQuestAccepted] = React.useState(false)
    const [objectivesVisible, setObjectivesVisible] = React.useState(false)
    const [questCompleted, setQuestCompleted] = React.useState(false)
    const [questLocked, setQuestLocked] = React.useState(false)
    const [questActive, setQuestActive] = React.useState(false)
    const [questSTXRewards, setQuestSTXRewards] = React.useState(0)
    const [isWhitelisted, setWhitelisted] = React.useState(false)
    const [user, setUser] = React.useState<any>(null)

    const showCommunityRewards = charismaRewards > 0 || questSTXRewards > 0

    useEffect(() => {
        if (userSession.isUserSignedIn()) {
            const profile = userSession.loadUserData().profile
            setUser(wallets.find((w: any) => w.stxaddress === profile.stxAddress.mainnet))
            setWhitelisted(wallets.some((w: any) => w.stxaddress === profile.stxAddress.mainnet))
            checkQuestCompleteAndUnlocked(profile.stxAddress.mainnet, Number(props?.questid || 0))
                .then((res) => {
                    if (!res.success) {

                        console.warn(res.value.value)

                        if (Number(res.value.value) === 3101) {
                            console.warn('Quest Not Complete')
                            setQuestCompleted(false)
                            setQuestLocked(false)
                        }
                        if (Number(res.value.value) === 3102) {
                            console.warn('Rewards Locked')
                            setQuestLocked(true)
                            setQuestCompleted(true)
                        }
                    } else {
                        setQuestCompleted(true)
                        setQuestLocked(false)
                    }
                })

            checkQuestActivatedAndUnexpired(profile.stxAddress.mainnet, Number(props?.questid || 0))
                .then((res) => {
                    if (!res.success) {
                        console.warn(res.value.value)
                        setQuestActive(false)
                    } else {
                        setQuestActive(true)
                    }
                })

            checkQuestStxRewards(profile.stxAddress.mainnet, Number(props?.questid || 0))
                .then((res) => {
                    if (!res.success) {
                        console.warn(res.value.value)
                    } else {
                        console.log(res.value.value)
                        setQuestSTXRewards(res.value.value / 1000000)
                    }
                })
        }
    }, [props, wallets])

    const claimRewards = () => {
        doContractCall({
            network: new StacksMainnet(),
            anchorMode: AnchorMode.Any,
            contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
            contractName: "dme015-quest-reward-helper",
            functionName: "claim-quest-reward",
            functionArgs: [uintCV(Number(props?.questid))],
            postConditionMode: PostConditionMode.Deny,
            postConditions: [],
            onFinish: (data) => {
                console.log("onFinish:", data);
            },
            onCancel: () => {
                console.log("onCancel:", "Transaction was canceled");
            },
        });
    }

    const handleViewQuest = () => {
        setQuestAccepted(true)
        if (questLocked) {
            setObjectivesVisible(true)
        }
        const quest = props?.id
        const wallet = user?.id
        createQuestSession({ quest, wallet, instance: `${quest}${wallet}` })
    }

    const fadeIn = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
    };

    return (
        <Page meta={meta} fullViewport>
            <Layout className='m-2 sm:container sm:mx-auto sm:py-10 items-center'>
                <Card className='bg-black text-primary-foreground border-accent-foreground p-0 relative overflow-hidden rounded-md group/card w-full max-w-2xl'>
                    <CardHeader className='p-4 z-20'>
                        <div className='flex justify-between items-center'>
                            <CardTitle className='text-xl font-semibold z-30'>{props?.title}</CardTitle>
                            <ActiveQuestIndicator active={questActive} />
                        </div>
                        <CardDescription className='text-md font-fine text-foreground z-30'>{props?.subtitle}</CardDescription>
                        <div className='z-20'>
                            <CardTitle className='text-xl font-semibold mt-2 z-30'>Rewards</CardTitle>
                            {showCommunityRewards && <CardDescription className='text-sm font-fine text-foreground mb-4 z-30'>You will recieve:</CardDescription>}
                            {showCommunityRewards ? <div className='grid gap-4 grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10'>
                                <div className='relative'>
                                    <Image src={charismaToken} alt='charisma-token' className='border-white rounded-full border w-full z-30 ' />
                                    <div className='absolute -top-1 -right-3 text-md md:text-base lg:text-xs font-bold bg-accent text-accent-foreground rounded-full px-1'>{charismaRewards}</div>
                                </div>
                                {questSTXRewards > 0 && <div className='relative'>
                                    <Image src={stxToken} alt='stx-token' className='border-white rounded-full border w-full z-30 ' />
                                    <div className='absolute -top-1 -right-3 text-md md:text-base lg:text-xs font-bold bg-accent text-accent-foreground rounded-full px-1'>{questSTXRewards}</div>
                                </div>}
                            </div> : <div className='text-sm font-fine text-foreground z-30'>No rewards have been set for this quest yet</div>}
                        </div>
                    </CardHeader>
                    {!questAccepted && <CardFooter className="p-4 flex justify-between z-20">
                        <Link href='/quests'><Button variant="ghost" className='z-30'>Back</Button></Link>
                        <Button variant="ghost" className='text-primary hover:bg-white hover:text-primary z-30' onClick={handleViewQuest}>View</Button>
                    </CardFooter>}

                    {questAccepted && <CardContent className='p-0 z-20'>
                        <div className='p-4 z-30'>
                            <CardTitle className='text-xl font-semibold z-30'>Description</CardTitle>
                            <p className='text-base z-30'>
                                {questLocked ? props?.description?.map((s: string) => <span key={s}>{s}</span>) : <Typewriter
                                    options={{
                                        delay: 25,
                                    }}
                                    onInit={(typewriter) => {
                                        typewriter.pauseFor(1500)
                                        props?.description?.forEach((s: string) => typewriter.typeString(s).pauseFor(1000))

                                        typewriter.start().callFunction(() => setObjectivesVisible(true))
                                    }}
                                />}
                            </p>

                            {objectivesVisible && <motion.div initial="hidden" animate="visible" variants={fadeIn} className='text-xl font-semibold mt-4 z-30'>Objectives</motion.div>}
                            {objectivesVisible && props?.objectives?.map((o: any, k: any) =>
                                <motion.p key={k} initial="hidden" animate="visible" variants={fadeIn} className={`text-md font-fine text-foreground z-30 duration-200 ease-out transition transform `}>
                                    {/* TODO: fix this hacky solution */}
                                    {o.text}: {questCompleted ? "1/1" : o.metric}
                                </motion.p>
                            )}
                        </div>
                    </CardContent>}
                    {questAccepted && <CardFooter className="p-4 flex justify-between z-20">
                        <Link href='/quests'><Button variant="ghost" className='z-30'>Back</Button></Link>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>{<Button variant="ghost" className='text-primary hover:bg-white hover:text-primary z-30' onClick={claimRewards} disabled={questLocked || !isWhitelisted || !questCompleted}>Claim Rewards</Button>}</TooltipTrigger>
                                <TooltipContent className={`max-w-[99vw] max-h-[80vh] overflow-scroll bg-black text-white border-primary leading-tight shadow-2xl`}>
                                    {!isWhitelisted ? 'You are not whitelisted for this quest' : questLocked ? 'You have already claimed rewards for this quest' : questCompleted ? 'Click to claim quest rewards' : 'Complete the quest objective to claim the rewards'}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </CardFooter>}
                    <Image
                        src={props?.questBgImage?.url}
                        width={800}
                        height={1600}
                        alt={'quest-background-image'}
                        className={cn("object-cover", "sm:aspect-[1/2]", 'aspect-[1/3]', 'opacity-10', 'flex', 'z-10', 'absolute', 'inset-0', 'pointer-events-none')}
                    />
                    <div className='absolute inset-0 bg-gradient-to-b from-white to-black opacity-10 z-0 pointer-events-none' />
                </Card>
            </Layout>

        </Page >
    );
}

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {


    const wallets = await getAllWallets()
    const quest = await getQuestBySlug(String(params?.slug))

    const getCharismaRewards: any = await callReadOnlyFunction({
        network: new StacksMainnet(),
        contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
        contractName: "dme009-charisma-rewards",
        functionName: "get-rewards",
        functionArgs: [uintCV(Number(quest?.questid))],
        senderAddress: 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ'
    })

    return {
        props: {
            ...quest,
            charismaRewards: Number(getCharismaRewards.value.value),
            wallets
        },
        revalidate: 60
    };
};

export const getStaticPaths = () => {
    return {
        paths: [
            { params: { slug: 'charismatic-flow' } },
        ],
        fallback: true
    };
}

// active quest indicator pings green circle when active, red when not active
// tooltip on hover shows "active" or "not active"
const ActiveQuestIndicator = ({ active }: { active: boolean }) => {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger className='cursor-default'>
                    <div className='relative w-4 h-4'>
                        <div className={`absolute top-0 left-0 w-4 h-4 rounded-full ${active ? 'bg-green-500 animate-ping' : 'bg-red-500'}`} />
                        <div className={`absolute top-0 left-0 w-4 h-4 rounded-full ${active ? 'bg-green-500' : 'bg-red-500'}`} />
                    </div>
                </TooltipTrigger>
                <TooltipContent className={`max-w-[99vw] max-h-[80vh] overflow-scroll bg-black text-white border-primary leading-tight shadow-2xl`}>
                    {active ? 'Quest is active' : 'Quest is not active'}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
