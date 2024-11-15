import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import Layout from '@components/layout/layout';
import Image from 'next/image';
import { GetStaticProps } from 'next';
import { openContractCall, useConnect } from '@stacks/connect-react';
import { network } from '@components/stacks-session/connect';
import { useGlobalState } from '@lib/hooks/global-state-context';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger
} from '@components/ui/context-menu';
import { cn } from '@lib/utils';
import {
  Pc,
  PostConditionMode,
  fetchCallReadOnlyFunction,
  cvToValue,
  contractPrincipalCV,
  uintCV
} from '@stacks/transactions';
import redPillNft from '@public/sip9/pills/red-pill-nft.gif';
import bluePillNft from '@public/sip9/pills/blue-pill-nft.gif';
import { StaticImageData } from 'next/image';
import { MarketplaceService } from '@lib/data/marketplace/marketplace-service';
import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import stxLogo from '@public/stx-logo.png';
import numeral from 'numeral';
import {
  Tag,
  Clock,
  CircleDollarSign,
  Share2,
  ExternalLink,
  ShoppingCart,
  Info,
  CopyIcon,
  Brain,
  LineChart,
  Loader2,
  Plus,
  Sparkles,
  TrendingUp,
  Coins,
  Cat,
  PictureInPicture,
  Box
} from 'lucide-react';
import { Separator } from '@components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@components/ui/dialog';
import { ScrollArea } from '@components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Alert, AlertDescription } from '@components/ui/alert';
import { Label } from '@components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@components/ui/select';
import { Input } from '@components/ui/input';
import { getNftURI } from '@lib/stacks-api';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem
} from '@components/ui/command';
import { TypeOf } from 'zod';
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover';

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  }).format(date);
}

// Types
interface BaseItem {
  id: string;
  name: string;
  image: string | StaticImageData;
  price: number;
  contractAddress: string;
  contractName: string;
}

interface ShopProduct extends BaseItem {
  type: 'product';
  description?: string;
  traits?: Record<string, string>;
}

interface MarketplaceListing {
  type: 'listing';
  id: string;
  contractId: string;
  tokenId: number;
  price: number;
  commission: number;
  timestamp: number;
  metadata: {
    sip: number;
    name: string;
    description: string | string[];
    attributes: Array<any>;
    properties: Record<string, any>;
    image: string;
  };
}

type ShopItem = ShopProduct | MarketplaceListing | any;

interface ProductCardProps {
  item: ShopItem;
  onAction: (item: ShopItem, action: string) => void;
  disabled?: boolean;
  className?: string;
  currentAddress?: string;
}

// Product definitions
const PRODUCT_LIST: Omit<ShopProduct, 'price' | 'type'>[] = [
  {
    id: 'red-pill',
    name: 'Red Pill NFT',
    image: redPillNft,
    contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
    contractName: 'red-pill-nft',
    description: 'Take the red pill and see how deep the rabbit hole goes.'
  },
  {
    id: 'blue-pill',
    name: 'Blue Pill NFT',
    image: bluePillNft,
    contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
    contractName: 'blue-pill-nft',
    description: 'Take the blue pill and the story ends.'
  }
];

// Collections that support the required token traits
const COLLECTIONS_BY_ARTIST = {
  'rozar.btc': {
    address: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
    collections: [
      {
        id: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.odins-raven',
        name: "Odin's Ravens",
        expectedPrice: '350-500'
      },
      {
        id: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.spell-scrolls-fire-bolt',
        name: 'Spell Scrolls',
        expectedPrice: '10-20'
      },
      {
        id: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.pixel-rozar',
        name: 'Pixel Rozar',
        expectedPrice: '1-5'
      },
      {
        id: 'SP1C2K603TGWJGKPT2Z3WWHA0ARM66D352385TTWH.welsh-punk',
        name: 'Welsh Punk',
        expectedPrice: '10-100'
      },
      {
        id: 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.bitgear-genesis',
        name: 'Bitgear Genesis',
        expectedPrice: '150-300'
      }
    ]
  },
  GPSC: {
    address: 'UNKNOWN',
    collections: [
      {
        id: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.memobots-guardians-of-the-gigaverse',
        name: 'Memobots: Guardians',
        expectedPrice: '60-120'
      }
    ]
  },
  irmissima: {
    address: 'SPNFDGPASBB91FVB0FCRAZ0XCPSSZ4Y56M2AEWDZ',
    collections: [
      {
        id: 'SPNFDGPASBB91FVB0FCRAZ0XCPSSZ4Y56M2AEWDZ.cultured-welsh-chromie',
        name: 'Cultured Welsh: Chromie',
        expectedPrice: '50-100'
      },
      {
        id: 'SPNFDGPASBB91FVB0FCRAZ0XCPSSZ4Y56M2AEWDZ.cultured-welsh-grant',
        name: 'Cultured Welsh: Grant',
        expectedPrice: '50-100'
      },
      {
        id: 'SPNFDGPASBB91FVB0FCRAZ0XCPSSZ4Y56M2AEWDZ.cultured-welsh-memories',
        name: 'Cultured Welsh: Memories',
        expectedPrice: '50-100'
      },
      {
        id: 'SPNFDGPASBB91FVB0FCRAZ0XCPSSZ4Y56M2AEWDZ.cultured-welsh-ribboned',
        name: 'Cultured Welsh: Ribboned',
        expectedPrice: '50-100'
      },
      {
        id: 'SPNFDGPASBB91FVB0FCRAZ0XCPSSZ4Y56M2AEWDZ.cultured-welsh-ringers',
        name: 'Cultured Welsh: Ringers',
        expectedPrice: '50-100'
      },
      {
        id: 'SPNFDGPASBB91FVB0FCRAZ0XCPSSZ4Y56M2AEWDZ.cultured-welsh-beepled',
        name: 'Cultured Welsh: Beepled',
        expectedPrice: '50-100'
      },
      {
        id: 'SPNFDGPASBB91FVB0FCRAZ0XCPSSZ4Y56M2AEWDZ.cultured-welsh-fidenza',
        name: 'Cultured Welsh: Fidenza',
        expectedPrice: '50-100'
      }
    ]
  },
  Vinzo: {
    address: 'SPKW6PSNQQ5Y8RQ17BWB0X162XW696NQX1868DNJ',
    collections: [
      {
        id: 'SPKW6PSNQQ5Y8RQ17BWB0X162XW696NQX1868DNJ.weird-welsh',
        name: 'Weird Welsh',
        expectedPrice: '50-200'
      },
      {
        id: 'SPKW6PSNQQ5Y8RQ17BWB0X162XW696NQX1868DNJ.treasure-hunters',
        name: 'Treasure Hunters',
        expectedPrice: '100-200'
      },
      {
        id: 'SP3T1M18J3VX038KSYPP5G450WVWWG9F9G6GAZA4Q.jumping-pupperz',
        name: 'Jumping Pupperz',
        expectedPrice: '25-60'
      }
    ]
  },
  MooningShark: {
    address: 'SPKW6PSNQQ5Y8RQ17BWB0X162XW696NQX1868DNJ',
    collections: [
      {
        id: 'SP1KMAA7TPZ5AZZ4W67X74MJNFKMN576604CWNBQS.mooningsharks',
        name: 'Mooning Sharks',
        expectedPrice: '30-40'
      }
    ]
  },
  Jackbinswitch: {
    address: null,
    collections: [
      {
        id: 'SPV8C2N59MA417HYQNG6372GCV0SEQE01EV4Z1RQ.stacks-invaders-v0',
        name: 'Stacks Invaders',
        expectedPrice: '75-125'
      }
    ]
  },
  Unknown: {
    address: null,
    collections: [
      {
        id: 'SPJW1XE278YMCEYMXB8ZFGJMH8ZVAAEDP2S2PJYG.happy-welsh',
        name: 'Happy Welsh',
        expectedPrice: '150-5000'
      }
    ]
  }
};

// Helper function to fetch product prices
async function fetchProductPrice(contractAddress: string, contractName: string): Promise<number> {
  try {
    const price = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-price',
      functionArgs: [],
      senderAddress: contractAddress,
      network
    });

    return cvToValue(price).value;
  } catch (error) {
    console.error(`Error fetching price for ${contractName}:`, error);
    return 0;
  }
}

// Product Card Component
interface ProductCardProps {
  item: ShopItem;
  onAction: (item: ShopItem, action: string) => void;
  disabled?: boolean;
  className?: string;
  currentAddress?: string;
}

function ProductDialog({
  item,
  isOpen,
  onOpenChange,
  onAction
}: {
  item: ShopItem;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAction: (item: ShopItem, action: string) => void;
}) {
  const isListing = item.type === 'listing';
  const displayName = isListing ? item.metadata.name : item.name;
  const imageSrc = isListing ? item.metadata.image : item.image;
  const displayPrice = numeral(item.price / 1000000).format('0,0.00');
  const [contractAddress, contractName] = isListing
    ? item.contractId.split('.')
    : [item.contractAddress, item.contractName];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col w-full p-0 gap-0 md:max-w-6xl h-[90vh] md:h-[85vh] overflow-hidden">
        {/* Mobile Header - Only shown on small screens */}
        <DialogHeader className="z-10 p-4 md:hidden bg-background">
          <DialogTitle>{displayName}</DialogTitle>
          <p className="text-sm text-muted-foreground">{contractName.replace(/-/g, ' ')}</p>
        </DialogHeader>

        <div className="flex flex-col flex-1 overflow-hidden md:flex-row md:h-full">
          {/* Image Section */}
          <div className="relative w-full h-[25vh] md:h-full md:w-3/5 flex items-center justify-center z-20">
            <Image
              src={imageSrc || '/dmg-logo.gif'}
              alt={displayName}
              quality={100}
              className="object-contain max-w-full max-h-full"
              width={1024}
              height={1024}
            />
          </div>
          <div className="absolute w-full h-[25vh] md:h-full md:w-3/5 bg-black flex items-center justify-cente z-0">
            <Image
              src={imageSrc || '/dmg-logo.gif'}
              alt={displayName}
              quality={10}
              className="object-cover h-full max-w-full opacity-50 blur-3xl"
              width={1024}
              height={1024}
            />
          </div>

          {/* Details Section */}
          <ScrollArea className="flex-1 md:w-2/5 bg-background">
            <div className="p-4 space-y-6 md:p-6">
              {/* Desktop Header - Hidden on mobile */}
              <div className="hidden md:block">
                <h2 className="text-lg font-bold">{displayName}</h2>
                <p className="text-muted-foreground">{contractName.replace(/-/g, ' ')}</p>
              </div>

              {/* Price and Purchase Section - Fixed on mobile */}
              <div className="sticky top-0 z-10 pt-2 pb-4 bg-background">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <CircleDollarSign className="w-5 h-5 text-muted-foreground" />
                    <span className="text-2xl font-semibold">{displayPrice} STX</span>
                  </div>
                  <Button
                    size="lg"
                    onClick={() => {
                      onOpenChange(false);
                      onAction(item, isListing ? 'purchase' : 'claim');
                    }}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {isListing ? 'Purchase' : 'Claim'}
                  </Button>
                </div>
                {isListing && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    Listed {formatTimestamp(item.timestamp)}
                  </div>
                )}
              </div>

              <Separator />

              {/* Accordion for mobile, regular sections for desktop */}
              <div className="md:hidden">
                <Accordion type="multiple" className="w-full">
                  {/* Description Section */}
                  {isListing && item.metadata.description && (
                    <AccordionItem value="description">
                      <AccordionTrigger>Description</AccordionTrigger>
                      <AccordionContent>
                        <p className="leading-0 text-muted-foreground">
                          {item.metadata.description.description || item.metadata.description}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {/* Properties Section */}
                  {isListing && item.metadata.attributes && item.metadata.attributes.length > 0 && (
                    <AccordionItem value="properties">
                      <AccordionTrigger>Properties</AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-2 gap-3">
                          {item.metadata.attributes.map((attr: any, idx: number) => (
                            <div
                              key={idx}
                              className="p-3 text-center transition-colors rounded-lg bg-accent-foreground/10"
                            >
                              <div className="text-sm text-muted-foreground">
                                {attr.trait || attr.trait_type}
                              </div>
                              <div className="font-medium">{attr.value || '-'}</div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {/* Details Section */}
                  <AccordionItem value="details">
                    <AccordionTrigger>Details</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Contract</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm">
                              {contractAddress.slice(0, 4)}...{contractAddress.slice(-4)}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigator.clipboard.writeText(item.contractId)}
                            >
                              <CopyIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        {isListing && (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Token ID</span>
                              <span className="font-mono">#{item.tokenId}</span>
                            </div>
                            {item.commission > 0 && (
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Commission</span>
                                <span>{(item.commission / 100).toFixed(1)}%</span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              {/* Desktop Sections - Hidden on mobile */}
              <div className="hidden space-y-6 md:block">
                {/* Description */}
                {isListing && item.metadata.description && (
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Description</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.metadata.description.description || item.metadata.description}
                    </p>
                  </div>
                )}

                {/* Properties */}
                {isListing && item.metadata.attributes && item.metadata.attributes.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Properties</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {item.metadata.attributes.map((attr: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-3 text-center transition-colors rounded-lg bg-accent-foreground/10"
                        >
                          <div className="text-sm text-muted-foreground">
                            {attr.trait || attr.trait_type}
                          </div>
                          <div className="font-medium">{attr.value || '-'}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Details</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Contract</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">
                          {contractAddress.slice(0, 4)}...{contractAddress.slice(-4)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigator.clipboard.writeText(item.contractId)}
                        >
                          <CopyIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    {isListing && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Token ID</span>
                          <span className="font-mono">#{item.tokenId}</span>
                        </div>
                        {item.commission > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Commission</span>
                            <span>{(item.commission / 100).toFixed(1)}%</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface ProductCardProps {
  item: ShopItem;
  onAction: (item: ShopItem, action: string) => void;
  className?: string;
  currentAddress?: string;
}

export function ProductCard({ item, onAction, className, currentAddress }: ProductCardProps) {
  const [showDetails, setShowDetails] = React.useState(false);
  const isListing = item.type === 'listing';
  const displayName = isListing ? item.metadata.name : item.name;
  const imageSrc = isListing ? item.metadata.image : item.image;

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>
          <div
            onClick={() => setShowDetails(true)}
            className={cn(
              'relative w-full overflow-hidden rounded-lg aspect-square cursor-pointer',
              'transition-all duration-200 hover:scale-[1.02] hover:shadow-xl',
              className
            )}
          >
            <Image
              src={imageSrc || '/dmg-logo.gif'}
              className="object-cover w-full h-full transition-transform duration-200"
              alt={displayName}
              width={300}
              height={300}
            />
          </div>
        </ContextMenuTrigger>

        <ContextMenuContent className="w-64">
          <div className="px-2 py-1.5">
            <h3 className="text-sm font-semibold">{displayName}</h3>
          </div>
          <ContextMenuSeparator />
          <ContextMenuItem
            onClick={() => onAction(item, isListing ? 'purchase' : 'claim')}
            className="cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {isListing ? 'Purchase Now' : 'Claim'}
          </ContextMenuItem>
          <ContextMenuItem onClick={() => setShowDetails(true)} className="cursor-pointer">
            <ExternalLink className="w-4 h-4 mr-2" />
            View Details
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            onClick={() => {
              navigator.clipboard.writeText(
                isListing ? item.contractId : `${item.contractAddress}.${item.contractName}`
              );
            }}
            className="cursor-pointer"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Copy Contract ID
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <ProductDialog
        item={item}
        isOpen={showDetails}
        onOpenChange={setShowDetails}
        onAction={onAction}
      />
    </>
  );
}

function MarketplaceHeader() {
  return (
    <div className="py-6 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
          <p className="text-muted-foreground">Buy and sell NFTs from approved collections</p>
        </div>
        <ListingDialog />
      </div>

      {/* Market Insights */}
      {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Floor Price</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">125 STX</div>
            <p className="text-xs text-muted-foreground">+2.5% from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <LineChart className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24.5K STX</div>
            <p className="text-xs text-muted-foreground">152 sales this week</p>
          </CardContent>
        </Card>
        <Card className="col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              <div className="flex items-center gap-2">
                Market Insights
                <Brain className="w-4 h-4 text-muted-foreground" />
              </div>
            </CardTitle>
            <Sparkles className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="text-sm">
                • Floor price is expected to rise 10-15% in the next 24h based on recent trading
                patterns
              </p>
              <p className="text-sm">
                • Rare traits "Golden" and "Legendary" are trending in recent sales
              </p>
              <p className="text-sm text-muted-foreground">Last updated 5 minutes ago</p>
            </div>
          </CardContent>
        </Card>
      </div> */}
    </div>
  );
}

function CollectionSearch({
  value,
  onValueChange
}: {
  value: string;
  onValueChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Get current selection display name
  const selectedCollection = useMemo(() => {
    for (const [artist, data] of Object.entries(COLLECTIONS_BY_ARTIST)) {
      const collection = data.collections.find(c => c.id === value);
      if (collection) return collection.name;
    }
    return '';
  }, [value]);

  // Filter collections based on search
  const filteredArtists = useMemo(() => {
    const searchLower = search.toLowerCase();
    return Object.entries(COLLECTIONS_BY_ARTIST).reduce((acc, [artistName, data]) => {
      const filteredCollections = data.collections.filter(
        collection =>
          collection.name.toLowerCase().includes(searchLower) ||
          artistName.toLowerCase().includes(searchLower)
      );

      if (filteredCollections.length > 0) {
        acc[artistName as keyof typeof COLLECTIONS_BY_ARTIST] = {
          ...data,
          collections: filteredCollections
        } as any;
      }
      return acc;
    }, {} as typeof COLLECTIONS_BY_ARTIST);
  }, [search]);

  return (
    <div className="flex flex-col gap-2">
      <Label>Collection</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between w-full"
          >
            {selectedCollection || 'Select collection...'}
            <Box className="w-4 h-4 ml-2 opacity-50 shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command className="border-0">
            <CommandInput
              placeholder="Search collections..."
              value={search}
              onValueChange={setSearch}
              className="h-9"
            />
            <div className="max-h-[300px] overflow-auto">
              {search.length === 0 && (
                <p className="py-6 text-sm text-center text-muted-foreground">
                  Search for a collection to begin...
                </p>
              )}
              {search.length > 0 && Object.keys(filteredArtists).length === 0 && (
                <CommandEmpty>No collections found.</CommandEmpty>
              )}
              {Object.entries(filteredArtists).map(([artistName, data]) => (
                <CommandGroup key={artistName} heading={artistName} className="px-2">
                  {data.collections.map(collection => (
                    <CommandItem
                      key={collection.id}
                      onSelect={() => {
                        onValueChange(collection.id);
                        setOpen(false);
                        setSearch('');
                      }}
                      value={collection.id}
                      className="flex items-center gap-2 px-2 py-3 rounded-md cursor-pointer hover:bg-accent"
                    >
                      <Box className="flex-shrink-0 w-4 h-4" />
                      <div className="flex-1 overflow-hidden">
                        <p className="font-medium truncate">{collection.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{artistName}</span>
                          {data.address && (
                            <>
                              <span>•</span>
                              <span className="font-mono">
                                {data.address.slice(0, 4)}...{data.address.slice(-4)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                        {collection.expectedPrice} STX
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </div>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function ListingDialog() {
  const [isLoading, setIsLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const { stxAddress } = useGlobalState();
  const [showPreview, setShowPreview] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [price, setPrice] = useState('');
  const [metadata, setMetadata] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Check token ownership and fetch metadata
  const fetchNFTDetails = async () => {
    if (!selectedCollection || !tokenId || !stxAddress) {
      setError('Please select a collection and enter a token ID');
      return;
    }

    setPreviewLoading(true);
    setError(null);
    try {
      // First verify ownership
      const ownerCV = await fetchCallReadOnlyFunction({
        network,
        contractAddress: selectedCollection.split('.')[0],
        contractName: selectedCollection.split('.')[1],
        functionName: 'get-owner',
        functionArgs: [uintCV(parseInt(tokenId))],
        senderAddress: stxAddress
      });

      const owner = cvToValue(ownerCV).value.value;

      if (owner !== stxAddress) {
        setError("You don't own this NFT");
        setShowPreview(false);
        return;
      }
      // Fetch metadata
      const metdata = await getNftURI(selectedCollection, tokenId);
      console.log('metadata', metdata);
      setMetadata(metdata);
      setShowPreview(true);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch NFT details');
      setShowPreview(false);
    } finally {
      setPreviewLoading(false);
    }
  };

  // Create the listing
  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCollection || !tokenId || !price || !stxAddress) {
      setError('Please fill all fields');
      return;
    }

    setIsLoading(true);
    try {
      await openContractCall({
        network,
        contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
        contractName: 'marketplace-v6',
        functionName: 'list-asset',
        functionArgs: [
          contractPrincipalCV(selectedCollection.split('.')[0], selectedCollection.split('.')[1]),
          uintCV(parseInt(tokenId)),
          uintCV(parseInt(price) * 1_000_000), // Convert to microSTX
          uintCV(250) // 2.5% commission
        ],
        postConditionMode: PostConditionMode.Allow,
        postConditions: []
      });
    } catch (error: any) {
      setError(error.message || 'Failed to create listing');
    } finally {
      setIsLoading(false);
    }
  };

  const collectionInfo = useCollectionInfo(selectedCollection);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" /> List NFT
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>List NFT for Sale</DialogTitle>
          <DialogDescription>
            Choose an NFT from your collection to list on the marketplace
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreateListing}>
          <div className="grid gap-4 py-4">
            <div className="flex w-full space-x-2">
              <div className="grid w-full gap-2">
                <CollectionSearch
                  value={selectedCollection}
                  onValueChange={value => {
                    setSelectedCollection(value);
                    setShowPreview(false);
                  }}
                />
              </div>

              <div className="grid gap-2">
                <Label>Token ID</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="ID"
                    className="w-24"
                    value={tokenId}
                    onChange={e => setTokenId(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className="min-w-20"
                    onClick={fetchNFTDetails}
                    disabled={!selectedCollection || !tokenId || previewLoading}
                  >
                    {previewLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Check'}
                  </Button>
                </div>
              </div>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {showPreview && metadata && (
              <>
                <Separator />
                <div className="grid gap-4">
                  <Label>NFT Preview</Label>
                  <div className="flex items-start gap-4">
                    <div className="relative w-[300px] h-[300px] rounded-lg overflow-hidden">
                      <Image
                        src={metadata.image}
                        alt={metadata.name}
                        className="object-cover"
                        fill
                      />
                    </div>
                    <div className="flex-1 space-y-4">
                      {metadata.attributes && (
                        <div className="space-y-2 leading-none">
                          {metadata.attributes.map((attr: any, i: number) => (
                            <div key={i} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                {attr.trait || attr.trait_type}
                              </span>
                              <span>{attr.value || '-'}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <Alert>
                    <Sparkles className="w-4 h-4" />
                    <AlertDescription>
                      Suggestion: Based on recent sales and traits, a listing price of{' '}
                      {collectionInfo?.expectedPrice} STX would optimize for quick sale.
                    </AlertDescription>
                  </Alert>

                  <div className="grid gap-2">
                    <Label>Price (STX)</Label>
                    <Input
                      type="number"
                      placeholder="Enter price in STX"
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isLoading || !showPreview || !price}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Listing'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to get collection info anywhere in the app
export function useCollectionInfo(collectionId: string) {
  return useMemo(() => {
    for (const [artist, data] of Object.entries(COLLECTIONS_BY_ARTIST)) {
      const collection = data.collections.find(c => c.id === collectionId);
      if (collection) {
        return {
          ...collection,
          artist,
          artistAddress: data.address
        };
      }
    }
    return null;
  }, [collectionId]);
}

// Page Component
interface ShopPageProps {
  products: ShopProduct[];
  marketplaceListings: MarketplaceListing[];
}

export const getStaticProps: GetStaticProps<ShopPageProps> = async () => {
  // Fetch prices for all products
  const productsWithPrices = await Promise.all(
    PRODUCT_LIST.map(async product => {
      const price = await fetchProductPrice(product.contractAddress, product.contractName);
      return { ...product, price, type: 'product' as const };
    })
  );

  let marketplaceListings: MarketplaceListing[] = [];
  const listings = await MarketplaceService.getListings();
  marketplaceListings = listings.map((listing: any) => ({
    type: 'listing',
    id: `${listing.contractId}-${listing.tokenId}`,
    ...listing
  }));

  marketplaceListings = marketplaceListings.filter(listing => listing.metadata.image);

  return {
    props: {
      products: productsWithPrices,
      marketplaceListings
    },
    revalidate: 60
  };
};

export default function ShopPage({ products, marketplaceListings }: ShopPageProps) {
  const meta = {
    title: 'Charisma | Shop',
    description: 'The Charisma Shop'
  };

  const { charismaClaims, stxAddress } = useGlobalState();
  const { doContractCall } = useConnect();

  const handleAction = async (item: ShopItem, action: string) => {
    if (!stxAddress) return;

    switch (action) {
      case 'claim': {
        const product = item as ShopProduct;
        const postConditions = [];
        if (!charismaClaims.hasFreeClaim) {
          postConditions.push(Pc.principal(stxAddress).willSendEq(product.price).ustx());
        }

        await doContractCall({
          network,
          contractAddress: product.contractAddress,
          contractName: product.contractName,
          functionName: 'claim',
          functionArgs: [],
          postConditionMode: PostConditionMode.Deny,
          postConditions
        });
        break;
      }

      case 'purchase': {
        const listing = item as MarketplaceListing;
        await doContractCall({
          network,
          contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
          contractName: 'marketplace-v6',
          functionName: 'purchase-asset',
          functionArgs: [
            contractPrincipalCV(listing.contractId.split('.')[0], listing.contractId.split('.')[1]),
            uintCV(listing.tokenId)
          ],
          postConditionMode: PostConditionMode.Deny,
          postConditions: [Pc.principal(stxAddress).willSendEq(listing.price).ustx()]
        });
        break;
      }

      case 'unlist': {
        const listing = item as MarketplaceListing;
        await doContractCall({
          network,
          contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
          contractName: 'marketplace-v6',
          functionName: 'unlist-asset',
          functionArgs: [
            contractPrincipalCV(listing.contractId.split('.')[0], listing.contractId.split('.')[1]),
            uintCV(listing.tokenId)
          ],
          postConditionMode: PostConditionMode.Deny,
          postConditions: []
        });
        break;
      }
    }
  };

  // Combine products and listings
  const allItems: ShopItem[] = [...products, ...marketplaceListings];

  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <div className="m-2 sm:container sm:mx-auto sm:pb-10 md:max-w-6xl">
          <MarketplaceHeader />

          <div className="grid grid-cols-4 gap-2 md:grid-cols-5 lg:grid-cols-6">
            {allItems.map(item => (
              <ProductCard
                key={`${item.type}-${item.id}`}
                item={item}
                onAction={handleAction}
                currentAddress={stxAddress}
              />
            ))}
          </div>
        </div>
      </Layout>
    </Page>
  );
}
