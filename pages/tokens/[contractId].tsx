import { GetServerSideProps } from 'next';
import Layout from '@components/layout/layout';
import { ContractId, Dexterity, Token } from 'dexterity-sdk';
import { Kraxel } from '@lib/kraxel';
import { TokenDetailView } from '@components/tokens/token-detail-view';
import { useState, useEffect } from 'react';
import { MetadataService } from '@lib/metadata/service';
import _ from 'lodash';

// Initialize SDK
Dexterity.configure({ apiKeyRotation: 'loop' });

interface Props {
    token: Token;
    prices: Record<string, number>;
    isNewToken: boolean;
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
    const contractId = params?.contractId as ContractId;

    let token;
    const prices = await Kraxel.getAllTokenPrices();

    try {
        token = await Dexterity.getTokenInfo(contractId);
        return {
            props: {
                token: JSON.parse(JSON.stringify(token)),
                prices,
                isNewToken: false
            }
        };
    } catch (error) {
        console.error('Error fetching token info:', error);

        const metadata = await MetadataService.get(contractId);

        // Create blank token metadata
        const blankToken = _.merge({
            contractId,
            name: 'New Token',
            symbol: 'TOKEN',
            decimals: 6,
            description: '',
            image: '',
            identifier: 'TOKEN'
        }, metadata);

        return {
            props: {
                token: blankToken,
                prices,
                isNewToken: true
            }
        };
    }

};

export default function TokenDetailPage({ token, prices, isNewToken }: Props & { isNewToken: boolean }) {
    const [tokenData, setTokenData] = useState<Token | null>(token || null);

    useEffect(() => {
        if (isNewToken) {
            // Get new token data from localStorage
            const newToken = localStorage.getItem('newToken');
            if (newToken) {
                setTokenData(JSON.parse(newToken));
                localStorage.removeItem('newToken'); // Clean up
            }
        }
    }, [isNewToken]);

    if (!tokenData) return null;

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-b from-background/10 to-background/0">
                <TokenDetailView token={tokenData} prices={prices} />
            </div>
        </Layout>
    );
} 