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

export function NFTEmptyPlaceholder() {
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

        <h3 className="mt-4 text-lg font-semibold">No NFTs found</h3>
        <p className="mt-2 mb-4 text-sm text-muted-foreground">
          You haven't created any NFTs yet. Start creating!
        </p>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="relative">
              Create NFT
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New NFT</DialogTitle>
              <DialogDescription>
                Enter the details of your new NFT.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">NFT Name</Label>
                <Input id="name" placeholder="My Awesome NFT" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="file">Upload File</Label>
                <Input id="file" type="file" />
              </div>
            </div>
            <DialogFooter>
              <Button>Create NFT</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}