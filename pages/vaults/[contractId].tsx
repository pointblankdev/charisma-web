import { GetServerSideProps } from 'next';
import Layout from '@components/layout/layout';
import { VaultDetailView } from '@components/pools/vault-detail-view';
import { ContractId, Dexterity, Liquidity } from 'dexterity-sdk';
import { Vault } from 'dexterity-sdk/dist/core/vault';
import PricesService from '@lib/server/prices/prices-service';

const service = PricesService.getInstance();

// Initialize SDK
Dexterity.configure({ apiKeyRotation: 'loop' })

interface Props {
    vault: any; // We'll type this properly later
    prices: Record<string, number>;
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
    const contractId = params?.contractId as string;

    if (!contractId) {
        return {
            notFound: true
        };
    }

    try {

        // Fetch vault data
        const vault = await Vault.build(contractId as ContractId) as any
        vault.liquidity = [vault.tokenA, vault.tokenB];

        if (!vault) {
            return {
                notFound: true
            };
        }

        const prices = await service.getAllTokenPrices();


        return {
            props: {
                vault: JSON.parse(JSON.stringify(vault)), // Serialize for Next.js
                prices
            }
        };
    } catch (error) {
        console.error('Error fetching vault data:', error);
        return {
            notFound: true
        };
    }
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
                <VaultDetailView vault={vault} prices={prices} />
            </div>
        </Layout>
    );
} 