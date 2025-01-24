import { GetServerSideProps } from 'next';
import Layout from '@components/layout/layout';
import { ContractId, Dexterity } from 'dexterity-sdk';
import { Vault } from 'dexterity-sdk/dist/core/vault';
import { Kraxel } from '@lib/kraxel';
import { VaultDetailView } from '@components/pools/vault-detail-view';


// Initialize SDK
Dexterity.configure({ apiKeyRotation: 'loop' })

interface Props {
    vault: any; // We'll type this properly later
    prices: Record<string, number>;
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
    const contractId = params?.contractId as ContractId;
    // Fetch vault data
    const vault = await Vault.build(contractId)
    const prices = await Kraxel.getAllTokenPrices();
    return {
        props: {
            vault: JSON.parse(JSON.stringify(vault)), // Serialize for Next.js
            prices
        }
    };
};

export default function VaultDetailPage({ vault, prices }: Props) {
    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-b from-background/10 to-background/0">
                <VaultDetailView vault={vault} prices={prices} />
            </div>
        </Layout>
    );
} 