import { useState, useEffect } from 'react';
import { GetStaticProps, GetStaticPaths } from 'next';
import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import Layout from '@components/layout/layout';
import { Button } from '@components/ui/button';
import { Separator } from '@components/ui/separator';
import Image from 'next/image';
import { useDungeonCrawler } from '@lib/hooks/use-dungeon-crawler';
import { useGlobalState } from '@lib/hooks/global-state-context';
import { API_URL } from '@lib/constants';

interface InteractionMetadata {
    url: string;
    image: string;
    name: string;
    description: string;
    contract: string;
    category: string;
}

interface InteractionDetailProps {
    metadata: InteractionMetadata;
}


// Updated getStaticPaths and getStaticProps
export const getStaticPaths: GetStaticPaths = () => {
    // You might want to fetch this from an API or central config
    const interactionIds = ['fatigue', 'charisma-mine', 'hot-potato', 'keepers-challenge', 'randomizer'];
    console.log(interactionIds)
    return {
        paths: interactionIds.map(id => ({
            params: { interaction: id }
        })),
        fallback: false
    };
};

export const getStaticProps: GetStaticProps<InteractionDetailProps> = async ({ params }) => {
    const interactionId = params?.interaction as string;

    try {
        // Fetch interaction metadata from your API
        const res = await fetch(`${API_URL}/api/v0/interactions/${interactionId}`);
        const metadata: InteractionMetadata = await res.json();

        console.log(metadata)

        return {
            props: {
                metadata
            },
            revalidate: 60
        };
    } catch (error) {
        return {
            notFound: true
        };
    }
};

export default function InteractionDetailPage({ metadata }: InteractionDetailProps) {
    const { interact } = useDungeonCrawler();
    const { stxAddress } = useGlobalState();


    const [isLoading, setIsLoading] = useState(false);

    const handleExecute = async (action: string) => {
        if (!stxAddress) {
            // Handle not connected state
            return;
        }

        setIsLoading(true);
        try {
            await interact(metadata.contract, action);
        } catch (error) {
            console.error('Failed to execute interaction:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Page
            meta={{
                title: `${metadata.name} Interaction`,
                description: metadata.description
            }}
            fullViewport
        >
            <SkipNavContent />
            <Layout>
                <div className="container relative hidden h-[calc(100vh-112px)] flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
                    {/* Left Panel - Image and Description */}
                    <div className="relative lg:block h-full"> {/* Changed to relative positioning and full height */}
                        <div className="absolute inset-0 z-10 bg-zinc-900/50" />
                        <div className="relative h-full"> {/* Added wrapper div for image */}
                            <Image
                                src={metadata.image}
                                alt={metadata.name}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                        {/* Overlay Content */}
                        <div className="absolute inset-0 z-20 flex flex-col justify-between p-10 text-white">
                            <div className="flex items-center text-lg font-medium">
                                <span className="text-3xl">{metadata.name}</span>
                            </div>
                            <div className="space-y-4">
                                <blockquote className="space-y-2">
                                    <p className="text-lg">{metadata.description}</p>
                                    <footer className="text-sm opacity-90">
                                        Category: {metadata.category}
                                    </footer>
                                </blockquote>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - Interaction Controls */}
                    <div className="relative flex h-full lg:w-full z-10"> {/* Added relative and h-full */}
                        <div className="flex w-full items-center justify-center bg-black"> {/* Removed padding, made full height */}
                            <div className="mx-auto w-full max-w-xl space-y-6 px-4"> {/* Moved padding here */}
                                <div className="space-y-2 text-center">
                                    <h1 className="text-2xl font-semibold tracking-tight">
                                        Execute Interaction
                                    </h1>
                                    <p className="text-sm text-muted-foreground">
                                        Select an action to perform
                                    </p>
                                </div>

                                <div className="grid gap-6">
                                    {/* Primary Action */}
                                    <Button
                                        onClick={() => handleExecute('BURN')}
                                        disabled={isLoading || !stxAddress}
                                        className="w-full"
                                    >
                                        {isLoading ? 'Executing...' : 'Execute Primary Action'}
                                    </Button>

                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <Separator className="w-full" />
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-background px-2 text-muted-foreground">
                                                Contract Details
                                            </span>
                                        </div>
                                    </div>

                                    {/* Contract Info */}
                                    <div className="rounded-lg border p-4">
                                        <h3 className="text-sm font-medium">Contract Address</h3>
                                        <p className="mt-1 break-all text-sm text-muted-foreground">
                                            {metadata.contract}
                                        </p>
                                    </div>

                                    {!stxAddress && (
                                        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900/50 dark:bg-yellow-900/20">
                                            <p className="text-sm text-yellow-600 dark:text-yellow-200">
                                                Connect your wallet to execute interactions
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <p className="px-2 text-center text-sm text-muted-foreground">
                                    Make sure you have sufficient energy before executing interactions.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        </Page>
    );
}