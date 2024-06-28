import SettingsLayout from './layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@components/ui/card';
import useWallet from '@lib/hooks/use-wallet-balances';
import { Avatar, AvatarImage, AvatarFallback } from '@radix-ui/react-avatar';
import { DollarSign, Users, CreditCard, Activity } from 'lucide-react';
import Image from 'next/image';
import { Link1Icon } from '@radix-ui/react-icons';
import Link from 'next/link';

import welshLogo from '@public/welsh-logo.png';
import leoLogo from '@public/leo-logo.png';

import { MoreHorizontal } from 'lucide-react';
import { Button } from '@components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@components/ui/table';
import { Badge } from '@components/ui/badge';
import millify from 'millify';
import { getStakedTokenExchangeRate, getTokenPrices } from '@lib/stacks-api';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';

type Rates = {
  'liquid-staked-welsh-v2': number,
  'liquid-staked-leo': number,
  "prices": any
}

export const getServerSideProps = (async () => {
  try {
  // Fetch data from external API
  const [welshRate, leoRate, prices] = await Promise.all([
    getStakedTokenExchangeRate('liquid-staked-welsh-v2'),
    getStakedTokenExchangeRate('liquid-staked-leo'),
    getTokenPrices(),
  ]);

  const rates: Rates = {
    'liquid-staked-welsh-v2': welshRate.value / Math.pow(10, 6),
    'liquid-staked-leo': leoRate.value / Math.pow(10, 6),
    "prices": prices
  }

  // Pass data to the page via props
  return { props: { rates } }
} catch (error) {
  console.error('Error fetching data:', error);
  return {
    props: {
      rates: {
        'liquid-staked-welsh-v2': 0,
        'liquid-staked-leo': 0,
        prices: {},
      },
    },
  };
}
}) satisfies GetServerSideProps<{ rates: Rates }>

export default function PortfolioPage(
  {
    rates,
  }: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  const supportedTokens = ['SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token'];

  console.log({rates});
  

  return (
    <SettingsLayout>
      <main className="flex flex-1 flex-col gap-4 p-0 md:gap-8">
        {/* <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card x-chunk="dashboard-01-chunk-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Staked Value
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$45,231.89</div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>
          <Card x-chunk="dashboard-01-chunk-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Current Rebase Rewards
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+24 bps</div>
              <p className="text-xs text-muted-foreground">
                +180.1% from last month
              </p>
            </CardContent>
          </Card>
          <Card x-chunk="dashboard-01-chunk-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Index Token Performance
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12.32%</div>
              <p className="text-xs text-muted-foreground">
                +19% from last month
              </p>
            </CardContent>
          </Card>
          <Card x-chunk="dashboard-01-chunk-3">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Arbitrage Profit/Loss
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$573.25</div>
              <p className="text-xs text-muted-foreground">
                +23.20 since last hour
              </p>
            </CardContent>
          </Card>
        </div> */}
        <Component rates={rates} />
      </main>
    </SettingsLayout>
  );
}


function Component({rates}: {rates:Rates}) {
  const { balances } = useWallet();

  const tokens = balances?.fungible_tokens as any;

  const { 'liquid-staked-welsh-v2': welshRate, 'liquid-staked-leo': leoRate, prices } = rates;

  if (!tokens) return <div>Loading...</div>;

  const totalWelshTokens =
    (tokens[`SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-welsh-v2::liquid-staked-token`]
      ?.balance *
      welshRate) /
      Math.pow(10, 6) +
    tokens[`SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token::welshcorgicoin`]
      ?.balance /
      Math.pow(10, 6);

  const totalLeoTokens =
    (tokens[`SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-leo::liquid-staked-token`]
      ?.balance *
      leoRate) /
      Math.pow(10, 6) +
    tokens[`SP1AY6K3PQV5MRT6R4S671NWW2FRVPKM0BR162CT6.leo-token::leo`]?.balance / Math.pow(10, 6);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Staked Token Balances</CardTitle>
        <CardDescription>A detailed list of all liquid staked tokens held.</CardDescription>
      </CardHeader>
      <CardContent>
        {tokens && prices && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  <span className="sr-only">Image</span>
                </TableHead>
                <TableHead>
                  <span className="sr-only">Name</span>
                </TableHead>
                <TableHead className="hidden md:table-cell text-right">Unstaked</TableHead>
                <TableHead className="hidden md:table-cell text-right">Staked</TableHead>
                <TableHead className="hidden md:table-cell text-right">Total Amount</TableHead>
                <TableHead className="hidden md:table-cell text-right">
                  Current Value (USD)
                </TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="hidden sm:table-cell">
                  <Image
                    alt="Product image"
                    className="aspect-square rounded-md object-cover"
                    height="64"
                    src={welshLogo}
                    width="64"
                  />
                </TableCell>
                <TableCell className="font-medium">
                  <div className="text-lg">Welshcorgicoin</div>
                  <Link
                    href={`https://stxscan.co/accounts/${'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token'}`}
                  >
                    <div className="items-end space-x-1 text-xs hidden sm:flex">
                      <div className="whitespace-nowrap hidden lg:flex">
                        SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token
                      </div>
                      <Link1Icon className="mb-0.5" />
                    </div>
                  </Link>
                </TableCell>
                <TableCell className="hidden md:table-cell text-xl text-right">
                  {tokens &&
                    Math.floor(
                      tokens[
                        `SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token::welshcorgicoin`
                      ]?.balance / Math.pow(10, 6)
                    )}
                </TableCell>
                <TableCell className="hidden md:table-cell text-xl text-right whitespace-nowrap">
                  <div className="leading-[1] mt-4">
                    {tokens &&
                      Math.floor(
                        (tokens[
                          `SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-welsh-v2::liquid-staked-token`
                        ]?.balance *
                          welshRate) /
                          Math.pow(10, 6)
                      )}
                  </div>
                  <div className="leading-[1] text-right text-green-200 flex items-end justify-end">
                    <div className="font-fine text-sm mr-1 mb-0.5">
                      {millify(
                        tokens[
                          `SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-welsh-v2::liquid-staked-token`
                        ]?.balance / Math.pow(10, 6)
                      )}{' '}
                      sWELSH
                    </div>
                    <div className="font-fine text-sm mb-0.5">
                      x{Number(welshRate)}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-xl text-right">
                  {tokens && Math.floor(totalWelshTokens)}
                </TableCell>
                <TableCell className="hidden md:table-cell text-xl text-right">
                  ${(prices[6]?.price * totalWelshTokens).toFixed(2)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button disabled aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="hidden sm:table-cell">
                  <Image
                    alt="Product image"
                    className="aspect-square rounded-md object-cover"
                    height="64"
                    src={leoLogo}
                    width="64"
                  />
                </TableCell>
                <TableCell className="font-medium">
                  <div className="text-lg">Leo</div>
                  <Link
                    href={`https://stxscan.co/accounts/${'SP1AY6K3PQV5MRT6R4S671NWW2FRVPKM0BR162CT6.leo-token'}`}
                  >
                    <div className="items-end space-x-1 text-xs hidden sm:flex">
                      <div className="whitespace-nowrap hidden lg:flex">
                        SP1AY6K3PQV5MRT6R4S671NWW2FRVPKM0BR162CT6.leo-token
                      </div>
                      <Link1Icon className="mb-0.5" />
                    </div>
                  </Link>
                </TableCell>
                <TableCell className="hidden md:table-cell text-xl text-right">
                  {tokens &&
                    Math.floor(
                      tokens[`SP1AY6K3PQV5MRT6R4S671NWW2FRVPKM0BR162CT6.leo-token::leo`]?.balance /
                        Math.pow(10, 6)
                    )}
                </TableCell>
                <TableCell className="hidden md:table-cell text-xl text-right whitespace-nowrap">
                  <div className="leading-[1] mt-4">
                    {tokens &&
                      Math.floor(
                        (tokens[
                          `SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-leo::liquid-staked-token`
                        ]?.balance *
                          leoRate) /
                          Math.pow(10, 6)
                      )}
                  </div>
                  <div className="leading-[1] text-right text-green-200 flex items-end justify-end">
                    <div className="font-fine text-sm mr-1 mb-0.5">
                      {millify(
                        tokens[
                          `SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-leo::liquid-staked-token`
                        ]?.balance / Math.pow(10, 6)
                      )}{' '}
                      sLEO
                    </div>
                    <div className="font-fine text-sm mb-0.5">
                      x{leoRate}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-xl text-right">
                  {tokens &&
                    Math.floor(
                      (tokens[
                        `SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-leo::liquid-staked-token`
                      ]?.balance *
                        leoRate +
                        Number(
                          tokens[`SP1AY6K3PQV5MRT6R4S671NWW2FRVPKM0BR162CT6.leo-token::leo`]?.balance
                        )) /
                      Math.pow(10, 6)
                    )}
                </TableCell>
                <TableCell className="hidden md:table-cell text-xl text-right">
                  ${(prices[5].price * totalLeoTokens).toFixed(2)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button disabled aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          Showing <strong>1-2</strong> of <strong>{Object.keys(tokens).length}</strong> tokens
        </div>
      </CardFooter>
    </Card>
  );
}
