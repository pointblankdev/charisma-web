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
import numeral from "numeral"
import Image from "next/image"
import energyIcon from '@public/creatures/img/energy.png';

const ITEMS_PER_PAGE = 10;

export default function Leaderboard({ holders, expTotalSupply }: any) {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(holders.length / ITEMS_PER_PAGE);

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const pageData = holders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center"><>Leaderboard</><Image alt='energy-icon' src={energyIcon} className='mx-2 rounded-full w-6 h-6' /></CardTitle>
                <CardDescription>
                    High experience grants you greater access to rewards and perks.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="md:table-cell">Rank</TableHead>
                            <TableHead>Wallet Address</TableHead>
                            <TableHead>Experience</TableHead>
                            <TableHead>% of TS</TableHead>
                            <TableHead>&gt; 10% TS</TableHead>
                            <TableHead>&gt; 1% TS</TableHead>
                            <TableHead>&gt; 0.1% TS</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pageData.map((holder: any) => (
                            <TableRow key={holder.rank}>
                                <TableCell className="font-normal text-center">{holder.rank}</TableCell>
                                <TableCell className="font-medium">{holder.bns.names[0] || holder.address}</TableCell>
                                <TableCell className="font-medium">{numeral(holder.experience / 1000000).format('0.0 a')}</TableCell>
                                <TableCell className="font-medium">{numeral(holder.experience / expTotalSupply).format('0.00 %')}</TableCell>
                                <TableCell className="font-medium">{holder.experience / expTotalSupply >= 0.1 ? "🌞" : "✖️"}</TableCell>
                                <TableCell className="font-medium">{holder.experience / expTotalSupply >= 0.01 ? "🌟" : "✖️"}</TableCell>
                                <TableCell className="font-medium">{holder.experience / expTotalSupply >= 0.001 ? "✨" : "✖️"}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
            <CardFooter>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <Button
                        variant={'ghost'}
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </Button>
                    <span className="mx-2">
                        Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                    </span>
                    <Button
                        variant={'ghost'}
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
