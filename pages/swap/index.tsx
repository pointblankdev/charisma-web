
import { SkipNavContent } from '@reach/skip-nav';

import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import Layout from '@components/layout';
import Image from 'next/image';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@components/ui/tooltip"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@components/ui/card';
import { GetStaticProps } from 'next';
import { useEffect, useLayoutEffect, useState } from 'react';
import { cn } from '@lib/utils';
import { motion } from "framer-motion"
import fenrirIcon from '@public/fenrir-icon-2.png'
import stxIcon from '@public/stacks-stx-logo.png'
import swap from '@public/quests/a2.png'
import { Input } from '@components/ui/input';
import SwapStxForFenrir from '@components/swap/fenrir';
import millify from 'millify';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/swap/select';
import SwapFenrirForStx from '@components/swap/stx';
import { getFenrirBalance, getFenrirTotalSupply, getTokenPrices } from '@lib/stacks-api';

export default function Swap({ data }: Props) {
    const meta = {
        title: 'Charisma | Swap Tokens',
        description: META_DESCRIPTION,
        image: '/fenrir-21.png'
    };

    const [amount, setAmount] = useState('');

    const handleTokenAmountChange = (event: any) => {
        const { value } = event.target;
        // Limit input to only allow numbers and to 6 decimal places
        if (/^\d*\.?\d{0,4}$/.test(value)) {
            setAmount(value);
        }
    };

    const [odinWelshRatio, setOdinWelshRatio] = useState(1)
    const [welshVelarPrice, setWelshVelarPrice] = useState(0)
    const [odinVelarPrice, setOdinVelarPrice] = useState(0)
    const [stxVelarPrice, setStxVelarPrice] = useState(0)

    const [welshBalance, setWelshBalance] = useState(0)
    const [odinBalance, setOdinBalance] = useState(0)
    const [fenrirTotalSupply, setFenrirTotalSupply] = useState(0)

    useEffect(() => {
        getTokenPrices().then((response) => {
            const odinVelarPrice = Number(response.message[16].price)
            const welshVelarPrice = Number(response.message[14].price)
            const stxVelarPrice = Number(response.message[0].price)
            setOdinWelshRatio((odinVelarPrice * 10) / welshVelarPrice)
            setOdinVelarPrice(odinVelarPrice)
            setWelshVelarPrice(welshVelarPrice)
            setStxVelarPrice(stxVelarPrice)

            getFenrirBalance("liquid-staked-welsh-v2").then((amount) => {
                setWelshBalance(Number(amount.value.value))
            })
            getFenrirBalance("liquid-staked-odin").then((amount) => {
                setOdinBalance(Number(amount.value.value))
            })
            getFenrirTotalSupply().then((amount) => {
                setFenrirTotalSupply(Number(amount.value.value))
            })
        })
    }, [])

    const fadeIn = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
    };

    const [sellToken, setSellToken] = useState('STX');
    const [buyToken, setBuyToken] = useState('FENRIR');

    const amountStx = Number(amount) * 1000000
    let amountStxForWelsh = 0
    let amountStxForOdin = 0
    let amountFenrir = 0
    let amountOutEstimation = 0

    if (sellToken === 'STX' && buyToken === 'FENRIR') {
        amountStxForWelsh = Math.floor(amountStx * (1 - odinWelshRatio))
        amountStxForOdin = amountStx - amountStxForWelsh
        amountFenrir = Math.floor(((amountStxForWelsh * stxVelarPrice) / welshVelarPrice) * 0.9) // 10% slippage safety
        amountOutEstimation = amountFenrir
    }

    if (sellToken === 'FENRIR' && buyToken === 'STX') {
        amountFenrir = Number(amount)
        amountOutEstimation = (amountFenrir / 1000000) * ((welshVelarPrice * (welshBalance / fenrirTotalSupply)) + (odinVelarPrice * (odinBalance / fenrirTotalSupply)))
    }

    console.log(amountOutEstimation)

    return (
        <Page meta={meta} fullViewport>
            <SkipNavContent />
            <Layout>
                <motion.div initial="hidden" animate="visible" variants={fadeIn} className="m-2 sm:container sm:mx-auto sm:py-10 md:max-w-3xl">

                    <Card className='bg-black text-primary-foreground border-accent-foreground p-0 relative overflow-hidden rounded-md group/card w-full max-w-3xl opacity-[0.99] shadow-black shadow-2xl'>
                        <CardHeader className='z-20 p-4'>
                            <div className='flex items-center justify-between'>
                                <CardTitle className='z-30 text-xl font-semibold'>Swap Tokens</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className='z-20 p-4'>
                            <div className='flex flex-col sm:relative'>
                                <Select value={sellToken} onValueChange={setSellToken}>
                                    <SelectTrigger className="h-20 mb-2 text-2xl text-right sm:absolute sm:pl-[20rem]" >
                                        <SelectValue placeholder='Select a token' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="STX" className='group/token' disabled={buyToken == 'STX'}>
                                            <div className='flex space-x-2 items-center h-20'>
                                                <Image src={stxIcon} alt='Stacks Token' className='z-30 w-12 h-12 border border-white rounded-full' />
                                                <div className='text-left'>
                                                    <div className='flex items-baseline space-x-1'>
                                                        <div className='text-xl font-medium leading-tight'>STX</div>
                                                        <div className='text-lg font-light -mt-1 leading-normal'>Stacks Native Token</div>
                                                    </div>
                                                    <div className='-ml-0.5 text-sm mt-0 flex flex-wrap group-hover/token:text-white'>
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger><div className='bg-primary rounded-full w-fit leading-tight px-1 pb-0.5 text-center m-1 pointer-events-auto'>Gas Token</div></TooltipTrigger>
                                                                <TooltipContent side='bottom' className={`text-md max-h-[80vh] overflow-scroll bg-black text-white border-primary leading-tight shadow-2xl max-w-prose`}>
                                                                    <strong>Gas Token:</strong> This token is used to pay for transaction fees on the Stacks blockchain. <br /><br />
                                                                    It is consumed in the process of executing smart contracts and other operations on the network. <br /><br />
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger><div className='bg-primary rounded-full w-fit leading-tight px-1 pb-0.5 text-center m-1 pointer-events-auto'>Stackable</div></TooltipTrigger>
                                                                <TooltipContent side='bottom' className={`text-md max-h-[80vh] overflow-scroll bg-black text-white border-primary leading-tight shadow-2xl max-w-prose`}>
                                                                    <strong>Stackable:</strong> This token can be used to participate in the Proof-of-Transfer (PoX) consensus mechanism of the Stacks blockchain. <br /><br />
                                                                    It can be locked up or liquid staked to secure the network and earn rewards. <br /><br />
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </div>
                                                </div>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="FENRIR" className='group/token' disabled={buyToken == 'FENRIR'}>
                                            <div className='flex space-x-2 items-center h-20'>
                                                <Image src={fenrirIcon} alt='Fenrir Token' className='z-30 w-12 h-12 border border-white rounded-full' />
                                                <div className='text-left'>
                                                    <div className='flex items-baseline space-x-1'>
                                                        <div className='text-xl font-medium leading-tight'>FENRIR</div>
                                                        <div className='text-lg font-light -mt-1 leading-normal'>Corgi of Ragnarok</div>
                                                    </div>
                                                    <div className='-ml-0.5 text-xs mt-0 flex flex-wrap group-hover/token:text-white'>
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger><div className='bg-primary rounded-full w-fit leading-tight px-1 pb-0.5 text-center m-1 pointer-events-auto'>Deflationary</div></TooltipTrigger>
                                                                <TooltipContent side='bottom' className={`text-md max-h-[80vh] overflow-scroll bg-black text-white border-primary leading-tight shadow-2xl max-w-prose`}>
                                                                    <strong>Deflationary:</strong> This token automatically burns a small percentage of each transaction, channeling these funds directly into its own rebasing pool. <br /><br />
                                                                    This mechanism continuously reduces the total supply relative to it's base token, increasing the token's value over time. <br /><br />
                                                                    The self-burning feature, coupled with the rebase pool, ensures a dynamic adjustment of the token's supply in response to transactional activity, promoting stability and encouraging long-term holding. <br /><br />
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger><div className='bg-primary rounded-full w-fit leading-tight px-1 pb-0.5 text-center m-1 pointer-events-auto'>Compound Rebase</div></TooltipTrigger>
                                                                <TooltipContent side='bottom' className={`text-md max-h-[80vh] overflow-scroll bg-black text-white border-primary leading-tight shadow-2xl max-w-prose`}>
                                                                    <strong>Compound Rebase:</strong> This token type leverages the rebase mechanisms of multiple underlying tokens. <br /><br />
                                                                    This advanced structure allows for synchronized adjustments in value, closely tracking the collective performance of diverse assets. <br /><br />
                                                                    It's supported by a robust ecosystem of apps and protocols, each contributing to the vitality and growth of multiple rebasing pools. <br /><br />
                                                                    This interconnected framework not only enhances potential returns but also fosters a dynamic environment for investment and financial strategy. <br /><br />
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger><div className='bg-primary rounded-full w-fit leading-tight px-1 pb-0.5 text-center m-1 pointer-events-auto'>Craftable</div></TooltipTrigger>
                                                                <TooltipContent side='bottom' className={`text-md max-h-[80vh] overflow-scroll bg-black text-white border-primary leading-tight shadow-2xl max-w-prose`}>
                                                                    <strong>Craftable Token:</strong> A craftable token is a type of compound token that requires one or more base tokens to create. <br /><br />
                                                                    It is crafted through a rebasing process that aligns its value with both coins simultaneously, offering holders a representative share in each of the coin's pools at a fixed weight. <br /><br />
                                                                    This mechanism ensures that the craftable token maintains a balanced exposure to both assets, providing a unique investment opportunity that diversifies risk and potential rewards. <br /><br />
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </div>
                                                </div>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input value={amount} onChange={handleTokenAmountChange} placeholder="Enter an amount" className="ring-offset-0 ring-transparent ring-inset focus-visible:ring-none sm:border-r-0 border-t border-b sm:rounded-r-none h-20 mb-2 text-2xl text-right sm:absolute sm:w-[20rem]" />
                            </div>

                            <div className='relative mt-0 sm:mt-28 mb-6 text-5xl items-center flex pb-4 justify-center w-full' >
                                <div className='cursor-pointer select-none hover:text-accent/80' onClick={() => { setBuyToken(sellToken);; setSellToken(buyToken) }}>↯</div>
                            </div>

                            <div className='flex flex-col sm:relative'>
                                <Select value={buyToken} onValueChange={setBuyToken}>
                                    <SelectTrigger className="h-20 mb-2 text-2xl text-right sm:absolute sm:pl-[20rem]" >
                                        <SelectValue placeholder='Select a token' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="STX" className='group/token' disabled={sellToken == 'STX'}>
                                            <div className='flex space-x-2 items-center h-20'>
                                                <Image src={stxIcon} alt='Stacks Token' className='z-30 w-12 h-12 border border-white rounded-full' />
                                                <div className='text-left'>
                                                    <div className='flex items-baseline space-x-1'>
                                                        <div className='text-xl font-medium leading-tight'>STX</div>
                                                        <div className='text-lg font-light -mt-1 leading-normal'>Stacks Native Token</div>
                                                    </div>
                                                    <div className='-ml-0.5 text-sm mt-0 flex flex-wrap group-hover/token:text-white'>
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger><div className='bg-primary rounded-full w-fit leading-tight px-1 pb-0.5 text-center m-1 pointer-events-auto'>Gas Token</div></TooltipTrigger>
                                                                <TooltipContent side='bottom' className={`text-md max-h-[80vh] overflow-scroll bg-black text-white border-primary leading-tight shadow-2xl max-w-prose`}>
                                                                    <strong>Gas Token:</strong> This token is used to pay for transaction fees on the Stacks blockchain. <br /><br />
                                                                    It is consumed in the process of executing smart contracts and other operations on the network. <br /><br />
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger><div className='bg-primary rounded-full w-fit leading-tight px-1 pb-0.5 text-center m-1 pointer-events-auto'>Stackable</div></TooltipTrigger>
                                                                <TooltipContent side='bottom' className={`text-md max-h-[80vh] overflow-scroll bg-black text-white border-primary leading-tight shadow-2xl max-w-prose`}>
                                                                    <strong>Stackable:</strong> This token can be used to participate in the Proof-of-Transfer (PoX) consensus mechanism of the Stacks blockchain. <br /><br />
                                                                    It can be locked up or liquid staked to secure the network and earn rewards. <br /><br />
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </div>
                                                </div>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="FENRIR" className='group/token' disabled={sellToken == 'FENRIR'}>
                                            <div className='flex space-x-2 items-center h-20'>
                                                <Image src={fenrirIcon} alt='Fenrir Token' className='z-30 w-12 h-12 border border-white rounded-full' />
                                                <div className='text-left'>
                                                    <div className='flex items-baseline space-x-1'>
                                                        <div className='text-xl font-medium leading-tight'>FENRIR</div>
                                                        <div className='text-lg font-light -mt-1 leading-normal'>Corgi of Ragnarok</div>
                                                    </div>
                                                    <div className='-ml-0.5 text-xs mt-0 flex flex-wrap group-hover/token:text-white'>
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger><div className='bg-primary rounded-full w-fit leading-tight px-1 pb-0.5 text-center m-1 pointer-events-auto'>Deflationary</div></TooltipTrigger>
                                                                <TooltipContent side='bottom' className={`text-md max-h-[80vh] overflow-scroll bg-black text-white border-primary leading-tight shadow-2xl max-w-prose`}>
                                                                    <strong>Deflationary:</strong> This token automatically burns a small percentage of each transaction, channeling these funds directly into its own rebasing pool. <br /><br />
                                                                    This mechanism continuously reduces the total supply relative to it's base token, increasing the token's value over time. <br /><br />
                                                                    The self-burning feature, coupled with the rebase pool, ensures a dynamic adjustment of the token's supply in response to transactional activity, promoting stability and encouraging long-term holding. <br /><br />
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger><div className='bg-primary rounded-full w-fit leading-tight px-1 pb-0.5 text-center m-1 pointer-events-auto'>Compound Rebase</div></TooltipTrigger>
                                                                <TooltipContent side='bottom' className={`text-md max-h-[80vh] overflow-scroll bg-black text-white border-primary leading-tight shadow-2xl max-w-prose`}>
                                                                    <strong>Compound Rebase:</strong> This token type leverages the rebase mechanisms of multiple underlying tokens. <br /><br />
                                                                    This advanced structure allows for synchronized adjustments in value, closely tracking the collective performance of diverse assets. <br /><br />
                                                                    It's supported by a robust ecosystem of apps and protocols, each contributing to the vitality and growth of multiple rebasing pools. <br /><br />
                                                                    This interconnected framework not only enhances potential returns but also fosters a dynamic environment for investment and financial strategy. <br /><br />
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger><div className='bg-primary rounded-full w-fit leading-tight px-1 pb-0.5 text-center m-1 pointer-events-auto'>Craftable</div></TooltipTrigger>
                                                                <TooltipContent side='bottom' className={`text-md max-h-[80vh] overflow-scroll bg-black text-white border-primary leading-tight shadow-2xl max-w-prose`}>
                                                                    <strong>Craftable Token:</strong> A craftable token is a type of compound token that requires one or more base tokens to create. <br /><br />
                                                                    It is crafted through a rebasing process that aligns its value with both coins simultaneously, offering holders a representative share in each of the coin's pools at a fixed weight. <br /><br />
                                                                    This mechanism ensures that the craftable token maintains a balanced exposure to both assets, providing a unique investment opportunity that diversifies risk and potential rewards. <br /><br />
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </div>
                                                </div>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input value={"~" + millify(amountOutEstimation)} placeholder="Estimated Amount" className="ring-offset-0 ring-transparent ring-inset focus-visible:ring-none sm:border-r-0 border-t border-b sm:rounded-r-none h-20 mb-2 text-2xl text-right sm:absolute sm:w-[20rem]" />
                            </div>

                        </CardContent>

                        <CardFooter className="z-20 flex justify-between p-4 mt-36">
                            <div></div>
                            {sellToken == 'STX' ? <SwapStxForFenrir amountStx={amountStx} amountStxForWelsh={amountStxForWelsh} amountStxForOdin={amountStxForOdin} amountFenrir={amountFenrir} /> : <SwapFenrirForStx amountFenrir={amountFenrir} />}
                        </CardFooter>
                        <Image
                            src={swap}
                            width={800}
                            height={1600}
                            alt={'quest-background-image'}
                            className={cn("object-cover", "sm:aspect-[1/2]", 'aspect-[1/3]', 'opacity-10', 'flex', 'z-10', 'absolute', 'inset-0', 'pointer-events-none')}
                        />
                        <div className='absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-white to-black opacity-10' />
                    </Card>
                    <div className='text-center font-thin m-2 text-sm'>*Swaps use Velar liquidity pools and may be subject to slippage with high volumes</div>




                </motion.div >
            </Layout >
        </Page >
    );
}

type Props = {
    data: any;
};


export const getStaticProps: GetStaticProps<Props> = () => {

    try {

        return {
            props: {
                data: {}
            },
            revalidate: 6000
        };

    } catch (error) {
        return {
            props: {
                data: {}
            },
        }
    }
};
