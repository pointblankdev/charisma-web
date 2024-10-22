import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs"
import { Button } from "@components/ui/button"
import { Separator } from "@components/ui/separator"
import { ScrollArea, ScrollBar } from "@components/ui/scroll-area"
import Page from "@components/page"
import { SkipNavContent } from "@reach/skip-nav"
import Layout from "@components/layout/layout"
import { GetStaticProps } from "next"
import { getInteractionUri } from "@lib/stacks-api"
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
import { SITE_URL } from "@lib/constants"
import React, { useState } from "react"

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

const INTERACTIONS = [
  {
    address: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
    name: 'charisma-mine-rc2'
  },
  {
    address: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
    name: 'fate-randomizer-rc1'
  },
  {
    address: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
    name: 'the-troll-toll-rc1'
  },
  {
    address: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
    name: 'fatigue-rc3'
  },
  {
    address: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
    name: 'meme-engine-cha-rc4'
  },
  {
    address: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
    name: 'charismatic-corgi-rc1'
  }
];

interface ExplorePageProps {
  interactionData: Interaction[];
}

export const getStaticProps: GetStaticProps<ExplorePageProps> = async () => {
  const interactionData = (await Promise.all(
    INTERACTIONS.map(async (interaction) => {
      const metadata = await getInteractionUri(interaction.address, interaction.name);

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

  return {
    props: {
      interactionData,
    },
    revalidate: 60, // Revalidate every 10 minutes
  };
};

export default function ExplorePage({ interactionData }: ExplorePageProps) {
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
    <>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            {title}
          </h2>
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      <Separator className="my-4" />
      <div className="relative">
        <ScrollArea>
          <div className="flex pb-4 space-x-4">
            {interactions.map((interaction) => (
              <InteractionArtwork
                key={interaction.name}
                interaction={interaction}
                className={recent ? "w-[150px]" : "w-[250px]"}
                aspectRatio="square"
                width={recent ? 150 : 250}
                height={recent ? 150 : 250}
              />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </>
  );

  return (
    <Page meta={metadata} fullViewport>
      <SkipNavContent />
      <Layout>
        <div className="md:hidden">
          <Image
            src="/examples/nft-marketplace-light.png"
            width={1280}
            height={1114}
            alt="Charisma Interactions"
            className="block dark:hidden"
          />
          <Image
            src="/examples/nft-marketplace-dark.png"
            width={1280}
            height={1114}
            alt="Charisma Interactions"
            className="hidden dark:block"
          />
        </div>
        <div className="hidden md:block">
          <div className="grid lg:grid-cols-5">
            <Sidebar collections={collections} className="hidden lg:block" />
            <div className="col-span-3 lg:col-span-4 lg:border-l">
              <div className="h-full px-4 py-6 lg:px-8">
                <Tabs defaultValue="all" className="h-full space-y-6">
                  <div className="flex items-center space-between">
                    <TabsList>
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="utility">Utility</TabsTrigger>
                      <TabsTrigger value="rewards">Rewards</TabsTrigger>
                      <TabsTrigger value="engines">Engines</TabsTrigger>
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
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </Page>
  )
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
          <div className="space-y-1">
            <Button variant="outline" className="justify-start w-full">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              Discover
            </Button>
            <Button disabled variant="ghost" className="justify-start w-full">
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