import Page from '@components/page';
import ProtocolDashboard from '@components/stackflow/protocol-dashboard';

export default function Stackflow() {
    return (
        <Page meta={{
            title: 'Stackflow',
            description: 'Stackflow is a protocol for building and managing payment channels on the Stacks blockchain.',
        }}>
            <ProtocolDashboard />
        </Page>
    );
}
