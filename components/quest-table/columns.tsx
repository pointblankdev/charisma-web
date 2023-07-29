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
import Logo from "@components/logo"
import IconLogo from "@components/icons/icon-logo"
import Link from "next/link"


// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Quest = {
    id: string
    amount: number
    status: "pending" | "processing" | "success" | "failed"
    name: string
    url: string
}

export const columns: ColumnDef<Quest>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Quest Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "description",
        header: "Description",
    },
    {
        accessorKey: "amount",
        header: () => <div className="text-right">Reward</div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("amount"))

            return <div className="flex items-center space-x-1 justify-end"><span className="text-right font-medium mr-1">{amount}x</span><IconLogo height={16} width={16} /></div>
        },

    },
    {
        id: "actions",
        cell: ({ row }) => {
            const quest = row.original

            return (
                <Link passHref href='/faucet'>
                    <Button variant="ghost">
                        Accept
                    </Button>
                </Link>
            )
        },
    },
]
