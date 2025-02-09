import Page from '@components/page';
import ProtocolDashboard from '@components/stackflow/protocol-dashboard';

export default function Stackflow() {
    return (
        <Page meta={{
            title: 'Charisma Unleashed',
            description: 'Charisma Unleashed is a Bitcoin L2 scaling solution with unlimited TPS and throughput.',
        }}>
            <ProtocolDashboard />
        </Page>
    );
}
