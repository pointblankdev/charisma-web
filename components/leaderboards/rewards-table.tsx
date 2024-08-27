import { useState } from "react"
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@components/ui/table"
import numeral from "numeral"

const ITEMS_PER_PAGE = 10;

export default function RewardsTable({ wchaPriceData, topRewardedPlayers }: any) {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(topRewardedPlayers.length / ITEMS_PER_PAGE);

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const pageData = topRewardedPlayers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const wChaExchangeRate = Number(wchaPriceData.price)

    const totalRewards = topRewardedPlayers.reduce((acc: number, holder: any) => acc + (holder.amount / Math.pow(10, 6)), 0) * wChaExchangeRate

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between">
                    <div>

                        <CardTitle className="flex items-center text-4xl font-semibold tracking-tight">Total Rewards</CardTitle>
                        <CardDescription>
                            Total rewards distributed to top Charisma participants.
                        </CardDescription>
                    </div>
                    <div>
                        <div className="text-center leading-tight font-light text-muted-foreground">All Players</div>
                        <CardTitle className="flex items-center text-3xl font-light tracking-tight text-primary-foreground/90">{numeral(totalRewards).format('$0,0.00')}</CardTitle>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-center">Rank</TableHead>
                            <TableHead>Wallet Address</TableHead>
                            <TableHead className="text-right">Total (USD)</TableHead>
                            <TableHead className="text-right">CHA</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pageData.map((holder: any) => (
                            <TableRow key={holder.rank}>
                                <TableCell className="font-normal text-center">{holder.rank}</TableCell>
                                <TableCell className="font-medium">{holder.bns || holder.address}</TableCell>
                                <TableCell className="font-medium text-right">{numeral((holder.amount / Math.pow(10, 6)) * wChaExchangeRate).format('$0.00')}</TableCell>
                                <TableCell className="font-medium text-right">{(holder.amount / Math.pow(10, 6))}</TableCell>
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
