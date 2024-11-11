import React from 'react';
import { useGlobalState } from '@lib/hooks/global-state-context';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter
} from '@components/ui/drawer';
import { ScrollArea } from '@components/ui/scroll-area';
import { Button } from '@components/ui/button';
import { Skeleton } from '@components/ui/skeleton';
import { Separator } from '@components/ui/separator';
import { Badge } from '@components/ui/badge';
import {
  Sword,
  Scroll,
  Shield,
  Backpack,
  Book,
  Wand2,
  Hammer,
  Sparkles,
  X,
  Plus
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@lib/utils';
import { useEffect, useCallback, useState } from 'react';

interface GlobalDrawerProps {
  open: boolean;
  onClose: () => void;
}

interface QuickAction {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  onClick: () => void;
  disabled?: boolean;
}

interface NFTItem {
  id: string;
  image: string;
  name: string;
  slot: number; // 0-63 (4x16 grid)
}

interface InventorySlot {
  id: number;
  item: NFTItem | null;
}

interface GlobalDrawerProps {
  open: boolean;
  onClose: () => void;
}

function InventorySlot({ item, onClick }: { item: NFTItem | null; onClick?: () => void }) {
  return (
    <div
      className={cn(
        // Make the slot take up full space of its container
        'w-full h-full relative rounded-lg',
        'border border-border/50',
        'bg-background/80 transition-all',
        'shadow-[inset_1_2px_8px_rgba(0,0,0,0.1)]',
        'hover:border-primary/40 hover:border-2 duration-100'
      )}
      onClick={onClick}
    >
      {item && (
        <div
          className={cn(
            'absolute inset-0.5 rounded-md overflow-hidden',
            'duration-100',
            'ring-1 ring-white/10',
            'hover:brightness-110 transition-all',
            'after:absolute after:inset-0 after:bg-gradient-to-b after:from-white/5 after:to-transparent',
            'cursor-pointer',
            ' hover:scale-150 hover:z-50 hover:shadow-lg'
          )}
        >
          <Image
            src={item.image}
            alt={item.name}
            className="object-cover"
            fill
            sizes="(min-width: 1024px) calc(100vw / 16), calc(100vw / 16)"
          />
        </div>
      )}
    </div>
  );
}

export function GlobalDrawer({ open, onClose }: GlobalDrawerProps) {
  const [inventory] = React.useState<NFTItem[]>([
    {
      id: '1',
      image: 'https://charisma.rocks/sip9/odins-raven/img/1.gif',
      name: 'Item 1',
      slot: 5
    },
    { id: '2', image: 'https://charisma.rocks/sip9/memobots/1.png', name: 'Item 2', slot: 3 },
    { id: '3', image: 'https://charisma.rocks/sip9/odins-raven/img/2.gif', name: 'Item 3', slot: 7 }
  ]);

  const slots: InventorySlot[] = React.useMemo(() => {
    return Array.from({ length: 64 }, (_, i) => ({
      id: i,
      item: inventory.find(item => item.slot === i) || null
    }));
  }, [inventory]);

  return (
    <Drawer open={open} onClose={onClose}>
      <DrawerContent className="h-[50vh]">
        <div className="flex flex-col h-full">
          {/* Minimal header */}
          <div className="px-4 pt-1 border-b">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                INVENTORY — {inventory.length}/64 SLOTS
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-muted-foreground"
                onClick={onClose}
              >
                ESC
              </Button>
            </div>
          </div>

          {/* Full width grid container */}
          <div className="flex-1 w-full h-full">
            <div className="grid h-full grid-rows-4 bg-border/50">
              {Array.from({ length: 4 }).map((_, rowIndex) => (
                <div
                  key={rowIndex}
                  className="grid w-full gap-px px-1 grid-cols-16"
                  style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }}
                >
                  {slots.slice(rowIndex * 16, (rowIndex + 1) * 16).map(slot => (
                    <div
                      key={slot.id}
                      className="aspect-square bg-border/50 border-[var(--sidebar/10)]"
                    >
                      <InventorySlot
                        item={slot.item}
                        onClick={() => {
                          if (slot.item) {
                            console.log('Clicked item:', slot.item);
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

// Hook to manage drawer state
export function useGlobalDrawer() {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  // Handle keyboard shortcut
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Check for CMD/CTRL + Spacebar
      if ((event.metaKey || event.ctrlKey) && event.key === 'i') {
        event.preventDefault(); // Prevent default browser behavior
        toggle();
      }

      // Add ESC to close
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
