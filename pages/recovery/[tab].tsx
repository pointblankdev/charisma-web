import { GetStaticPaths, GetStaticProps } from 'next';
import RecoveryClaimPage from '@components/recovery/index';
import { getAvailableRedemptions, getTotalSupply } from '@lib/stacks-api';

export const getStaticPaths: GetStaticPaths = () => {
    return {
        paths: [
            { params: { tab: 'plan' } },
            { params: { tab: 'claim' } },
            { params: { tab: 'redemptions' } },
        ],
        fallback: false,
    };
};

export const getStaticProps: GetStaticProps = async () => {
    const syntheticWelshIssued = 86943663098322;
    const syntheticRooIssued = 1176056176569;

    const syntheticWelshRemainingSupply = await getTotalSupply('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-welsh');
    const syntheticRooRemainingSupply = await getTotalSupply('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-roo');

    const {
        welsh: syntheticWelshRedemptionsAvailable,
        roo: syntheticRooRedemptionsAvailable
    } = await getAvailableRedemptions();

    return {
        props: {
            data: {
                syntheticWelsh: {
                    issued: syntheticWelshIssued,
                    burned: syntheticWelshIssued - syntheticWelshRemainingSupply,
                    remaining: syntheticWelshRemainingSupply,
                    available: syntheticWelshRedemptionsAvailable
                },
                syntheticRoo: {
                    issued: syntheticRooIssued,
                    burned: syntheticRooIssued - syntheticRooRemainingSupply,
                    remaining: syntheticRooRemainingSupply,
                    available: syntheticRooRedemptionsAvailable
                }
            }
        },
        revalidate: 60
    };
};

export default RecoveryClaimPage;