import Layout from '@components/layout';
import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import { SkipNavContent } from '@reach/skip-nav';

export default function Dashboard() {

    const meta = {
        title: 'Charisma | Arbitrage Dashboard',
        description: META_DESCRIPTION,
        image: '/liquid-charisma.png'
    };

    return (
        <Page meta={meta} fullViewport>
            <SkipNavContent />
            <Layout>
                <div className="m-2 sm:container sm:mx-auto sm:py-10">
                    <h1>Arbitrage Dashboard</h1>

                </div>
            </Layout>
        </Page>
    );
}
