import { useState } from 'react';
import { GetStaticProps, GetStaticPaths } from 'next';
import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import Layout from '@components/layout/layout';
import { Button } from '@components/ui/button';
import Image from 'next/image';
import { useDungeonCrawler } from '@lib/hooks/use-dungeon-crawler';
import { useGlobalState } from '@lib/hooks/global-state-context';
import { ToggleGroup, ToggleGroupItem } from '@components/ui/toggle-group';
import { interactionIds } from 'pages/api/v0/interactions';
import { ExternalLink } from 'lucide-react';
import { getInteractionUri } from '@lib/stacks-api';
import { ScrollArea } from '@components/ui/scroll-area';

interface InteractionMetadata {
  url: string;
  image: string;
  name: string;
  subtitle: string; // Original short description
  description: string[]; // New detailed description paragraphs
  contract: string;
  category: string;
  actions: string[];
  analytics?: any;
  tokenContract?: string;
}

interface InteractionDetailProps {
  metadata: InteractionMetadata;
}

// Updated getStaticPaths and getStaticProps
export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: interactionIds.map(id => ({
      params: { interaction: id }
    })),
    fallback: false
  };
};

export const getStaticProps: GetStaticProps<any> = async ({ params }) => {
  const interaction = params?.interaction as string;
  try {
    const metadata = await getInteractionUri(interaction.split('.')[0], interaction.split('.')[1]);

    console.log(metadata);

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
  const [selectedAction, setSelectedAction] = useState(undefined);

  const handleExecute = async () => {
    if (!stxAddress || !selectedAction) return;
    setIsLoading(true);
    try {
      await interact(metadata, selectedAction);
    } catch (error) {
      console.error('Failed to execute interaction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const ContractLink = () => (
    <a
      href={`https://explorer.hiro.so/txid/${metadata.contract}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center space-x-1 transition-colors group text-gray-50/90 hover:text-gray-50"
    >
      <span className="text-sm break-all whitespace-nowrap">{metadata.contract}</span>
      <ExternalLink
        size={14}
        className="transition-opacity opacity-90 group-hover:opacity-100 text-gray-50/90 group-hover:text-gray-50"
      />
    </a>
  );

  const InteractionPanel = () => (
    <div className="max-w-screen-sm sm:mx-auto sm:px-4">
      <div className="mt-6">
        <div className="relative px-6 pb-4 pt-2 sm:rounded-lg bg-[var(--sidebar)] border border-[var(--accents-7)]">
          <div className="mb-2 space-y-8">
            <div className="p-4 rounded-lg shadow-xl shadow-primary/10 border border-t-0 border-x-0 border-b-[var(--accents-7)]">
              <div className="mb-4 space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">Execute Interaction</h1>
                <p className="text-sm text-muted-foreground">Select an action to perform</p>
              </div>
              <ToggleGroup
                type="single"
                value={selectedAction}
                onValueChange={(value: any) => value && setSelectedAction(value)}
                className="flex flex-wrap justify-start gap-2"
              >
                {metadata.actions.map(action => (
                  <ToggleGroupItem
                    key={action}
                    value={action}
                    aria-label={`Select ${action} action`}
                    className="px-3 py-2 text-sm bg-[var(--sidebar)] border border-primary/30 text-white hover:bg-accent-foreground"
                  >
                    {action}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

            {/* Contract Info Section */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-0 leading-0">
                <span className="text-gray-400">Contract Address</span>
              </div>
              <ContractLink />

              {!stxAddress && (
                <div className="p-4 rounded-lg border border-primary/30 bg-[var(--sidebar)]">
                  <p className="text-sm text-yellow-200">
                    Connect your wallet to execute interactions
                  </p>
                </div>
              )}

              {/* Execute Button */}
              <Button
                onClick={handleExecute}
                disabled={isLoading || !stxAddress || !selectedAction}
                className="w-full px-4 py-3 my-4 font-bold rounded-lg"
              >
                {isLoading ? 'Executing...' : 'Execute Action'}
              </Button>

              <p className="text-sm text-center text-gray-400">
                Always DYOR and carefully review smart contracts before executing any transactions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Page
      meta={{ title: `${metadata.name} Interaction`, description: metadata.subtitle }}
      fullViewport
    >
      <SkipNavContent />
      <Layout>
        {/* Mobile View */}
        <div className="container relative flex md:hidden h-[calc(100vh-112px)] items-center justify-center">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 z-10 bg-zinc-900/70" />
            <Image
              src={metadata.image}
              alt={metadata.name}
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="relative z-20 w-full">
            <InteractionPanel />
          </div>
        </div>

        {/* Desktop View */}
        <div className="container relative hidden md:grid h-[calc(100vh-112px)] flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
          {/* Left Panel - Image and Description */}
          <div className="relative h-full lg:block group">
            <div className="absolute inset-0 z-10 transition-all bg-black/50 group-hover:bg-black/80" />
            <div className="relative h-full">
              <Image
                src={metadata.image}
                alt={metadata.name}
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="absolute inset-0 z-20 flex flex-col justify-between p-10 text-white">
              <div className="space-y-6">
                <div className="flex items-center text-lg font-medium">
                  <span className="text-3xl">{metadata.name}</span>
                </div>

                {/* Description Section */}
                <ScrollArea className="pr-4 h-fit">
                  <div className="space-y-4">
                    {metadata.description.map?.((paragraph, index) => (
                      <p
                        key={index}
                        className="text-md text-transparent group-hover:text-gray-200 leading-normal md:leading-relaxed max-w-[80ch] transition-all duration-300"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div className="space-y-4">
                <blockquote className="space-y-2">
                  <p className="text-lg">{metadata.subtitle}</p>
                  <footer className="text-sm opacity-90">Category: {metadata.category}</footer>
                </blockquote>
              </div>
            </div>
          </div>

          {/* Right Panel - Interaction Interface */}
          <div className="flex items-center justify-center w-full h-full">
            <InteractionPanel />
          </div>
        </div>
      </Layout>
    </Page>
  );
}
