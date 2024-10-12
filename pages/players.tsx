import { useState, useEffect } from 'react';
import { GetStaticProps } from 'next';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@components/ui/table";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import Layout from '@components/layout/layout';
import Page from '@components/page';
import numeral from "numeral";
import { ArrowUpDown, User } from 'lucide-react';
import { getPlayerPill, getPlayers, getPlayerTokens } from '@lib/db-providers/kv';
import Link from 'next/link';
import redPill from '@public/sip9/pills/red-pill-floating.gif';
import bluePill from '@public/sip9/pills/blue-pill-floating.gif';
import Image from 'next/image';

const ITEMS_PER_PAGE = 10;

interface Player {
    stxAddress: string;
    experience: number;
    chaTokens: number;
    governanceTokens: number;
    iouWELSH: number;
    iouROO: number;
    synSTX: number;
    pill: 'RED' | 'BLUE';
}

interface PlayersPageProps {
    players: Player[];
}

export const getStaticProps: GetStaticProps<PlayersPageProps> = async () => {
    const playerAddresses = await getPlayers();
    const players: Player[] = await Promise.all(playerAddresses.map(async (address: string) => {
        const [
            experience,
            chaBalance,
            governanceBalance,
            // iouWELSHBalance,
            // iouROOBalance,
            // synSTXBalance,
            pill
        ] = await Promise.all([
            getPlayerTokens('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.experience', address),
            getPlayerTokens('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token', address),
            getPlayerTokens('SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme000-governance-token', address),
            // getPlayerTokens('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-welsh', address),
            // getPlayerTokens('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-roo', address),
            // getPlayerTokens('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-stx', address),
            getPlayerPill(address)
        ]);

        return {
            stxAddress: address,
            experience,
            chaTokens: chaBalance,
            governanceTokens: governanceBalance,
            // iouWELSH: iouWELSHBalance,
            // iouROO: iouROOBalance,
            // synSTX: synSTXBalance,
            pill
        };
    }));

    // Sort players by experience in descending order
    players.sort((a, b) => b.experience - a.experience);

    return {
        props: {
            players,
        },
        revalidate: 600,
    };
};

export default function PlayersPage({ players }: PlayersPageProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredPlayers, setFilteredPlayers] = useState(players);
    const [sortBy, setSortBy] = useState<keyof Player>('experience');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const totalPages = Math.ceil(filteredPlayers.length / ITEMS_PER_PAGE);

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    const handleSort = (column: keyof Player) => {
        if (column === sortBy) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('desc');
        }
    };

    useEffect(() => {
        let result = players;
        if (searchTerm !== "") {
            result = players.filter((player) =>
                player.stxAddress.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        result.sort((a, b) => {
            if (a[sortBy] < b[sortBy]) return sortOrder === 'asc' ? -1 : 1;
            if (a[sortBy] > b[sortBy]) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
        setFilteredPlayers(result);
        setCurrentPage(1);
    }, [searchTerm, players, sortBy, sortOrder]);

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const pageData = filteredPlayers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const meta = {
        title: 'Charisma | Players',
        description: "View all Charisma players and their stats",
    };

    return (
        <Page meta={meta}>
            <Layout>
                <div className="sm:w-full sm:mx-auto sm:pb-10">
                    <div className="mt-6">
                        <div className="relative sm:px-6 pb-4 pt-5 sm:rounded-lg bg-[var(--sidebar)] border border-[var(--accents-7)] overflow-hidden">
                            <div className="flex items-center justify-between px-4 mb-4 sm:px-0">
                                <h1 className="text-2xl font-bold text-white/95">Charisma Players List</h1>
                                <Input
                                    type="text"
                                    placeholder="Search by STX address..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="max-w-xs"
                                />
                            </div>

                            <div className="px-4 overflow-x-auto sm:px-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="text-left text-gray-400">
                                            <TableHead className="py-2 cursor-pointer" onClick={() => handleSort('stxAddress')}>
                                                STX Address {sortBy === 'stxAddress' && <ArrowUpDown className="inline ml-1" size={16} />}
                                            </TableHead>
                                            <TableHead className="py-2">
                                                Pilled
                                            </TableHead>
                                            <TableHead className="py-2 cursor-pointer" onClick={() => handleSort('experience')}>
                                                Experience {sortBy === 'experience' && <ArrowUpDown className="inline ml-1" size={16} />}
                                            </TableHead>
                                            <TableHead className="py-2 cursor-pointer" onClick={() => handleSort('governanceTokens')}>
                                                Governance Tokens {sortBy === 'governanceTokens' && <ArrowUpDown className="inline ml-1" size={16} />}
                                            </TableHead>
                                            <TableHead className="py-2 cursor-pointer" onClick={() => handleSort('chaTokens')}>
                                                CHA Tokens {sortBy === 'chaTokens' && <ArrowUpDown className="inline ml-1" size={16} />}
                                            </TableHead>
                                            {/* <TableHead className="py-2 cursor-pointer" onClick={() => handleSort('iouWELSH')}>
                                                iouWELSH {sortBy === 'iouWELSH' && <ArrowUpDown className="inline ml-1" size={16} />}
                                            </TableHead>
                                            <TableHead className="py-2 cursor-pointer" onClick={() => handleSort('iouROO')}>
                                                iouROO {sortBy === 'iouROO' && <ArrowUpDown className="inline ml-1" size={16} />}
                                            </TableHead>
                                            <TableHead className="py-2 cursor-pointer" onClick={() => handleSort('synSTX')}>
                                                synSTX {sortBy === 'synSTX' && <ArrowUpDown className="inline ml-1" size={16} />}
                                            </TableHead> */}
                                            <TableHead className="py-2">
                                                Actions
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {pageData.map((player, index) => (
                                            <TableRow key={index} className="border-t border-gray-700/50">
                                                <TableCell className="py-4 font-medium text-white">{player.stxAddress}</TableCell>
                                                <TableCell className="py-4 text-white">
                                                    {player.pill === 'RED' ? <Image src={redPill} alt='Red Pill' width={30} height={30} /> : player.pill === 'BLUE' ? <Image src={bluePill} alt='Blue Pill' width={30} height={30} /> : ''}
                                                </TableCell>
                                                <TableCell className="py-4 text-white">{numeral(player.experience / 10 ** 6).format('0,0')}</TableCell>
                                                <TableCell className="py-4 text-white">{numeral(player.governanceTokens / 10 ** 6).format('0,0')}</TableCell>
                                                <TableCell className="py-4 text-white">{numeral(player.chaTokens / 10 ** 6).format('0,0')}</TableCell>
                                                {/* <TableCell className="py-4 text-white">{numeral(player.iouWELSH / 10 ** 6).format('0,0')}</TableCell>
                                                <TableCell className="py-4 text-white">{numeral(player.iouROO / 10 ** 6).format('0,0')}</TableCell>
                                                <TableCell className="py-4 text-white">{numeral(player.synSTX / 10 ** 6).format('0,0')}</TableCell> */}
                                                <TableCell className="py-4 text-white">
                                                    <Link href={`/players/${player.stxAddress}`} passHref>
                                                        <Button size="sm" variant="outline">
                                                            <User className="w-4 h-4 mr-2" />
                                                            View Profile
                                                        </Button>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            <div className="flex items-center justify-between px-4 mt-4 text-xs sm:px-0 text-muted-foreground">
                                <Button
                                    variant="ghost"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </Button>
                                <span>
                                    Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                                </span>
                                <Button
                                    variant="ghost"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        </Page>
    );
}