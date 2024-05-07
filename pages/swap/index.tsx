
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
import { Button } from '@components/ui/button';
import { GetStaticProps } from 'next';
import { useEffect, useLayoutEffect, useState } from 'react';
import { cn } from '@lib/utils';
import Link from 'next/link';
import { motion } from "framer-motion"
import fenrirIcon from '@public/fenrir-icon-2.png'
import stxIcon from '@public/stacks-stx-logo.png'
import swap from '@public/quests/a2.png'
import { Input } from '@components/ui/input';
import SwapStxForFenrir from '@components/swap/fenrir';
import millify from 'millify';

export default function Fenrir({ data }: Props) {
    const meta = {
        title: 'Charisma | Fenrir, Corgi of Ragnarok',
        description: META_DESCRIPTION,
        image: '/fenrir-21.png'
    };

    const [amount, setAmount] = useState('');

    const tokenAmount = Number(amount) * 1000000;

    const handleTokenAmountChange = (event: any) => {
        const { value } = event.target;
        // Limit input to only allow numbers and to 6 decimal places
        if (/^\d*\.?\d{0,4}$/.test(value)) {
            setAmount(value);
        }
    };

    const fadeIn = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
    };

    console.log(tokenAmount)
    return (
        <Page meta={meta} fullViewport>
            <SkipNavContent />
            <Layout>
                <motion.div initial="hidden" animate="visible" variants={fadeIn} className="m-2 sm:container sm:mx-auto sm:py-10 md:max-w-2xl">

                    <Card className='bg-black text-primary-foreground border-accent-foreground p-0 relative overflow-hidden rounded-md group/card w-full max-w-2xl opacity-[0.99] shadow-black shadow-2xl'>
                        <CardHeader className='z-20 p-4'>
                            <div className='flex items-center justify-between'>
                                <CardTitle className='z-30 text-xl font-semibold'>Swap Tokens</CardTitle>
                            </div>

                        </CardHeader>
                        <CardContent className='z-20 p-4'>

                            <div className='relative'>
                                <Input value={amount} onChange={handleTokenAmountChange} placeholder="Enter token amount" className="h-20 mb-2 text-2xl text-right absolute pr-72" />
                                <div className='flex space-x-2 items-center absolute w-[17rem] right-0 top-0 h-20'>
                                    <Image src={stxIcon} alt='Fenrir Token' className='z-30 w-8 h-8 border border-white rounded-full' />
                                    <div className=''>
                                        <div className='text-xl leading-tight'>STX</div>
                                        <div className='text-xs -mt-2'>Stacks Gas Token</div>
                                    </div>
                                </div>
                            </div>

                            <div className='relative mt-28 mb-6 text-5xl items-center flex pb-4 justify-center w-full'>↯</div>

                            <div className='relative'>
                                <Input value={"~" + millify(Number(tokenAmount) * 100)} placeholder="Estimated Amount" className="h-20 mb-2 text-2xl text-right absolute pr-72" />
                                <div className='flex space-x-2 items-center absolute w-[17rem] right-0 top-0 h-20'>
                                    <Image src={fenrirIcon} alt='Fenrir Token' className='z-30 w-8 h-8 border border-white rounded-full' />
                                    <div className=''>
                                        <div className='text-xl leading-tight'>FENRIR</div>
                                        <div className='text-xs -mt-2'>Auto-Deflationary 2x Rebase Token</div>
                                    </div>
                                </div>
                            </div>

                        </CardContent>

                        <CardFooter className="z-20 flex justify-between p-4 mt-36">
                            <Link href='/crafting'><Button variant="ghost" className='z-30'>Back</Button></Link>
                            <SwapStxForFenrir amount={Number(tokenAmount)} />
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




                </motion.div>
            </Layout>
        </Page>
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
