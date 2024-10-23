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
import React, { useEffect, useState } from "react"
import { interactionIds } from "pages/api/v0/interactions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@components/ui/dialog";
import { Label } from "@components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { ChevronDown, UserPlus, Users, Bot } from "lucide-react"; // Import icons
import { useGlobalState } from "@lib/hooks/global-state-context"

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
  subtitle: string;
  description: string[];
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
        subtitle: metadata.subtitle || '',
        description: metadata.description || [],
        uri: metadata.url.replace(SITE_URL, ''),
        actions: metadata.actions || [],
      };
    })
  )).filter((item): item is Interaction => item !== null);

  // Curated list of explorations
  const explorations: Exploration[] = [
    {
      name: "Energized Arbitrage - Positive Charge",
      description: "Generate energy from holding CHA tokens and profit from market inefficiencies.",
      cover: "/explorations/energy-arbitrage.png",
      steps: [
        {
          contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.meme-engine-cha-rc4',
          action: "TAP",
          description: "Generate energy from your CHA holdings"
        },
        {
          contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charismatic-corgi-rc3",
          action: "FORWARD",
          description: "Arbitrage swap forward yielding WELSH and CHA tokens"
        },
      ]
    },
    {
      name: "Energized Arbitrage - Negative Charge",
      description: "Generate energy from holding CHA tokens and profit from market inefficiencies.",
      cover: "/explorations/energy-arbitrage.png",
      steps: [
        {
          contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.meme-engine-cha-rc4',
          action: "TAP",
          description: "Generate energy from your CHA holdings"
        },
        {
          contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charismatic-corgi-rc3",
          action: "REVERSE",
          description: "Arbitrage swap backwards yielding WELSH and CHA tokens"
        },
      ]
    },
    {
      name: "Charismatic Flow",
      description: "Collect energy from held CHA tokens and then attempt to wrap additional Charisma tokens.",
      cover: "/explorations/charismatic-flow.png",
      steps: [
        {
          contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.meme-engine-cha-rc4',
          action: "TAP",
          description: "Generate base energy"
        },
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
        return "Farm token rewards without giving up custody of your assets.";
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
                <Tabs defaultValue="engines" className="sm:h-fit space-y-6">
                  <div className="flex items-center space-between">
                    <TabsList className="mx-4">
                      <TabsTrigger value="all">All Interactions</TabsTrigger>
                      <TabsTrigger value="engines">Engines</TabsTrigger>
                      <TabsTrigger value="rewards">Rewards</TabsTrigger>
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

// Update Character interface
interface Character {
  ownerAddress: string;
  characterAddress: string;
  schedule: string;
  interactions: string[];
  created: number;
  lastRun?: number;
  active: boolean;
}

function Sidebar({ className, collections }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { stxAddress } = useGlobalState();

  // Fetch characters when component mounts or stxAddress changes
  useEffect(() => {
    const fetchCharacters = async () => {
      if (!stxAddress) return;

      try {
        setIsLoading(true);
        const response = await fetch(`/api/v0/characters?address=${stxAddress}`);
        if (!response.ok) throw new Error('Failed to fetch characters');

        const data = await response.json();
        setCharacters(data);
      } catch (error) {
        console.error('Error fetching characters:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCharacters();
  }, [stxAddress]);

  const handleCreateCharacter = async (data: {
    ownerAddress: string;
    schedule: string;
    interactions: string[];
  }) => {
    try {
      const response = await fetch('/api/v0/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        setIsOpen(false);
        throw new Error('Failed to create character');
      }


      const newCharacter = await response.json();
      setCharacters(prev => [...prev, newCharacter]);
      setIsOpen(false);
    } catch (error) {
      console.error('Error creating character:', error);
    }
  };

  const formatAddress = (address: string) =>
    `${address.slice(0, 4)}...${address.slice(-4)}`;

  return (
    <div className={cn("pb-12", className)}>
      <div className="py-4 space-y-4">
        {/* Existing Explore section */}
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
          </div>
        </div>

        {/* Characters section */}
        <div className="px-3 py-2">
          <div className="flex items-center px-4 mb-2 space-x-2">
            <h2 className="text-lg font-semibold tracking-tight flex items-center">
              Your Team
            </h2>
            <div className="text-muted-foreground text-sm">(Experimental)</div>
          </div>
          <div className="space-y-1">
            {stxAddress && characters.length < 1 && (
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create New Trading Bot
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Character</DialogTitle>
                    <DialogDescription>
                      Create an automated character to run interactions on your behalf.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    handleCreateCharacter({
                      ownerAddress: stxAddress,
                      schedule: formData.get('schedule') as string,
                      interactions: (formData.get('interactions') as string).split(','),
                    });
                  }}>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="schedule">Schedule</Label>
                        <Select name="schedule">
                          <SelectTrigger>
                            <SelectValue placeholder="Select schedule" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hourly">Every Hour</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="interactions">Select Interactions</Label>
                        <Select name="interactions">
                          <SelectTrigger>
                            <SelectValue placeholder="Choose interactions" />
                          </SelectTrigger>
                          <SelectContent>
                            {/* We'll need to populate this with actual interactions */}
                            <SelectItem value="charisma-mine">Charisma Mine</SelectItem>
                            <SelectItem value="keepers-challenge">Keeper's Challenge</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Create Character</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}

            {/* Characters list */}
            <ScrollArea className="h-fit">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : characters.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground p-4">
                  No characters created yet
                </div>
              ) : (
                characters.map((character) => (
                  <div
                    key={character.characterAddress}
                    className="flex items-center justify-between p-2 hover:bg-accent-foreground rounded-md group"
                  >
                    <div className="flex items-center space-x-2">
                      <Bot className="w-4 h-4" />
                      <div className="space-y-1">
                        <div className="text-sm font-medium">
                          {formatAddress(character.characterAddress)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {character.schedule} • {character.interactions.length} interactions
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={cn(
                        "px-2 py-1 rounded-full text-xs",
                        character.active ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                      )}>
                        {character.active ? 'Active' : 'Inactive'}
                      </div>
                      {/* <ArchiveCharacterDialog character={character as any} onArchive={() => { }} /> */}
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
          </div>
        </div>

        {/* Existing Crates section */}
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
  );
}

export { InteractionArtwork, InteractionEmptyPlaceholder, Sidebar };