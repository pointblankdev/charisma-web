import React from 'react';
import { useEffect, useCallback, useState } from 'react';
import { Drawer, DrawerContent } from '@components/ui/drawer';
import { cn } from '@lib/utils';
import Image from 'next/image';
import { API_URL } from '@lib/constants';
import {
  Copy,
  Download,
  ExternalLink,
  Gift,
  Info,
  Link,
  Loader2,
  PlusCircle,
  Send,
  Share2
} from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger
} from '@components/ui/context-menu';
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  DragStartEvent,
  DragEndEvent,
  useDraggable,
  useDroppable,
  DragOverEvent
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { createPortal } from 'react-dom';
import { usePersistedState } from '@lib/hooks/use-persisted-state';
import { Tabs, TabsList, TabsTrigger } from '@components/ui/tabs';
import { useToast } from '@components/ui/use-toast';

interface GlobalDrawerProps {
  open: boolean;
  onClose: () => void;
  userAddress: string;
}

interface NFTItem {
  id: string;
  image: string;
  name: string;
  slot: number;
  contract: string;
  metadata?: {
    image: string;
    name: string;
    // Add other metadata fields as needed
  };
}

interface CollectionState {
  slots: Record<string, number>; // tokenId -> slot mapping
  activeTab: string;
}

// Define collection metadata
const COLLECTIONS = [
  {
    id: 'odins-raven',
    name: "Odin's Ravens",
    contract: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.odins-raven'
  },
  {
    id: 'spell-scrolls',
    name: 'Spell Scrolls',
    contract: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.spell-scrolls-fire-bolt'
  },
  {
    id: 'pixel-rozar',
    name: 'Pixel Rozar',
    contract: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.pixel-rozar'
  },
  {
    id: 'welsh-punk',
    name: 'Welsh Punk',
    contract: 'SP1C2K603TGWJGKPT2Z3WWHA0ARM66D352385TTWH.welsh-punk'
  },
  // {
  //   id: 'bitgear-genesis',
  //   name: 'Bitgear Genesis',
  //   contract: 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.bitgear-genesis'
  // },
  {
    id: 'memobots',
    name: 'Memobots: Guardians',
    contract: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.memobots-guardians-of-the-gigaverse'
  },
  // {
  //   id: 'cultured-welsh-chromie',
  //   name: 'Cultured Welsh: Chromie',
  //   contract: 'SPNFDGPASBB91FVB0FCRAZ0XCPSSZ4Y56M2AEWDZ.cultured-welsh-chromie'
  // },
  // {
  //   id: 'cultured-welsh-grant',
  //   name: 'Cultured Welsh: Grant',
  //   contract: 'SPNFDGPASBB91FVB0FCRAZ0XCPSSZ4Y56M2AEWDZ.cultured-welsh-grant'
  // },
  {
    id: 'weird-welsh',
    name: 'Weird Welsh',
    contract: 'SPKW6PSNQQ5Y8RQ17BWB0X162XW696NQX1868DNJ.weird-welsh'
  },
  {
    id: 'treasure-hunters',
    name: 'Treasure Hunters',
    contract: 'SPKW6PSNQQ5Y8RQ17BWB0X162XW696NQX1868DNJ.treasure-hunters'
  },
  // {
  //   id: 'jumping-pupperz',
  //   name: 'Jumping Pupperz',
  //   contract: 'SP3T1M18J3VX038KSYPP5G450WVWWG9F9G6GAZA4Q.jumping-pupperz'
  // },
  {
    id: 'mooning-sharks',
    name: 'Mooning Sharks',
    contract: 'SP1KMAA7TPZ5AZZ4W67X74MJNFKMN576604CWNBQS.mooningsharks'
  }
  // {
  //   id: 'stacks-invaders',
  //   name: 'Stacks Invaders',
  //   contract: 'SPV8C2N59MA417HYQNG6372GCV0SEQE01EV4Z1RQ.stacks-invaders-v0'
  // },
  // {
  //   id: 'happy-welsh',
  //   name: 'Happy Welsh',
  //   contract: 'SPJW1XE278YMCEYMXB8ZFGJMH8ZVAAEDP2S2PJYG.happy-welsh'
  // }
] as const;

interface DraggableSlotProps {
  item: NFTItem | null;
  index: number;
  isDraggedOver: boolean;
}

function NFTContextMenu({ item, children }: { item: NFTItem; children: React.ReactNode }) {
  const { toast } = useToast();

  const handleCopyContract = () => {
    navigator.clipboard.writeText(item.contract);
    toast({ title: 'Contract address copied to clipboard', description: item.contract });
  };

  const handleViewOnExplorer = () => {
    window.open(`https://explorer.stacks.co/txid/${item.contract}`, '_blank');
  };

  const handleCopyLink = () => {
    const link = `https://gamma.io/collections/${item.contract}/${item.id}`;
    navigator.clipboard.writeText(link);
    toast({ title: 'Link copied to clipboard', description: link });
  };

  const handleListNFT = () => {
    toast({
      title: 'List NFT',
      description: `Preparing to list ${item.name}...`
    });
  };

  const handleCopyImageUrl = () => {
    navigator.clipboard.writeText(item.image);
    toast({ title: 'Image URL copied to clipboard', description: item.image });
  };

  const handleTwitterShare = () => {
    const text = `Check out my ${item.name} from the ${item.contract.split('.')[1]} collection!`;
    const imageUrl = item.image;

    const twitterUrl = new URL('https://twitter.com/intent/tweet');
    twitterUrl.searchParams.append('text', text);
    twitterUrl.searchParams.append('url', imageUrl);
    // Optional: Add hashtags
    twitterUrl.searchParams.append('hashtags', 'NFT,Stacks,Bitcoin');
    // Optional: Tag relevant accounts
    twitterUrl.searchParams.append('via', 'CharismaBTC');

    window.open(twitterUrl.toString(), '_blank');
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-64 bg-black/90 border-white/10 text-white/90 animate-in fade-in-0 zoom-in-95">
        <div className="px-2 py-1.5 text-xs font-semibold text-white/60">
          {item.name}
          <div className="text-[10px] font-normal text-white/40">
            Token #{item.id} • {item.contract.split('.')[1]}
          </div>
        </div>
        <ContextMenuSeparator className="bg-white/10" />

        <ContextMenuItem
          className="hover:bg-white/10 focus:bg-white/10"
          onClick={handleCopyImageUrl}
        >
          <Info className="w-4 h-4 mr-2 opacity-50" />
          Copy Image URL
        </ContextMenuItem>

        <ContextMenuItem className="hover:bg-white/10 focus:bg-white/10" onClick={handleListNFT}>
          <PlusCircle className="w-4 h-4 mr-2 opacity-50" />
          List NFT
        </ContextMenuItem>

        <ContextMenuSub>
          <ContextMenuSubTrigger className="hover:bg-white/10 focus:bg-white/10">
            <Share2 className="w-4 h-4 mr-2 opacity-50" />
            Share
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="bg-black/90 border-white/10">
            <ContextMenuItem
              className="hover:bg-white/10 focus:bg-white/10"
              onClick={handleCopyLink}
            >
              <Link className="w-4 h-4 mr-2 opacity-50" />
              Copy Link
            </ContextMenuItem>
            <ContextMenuItem
              className="hover:bg-white/10 focus:bg-white/10"
              onClick={handleTwitterShare}
            >
              <ExternalLink className="w-4 h-4 mr-2 opacity-50" />
              Share to Twitter
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuItem className="hover:bg-white/10 focus:bg-white/10 text-white/50" disabled>
          <Send className="w-4 h-4 mr-2 opacity-50" />
          Send
          <span className="ml-auto text-[10px] text-white/25">Soon</span>
        </ContextMenuItem>

        <ContextMenuSeparator className="bg-white/10" />

        <ContextMenuItem
          className="hover:bg-white/10 focus:bg-white/10"
          onClick={handleCopyContract}
        >
          <Copy className="w-4 h-4 mr-2 opacity-50" />
          Copy Contract Address
        </ContextMenuItem>

        <ContextMenuItem
          className="hover:bg-white/10 focus:bg-white/10"
          onClick={handleViewOnExplorer}
        >
          <ExternalLink className="w-4 h-4 mr-2 opacity-50" />
          View on Explorer
        </ContextMenuItem>

        <ContextMenuSeparator className="bg-white/10" />

        <ContextMenuSub>
          <ContextMenuSubTrigger className="hover:bg-white/10 focus:bg-white/10">
            <PlusCircle className="w-4 h-4 mr-2 opacity-50" />
            More Actions
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="bg-black/90 border-white/10">
            <ContextMenuItem className="hover:bg-white/10 focus:bg-white/10 text-white/50" disabled>
              <Download className="w-4 h-4 mr-2 opacity-50" />
              Download Metadata
              <span className="ml-auto text-[10px] text-white/25">Soon</span>
            </ContextMenuItem>
            <ContextMenuItem className="hover:bg-white/10 focus:bg-white/10 text-white/50" disabled>
              <Gift className="w-4 h-4 mr-2 opacity-50" />
              Gift NFT
              <span className="ml-auto text-[10px] text-white/25">Soon</span>
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
      </ContextMenuContent>
    </ContextMenu>
  );
}

function DraggableSlot({ item, index, isDraggedOver }: DraggableSlotProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: index.toString(),
    data: { item }
  });

  const { setNodeRef: setDropRef } = useDroppable({
    id: index.toString()
  });

  // Combine draggable and droppable refs
  const ref = (node: HTMLDivElement | null) => {
    setNodeRef(node);
    setDropRef(node);
  };

  const slot = (
    <div
      ref={ref}
      {...attributes}
      {...listeners}
      className={cn(
        'relative w-full h-full',
        'border border-white/5',
        'transition-all duration-150',
        'group',
        // Empty slot styling
        !item && 'hover:bg-white/5',
        !item && 'bg-grid-pattern',
        // Dragging states
        isDragging && 'opacity-30',
        isDraggedOver && 'ring-2 ring-primary',
        // Cursor
        item ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
      )}
    >
      {item && !isDragging && (
        <div
          className={cn(
            'absolute inset-1',
            'rounded-sm overflow-hidden',
            'ring-1 ring-white/10',
            'transition-all duration-150',
            'bg-black/40',
            'group-hover:ring-white/20',
            'group-hover:brightness-110'
          )}
        >
          <Image
            src={item.image}
            alt={item.name}
            className={cn(
              'object-cover',
              'transition-transform duration-150',
              'group-hover:scale-105'
            )}
            fill
            sizes="96px"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/30" />
        </div>
      )}
    </div>
  );

  return item ? <NFTContextMenu item={item}>{slot}</NFTContextMenu> : slot;
}

function DragOverlayContent({ item }: { item: NFTItem }) {
  return (
    <div
      className={cn(
        'w-24 h-24',
        'rounded-sm',
        'shadow-2xl shadow-black/50',
        'transition-transform duration-100',
        'scale-110'
      )}
    >
      <div className="absolute overflow-hidden rounded-sm inset-1 ring-2 ring-primary/50">
        <Image src={item.image} alt={item.name} className="object-cover" fill sizes="96px" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/30" />
      </div>
    </div>
  );
}

function DragOverlayPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) {
    return null;
  }

  return createPortal(children, document.body);
}

export function GlobalDrawer({ open, onClose, userAddress }: GlobalDrawerProps) {
  const { toast } = useToast();
  // Persist inventory state
  const [inventoryState, setInventoryState] = usePersistedState<any>('inventory-state', {
    slots: {},
    activeTab: COLLECTIONS[0].id
  });

  const [collectionsData, setCollectionsData] = useState<Record<string, NFTItem[]>>({});
  const [loadingCollections, setLoadingCollections] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedOverId, setDraggedOverId] = useState<string | null>(null);

  // Get current collection data
  const currentCollection = COLLECTIONS.find(c => c.id === inventoryState.activeTab)!;
  const currentInventory = collectionsData[currentCollection.id] || [];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    })
  );

  const fetchCollection = useCallback(
    async (collection: typeof COLLECTIONS[number]) => {
      if (!userAddress || !open) return;

      // Check if we already have this collection's data
      if (collectionsData[collection.id]?.length > 0) {
        return;
      }

      setLoadingCollections(prev => new Set([...prev, collection.id]));

      try {
        const response = await fetch(
          `${API_URL}/api/v0/nfts/list?contractAddress=${collection.contract}&userAddress=${userAddress}`
        );
        const data = await response.json();

        if (data.ownedTokenIds) {
          // Fetch metadata for each token
          const itemsWithMetadata = await Promise.all(
            data.ownedTokenIds.map(async (tokenId: string) => {
              const slot = inventoryState.slots[`${collection.id}-${tokenId}`] ?? -1;

              // Fetch metadata using our new API
              const metadataResponse = await fetch(
                `${API_URL}/api/v0/nfts/uri?contractAddress=${collection.contract}&tokenId=${tokenId}`
              );
              const metadata = await metadataResponse.json();

              return {
                id: tokenId,
                contract: collection.contract,
                name: metadata.name || `${collection.name} #${tokenId}`,
                slot,
                image: metadata.image,
                metadata
              };
            })
          );

          // Assign slots to new items
          let nextSlot = 0;
          const newItems = itemsWithMetadata.map(item => {
            if (item.slot === -1) {
              while (itemsWithMetadata.some(i => i.slot === nextSlot)) {
                nextSlot++;
              }
              item.slot = nextSlot++;
            }
            return item;
          });

          setCollectionsData(prev => ({
            ...prev,
            [collection.id]: newItems
          }));

          setInventoryState((prev: { slots: any }) => ({
            ...prev,
            slots: {
              ...prev.slots,
              ...Object.fromEntries(
                newItems.map(item => [`${collection.id}-${item.id}`, item.slot])
              )
            }
          }));
        }
      } catch (error) {
        console.error(`Error fetching collection ${collection.name}:`, error);
        toast({ title: `Failed to load ${collection.name}` });
      } finally {
        setLoadingCollections(prev => {
          const next = new Set(prev);
          next.delete(collection.id);
          return next;
        });
      }
    },
    [userAddress, open, inventoryState.slots, setInventoryState, collectionsData]
  );

  // Modified useEffect for fetching
  useEffect(() => {
    if (open && userAddress) {
      COLLECTIONS.forEach(collection => {
        fetchCollection(collection);
      });
    }
  }, [open, userAddress, fetchCollection]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id.toString());
  };

  const handleDragOver = (event: DragOverEvent) => {
    setDraggedOverId(event.over?.id.toString() ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = parseInt(active.id.toString());
      const newIndex = parseInt(over.id.toString());

      setCollectionsData(prev => {
        const collection = { ...prev };
        const items = [...(collection[currentCollection.id] || [])];
        const movedItem = items.find(item => item.slot === oldIndex);
        const targetItem = items.find(item => item.slot === newIndex);

        if (movedItem) {
          movedItem.slot = newIndex;
          if (targetItem) {
            targetItem.slot = oldIndex;
          }
        }

        collection[currentCollection.id] = items;
        return collection;
      });

      // Update persisted slots
      setInventoryState((prev: { slots: any }) => ({
        ...prev,
        slots: {
          ...prev.slots,
          ...Object.fromEntries(
            currentInventory.map(item => [`${currentCollection.id}-${item.id}`, item.slot])
          )
        }
      }));
    }

    setActiveId(null);
    setDraggedOverId(null);
  };

  const activeItem = activeId
    ? currentInventory.find(item => item.slot === parseInt(activeId))
    : null;

  return (
    <Drawer open={open} onClose={onClose}>
      <DrawerContent className="h-[80vh] bg-black/40 backdrop-blur-md border-t border-white/10">
        <div className="flex flex-col h-full">
          {/* Header with tabs */}
          <div className="border-b border-white/5">
            <div className="flex items-center justify-between px-4 py-2">
              <div className="flex items-center gap-2">
                <span className="flex items-center space-x-2 text-xs font-medium text-white/60">
                  <div>{currentInventory.length} ITEMS</div>
                  {loadingCollections.size > 0 && <Loader2 className="w-3 h-3 animate-spin" />}
                </span>
              </div>
              <span className="text-xs text-white/40">ESC to close</span>
            </div>

            <Tabs
              value={inventoryState.activeTab}
              onValueChange={value =>
                setInventoryState((prev: any) => ({ ...prev, activeTab: value }))
              }
              className="px-4 pb-2 overflow-x-scroll"
            >
              <TabsList className="bg-white/5">
                {COLLECTIONS.map(collection => (
                  <TabsTrigger
                    key={collection.id}
                    value={collection.id}
                    className="text-xs data-[state=active]:bg-white/10"
                  >
                    {collection.name}
                    {loadingCollections.has(collection.id) && (
                      <Loader2 className="w-3 h-3 ml-2 animate-spin" />
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Grid */}
          <div className="relative flex-1 w-full h-full p-4 overflow-y-scroll">
            <DndContext
              sensors={sensors}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              <div
                className={cn(
                  'grid h-full gap-1',
                  'grid-cols-[repeat(auto-fill,minmax(6rem,1fr))]',
                  'auto-rows-[6rem]',
                  'p-0.5',
                  // 'bg-white/5',
                  'rounded-lg'
                )}
              >
                {Array.from({ length: 150 }).map((_, index) => (
                  <DraggableSlot
                    key={`${currentCollection.id}-${index}`}
                    index={index}
                    item={currentInventory.find(item => item.slot === index) || null}
                    isDraggedOver={draggedOverId === index.toString()}
                  />
                ))}
              </div>

              <DragOverlayPortal>
                <DragOverlay dropAnimation={null}>
                  {activeItem ? <DragOverlayContent item={activeItem} /> : null}
                </DragOverlay>
              </DragOverlayPortal>
            </DndContext>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export function useGlobalDrawer() {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === 'i') {
        event.preventDefault();
        toggle();
      }

      if (event.key === 'Escape' && isOpen) {
        close();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggle, close, isOpen]);

  return {
    isOpen,
    open,
    close,
    toggle
  };
}
