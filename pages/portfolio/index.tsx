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
import dmgLogo from '@public/dmg-logo.gif'
import charismaLogo from '@public/charisma-logo-square.png'
import { callReadOnlyFunction, principalCV } from '@stacks/transactions';

export async function getServerSideProps(ctx: GetServerSidePropsContext) {


  const result: any = await callReadOnlyFunction({
    contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
    contractName: "univ2-core",
    functionName: "lookup-pool",
    functionArgs: [
      principalCV('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wstx'),
      principalCV('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token')
    ],
    senderAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
  });
  const poolInfo = result.value.data.pool;
  const reserve0 = BigInt(poolInfo.data.reserve0.value);
  const reserve1 = BigInt(poolInfo.data.reserve1.value);
  const chaPerStx = Number(reserve1) / Number(reserve0);

  const velarTokens = await velarApi.tokens('all');
  const supportedTokens: any[] = [
    { name: 'Charisma Governance', symbol: 'DMG', image: dmgLogo, ca: 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme000-governance-token', tokenId: 'charisma', decimals: 6 },
    { name: 'Charisma', symbol: 'CHA', image: charismaLogo, ca: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token', tokenId: 'charisma', decimals: 6 },
  ]

  return {
    props: {
      data: {
        dehydratedState: await getDehydratedStateFromSession(ctx),
        chaPerStx,
        velarTokens,
        supportedTokens
        // lands
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

  const getTokenAmountWithDecimals = (token: any) => {
    return getBalanceByKey(`${token.ca}::${token.tokenId}`) / Math.pow(10, token.decimals || 6) || 0
  }

  const getTokenUSDValue = (token: any) => {
    const stxToken = data.velarTokens.find((t: any) => t.symbol === 'STX');
    const chaTokenPrice = Number(stxToken?.price) / data.chaPerStx
    const tokenAmount = getTokenAmountWithDecimals(token);
    return numeral(tokenAmount * chaTokenPrice).format('$0,0.00')
  }

  //   const lands = data.lands.sort((a: any, b: any) => (a.id || 999) - (b.id || 999))

  // Filter lands to show only those with a positive balance
  // const filteredLands = data.tokens
  //   .filter((token: any) => getTokenAmountWithDecimals(token) > 0)
  //   .sort((a: any, b: any) => (a.id || 999) - (b.id || 999));

  const filteredTokens = data.supportedTokens

  return (
    <Card>
      <CardHeader className="p-2 sm:p-4">
        <CardTitle>SIP10 Token Balances</CardTitle>
        <CardDescription>A list of all supported tokens held.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px] sm:table-cell"><span className="sr-only">Image</span></TableHead>
              <TableHead><span className="sr-only">Name</span></TableHead>
              <TableHead><span className="sr-only">Symbol</span></TableHead>
              <TableHead className="text-right md:table-cell whitespace-nowrap">Token Amount</TableHead>
              <TableHead className="text-right md:table-cell whitespace-nowrap">Total Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTokens.map((token: any) => (
              <TableRow key={token.ca}>
                <TableCell className="sm:table-cell">
                  <Image
                    alt="Product image"
                    className="object-cover overflow-hidden rounded-full aspect-square"
                    height="64"
                    src={token.image}
                    width="64"
                  />
                </TableCell>
                <TableCell className="font-medium">
                  <div className="hidden text-lg sm:table-cell">{token.name}</div>
                </TableCell>
                <TableCell className="font-medium">
                  <div className="text-lg sm:table-cell">{token.symbol}</div>
                </TableCell>
                <TableCell className="text-lg text-right md:table-cell">
                  {numeral(getTokenAmountWithDecimals(token)).format('0a')}
                </TableCell>
                <TableCell className="text-lg text-right md:table-cell">
                  {getTokenUSDValue(token)}
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
