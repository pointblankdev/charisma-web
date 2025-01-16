import { GetServerSideProps } from 'next';
import Layout from '@components/layout/layout';
import { ContractId, Dexterity } from 'dexterity-sdk';
import { Vault } from 'dexterity-sdk/dist/core/vault';
import { Kraxel } from '@lib/kraxel';


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
                <div className="relative">
                    {/* Optional: Background pattern/effect */}
                    <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />

                    {/* Back button and breadcrumbs could go here */}
                    <div className="relative container mx-auto pt-6 px-4">
                        <nav className="flex mb-6 text-sm text-muted-foreground">
                            <a href="/pools" className="hover:text-foreground transition-colors">
                                Vaults
                            </a>
                            <span className="mx-2">→</span>
                            <span className="text-foreground">{vault.name || 'Vault Details'}</span>
                        </nav>
                    </div>
                </div>

                {/* Main content */}
                <div className="container mx-auto px-4">Coming soon...</div>
                {/* <VaultDetailView vault={vault} prices={prices} /> */}
            </div>
        </Layout>
    );
} 