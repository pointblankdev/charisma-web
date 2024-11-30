import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
import { Separator } from '@components/ui/separator';
import { ScrollArea, ScrollBar } from '@components/ui/scroll-area';
import Page from '@components/page';
import { SkipNavContent } from '@reach/skip-nav';
import Layout from '@components/layout/layout';
import { GetStaticProps } from 'next';
import { getInteractionUri } from '@lib/stacks-api';
import { cn } from '@lib/utils';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger
} from '@components/ui/context-menu';
import { useRouter } from 'next/navigation';
import { useDungeonCrawler } from '@lib/hooks/use-dungeon-crawler';
import React, { useEffect, useRef, useState } from 'react';
import { interactionIds } from 'pages/api/v0/interactions';
import { useGlobalState } from '@lib/hooks/global-state-context';
import { Badge } from '@components/ui/badge';
import numeral from 'numeral';
import useWallet from '@lib/hooks/wallet-balance-provider';
import { delay } from 'lodash';

export type Collection = typeof collections[number];

export const collections = ['Charisma Picks', 'Recently Added', 'My Interactions'];

// Add interaction categories
const INTERACTION_CATEGORIES = {
  UTILITY: 'Utility',
  REWARD: 'Rewards',
  ENGINE: 'Hold-to-Earn',
  ALL: 'All'
} as const;

type InteractionCategory = typeof INTERACTION_CATEGORIES[keyof typeof INTERACTION_CATEGORIES];

export interface Interaction {
  name: string;
  cover: string;
  type: 'interaction';
  uri: string;
  category: InteractionCategory;
  subtitle: string;
  analytics: any;
  tokenContract?: string;
  description: string[];
  contract: string;
  actions: string[];
}

// Add new interfaces for explorations
interface ExplorationStep {
  contractAddress: string; // contract address
  action: string;
  description: string;
}

interface Exploration {
  name: string;
  description: string;
  cover: string;
  steps: ExplorationStep[];
}

interface InteractionsPageProps {
  interactionData: Interaction[];
  explorations: Exploration[];
}

export const getStaticProps: GetStaticProps<InteractionsPageProps> = async () => {
  const interactionData = (
    await Promise.all(
      interactionIds.map(async (interaction: string) => {
        const metadata = await getInteractionUri(
          interaction.split('.')[0],
          interaction.split('.')[1]
        );
        if (!metadata) return null;

        return {
          name: metadata.name,
          contract: metadata.contract,
          cover: metadata.image,
          type: 'interaction' as const,
          category: metadata.category as InteractionCategory,
          analytics: metadata.analytics || {},
          tokenContract: metadata.tokenContract || '',
          subtitle: metadata.subtitle || '',
          description: metadata.description || [],
          uri: metadata.url,
          actions: metadata.actions || []
        };
      })
    )
  ).filter(item => item !== null) as any[];

  // Curated list of explorations
  const explorations: Exploration[] = [
    {
      name: 'Release the Owls',
      description: 'MAXIMUM ENERGY. MAXIMUM OWLS. MAXIMUM CHARISMA. MAXIMUM PROFIT.',
      cover: '/interactions/hooter-farm.png',
      steps: [
        {
          contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.hooter-farm',
          action: 'CLAIM_TOKENS',
          description: 'Burn energy to claim Hooter (HOOT) token rewards.'
        },
        {
          contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.hooter-farm',
          action: 'CLAIM_TOKENS',
          description: 'Burn energy to claim Hooter (HOOT) token rewards.'
        },
        {
          contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.hooter-farm',
          action: 'CLAIM_TOKENS',
          description: 'Burn energy to claim Hooter (HOOT) token rewards.'
        },
        {
          contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.hooter-farm',
          action: 'CLAIM_TOKENS',
          description: 'Burn energy to claim Hooter (HOOT) token rewards.'
        },
        {
          contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.hooter-farm',
          action: 'CLAIM_TOKENS',
          description: 'Burn energy to claim Hooter (HOOT) token rewards.'
        },
        {
          contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.hooter-farm',
          action: 'CLAIM_TOKENS',
          description: 'Burn energy to claim Hooter (HOOT) token rewards.'
        },
        {
          contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.hooter-farm',
          action: 'CLAIM_TOKENS',
          description: 'Burn energy to claim Hooter (HOOT) token rewards.'
        },
        {
          contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.hooter-farm',
          action: 'CLAIM_TOKENS',
          description: 'Burn energy to claim Hooter (HOOT) token rewards.'
        }
      ]
    }
  ] as any[];

  return {
    props: {
      interactionData,
      explorations
    },
    revalidate: 60
  };
};

export default function InteractionsPage({ interactionData, explorations }: InteractionsPageProps) {
  const metadata = {
    title: 'Interactions | Charisma',
    description: 'Discover and interact with Charisma protocol.'
  };

  console.log(interactionData);

  const getInteractionsByCategory = (category: InteractionCategory) => {
    return category === INTERACTION_CATEGORIES.ALL
      ? interactionData
      : interactionData.filter(interaction => interaction.category === category);
  };

  const getCategoryDescription = (category: InteractionCategory) => {
    switch (category) {
      case INTERACTION_CATEGORIES.UTILITY:
        return 'Core mechanisms that power other interactions in the protocol.';
      case INTERACTION_CATEGORIES.REWARD:
        return 'Interactions that offer rewards at the cost of energy or other requirements.';
      case INTERACTION_CATEGORIES.ENGINE:
        return 'Farm token rewards without giving up custody of your assets.';
      default:
        return 'Discover and interact with the Charisma protocol.';
    }
  };

  const renderInteractionSection = (
    title: string,
    description: string,
    interactions: Interaction[],
    recent = false
  ) => (
    <div className="">
      <div className="flex items-center justify-between mx-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            {title === 'All' ? 'All Interactions' : title}
          </h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <Separator className="my-4" />
      <div className="relative">
        <ScrollArea className="">
          <div className="flex pb-4 mx-4 space-x-4">
            {interactions.map(interaction => (
              <InteractionArtwork
                key={interaction.name}
                interaction={interaction}
                className={recent ? 'w-[200px]' : 'w-[300px]'}
                aspectRatio="square"
                width={recent ? 250 : 350}
                height={recent ? 250 : 350}
              />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );

  return (
    <Page meta={metadata} fullViewport>
      <SkipNavContent />
      <Layout>
        <div className="h-full py-6">
          <div className="space-y-6">
            {/* <Tabs defaultValue="all" className="space-y-6">
              <TabsList className="mx-4">
                <TabsTrigger value="all">All Interactions</TabsTrigger>
                <TabsTrigger value="hold-to-earn">Hold-to-Earn</TabsTrigger>
                <TabsTrigger value="rewards">Rewards</TabsTrigger>
              </TabsList>
              {Object.values(INTERACTION_CATEGORIES).map(category => (
                <TabsContent
                  key={category.toLowerCase()}
                  value={category.toLowerCase()}
                  className="p-0 border-none outline-none"
                >
                  {renderInteractionSection(
                    category,
                    getCategoryDescription(category),
                    getInteractionsByCategory(category)
                  )}
                </TabsContent>
              ))}
            </Tabs> */}

            {renderInteractionSection(
              'Energy Rewards',
              getCategoryDescription(INTERACTION_CATEGORIES.REWARD),
              getInteractionsByCategory(INTERACTION_CATEGORIES.REWARD)
            )}

            {/* Recommended Section */}
            <div className="mt-8">
              <div className="flex items-center justify-between mx-4">
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold tracking-tight">Recommended</h2>
                  <p className="text-sm text-muted-foreground">
                    Curated sequences of interactions for optimal profitability
                  </p>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="relative">
                <ScrollArea>
                  <div className="flex pb-4 mx-4 space-x-4">
                    {explorations.map((exploration, index) => (
                      <ExplorationArtwork
                        key={index}
                        exploration={exploration}
                        className="w-[200px]"
                      />
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </Page>
  );
}

interface InteractionArtworkProps extends React.HTMLAttributes<HTMLDivElement> {
  interaction: Interaction;
  aspectRatio?: 'portrait' | 'square';
  width?: number;
  height?: number;
}

function InteractionArtwork({
  interaction,
  aspectRatio = 'portrait',
  width,
  height,
  className,
  ...props
}: InteractionArtworkProps) {
  const router = useRouter();
  const { interact } = useDungeonCrawler();
  const [isLoading, setIsLoading] = useState(false);
  const { getBalance } = useWallet();
  const { tappedAt, block } = useGlobalState();
  const [animate, setAnimate] = useState(false);
  const previousEnergyRef = useRef(null);

  let tokenBalance, lastTapBlock, blockPeriod, unclaimedEnergy: any;
  if (interaction.tokenContract) {
    tokenBalance = getBalance(interaction.tokenContract);
    lastTapBlock = tappedAt[interaction.analytics.contractId];
    blockPeriod = block.height - lastTapBlock;
    unclaimedEnergy = interaction.analytics.energyPerBlockPerToken * tokenBalance * blockPeriod;
  }

  useEffect(() => {
    // Only trigger animation when unclaimedEnergy changes value
    if (previousEnergyRef.current !== null && previousEnergyRef.current !== unclaimedEnergy) {
      setAnimate(true);
      const timer = setTimeout(() => {
        setAnimate(false);
      }, 200); // Match this to animation duration
      return () => clearTimeout(timer);
    }
    previousEnergyRef.current = unclaimedEnergy;
  }, [unclaimedEnergy]);

  const handleInteractionClick = () => {
    if (interaction.uri) {
      router.push(interaction.uri);
    } else {
      console.error('No URI available for this interaction');
    }
  };

  const handleExploreClick = async (action: string) => {
    setIsLoading(true);
    try {
      await interact(interaction, action);
    } catch (error) {
      console.error('Failed to explore interaction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn('space-y-3', className, 'transition-all')} {...props}>
      <ContextMenu>
        <ContextMenuTrigger>
          <div
            className="relative overflow-hidden rounded-md cursor-pointer group"
            onClick={handleInteractionClick}
          >
            {/* Energy Generation Rate Badge */}
            {interaction?.analytics.energyPerBlockPerToken && !!unclaimedEnergy && (
              <Badge
                title={`Estimate based on your current balance of ${numeral(
                  tokenBalance / 10 ** 6
                ).format('0.00')} ${interaction.tokenContract?.split('.')[1]}`}
                className={cn(
                  'absolute z-20 text-white rounded-b-none rounded-t-xl justify-center w-[96px] text-center place-self-center top-2 right-2 bg-black/75 hover:bg-black/75',
                  unclaimedEnergy !== null && unclaimedEnergy > 0
                    ? 'rounded-b-none'
                    : 'rounded-b-xl'
                )}
              >
                <div>
                  {numeral(
                    (interaction?.analytics.energyPerBlockPerToken * tokenBalance) / 10 ** 6
                  ).format('0.00')}{' '}
                  ⚡/block
                </div>
              </Badge>
            )}

            {/* Unclaimed Energy Badge */}
            {!!unclaimedEnergy && unclaimedEnergy > 0 && (
              <Badge
                title="Unclaimed energy available"
                className={cn(
                  'absolute z-10 font-bold px-0 text-white justify-center rounded-t-none  w-[96px] text-center place-self-center rounded-b-xl top-8 right-2 bg-green-600/75 hover:bg-green-600/75'
                )}
              >
                <div className={animate ? 'shake' : ''}>
                  Claim {numeral(unclaimedEnergy / 10 ** 6).format('0.00')} ⚡
                </div>
              </Badge>
            )}

            <Image
              src={interaction.cover}
              alt={interaction.name}
              width={width}
              height={height}
              className={cn(
                'h-auto w-auto object-cover transition-all group-hover:scale-105',
                aspectRatio === 'portrait' ? 'aspect-[3/4]' : 'aspect-square'
              )}
            />
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-40">
          <ContextMenuItem onClick={handleInteractionClick} className="cursor-pointer">
            View Details
          </ContextMenuItem>
          <ContextMenuSeparator />
          {interaction.actions?.map(action => (
            <ContextMenuItem
              key={action}
              onClick={() => handleExploreClick(action)}
              disabled={isLoading}
              className="cursor-pointer"
            >
              {isLoading ? 'Exploring...' : `Execute ${action.toLowerCase()}`}
            </ContextMenuItem>
          ))}
          <ContextMenuSeparator />
          <ContextMenuItem
            onClick={() => {
              navigator.clipboard.writeText(interaction.contract);
            }}
            className="cursor-pointer"
          >
            Copy Contract ID
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <div className="space-y-1 text-sm">
        <h3 className="font-medium leading-none">{interaction.name}</h3>
        <p className="text-xs text-muted-foreground">
          {interaction.contract.split('.')[0].slice(0, 4)}...
          {interaction.contract.split('.')[0].slice(-4)}.{interaction.contract.split('.')[1]}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-2">{interaction.description}</p>
      </div>
    </div>
  );
}

// Add ExplorationArtwork component
interface ExplorationArtworkProps extends React.HTMLAttributes<HTMLDivElement> {
  exploration: Exploration;
  width?: number;
  height?: number;
}

function ExplorationArtwork({
  exploration,
  width = 250,
  height = 250,
  className,
  ...props
}: ExplorationArtworkProps) {
  const { explore } = useDungeonCrawler();
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const executeExploration = async () => {
    setIsExecuting(true);
    try {
      await explore({ interactions: exploration.steps });
    } catch (error) {
      console.error('Failed to execute exploration sequence:', error);
    } finally {
      setIsExecuting(false);
      setCurrentStep(0);
    }
  };

  const getStepStatus = (index: number) => {
    if (!isExecuting) return 'pending';
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'executing';
    return 'pending';
  };

  return (
    <div className={cn('space-y-3', className)} {...props}>
      <ContextMenu>
        <ContextMenuTrigger>
          <div
            className="overflow-hidden rounded-md cursor-pointer group"
            onClick={executeExploration}
          >
            <Image
              src={exploration.cover}
              alt={exploration.name}
              width={width}
              height={height}
              className="object-cover w-auto h-auto transition-all opacity-90 group-hover:opacity-100 aspect-square"
            />
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-96">
          <div className="px-2 py-1.5">
            <h3 className="font-semibold">{exploration.name}</h3>
            <p className="text-xs text-muted-foreground">{exploration.description}</p>
          </div>
          <ContextMenuSeparator />
          {exploration.steps.map((step, index) => (
            <ContextMenuItem
              key={index}
              disabled={isExecuting}
              // onClick={() => executeStep(step)}
              className="text-xs"
            >
              <div className="flex items-center justify-between w-full">
                <span>
                  {index + 1}. {step.description}
                </span>
                {getStepStatus(index) === 'completed' && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-green-500"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
                {getStepStatus(index) === 'executing' && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animate-spin"
                  >
                    <path d="M21 12a9 9 0 11-6.219-8.56" />
                  </svg>
                )}
              </div>
            </ContextMenuItem>
          ))}
          <ContextMenuSeparator />
          <ContextMenuItem
            onClick={executeExploration}
            disabled={isExecuting}
            className="cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <span>Execute All Steps</span>
              {isExecuting && (
                <span className="text-xs text-muted-foreground">
                  Step {currentStep + 1} of {exploration.steps.length}
                </span>
              )}
            </div>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <div className="space-y-1 text-sm">
        <h3 className="font-medium leading-none">{exploration.name}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2">{exploration.description}</p>
        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
          <span>{exploration.steps.length} steps</span>
          {isExecuting && (
            <>
              <span>•</span>
              <span>
                Executing {currentStep + 1}/{exploration.steps.length}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
