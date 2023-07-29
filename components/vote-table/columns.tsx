"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"

import { Button } from "@components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@components/ui/dropdown-menu"
import ContractCallVote from "./voting"


// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Proposal = {
    id: string
    amount: number
    status: "pending" | "processing" | "success" | "failed"
    name: string
    url: string
}

export const columns: ColumnDef<Proposal>[] = [
    {
        accessorKey: "status",
        header: "Status",
    },
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Proposal Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "amount",
        header: () => <div className="text-right">Votes in Favor</div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("amount"))

            return <div className="text-right font-medium">{amount}</div>
        },

    },
    {
        id: "actions",
        cell: ({ row }) => {
            const proposal = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Cast Vote</DropdownMenuLabel>
                        <ContractCallVote proposalPrincipal={proposal.name} />
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => window.open(proposal.url)}>View proposal</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
