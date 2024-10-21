import { useState, useEffect } from 'react';
import { GetStaticProps, GetStaticPaths } from 'next';
import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import Layout from '@components/layout/layout';
import { Button } from '@components/ui/button';
import { useDungeonCrawler } from '@lib/hooks/use-dungeon-crawler';

const INTERACTIONS = {
    'keepers-challenge-rc3': { address: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS', name: 'keepers-challenge-rc3' },
    'hot-potato-rc1': { address: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS', name: 'hot-potato-rc1' },
    'charisma-mine-rc1': { address: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS', name: 'charisma-mine-rc1' },
    'fatigue-rc1': { address: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS', name: 'fatigue-rc1' }
    // Add more interactions here
};

interface InteractionDetailProps {
    interactionKey: keyof typeof INTERACTIONS;
}

export default function InteractionDetailPage({ interactionKey }: InteractionDetailProps) {
    const [actions, setActions] = useState<string[]>([]);
    const [uri, setUri] = useState<string | null>(null);

    const interactionDetails = INTERACTIONS[interactionKey];

    // const {
    //     getInteractionUri,
    //     getActions,
    //     executeAction,
    //     loading,
    //     error
    // } = useDungeonCrawler(interactionDetails.address, interactionDetails.name);

    // useEffect(() => {
    //     async function fetchInteractionDetails() {
    //         // const fetchedUri = await getInteractionUri();
    //         // setUri(fetchedUri);

    //         const fetchedActions = await getActions();
    //         setActions(fetchedActions);
    //     }

    //     if (interactionDetails) {
    //         fetchInteractionDetails();
    //     }
    // }, [interactionDetails, getInteractionUri, getActions]);

    // const handleExecuteAction = async (action: string) => {
    //     try {
    //         await executeAction(action);
    //         alert('Action executed successfully!');
    //     } catch (error: any) {
    //         alert(`Error executing action: ${error.message}`);
    //     }
    // };

    if (!interactionDetails) {
        return <div>Invalid interaction</div>;
    }

    return (
        <Page meta={{ title: `${interactionDetails.name} Interaction`, description: `Explore new possibilities on Charisma` }} fullViewport>
            <SkipNavContent />
            <Layout>
                <div className="container mx-auto px-4 py-8">
                    <h1 className="text-4xl font-bold mb-8">{interactionDetails.name}</h1>
                    {uri && (
                        <div className="mb-6">
                            <h2 className="text-2xl font-semibold mb-2">Interaction URI</h2>
                            <p className="text-gray-600">{uri}</p>
                        </div>
                    )}
                    <div className="mb-6">
                        <h2 className="text-2xl font-semibold mb-4">Available Actions</h2>
                        {/* {loading ? (
                            <p>Loading actions...</p>
                        ) : error ? (
                            <p className="text-red-500">Error: {error}</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {actions.map((action) => (
                                    <Button
                                        key={action}
                                        // onClick={() => handleExecuteAction(action)}
                                        className="w-full"
                                    >
                                        {action}
                                    </Button>
                                ))}
                            </div>
                        )} */}
                    </div>
                </div>
            </Layout>
        </Page>
    );
}

export const getStaticPaths: GetStaticPaths = () => {
    const paths = Object.keys(INTERACTIONS).map(interaction => ({
        params: { interaction }
    }));

    return {
        paths,
        fallback: false // This ensures any paths not returned by getStaticPaths will result in a 404 page
    };
};

export const getStaticProps: GetStaticProps = ({ params }) => {
    const interactionKey = params?.interaction as keyof typeof INTERACTIONS;

    if (!INTERACTIONS[interactionKey]) {
        return {
            notFound: true
        };
    }

    return {
        props: {
            interactionKey
        }
    };
};
