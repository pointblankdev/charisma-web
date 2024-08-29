import { useState, useEffect } from "react";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@components/ui/table";
import numeral from "numeral";

const ITEMS_PER_PAGE = 10;

export default function Leaderboard({ holders, expTotalSupply }: any) {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredHolders, setFilteredHolders] = useState(holders);

    const totalPages = Math.ceil(filteredHolders.length / ITEMS_PER_PAGE);

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const pageData = filteredHolders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // Update the filtered holders whenever the searched wallet changes
    useEffect(() => {
        if (searchTerm === "") {
            // If the searched wallet is empty, show all holders
            setFilteredHolders(holders);
        } else {
            // Filter holders based on search term
            const filteredData = holders.filter((holder: { address: string; bns: string; }) =>
                holder.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                holder.bns?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredHolders(filteredData);
            setCurrentPage(1); // Reset to first page on search
        }
    }, [searchTerm, holders]);

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col md:flex-row justify-between">
                    <div>
                        <CardTitle className="flex items-center text-4xl font-semibold tracking-tight">Experience</CardTitle>
                        <CardDescription>
                            Top experience holders gain exclusive access to rewards and perks.
                        </CardDescription>
                    </div>
                    <div className="flex items-center space-x-4 my-4 md:my-0">
                        <Input
                            type="text"
                            placeholder="Search wallet..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full"
                        />
                        <Button onClick={() => setSearchTerm("")}>Clear</Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-center">Rank</TableHead>
                            <TableHead>Wallet Address</TableHead>
                            <TableHead className="text-center">Experience</TableHead>
                            <TableHead className="text-center">% of TS</TableHead>
                            <TableHead className="text-center">&gt; 10% TS</TableHead>
                            <TableHead className="text-center">&gt; 1% TS</TableHead>
                            <TableHead className="text-center">&gt; 0.1% TS</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pageData.length > 0 ? (
                            pageData.map((holder: any) => (
                                <TableRow key={holder.rank}>
                                    <TableCell className="font-normal text-center">{holder.rank}</TableCell>
                                    <TableCell className="font-medium">{holder.bns || holder.address}</TableCell>
                                    <TableCell className="font-medium text-center">{numeral(holder.experience / 1000000).format('0.0 a')}</TableCell>
                                    <TableCell className="font-medium text-center">{numeral(holder.experience / expTotalSupply).format('0.00 %')}</TableCell>
                                    <TableCell className="font-medium text-center">{holder.experience / expTotalSupply >= 0.1 ? "🌞" : "✖️"}</TableCell>
                                    <TableCell className="font-medium text-center">{holder.experience / expTotalSupply >= 0.01 ? "🌟" : "✖️"}</TableCell>
                                    <TableCell className="font-medium text-center">{holder.experience / expTotalSupply >= 0.001 ? "✨" : "✖️"}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center">No results found.</TableCell>
                            </TableRow>
                        )}
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
