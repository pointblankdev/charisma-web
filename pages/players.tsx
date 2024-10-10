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
import { ArrowUpDown } from 'lucide-react';
import { getPlayerEventData, getPlayers, getPlayerTokens } from '@lib/db-providers/kv';

const ITEMS_PER_PAGE = 10;

interface Player {
    stxAddress: string;
    experience: number;
    chaTokens: number;
    governanceTokens: number;
    iouWELSH: number;
    iouROO: number;
    synSTX: number;
    burnedGovernanceTokens: number;
    burnedIouWELSH: number;
    burnedIouROO: number;
    burnedSynSTX: number;
}

interface PlayersPageProps {
    players: Player[];
}

export const getStaticProps: GetStaticProps<PlayersPageProps> = async () => {
    const playerAddresses = await getPlayers();
    const players: Player[] = await Promise.all(playerAddresses.map(async (address: string) => {
        const governanceTokens = await getPlayerTokens('SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme000-governance-token', address);
        const experience = await getPlayerTokens('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.experience', address);
        const chaBalance = await getPlayerTokens('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token', address);
        const iouWELSHBalance = await getPlayerTokens('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-welsh', address);
        const iouROOBalance = await getPlayerTokens('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-roo', address);
        const synSTXBalance = await getPlayerTokens('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-stx', address);

        // Fetch burn data
        const burnData = await getPlayerEventData(address);

        // Calculate total burned tokens
        const burnedGovernanceTokens = burnData.burns.reduce((total: number, burn: any) => {
            if (burn.asset_identifier === 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme000-governance-token::charisma') {
                return total + parseInt(burn.amount, 10);
            }
            return total;
        }, 0);

        const burnedIouWELSH = burnData.burns.reduce((total: number, burn: any) => {
            if (burn.asset_identifier === 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-welsh::synthetic-welsh') {
                return total + parseInt(burn.amount, 10);
            }
            return total;
        }, 0);

        const burnedIouROO = burnData.burns.reduce((total: number, burn: any) => {
            if (burn.asset_identifier === 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-roo::synthetic-roo') {
                return total + parseInt(burn.amount, 10);
            }
            return total;
        }, 0);

        const burnedSynSTX = burnData.burns.reduce((total: number, burn: any) => {
            if (burn.asset_identifier === 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-stx::synthetic-stx') {
                return total + parseInt(burn.amount, 10);
            }
            return total;
        }, 0);

        return {
            stxAddress: address,
            experience,
            chaTokens: chaBalance,
            governanceTokens,
            iouWELSH: iouWELSHBalance,
            iouROO: iouROOBalance,
            synSTX: synSTXBalance,
            burnedGovernanceTokens,
            burnedIouWELSH,
            burnedIouROO,
            burnedSynSTX,
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
                <div className="sm:max-w-[2400px] sm:mx-auto sm:pb-10">
                    <div className="mt-6">
                        <div className="relative sm:px-6 pb-4 pt-5 sm:rounded-lg bg-[var(--sidebar)] border border-[var(--accents-7)] overflow-hidden">
                            <div className="flex items-center justify-between px-4 mb-4 sm:px-0">
                                <h1 className="text-2xl font-bold text-white/95">Players</h1>
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
                                            <TableHead className="py-2 cursor-pointer" onClick={() => handleSort('experience')}>
                                                Experience {sortBy === 'experience' && <ArrowUpDown className="inline ml-1" size={16} />}
                                            </TableHead>
                                            <TableHead className="py-2 cursor-pointer" onClick={() => handleSort('governanceTokens')}>
                                                Governance Tokens {sortBy === 'governanceTokens' && <ArrowUpDown className="inline ml-1" size={16} />}
                                            </TableHead>
                                            <TableHead className="py-2 cursor-pointer" onClick={() => handleSort('chaTokens')}>
                                                CHA Tokens {sortBy === 'chaTokens' && <ArrowUpDown className="inline ml-1" size={16} />}
                                            </TableHead>
                                            <TableHead className="py-2 cursor-pointer" onClick={() => handleSort('iouWELSH')}>
                                                iouWELSH {sortBy === 'iouWELSH' && <ArrowUpDown className="inline ml-1" size={16} />}
                                            </TableHead>
                                            <TableHead className="py-2 cursor-pointer" onClick={() => handleSort('iouROO')}>
                                                iouROO {sortBy === 'iouROO' && <ArrowUpDown className="inline ml-1" size={16} />}
                                            </TableHead>
                                            <TableHead className="py-2 cursor-pointer" onClick={() => handleSort('synSTX')}>
                                                synSTX {sortBy === 'synSTX' && <ArrowUpDown className="inline ml-1" size={16} />}
                                            </TableHead>
                                            <TableHead className="py-2 cursor-pointer" onClick={() => handleSort('burnedGovernanceTokens')}>
                                                Burned Governance {sortBy === 'burnedGovernanceTokens' && <ArrowUpDown className="inline ml-1" size={16} />}
                                            </TableHead>
                                            <TableHead className="py-2 cursor-pointer" onClick={() => handleSort('burnedIouWELSH')}>
                                                Burned iouWELSH {sortBy === 'burnedIouWELSH' && <ArrowUpDown className="inline ml-1" size={16} />}
                                            </TableHead>
                                            <TableHead className="py-2 cursor-pointer" onClick={() => handleSort('burnedIouROO')}>
                                                Burned iouROO {sortBy === 'burnedIouROO' && <ArrowUpDown className="inline ml-1" size={16} />}
                                            </TableHead>
                                            <TableHead className="py-2 cursor-pointer" onClick={() => handleSort('burnedSynSTX')}>
                                                Burned synSTX {sortBy === 'burnedSynSTX' && <ArrowUpDown className="inline ml-1" size={16} />}
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {pageData.map((player, index) => (
                                            <TableRow key={index} className="border-t border-gray-700/50">
                                                <TableCell className="py-4 font-medium text-white">{player.stxAddress}</TableCell>
                                                <TableCell className="py-4 text-white">{numeral(player.experience / 10 ** 6).format('0,0')}</TableCell>
                                                <TableCell className="py-4 text-white">{numeral(player.governanceTokens / 10 ** 6).format('0,0')}</TableCell>
                                                <TableCell className="py-4 text-white">{numeral(player.chaTokens / 10 ** 6).format('0,0')}</TableCell>
                                                <TableCell className="py-4 text-white">{numeral(player.iouWELSH / 10 ** 6).format('0,0')}</TableCell>
                                                <TableCell className="py-4 text-white">{numeral(player.iouROO / 10 ** 6).format('0,0')}</TableCell>
                                                <TableCell className="py-4 text-white">{numeral(player.synSTX / 10 ** 6).format('0,0')}</TableCell>
                                                <TableCell className="py-4 text-white">{numeral(player.burnedGovernanceTokens / 10 ** 6).format('0,0')}</TableCell>
                                                <TableCell className="py-4 text-white">{numeral(player.burnedIouWELSH / 10 ** 6).format('0,0')}</TableCell>
                                                <TableCell className="py-4 text-white">{numeral(player.burnedIouROO / 10 ** 6).format('0,0')}</TableCell>
                                                <TableCell className="py-4 text-white">{numeral(player.burnedSynSTX / 10 ** 6).format('0,0')}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            <div className="flex justify-between items-center px-4 mt-4 sm:px-0 text-xs text-muted-foreground">
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