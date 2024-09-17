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
import useWallet from '@lib/hooks/wallet-balance-provider';
import { getDehydratedStateFromSession } from '@components/stacks-session/session-helpers';
import { getLand, getLands } from '@lib/db-providers/kv';

export async function getServerSideProps(ctx: GetServerSidePropsContext) {

  const landContractAddresses = await getLands()

  const lands = []
  for (const ca of landContractAddresses) {
    const metadata = await getLand(ca)
    lands.push(metadata)
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
  const { getBalanceByKey } = useWallet();

  const getTokenAmountWithDecimals = (land: any) => {
    return getBalanceByKey(`${land.wraps.ca}::${land.wraps.asset}`) / Math.pow(10, land.wraps.decimals || 6) || 0
  }

  const getTokenUSDValue = (land: any) => {
    const token = data.tokens.find((token: any) => token.contractAddress === land.wraps.ca);
    const tokenAmount = getTokenAmountWithDecimals(land);
    return numeral(tokenAmount * token?.price).format('$0,0.00')
  }

  //   const lands = data.lands.sort((a: any, b: any) => (a.id || 999) - (b.id || 999))

  // Filter lands to show only those with a positive balance
  const filteredLands = data.lands
    .filter((land: any) => getTokenAmountWithDecimals(land) > 0)
    .sort((a: any, b: any) => (a.id || 999) - (b.id || 999));

  return (
    <Card>
      <CardHeader className="p-2 sm:p-4">
        <CardTitle>SIP10 Token Balances</CardTitle>
        <CardDescription>A list of all stakeable fungible tokens held.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px] sm:table-cell"><span className="sr-only">Image</span></TableHead>
              <TableHead><span className="sr-only">Name</span></TableHead>
              <TableHead className="text-right md:table-cell">Token Amount</TableHead>
              <TableHead className="text-right md:table-cell">Total Value (USD)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLands.map((land: any) => (
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
                  {getTokenAmountWithDecimals(land)}
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
