import { GetServerSideProps } from 'next';
import Layout from '@components/layout/layout';
import Page from '@components/page';
import { getPlayerEventData, getPlayerTokens } from '@lib/db-providers/kv';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import numeral from 'numeral';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';

interface PlayerData {
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

interface TokenEvent {
    timestamp: number;
    type: 'transfer' | 'mint' | 'burn';
    token: string;
    amount: number;
}

interface PlayerProfileProps {
    playerData: PlayerData;
    tokenEvents: TokenEvent[];
}

export const getServerSideProps: GetServerSideProps<PlayerProfileProps> = async (context) => {
    const address = context.params?.address as string;

    const governanceTokens = await getPlayerTokens('SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme000-governance-token', address);
    const experience = await getPlayerTokens('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.experience', address);
    const chaBalance = await getPlayerTokens('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token', address);
    const iouWELSHBalance = await getPlayerTokens('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-welsh', address);
    const iouROOBalance = await getPlayerTokens('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-roo', address);
    const synSTXBalance = await getPlayerTokens('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-stx', address);

    const eventData = await getPlayerEventData(address);

    const burnedGovernanceTokens = eventData.burns.reduce((total: number, burn: any) => {
        if (burn.asset_identifier === 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme000-governance-token::charisma') {
            return total + parseInt(burn.amount, 10);
        }
        return total;
    }, 0);

    const burnedIouWELSH = eventData.burns.reduce((total: number, burn: any) => {
        if (burn.asset_identifier === 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-welsh::synthetic-welsh') {
            return total + parseInt(burn.amount, 10);
        }
        return total;
    }, 0);

    const burnedIouROO = eventData.burns.reduce((total: number, burn: any) => {
        if (burn.asset_identifier === 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-roo::synthetic-roo') {
            return total + parseInt(burn.amount, 10);
        }
        return total;
    }, 0);

    const burnedSynSTX = eventData.burns.reduce((total: number, burn: any) => {
        if (burn.asset_identifier === 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-stx::synthetic-stx') {
            return total + parseInt(burn.amount, 10);
        }
        return total;
    }, 0);

    const playerData: PlayerData = {
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

    // Combine all token events into a single array
    const tokenEvents: TokenEvent[] = [
        ...eventData.burns.map((burn: any) => ({
            timestamp: burn.timestamp,
            type: 'burn' as const,
            token: burn.asset_identifier.split('::')[1],
            amount: parseInt(burn.amount, 10),
        })),
        // Add transfer and mint events here when available
    ];

    return {
        props: {
            playerData,
            tokenEvents,
        },
    };
};

export default function PlayerProfile({ playerData, tokenEvents }: PlayerProfileProps) {
    const [selectedToken, setSelectedToken] = useState('all');

    const filteredEvents = selectedToken === 'all'
        ? tokenEvents
        : tokenEvents.filter(event => event.token === selectedToken);

    const meta = {
        title: `Charisma | Player Profile - ${playerData.stxAddress}`,
        description: `Detailed profile and token events for player ${playerData.stxAddress}`,
    };

    return (
        <Page meta={meta}>
            <Layout>
                <div className="sm:max-w-[2400px] sm:mx-auto sm:pb-10">
                    <h1 className="text-3xl font-bold mb-6">Player Profile: {playerData.stxAddress}</h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Experience</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">{numeral(playerData.experience / 10 ** 6).format('0,0')}</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>CHA Tokens</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">{numeral(playerData.chaTokens / 10 ** 6).format('0,0')}</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Governance Tokens</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">{numeral(playerData.governanceTokens / 10 ** 6).format('0,0')}</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>iouWELSH</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">{numeral(playerData.iouWELSH / 10 ** 6).format('0,0')}</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>iouROO</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">{numeral(playerData.iouROO / 10 ** 6).format('0,0')}</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>synSTX</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">{numeral(playerData.synSTX / 10 ** 6).format('0,0')}</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Token Events</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="all" className="mb-4">
                                <TabsList>
                                    <TabsTrigger value="all" onClick={() => setSelectedToken('all')}>All Tokens</TabsTrigger>
                                    <TabsTrigger value="charisma" onClick={() => setSelectedToken('charisma')}>CHA</TabsTrigger>
                                    <TabsTrigger value="governance" onClick={() => setSelectedToken('governance')}>Governance</TabsTrigger>
                                    <TabsTrigger value="iouWELSH" onClick={() => setSelectedToken('iouWELSH')}>iouWELSH</TabsTrigger>
                                    <TabsTrigger value="iouROO" onClick={() => setSelectedToken('iouROO')}>iouROO</TabsTrigger>
                                    <TabsTrigger value="synSTX" onClick={() => setSelectedToken('synSTX')}>synSTX</TabsTrigger>
                                </TabsList>
                            </Tabs>

                            <ResponsiveContainer width="100%" height={400}>
                                <LineChart data={filteredEvents}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="timestamp"
                                        tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString()}
                                    />
                                    <YAxis />
                                    <Tooltip
                                        labelFormatter={(timestamp) => new Date(timestamp).toLocaleString()}
                                        formatter={(value: number, name: string) => [numeral(value / 10 ** 6).format('0,0'), name]}
                                    />
                                    <Legend />
                                    <Line type="monotone" dataKey="amount" stroke="#8884d8" name="Amount" />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </Layout>
        </Page>
    );
}