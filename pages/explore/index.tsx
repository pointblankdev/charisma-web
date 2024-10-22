import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs"
import { Button } from "@components/ui/button"
import { Separator } from "@components/ui/separator"
import { ScrollArea, ScrollBar } from "@components/ui/scroll-area"
import Page from "@components/page"
import { SkipNavContent } from "@reach/skip-nav"
import Layout from "@components/layout/layout"
import { GetStaticProps } from "next"
import { getInteractionUri, InteractionMetadata } from "@lib/stacks-api"
import { cn } from "@lib/utils"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@components/ui/context-menu"
import { useRouter } from "next/navigation"
import { useDungeonCrawler } from "@lib/hooks/use-dungeon-crawler"
import { API_URL, SITE_URL } from "@lib/constants"
import React, { useState } from "react"
import { interactionIds } from "pages/api/v0/interactions"

export type Collection = (typeof collections)[number]

export const collections = [
  "Charisma Picks",
  "Recently Added",
  "My Interactions",
]

// Add interaction categories
const INTERACTION_CATEGORIES = {
  UTILITY: "Utility",
  REWARD: "Rewards",
  ENGINE: "Engines",
  ALL: "All"
} as const;

type InteractionCategory = typeof INTERACTION_CATEGORIES[keyof typeof INTERACTION_CATEGORIES];

export interface Interaction {
  name: string;
  cover: string;
  type: "interaction";
  uri: string;
  category: InteractionCategory;
  description: string;
  contract: string;
  actions: string[];
}

interface ExplorePageProps {
  interactionData: Interaction[];
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

// Update props interface
interface ExplorePageProps {
  interactionData: Interaction[];
  explorations: Exploration[];
}

export const getStaticProps: GetStaticProps<ExplorePageProps> = async () => {
  const interactionData = (await Promise.all(
    interactionIds.map(async (interaction) => {

      const metadata = await getInteractionUri(interaction.split('.')[0], interaction.split('.')[1]);

      if (!metadata) return null;

      return {
        name: metadata.name,
        contract: metadata.contract,
        cover: metadata.image.replace(SITE_URL, ''),
        type: "interaction" as const,
        category: metadata.category as InteractionCategory,
        description: metadata.description,
        uri: metadata.url.replace(SITE_URL, ''),
        actions: metadata.actions || [],
      };
    })
  )).filter((item): item is Interaction => item !== null);

  // Curated list of explorations
  const explorations: Exploration[] = [
    {
      name: "Energy Arbitrage",
      description: "Generate energy from holding CHA tokens and profit from market inefficiencies.",
      cover: "/explorations/energy-arbitrage.png",
      steps: [
        {
          contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.meme-engine-cha-rc4',
          action: "TAP",
          description: "Generate energy from your CHA holdings"
        },
        {
          contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charismatic-corgi-rc1",
          action: "FORWARD",
          description: "Arbitrage swap forward yielding WELSH and CHA tokens"
        },
        {
          contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charismatic-corgi-rc1",
          action: "BACKWARD",
          description: "Arbitrage swap backwards yielding WELSH and CHA tokens"
        },
      ]
    },
    {
      name: "Welsh Abundance",
      description: "Collect energy, arbitrage WELSH, and mint CHA tokens.",
      cover: "/explorations/welsh-farming.png",
      steps: [
        {
          contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.meme-engine-cha-rc4',
          action: "TAP",
          description: "Generate base energy"
        },
        // {
        //   contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.the-troll-toll-rc1",
        //   action: "PAY",
        //   description: "Py the troll toll to mint CHA tokens",
        // },
        {
          contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-mine-rc3",
          action: "MINT",
          description: "Mint additional Charisma tokens"
        }
      ]
    },
    // Add more curated explorations...
  ];

  return {
    props: {
      interactionData,
      explorations,
    },
    revalidate: 60, // Revalidate every 10 minutes
  };
};

export default function ExplorePage({ interactionData, explorations }: ExplorePageProps) {
  const metadata = {
    title: "Explore Charisma",
    description: "Discover and interact with Charisma protocol.",
  }

  const getInteractionsByCategory = (category: InteractionCategory) => {
    return category === INTERACTION_CATEGORIES.ALL
      ? interactionData
      : interactionData.filter(interaction => interaction.category === category);
  };

  const getCategoryDescription = (category: InteractionCategory) => {
    switch (category) {
      case INTERACTION_CATEGORIES.UTILITY:
        return "Core mechanisms that power other interactions in the dungeon.";
      case INTERACTION_CATEGORIES.REWARD:
        return "Interactions that offer rewards for brave adventurers.";
      case INTERACTION_CATEGORIES.ENGINE:
        return "Special engines that generate energy from token holdings.";
      default:
        return "Discover and interact with the Charisma protocol.";
    }
  };


  const renderInteractionSection = (title: string, description: string, interactions: Interaction[], recent = false) => (
    <div className="">
      <div className="flex items-center justify-between mx-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            {title === 'All' ? 'All Interactions' : title}
          </h2>
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      <Separator className="my-4" />
      <div className="relative">
        <ScrollArea className="">
          <div className="flex pb-4 space-x-4 mx-4">
            {interactions.map((interaction) => (
              <InteractionArtwork
                key={interaction.name}
                interaction={interaction}
                className={recent ? "w-[250px]" : "w-[350px]"}
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
        <div className="block">
          <div className="grid lg:grid-cols-5">
            <Sidebar collections={collections} className="hidden lg:block" />
            <div className="col-span-3 lg:col-span-4 lg:border-l overflow-hidden sm:overflow-visible">
              <div className="h-full pl-0 py-6 lg:pl-8">
                <Tabs defaultValue="all" className="sm:h-[50vh] space-y-6">
                  <div className="flex items-center space-between">
                    <TabsList className="mx-4">
                      <TabsTrigger value="all">All Interactions</TabsTrigger>
                      <TabsTrigger value="rewards">Rewards</TabsTrigger>
                      <TabsTrigger value="engines">Engines</TabsTrigger>
                      <TabsTrigger value="utility">Utility</TabsTrigger>
                    </TabsList>
                  </div>
                  {Object.values(INTERACTION_CATEGORIES).map((category) => (
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
                </Tabs>

                {/* Add Recommended Section */}
                <div className="mt-8">
                  <div className="flex items-center justify-between mx-4">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-semibold tracking-tight">
                        Recommended
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Curated sequences of interactions for optimal profitability
                      </p>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <div className="relative">
                    <ScrollArea>
                      <div className="flex pb-4 space-x-4 mx-4">
                        {explorations.map((exploration, index) => (
                          <ExplorationArtwork
                            key={index}
                            exploration={exploration}
                            className="w-[250px]"
                          />
                        ))}
                      </div>
                      <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </Page>
  );
}

interface InteractionArtworkProps extends React.HTMLAttributes<HTMLDivElement> {
  interaction: Interaction
  aspectRatio?: "portrait" | "square"
  width?: number
  height?: number
}

function InteractionArtwork({
  interaction,
  aspectRatio = "portrait",
  width,
  height,
  className,
  ...props
}: InteractionArtworkProps) {
  const router = useRouter();
  const { interact } = useDungeonCrawler();
  const [isLoading, setIsLoading] = useState(false);

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
      await interact(interaction.contract, action);
    } catch (error) {
      console.error('Failed to explore interaction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("space-y-3", className)} {...props}>
      <ContextMenu>
        <ContextMenuTrigger>
          <div
            className="overflow-hidden rounded-md cursor-pointer"
            onClick={handleInteractionClick}
          >
            <Image
              src={interaction.cover}
              alt={interaction.name}
              width={width}
              height={height}
              className={cn(
                "h-auto w-auto object-cover transition-all opacity-90 hover:opacity-100",
                aspectRatio === "portrait" ? "aspect-[3/4]" : "aspect-square"
              )}
            />
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-40">
          <ContextMenuItem
            onClick={handleInteractionClick}
            className="cursor-pointer"
          >
            View Details
          </ContextMenuItem>
          <ContextMenuSeparator />
          {interaction.actions?.map((action) => (
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
          {interaction.contract.split('.')[0].slice(0, 4)}...{interaction.contract.split('.')[0].slice(-4)}.{interaction.contract.split('.')[1]}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {interaction.description}
        </p>
      </div>
    </div>
  );
}

function InteractionEmptyPlaceholder() {
  return (
    <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          className="w-10 h-10 text-muted-foreground"
          viewBox="0 0 24 24"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>

        <h3 className="mt-4 text-lg font-semibold">No Interactions found</h3>
        <p className="mt-2 mb-4 text-sm text-muted-foreground">
          No interactions are currently available. Check back later!
        </p>
      </div>
    </div>
  )
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

  // const executeStep = async (step: ExplorationStep) => {
  //   setIsExecuting(true);
  //   try {
  //     return await explore(
  //       step.interaction,
  //       step.action
  //     );
  //   } catch (error) {
  //     console.error('Failed to execute step:', error);
  //     throw error;
  //   }
  // };

  const executeExploration = async () => {
    setIsExecuting(true);
    try {
      await explore({ interactions: exploration.steps })
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
    <div className={cn("space-y-3", className)} {...props}>
      <ContextMenu>
        <ContextMenuTrigger>
          <div className="overflow-hidden rounded-md cursor-pointer group"
            onClick={executeExploration}
          >
            <Image
              src={exploration.cover}
              alt={exploration.name}
              width={width}
              height={height}
              className="h-auto w-auto object-cover transition-all opacity-90 group-hover:opacity-100 aspect-square"
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
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
                {getStepStatus(index) === 'executing' && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
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
        <p className="text-xs text-muted-foreground line-clamp-2">
          {exploration.description}
        </p>
        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
          <span>{exploration.steps.length} steps</span>
          {isExecuting && (
            <>
              <span>•</span>
              <span>Executing {currentStep + 1}/{exploration.steps.length}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  collections: Collection[]
}

function Sidebar({ className, collections }: SidebarProps) {
  return (
    <div className={cn("pb-12", className)}>
      <div className="py-4 space-y-4">
        <div className="px-3 py-2">
          <h2 className="px-4 mb-2 text-lg font-semibold tracking-tight">
            Explore
          </h2>
          <div className="space-y-1 flex flex-col">
            <Button variant="ghost" className="justify-start">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              Discover
            </Button>
            <Button disabled variant="ghost" className="justify-start">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2">
                <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z" />
              </svg>
              Popular
            </Button>
          </div>
        </div>
        <div className="py-2">
          <h2 className="relative text-lg font-semibold tracking-tight px-7">
            Crates
          </h2>
          <ScrollArea className="h-full px-1">
            <div className="p-2 space-y-1">
              {collections?.map((collection, i) => (
                <Button
                  key={`${collection}-${i}`}
                  variant="ghost"
                  className="justify-start w-full font-normal"
                  disabled
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                  </svg>
                  {collection}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}

export { InteractionArtwork, InteractionEmptyPlaceholder, Sidebar };