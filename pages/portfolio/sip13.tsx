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
import { useGlobalState } from '@lib/hooks/global-state-context';
import energyIcon from '@public/creatures/img/energy.png';

export async function getServerSideProps(ctx: GetServerSidePropsContext) {

    const landContractAddresses = await getLands()

    const dehydratedState = await getDehydratedStateFromSession(ctx) as string
    const stxAddress = await parseAddress(dehydratedState)

    const lands = []
    if (stxAddress) { // the app crashes if user wallet is not connected
        for (const ca of landContractAddresses) {
            const metadata = await getLand(ca)
            metadata.balance = await getLandBalance(metadata.id || 0, stxAddress)
            lands.push(metadata)
        }
    }
    const tokens = await velarApi.tokens('all');

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
            <main className="flex flex-col flex-1 gap-4 p-0 md:gap-8">
                <TokenBalances data={data} />
            </main>
        </SettingsLayout>
    );
}

function TokenBalances({ data }: Props) {
    const { lands: tokens } = useGlobalState()

    const getTokenUSDValue = (land: any) => {
        const token = data.tokens.find((token: any) => token.contractAddress === land.wraps.ca);
        return numeral(land.balance / Math.pow(10, land.wraps.decimals) * Number(token?.price)).format('$0,0.00')
    }

    const getUntappedEnergy = (land: any) => {
        return numeral(tokens[land.id]?.energy).format('0a')
    }

    const lands = data.lands.sort((a: any, b: any) => (a.id || 999) - (b.id || 999))

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
                            <TableHead className="md:table-cell float-end">
                                <Image
                                    alt={'Energy Icon'}
                                    src={energyIcon}
                                    width={100}
                                    height={100}
                                    className={`z-30 border rounded-full h-6 w-6 mt-3`}
                                />
                            </TableHead>
                            <TableHead className="text-right md:table-cell">Token Amount</TableHead>
                            <TableHead className="text-right md:table-cell">Total Value (USD)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {lands.map((land: any) => (
                            <TableRow key={land.id}>
                                <TableCell className="sm:table-cell">
                                    <Image
                                        alt="Product image"
                                        className="object-cover overflow-hidden border rounded-full aspect-square"
                                        height="64"
                                        src={land.image}
                                        width="64"
                                    />
                                </TableCell>
                                <TableCell className="font-medium">
                                    <div className="text-lg">{land.name}</div>
                                </TableCell>
                                <TableCell className="text-lg text-right md:table-cell">
                                    {getUntappedEnergy(land)}
                                </TableCell>
                                <TableCell className="text-lg text-right md:table-cell">
                                    {land?.balance / Math.pow(10, 6)}
                                </TableCell>
                                <TableCell className="text-lg text-right md:table-cell">
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
