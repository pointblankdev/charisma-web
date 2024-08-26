import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import Layout from '@components/layout/layout';
import { GetServerSidePropsContext } from 'next';
import { motion } from 'framer-motion';
import { getLand, getLands, getNftCollectionMetadata, getNftMetadata } from '@lib/db-providers/kv';
import { getDehydratedStateFromSession, parseAddress } from '@components/stacks-session/session-helpers';
import QuestCard from '@components/quest/quest-card';


export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    // get all lands from db
    const landContractAddresses = await getLands()

    const lands = []
    for (const ca of landContractAddresses) {
        const metadata = await getLand(ca)
        lands.push(metadata)
    }

    const nftCollectionMetadata = await getNftCollectionMetadata(ctx.params?.ca as string)
    const nftItemMetadata = await getNftMetadata(ctx.params?.ca as string, "1")

    const dehydratedState = await getDehydratedStateFromSession(ctx) as string
    const stxAddress = parseAddress(dehydratedState)

    return {
        props: {
            dehydratedState,
            stxAddress,
            lands,
            nftCollectionMetadata: { ...nftCollectionMetadata, ...nftItemMetadata },
            contractAddress: ctx.params?.ca
        }
    };
};

type Props = {
    stxAddress: string;
    lands: any[];
    nftCollectionMetadata: any;
    contractAddress: `${string}.${string}`
};

export default function SpellScrollFireBolt({ stxAddress, lands, nftCollectionMetadata, contractAddress }: Props) {
    const meta = {
        title: `Charisma | ${nftCollectionMetadata.name}`,
        description: nftCollectionMetadata.description.description,
        image: '/quests/mooning-shark/mooning-shark-square.png'
    };

    return (
        <Page meta={meta} fullViewport>
            <SkipNavContent />
            <Layout>
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                    className="m-2 sm:container sm:mx-auto sm:py-10 md:max-w-3xl"
                >
                    <QuestCard
                        nftCollectionMetadata={nftCollectionMetadata}
                        contractAddress={contractAddress}
                        lands={lands}
                        stxAddress={stxAddress}
                    />
                </motion.div>
            </Layout>
        </Page>
    );
}

