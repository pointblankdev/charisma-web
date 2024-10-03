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
import hiddenMemobot from '@public/quests/memobots/hidden-memobot.png'


export async function getServerSideProps(ctx: GetServerSidePropsContext) {


    return {
        props: {
            data: {
                dehydratedState: await getDehydratedStateFromSession(ctx),
                nfts: [
                    {
                        id: 0,
                        ca: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.red-pill-nft::red-pill',
                        name: `Red Pill`,
                        image: '/sip9/pills/red-pill-nft.gif',
                        amount: 0,
                        utilty: 'The Red Pill enables you to wrap your earned rewards into Charisma tokens.'
                    },
                    {
                        id: 1,
                        ca: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.blue-pill-nft::blue-pill',
                        name: `Blue Pill`,
                        image: '/sip9/pills/blue-pill-nft.gif',
                        amount: 0,
                        utilty: 'The Blue Pill offers your early access to Charisma Recovery token redemptions.'
                    },
                    {
                        id: 2,
                        ca: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.odins-raven::raven',
                        name: `Odin's Raven`,
                        image: '/odins-raven/img/4.gif',
                        amount: 0,
                        utilty: 'Protocol burn fees are reduced by up to 50% when holding this NFT.'
                    },
                    {
                        id: 3,
                        ca: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.memobots-guardians-of-the-gigaverse::memobots-guardians-of-the-gigaverse',
                        name: `MemoBot`,
                        image: hiddenMemobot,
                        amount: 0,
                        utilty: 'Overspent energy from tapping is preserved when holding this NFT.'
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
            <main className="flex flex-col flex-1 gap-4 p-0 md:gap-8">
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

    const heldNfts = nfts.filter((nft: any) => nft.amount > 0)

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
                            <TableHead className="text-right md:table-cell">Amount</TableHead>
                            <TableHead className="text-center md:table-cell">Utility Bonus</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {heldNfts.map((nft: any) => (
                            <TableRow key={nft.id}>
                                <TableCell className="sm:table-cell">
                                    <Image
                                        alt="Product image"
                                        className="object-cover overflow-hidden border rounded-full aspect-square"
                                        height="64"
                                        src={nft.image}
                                        width="64"
                                    />
                                </TableCell>
                                <TableCell className="font-medium">
                                    <div className="text-lg">{nft.name}</div>
                                </TableCell>
                                <TableCell className="text-lg text-right md:table-cell">
                                    {nft.amount}
                                </TableCell>
                                <TableCell className="text-lg text-center md:table-cell">
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
