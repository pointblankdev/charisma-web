// pages/pools/spot.tsx
import { GetStaticProps } from 'next';
import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import Layout from '@components/layout/layout';
import { Card } from '@components/ui/card';
import { useEffect, useState } from 'react';
import useWallet from '@lib/hooks/wallet-balance-provider';
import { motion } from 'framer-motion';
import { PoolsInterface } from '@components/pools/pools-interface';
import PricesService from '@lib/server/prices/prices-service';
import { PoolInfo, PoolService } from '@lib/server/pools/pool-service';
import PoolsLayout from '@components/pools/layout';

type Props = {
    data: {
        pools: PoolInfo[];
        tokenPrices: { [key: string]: number };
    };
};

export const getStaticProps: GetStaticProps<Props> = async () => {
    try {
        const [pools, tokenPrices] = await Promise.all([
            PoolService.getSpotPools(),
            PricesService.getAllTokenPrices()
        ]);
        return {
            props: {
                data: {
                    pools,
                    tokenPrices
                }
            },
            revalidate: 60
        };
    } catch (error) {
        return {
            props: {
                data: {
                    pools: [],
                    tokenPrices: {}
                }
            },
            revalidate: 60
        };
    }
};

export default function SpotPoolsPage({ data }: Props) {
    const meta = {
        title: 'Charisma | Spot Pools',
        description: 'View and manage spot liquidity pools on the Charisma DEX',
        image: 'https://charisma.rocks/pools-screenshot.png'
    };

    const { wallet } = useWallet();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (wallet) setLoading(false);
    }, [wallet]);

    const isAuthorized = wallet.experience.balance >= 1000 || wallet.redPilled;

    return (
        <Page meta={meta} fullViewport>
            <SkipNavContent />
            <Layout>
                {!loading && (
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                        className="sm:max-w-[2400px] sm:mx-auto sm:pb-10"
                    >
                        <PoolsLayout>
                            {isAuthorized ? (
                                <PoolsInterface data={data} title={'Spot Pools'} />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
                                    <Card className="w-full max-w-lg p-6 text-center">
                                        <h2 className="mb-4 text-2xl font-bold">Access Restricted</h2>
                                        <p className="mb-4">To view and manage liquidity pools, you need either:</p>
                                        <ul className="mb-4 text-left list-disc list-inside">
                                            <li className={wallet.experience.balance >= 1000 ? 'text-green-500' : 'text-red-500'}>
                                                At least 1000 Experience {wallet.experience.balance >= 1000 ? '✓' : '✗'}
                                            </li>
                                            <li className={wallet.redPilled ? 'text-green-500' : 'text-red-500'}>
                                                Own the Red Pill NFT {wallet.redPilled ? '✓' : '✗'}
                                            </li>
                                        </ul>
                                        <p className="text-sm text-muted-foreground">
                                            Continue using Charisma to gain more experience and unlock this feature.
                                        </p>
                                    </Card>
                                </div>
                            )}
                        </PoolsLayout>
                    </motion.div>
                )}
            </Layout>
        </Page>
    );
}