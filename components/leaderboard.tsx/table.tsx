"use client"

import { useState } from "react"
import { MoreHorizontal } from "lucide-react"
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
        Token: "Appliance",
        price: "$499.99",
        sales: 25,
        Reward: 10,
        dateAdded: "2023-07-12",
        imageSrc: "/placeholder.svg"
    },
    {
        id: 2,
        wallet: "SP1234567890ABCDEFGH1234567890ABCDEFGH",
        Token: "Electronics",
        price: "$129.99",
        sales: 100,
        Reward: 50,
        dateAdded: "2023-10-18",
    },
    {
        id: 3,
        wallet: "SP1234567890ABCDEFGH1234567890ABCDEFGH",
        Token: "Lighting",
        price: "$39.99",
        sales: 50,
        Reward: 75,
        dateAdded: "2023-11-29",
    },
    {
        id: 4,
        wallet: "SP1234567890ABCDEFGH1234567890ABCDEFGH",
        Token: "Beverage",
        price: "$2.99",
        sales: 0,
        Reward: 200,
        dateAdded: "2023-12-25",
    },
    {
        id: 5,
        wallet: "SP1234567890ABCDEFGH1234567890ABCDEFGH",
        Token: "Accessories",
        price: "$59.99",
        sales: 75,
        Reward: 30,
        dateAdded: "2024-01-01",
    },
    {
        id: 6,
        wallet: "SP1234567890ABCDEFGH1234567890ABCDEFGH",
        Token: "Electronics",
        price: "$199.99",
        sales: 30,
        Reward: 20,
        dateAdded: "2024-02-14",
    }
]

const ITEMS_PER_PAGE = 5;

export default function Leaderboard() {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentProducts = products.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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
                            <TableHead>Token</TableHead>
                            <TableHead className="hidden md:table-cell">Price</TableHead>
                            <TableHead className="hidden md:table-cell">Reward</TableHead>
                            <TableHead className="hidden md:table-cell">Date Added</TableHead>
                            <TableHead>
                                <span className="sr-only">Actions</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentProducts.map(product => (
                            <TableRow key={product.id}>
                                <TableCell className="font-medium">{product.id}</TableCell>
                                <TableCell className="font-medium">{product.wallet}</TableCell>
                                <TableCell>{product.Token}</TableCell>
                                <TableCell className="hidden md:table-cell">{product.price}</TableCell>
                                <TableCell className="hidden md:table-cell">{product.Reward}</TableCell>
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
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <Button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </Button>
                    <span className="mx-2">
                        Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                    </span>
                    <Button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </Button>
                </div>
            </CardFooter>
        </Card>
    )
}
