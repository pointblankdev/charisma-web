import Page from '@components/page';
import ProtocolDashboard from '@components/stackflow/protocol-dashboard';
import { Kraxel } from '@lib/kraxel';
import { GetStaticProps } from 'next';

export const getStaticProps: GetStaticProps = async () => {
    try {
        const prices = await Kraxel.getAllTokenPrices();

        return {
            props: {
                prices
            },
            revalidate: 60 // Revalidate every minute
        };
    } catch (error) {
        console.error('Error fetching prices:', error);
        return {
            props: {
                prices: {}
            },
            revalidate: 60
        };
    }
};

export default function Stackflow({ prices }: { prices: Record<string, number> }) {
    return (
        <Page meta={{
            title: 'Blaze',
            description: 'Blaze is a Bitcoin L2 scaling solution with near-unlimited TPS and throughput.',
        }}>
            <ProtocolDashboard prices={prices} />
        </Page>
    );
}
