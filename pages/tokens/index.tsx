import { GetStaticProps } from 'next';
import Layout from '@components/layout/layout';
import { ContractId, Dexterity, Token } from 'dexterity-sdk';
import { Kraxel } from '@lib/kraxel';
import { TokenGrid } from '@components/tokens/token-grid';
import { Button } from '@components/ui/button';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useGlobal } from '@lib/hooks/global-context';

// Initialize SDK
Dexterity.configure({ apiKeyRotation: 'loop' });

// Use same blacklist as other pages
const blacklist = [
    'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.chdollar',
    'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.dmg-runes',
    'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.uahdmg',
    'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.dmg-lp-token',
    'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.stx-lp-token'
] as ContractId[];

interface Props {
    tokens: Token[];
    prices: Record<string, number>;
}

export const getStaticProps: GetStaticProps<Props> = async () => {
    // Get prices and discover tokens
    const [, prices] = await Promise.all([
        Dexterity.discover({ blacklist: blacklist, reserves: false }),
        Kraxel.getAllTokenPrices()
    ]);

    // Get all tokens from Dexterity
    const tokens = Dexterity.getTokens()

    return {
        props: {
            tokens: JSON.parse(JSON.stringify(tokens)), // Serialize for Next.js
            prices
        },
        revalidate: 60
    };
};

export default function TokensPage({ tokens, prices }: Props) {
    const { stxAddress } = useGlobal();
    const router = useRouter();

    const handleCreateToken = () => {
        // Generate a temporary contract ID using timestamp
        const tempId = `${stxAddress}.token-${Date.now()}`;

        // Navigate to token detail page
        router.push(`/tokens/${tempId}`);
    };

    return (
        <Layout>
            <div className="container mx-auto p-6 min-h-screen">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Tokens</h1>
                        <p className="text-muted-foreground mt-2">
                            Browse and search all tokens available on the platform
                        </p>
                    </div>
                    <Button onClick={handleCreateToken} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Create Token
                    </Button>
                </div>
                <TokenGrid tokens={tokens} prices={prices} />
            </div>
        </Layout>
    );
} 