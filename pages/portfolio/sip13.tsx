import SettingsLayout from './layout';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from '@components/ui/card';
import Image from 'next/image';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@components/ui/table';
import velarApi from '@lib/velar-api';
import { GetServerSidePropsContext } from 'next';
import numeral from 'numeral';
import { getDehydratedStateFromSession, parseAddress } from '@components/stacks-session/session-helpers';
import { getLand, getLands } from '@lib/db-providers/kv';
import { getLandBalance } from '@lib/stacks-api';

export async function getServerSideProps(ctx: GetServerSidePropsContext) {

    const landContractAddresses = await getLands()

    const dehydratedState = await getDehydratedStateFromSession(ctx) as string
    const stxAddress = await parseAddress(dehydratedState)

    const lands = []
    for (const ca of landContractAddresses) {
        const metadata = await getLand(ca)
        metadata.balance = await getLandBalance(metadata.id || 0, stxAddress)
        lands.push(metadata)
    }

    const tokens = await velarApi.tokens();

    return {
        props: {
            data: {
                dehydratedState: await getDehydratedStateFromSession(ctx),
                tokens,
                lands
            }
        }
    };
};

type Props = {
    data: any;
};

export default function PortfolioPage({ data }: Props) {
    return (
        <SettingsLayout>
            <main className="flex flex-1 flex-col gap-4 p-0 md:gap-8">
                <TokenBalances data={data} />
            </main>
        </SettingsLayout>
    );
}

function TokenBalances({ data }: Props) {

    const getTokenUSDValue = (land: any) => {
        const token = data.tokens.find((token: any) => token.contractAddress === land.wraps.ca);
        return numeral(land.balance / Math.pow(10, land.wraps.decimals) * Number(token?.price)).format('$0,0.00')
    }

    return (
        <Card>
            <CardHeader className="p-2 sm:p-4">
                <CardTitle>SIP13 Token Balances</CardTitle>
                <CardDescription>A list of all semi-fungible tokens held.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px] sm:table-cell"><span className="sr-only">Image</span></TableHead>
                            <TableHead><span className="sr-only">Name</span></TableHead>
                            <TableHead className="md:table-cell text-right">Token Amount</TableHead>
                            <TableHead className="md:table-cell text-right">Total Value (USD)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.lands.map((land: any) => (
                            <TableRow key={land.id}>
                                <TableCell className="sm:table-cell">
                                    <Image
                                        alt="Product image"
                                        className="aspect-square rounded-full overflow-hidden object-cover border"
                                        height="64"
                                        src={land.image}
                                        width="64"
                                    />
                                </TableCell>
                                <TableCell className="font-medium">
                                    <div className="text-lg">{land.name}</div>
                                </TableCell>
                                <TableCell className="md:table-cell text-xl text-right">
                                    {land?.balance / Math.pow(10, 6)}
                                </TableCell>
                                <TableCell className="md:table-cell text-xl text-right">
                                    {getTokenUSDValue(land)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
            <CardFooter className="p-2 sm:p-4">
                <div className="text-xs text-muted-foreground">Showing only supported tokens</div>
            </CardFooter>
        </Card>
    );
}
