import { Button } from "@components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@components/ui/dialog"
import { Input } from "@components/ui/input"
import { Label } from "@components/ui/label"
import { createQuestDraft } from "@lib/user-api"
import Link from "next/link"
import { useRouter } from "next/router"
import React from "react"


export function DialogDemo() {
    const [name, setName] = React.useState('')
    const router = useRouter()
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="secondary" size='sm'>Create New Quest</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>New Quest</DialogTitle>
                    <DialogDescription>
                        First, let's name your quest. Click create when you're done.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="name"
                            placeholder="Awesome Quest #123"
                            className="col-span-3"
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="secondary" size='sm' onClick={() => createQuestDraft({ title: name })
                        .then(async (r) => {
                            const id = (await r.json()).id
                            router.push(`/quest-manager/${id}/update`)
                        })}>Create</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    )
}
