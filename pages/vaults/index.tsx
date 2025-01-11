import { GetStaticProps } from 'next';
import { Dexterity } from 'dexterity-sdk';
import Layout from '@components/layout/layout';
import { Card } from '@components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';

interface Props {
    vaults: any[];
}

export const getStaticProps: GetStaticProps<Props> = async () => {
    const vaults = await Dexterity.discover();
    return {
        props: {
            vaults: vaults.map((vault) => vault.toLPToken && vault.toLPToken())
        },
        revalidate: 60 * 60 // 1 hour
    };
};

export default function VaultsIndex({ vaults }: Props) {
    return (
        <Layout>
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-6">Liquidity Vaults</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vaults.map((vault) => (
                        <Link key={vault.contractId} href={`/vaults/${vault.contractId}`}>
                            <Card className="p-6 hover:bg-accent/10 transition-colors cursor-pointer">
                                <div className="flex items-center space-x-4">
                                    {vault.image ? (
                                        <Image
                                            src={vault.image}
                                            alt={vault.name || 'Vault'}
                                            width={48}
                                            height={48}
                                            className="rounded-full"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                                            <span className="text-2xl">🏦</span>
                                        </div>
                                    )}
                                    <div>
                                        <h2 className="font-semibold">{vault.name || 'Unnamed Vault'}</h2>
                                        <p className="text-sm text-muted-foreground">{vault.symbol}</p>
                                    </div>
                                </div>

                                <div className="mt-4 text-sm text-muted-foreground">
                                    <p className="truncate">{vault.description || 'No description available'}</p>
                                    {vault.properties?.date && (
                                        <p className="mt-2">
                                            Created {formatDistanceToNow(new Date(vault.properties.date))} ago
                                        </p>
                                    )}
                                </div>

                                <div className="mt-4 flex items-center space-x-2">
                                    <div className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                                        Fee: {(vault.fee / 1000000 * 100).toFixed(2)}%
                                    </div>
                                    {vault.properties?.lpRebatePercent && (
                                        <div className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                                            LP Rebate: {vault.properties.lpRebatePercent}%
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </Layout>
    );
} 