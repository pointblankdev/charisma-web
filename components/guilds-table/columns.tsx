"use client"

import { Button } from "@components/ui/button"
import { ColumnDef } from "@tanstack/react-table"
import { StaticImport } from "next/dist/shared/lib/get-img-props"
import Image from "next/image"
import Link from "next/link"


// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Guild = {
    name: string
    description: string
    url: string
    logo: StaticImport
    quests: number
}

export const columns: ColumnDef<Guild>[] = [
    {
        accessorKey: "logo",
        header: () => <div className="text-left">Crest</div>,
        cell: ({ row }) => {
            const logo: any = row.getValue("logo")

            return <Image src={logo.url} width={48} height={48} alt={'Guild logo'} className="rounded-full border border-white" />
        },

    },
    {
        accessorKey: "name",
        header: () => <div className="text-center">Name</div>,
        cell: ({ row }) => {
            const name = row.getValue("name")

            return <div className="text-center font-medium">{name}</div>
        },

    },
    {
        accessorKey: "description",
        header: () => <div className="text-center">Description</div>,
        cell: ({ row }) => {
            const description = row.getValue("description")

            return <div className="text-center font-medium">{description}</div>
        },

    },
    {
        accessorKey: "url",
        header: () => <div className="text-center">Website</div>,
        cell: ({ row }) => {
            const url = row.getValue("url")

            return <Link href={url as string} target='_blank' className="flex justify-center font-medium"><Button className="text-center font-medium" variant={'link'}>{url}</Button></Link>
        },

    },
    // {
    //     accessorKey: "quests",
    //     header: () => <div className="text-center">Quests</div>,
    //     cell: ({ row }) => {
    //         const quests = row.getValue("quests")
    //         return <div className="text-center font-medium">{quests}</div>
    //     },

    // },
]
