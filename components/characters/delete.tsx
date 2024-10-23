import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@components/ui/dialog";
import { Button } from "@components/ui/button";
import { ArchiveIcon, Loader2Icon } from 'lucide-react';


type Character = {
    ownerAddress: string;
    characterAddress: string;
    schedule: 'hourly' | 'daily' | 'weekly';
    interactions: string[];
    created: number;
    lastRun?: number;
    active: boolean;
};

export function ArchiveCharacterDialog({
    character,
    onArchive,
    trigger
}: {
    character: Character;
    onArchive: (characterAddress: string) => Promise<void>;
    trigger?: React.ReactNode;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [isArchiving, setIsArchiving] = useState(false);

    const handleArchive = async () => {
        try {
            setIsArchiving(true);
            await onArchive(character.characterAddress);
            setIsOpen(false);
        } catch (error) {
            console.error('Error archiving character:', error);
        } finally {
            setIsArchiving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100"
                    >
                        <ArchiveIcon className="h-4 w-4" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Archive Character</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to archive this character? You can unarchive it later if needed.
                    </DialogDescription>
                </DialogHeader>

                {/* Rest of the dialog content remains similar, just update text to reflect archiving */}

                <DialogFooter className="sm:justify-start">
                    <div className="w-full flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            disabled={isArchiving}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={handleArchive}
                            disabled={isArchiving}
                        >
                            {isArchiving ? (
                                <>
                                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                                    Archiving...
                                </>
                            ) : (
                                <>
                                    <ArchiveIcon className="mr-2 h-4 w-4" />
                                    Archive Character
                                </>
                            )}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}