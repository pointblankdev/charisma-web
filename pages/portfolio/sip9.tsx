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
import { util } from 'zod';
import useWallet from '@lib/hooks/wallet-balance-provider';

export async function getServerSideProps(ctx: GetServerSidePropsContext) {


    return {
        props: {
            data: {
                dehydratedState: await getDehydratedStateFromSession(ctx),
                nfts: [
                    {
                        id: 1,
                        ca: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.odins-raven::raven',
                        name: `Odin's Raven`,
                        image: '/odins-raven/img/4.gif',
                        amount: 1,
                        utilty: 'Protocol burn fees are reduced by up to 50% when holding this NFT.'
                    },
                ]
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
    const { balances } = useWallet();

    const nfts = data.nfts.map((nft: any) => {
        const balance: any = balances.non_fungible_tokens?.[nft.ca]
        nft.amount = balance?.count
        return nft
    })

    return (
        <Card>
            <CardHeader className="p-2 sm:p-4">
                <CardTitle>SIP9 Token Balances</CardTitle>
                <CardDescription>A list of all non-fungible utility tokens held.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px] sm:table-cell"><span className="sr-only">Image</span></TableHead>
                            <TableHead><span className="sr-only">Name</span></TableHead>
                            <TableHead className="md:table-cell text-right">Amount</TableHead>
                            <TableHead className="md:table-cell text-center">Utility Bonus</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {nfts.map((nft: any) => (
                            <TableRow key={nft.id}>
                                <TableCell className="sm:table-cell">
                                    <Image
                                        alt="Product image"
                                        className="aspect-square rounded-full overflow-hidden object-cover border"
                                        height="64"
                                        src={nft.image}
                                        width="64"
                                    />
                                </TableCell>
                                <TableCell className="font-medium">
                                    <div className="text-xl">{nft.name}</div>
                                </TableCell>
                                <TableCell className="md:table-cell text-xl text-right">
                                    {nft.amount}
                                </TableCell>
                                <TableCell className="md:table-cell text-lg text-center">
                                    {nft.utilty}
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
