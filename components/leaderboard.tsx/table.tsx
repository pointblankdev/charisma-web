"use client"

import Image from "next/image"
import { MoreHorizontal } from "lucide-react"

import { Badge } from "@components/ui/badge"
import { Button } from "@components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@components/ui/dropdown-menu"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@components/ui/table"

const products = [
    {
        id: 1,
        wallet: "SP1234567890ABCDEFGH1234567890ABCDEFGH",
        category: "Appliance",
        price: "$499.99",
        sales: 25,
        stock: 10,
        dateAdded: "2023-07-12",
        imageSrc: "/placeholder.svg"
    },
    {
        id: 2,
        wallet: "SP1234567890ABCDEFGH1234567890ABCDEFGH",
        category: "Electronics",
        price: "$129.99",
        sales: 100,
        stock: 50,
        dateAdded: "2023-10-18",
    },
    {
        id: 3,
        wallet: "SP1234567890ABCDEFGH1234567890ABCDEFGH",
        category: "Lighting",
        price: "$39.99",
        sales: 50,
        stock: 75,
        dateAdded: "2023-11-29",
    },
    {
        id: 4,
        wallet: "SP1234567890ABCDEFGH1234567890ABCDEFGH",
        category: "Beverage",
        price: "$2.99",
        sales: 0,
        stock: 200,
        dateAdded: "2023-12-25",
    },
    {
        id: 5,
        wallet: "SP1234567890ABCDEFGH1234567890ABCDEFGH",
        category: "Accessories",
        price: "$59.99",
        sales: 75,
        stock: 30,
        dateAdded: "2024-01-01",
    },
    {
        id: 6,
        wallet: "SP1234567890ABCDEFGH1234567890ABCDEFGH",
        category: "Electronics",
        price: "$199.99",
        sales: 30,
        stock: 20,
        dateAdded: "2024-02-14",
    }
]

export default function Leaderboard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Leaderboard</CardTitle>
                <CardDescription>
                    Overview of top-performing users and their details.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="hidden w-[100px] sm:table-cell">
                            <TableHead className="hidden md:table-cell">Rank</TableHead>
                            </TableHead>
                            <TableHead>Wallet Address</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="hidden md:table-cell">Price</TableHead>
                            <TableHead className="hidden md:table-cell">Total Sales</TableHead>
                            <TableHead className="hidden md:table-cell">Stock</TableHead>
                            <TableHead className="hidden md:table-cell">Date Added</TableHead>
                            <TableHead>
                                <span className="sr-only">Actions</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map(product => (
                            <TableRow key={product.id}>
                                <TableCell className="font-medium">{product.id}</TableCell>
                                <TableCell className="font-medium">{product.wallet}</TableCell>
                                <TableCell>{product.category}</TableCell>
                                <TableCell className="hidden md:table-cell">{product.price}</TableCell>
                                <TableCell className="hidden md:table-cell">{product.sales}</TableCell>
                                <TableCell className="hidden md:table-cell">{product.stock}</TableCell>
                                <TableCell className="hidden md:table-cell">{product.dateAdded}</TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Toggle menu</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem>Edit</DropdownMenuItem>
                                            <DropdownMenuItem>Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
            <CardFooter>
                <div className="text-xs text-muted-foreground">
                    Showing <strong>1-6</strong> of <strong>6</strong> products
                </div>
            </CardFooter>
        </Card>
    )
}
