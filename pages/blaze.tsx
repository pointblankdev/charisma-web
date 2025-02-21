import Page from '@components/page';
import BlazeDashboard from '@components/blaze/dashboard';
import { Kraxel } from '@lib/kraxel';
import { GetStaticProps } from 'next';

export const getStaticProps: GetStaticProps = async () => {
    const prices = await Kraxel.getAllTokenPrices();

    return {
        props: {
            prices
        },
        revalidate: 60 // Revalidate every minute
    };
};

export default function BlazePage({ prices }: { prices: Record<string, number> }) {
    return (
        <Page meta={{
            title: 'Blaze',
            description: 'Blaze is a Bitcoin L2 that unlocks massive TPS and throughput using off-chain cryptographic signatures. Blazing-fast transactions, low fees, high scalability, and bitcoin finality.',
            image: 'https://charisma.rocks/celebration-2.png'
        }}>
            <BlazeDashboard prices={prices} />
        </Page>
    );
}
