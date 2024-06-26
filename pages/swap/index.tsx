
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
import WelshIcon from '@public/welsh-logo.png'
import stxIcon from '@public/stacks-stx-logo.png'
import swap from '@public/quests/a2.png'
import { Input } from '@components/ui/input';
import millify from 'millify';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/swap/select';
import { getTokenPrices } from '@lib/stacks-api';
import BasicSwap from '@components/swap/basic';

export default function Swap({ data }: Props) {
    const meta = {
        title: 'Charisma | Swap Tokens',
        description: META_DESCRIPTION,
        image: '/liquid-charisma.png'
    };

    const [amount, setAmount] = useState('');
    const [priceData, setPriceData] = useState([] as any[]);

    const handleTokenAmountChange = (event: any) => {
        const { value } = event.target;
        // Limit input to only allow numbers and to 6 decimal places
        if (/^\d*\.?\d{0,4}$/.test(value)) {
            setAmount(value);
        }
    };

    useEffect(() => {
        getTokenPrices().then((response) => {
            setPriceData(response.message)
        })
    }, [])

    const fadeIn = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
    };

    const [sellToken, setSellToken] = useState('STX');
    const [buyToken, setBuyToken] = useState('WELSH');

    const welshPrice = priceData.find((token) => token.symbol === 'WELSH')?.price
    const stxPrice = priceData.find((token) => token.symbol === 'STX')?.price

    const amountOutEstimation = ((stxPrice * Number(amount)) / welshPrice) * 0.96 // 4% slippage

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
                                    </SelectContent>
                                </Select>
                                <Input value={amount} onChange={handleTokenAmountChange} placeholder="Enter an amount" className="ring-offset-0 ring-transparent ring-inset focus-visible:ring-none sm:border-r-0 border-t border-b sm:rounded-r-none h-20 mb-2 text-2xl text-right sm:absolute sm:w-[20rem]" />
                            </div>

                            <div className='relative mt-0 sm:mt-28 mb-6 text-5xl items-center flex pb-4 justify-center w-full' >
                                {/* <div className='cursor-pointer select-none hover:text-accent/80' onClick={() => { setBuyToken(sellToken);; setSellToken(buyToken) }}>↯</div> */}
                                <div className='cursor-pointer select-none hover:text-accent/80'>↯</div>
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
                                        <SelectItem value="WELSH" className='group/token' disabled={sellToken == 'WELSH'}>
                                            <div className='flex space-x-2 items-center h-20'>
                                                <Image src={WelshIcon} alt='Welshcorgicoin Token' className='z-30 w-12 h-12 border border-white rounded-full' />
                                                <div className='text-left'>
                                                    <div className='flex items-baseline space-x-1'>
                                                        <div className='text-xl font-medium leading-tight'>WELSH</div>
                                                        <div className='text-lg font-light -mt-1 leading-normal'>Welshcorgicoin</div>
                                                    </div>
                                                    <div className='-ml-0.5 text-xs mt-0 flex flex-wrap group-hover/token:text-white'>
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger><div className='bg-primary rounded-full w-fit leading-tight px-1 pb-0.5 text-center m-1 pointer-events-auto'>Community Coin</div></TooltipTrigger>
                                                                <TooltipContent side='bottom' className={`text-md max-h-[80vh] overflow-scroll bg-black text-white border-primary leading-tight shadow-2xl max-w-prose`}>
                                                                    <strong>Community Coin:</strong> A Community Coin is a subset of memecoins characterized by its large and active user base, highly decentralized holdings, and significant incentives for holders. <br /><br />
                                                                    These coins often thrive on community engagement and participation, providing advantages such as airdrops and other rewards within their ecosystem. <br /><br />
                                                                    The decentralized nature ensures wide distribution, while the ongoing incentives encourage long-term holding and active involvement in the project's development and governance. <br /><br />
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger><div className='bg-primary rounded-full w-fit leading-tight px-1 pb-0.5 text-center m-1 pointer-events-auto'>Community Takeover</div></TooltipTrigger>
                                                                <TooltipContent side='bottom' className={`text-md max-h-[80vh] overflow-scroll bg-black text-white border-primary leading-tight shadow-2xl max-w-prose`}>
                                                                    <strong>Community Takeover:</strong> Occurs when the original developer "rugs" a project by dumping their tokens and abandoning it, but a grassroots community movement intervenes to revive and sustain the project. <br /><br />
                                                                    This resurgence is driven by dedicated community members who take control, reestablish trust, and actively contribute to the project's development and growth. <br /><br />
                                                                    Through their collective efforts, the community ensures the project's continued activity and success, often fostering a stronger and more resilient ecosystem. <br /><br />
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </div>
                                                </div>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input value={millify(amountOutEstimation) + "+"} placeholder="Estimated Amount" className="ring-offset-0 ring-transparent ring-inset focus-visible:ring-none sm:border-r-0 border-t border-b sm:rounded-r-none h-20 mb-2 text-2xl text-right sm:absolute sm:w-[20rem]" />
                            </div>

                        </CardContent>

                        <CardFooter className="z-20 flex justify-between p-4 mt-24">
                            <div></div>
                            <BasicSwap data={{ amountIn: amount, amountOutMin: amountOutEstimation }} />
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
                    <div className='text-center font-thin m-2 text-xs sm:text-sm'>*Swaps use Velar liquidity pools and are set to a maximum of 4% slippage.</div>
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
