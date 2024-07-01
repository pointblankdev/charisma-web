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
import Image from 'next/image';

import charismaLogo from '@public/charisma.png';
import welshLogo from '@public/welsh-logo.png';
import leoLogo from '@public/leo-logo.png';

import { Activity, CreditCard, DollarSign, MoreHorizontal, Users } from 'lucide-react';
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

import millify from 'millify';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { commafy } from 'commafy-anything'
import { getStakedTokenExchangeRate } from '@lib/stacks-api';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import velarApi from '@lib/velar-api';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip';
import InfoIcon from '@components/icons/icon-info';

type Rates = {
  'liquid-staked-charisma': number
  'liquid-staked-welsh-v2': number,
  'liquid-staked-leo': number,
  "prices": any
}

export const getServerSideProps = (async () => {
  try {
    // Fetch data from external API
    const [charismaRate, welshRate, leoRate, tickers] = await Promise.all([
      getStakedTokenExchangeRate('liquid-staked-charisma'),
      getStakedTokenExchangeRate('liquid-staked-welsh-v2'),
      getStakedTokenExchangeRate('liquid-staked-leo'),
      velarApi.tickers(),
    ]);

    const rates: Rates = {
      'liquid-staked-charisma': charismaRate.value / Math.pow(10, 6),
      'liquid-staked-welsh-v2': welshRate.value / Math.pow(10, 6),
      'liquid-staked-leo': leoRate.value / Math.pow(10, 6),
      "prices": tickers
    }

    // Pass data to the page via props
    return { props: { rates } }
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      props: {
        rates: {
          'liquid-staked-charisma': 0,
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
        <TokenBalances rates={rates} />
      </main>
    </SettingsLayout>
  );
}


function TokenBalances({ rates }: { rates: Rates }) {
  const { balances } = useWallet();

  const tokens = balances?.fungible_tokens as any;

  const {
    'liquid-staked-charisma': charismaRate,
    'liquid-staked-welsh-v2': welshRate,
    'liquid-staked-leo': leoRate,
    prices
  } = rates;

  if (!tokens) return <div>Sign in to view your balances...</div>;

  const chaBalance = tokens[`SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme000-governance-token::charisma`]?.balance
  const sChaBalance = tokens[`SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-charisma::liquid-staked-token`]?.balance
  const iCCBalance = tokens[`SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charismatic-corgi::index-token`]?.balance
  const iQCBalance = tokens[`SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.quiet-confidence::index-token`]?.balance
  const iOSBalance = tokens[`SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.outback-stakehouse::index-token`]?.balance
  const iGKBalance = tokens[`SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.good-karma::index-token`]?.balance
  const fffBalance = tokens[`SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.feather-fall-fund-v1::fff`]?.balance

  const welshBalance = tokens[`SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token::welshcorgicoin`]?.balance
  const sWelshBalance = tokens[`SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-welsh-v2::liquid-staked-token`]?.balance

  const totalCharismaTokens =
    (chaBalance / Math.pow(10, 6))
    + (sChaBalance * charismaRate / Math.pow(10, 6))
    + (iCCBalance * 1 * charismaRate / Math.pow(10, 6))
    + (iQCBalance * 10 * charismaRate / Math.pow(10, 6))
    + (iOSBalance * 1 * charismaRate / Math.pow(10, 6))
    + (iGKBalance * 1 * charismaRate / Math.pow(10, 6))
    + (fffBalance * 1 * charismaRate / Math.pow(10, 6))

  const totalWelshTokens =
    (welshBalance / Math.pow(10, 6)) +
    (sWelshBalance * welshRate / Math.pow(10, 6)) +
    (iCCBalance * 100 * welshRate / Math.pow(10, 6))


  const stxPrice = prices.find((ticker: any) => ticker.ticker_id === 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.wstx_SP3Y2ZSH8P7D50B0VBTSX11S7XSG24M1VB9YFQA4K.token-aeusdc').last_price
  const chaPrice = stxPrice / prices.find((ticker: any) => ticker.target_currency === 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme000-governance-token').last_price
  const welshPrice = stxPrice / prices.find((ticker: any) => ticker.target_currency === 'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token').last_price

  return (
    <Card>
      <CardHeader className='p-2 sm:p-4'>
        <CardTitle>Token Balances</CardTitle>
        <CardDescription>A detailed list of all liquid staked tokens held.</CardDescription>
      </CardHeader>
      <CardContent className='p-0'>
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
                <TableHead className="md:table-cell text-right">Total Amount</TableHead>
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
                    src={charismaLogo}
                    width="64"
                  />
                </TableCell>
                <TableCell className="font-medium">
                  <div className="text-lg">Charisma</div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-xl text-right">
                  {tokens &&
                    commafy(Math.floor(
                      tokens[
                        `SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme000-governance-token::charisma`
                      ]?.balance / Math.pow(10, 6)
                    ))}
                </TableCell>
                <TableCell className="md:table-cell text-xl text-right whitespace-nowrap">
                  <div className="leading-[0.8] text-sm text-primary-foreground/80 block sm:hidden">
                    ${commafy((chaPrice * totalCharismaTokens).toFixed(2))}
                  </div>
                  <div className="leading-[1] flex justify-end space-x-1 items-center">
                    {tokens && commafy(Math.floor(totalCharismaTokens))}</div>
                  {chaBalance > 0 &&
                    <div className="leading-[1] text-right text-green-200 flex items-end justify-end">
                      <div className="font-fine text-sm mb-0.5">
                        {tokens && commafy(Math.floor(chaBalance / Math.pow(10, 6)))} CHA
                      </div>
                    </div>
                  }
                  {sChaBalance > 0 &&
                    <div className="leading-[1] text-right text-green-200 flex items-end justify-end">
                      <div className="font-fine text-sm mr-1 mb-0.5">
                        {millify(sChaBalance / Math.pow(10, 6))}{' '}
                        sCHA
                      </div>
                      <div className="font-fine text-sm mb-0.5">
                        x{Number(charismaRate)}
                      </div>
                    </div>
                  }
                  {iQCBalance > 0 &&
                    <div className="leading-[1] text-right text-green-200 flex items-end justify-end">
                      <div className="font-fine text-sm mr-1 mb-0.5">
                        {millify(iQCBalance / Math.pow(10, 6))}{' '}
                        iQC
                      </div>
                      <div className="font-fine text-sm mb-0.5">
                        x10 x{Number(charismaRate)}
                      </div>
                    </div>
                  }
                  {iCCBalance > 0 &&
                    <div className="leading-[1] text-right text-green-200 flex items-end justify-end">
                      <div className="font-fine text-sm mr-1 mb-0.5">
                        {millify(iCCBalance / Math.pow(10, 6)
                        )}{' '}
                        iCC
                      </div>
                      <div className="font-fine text-sm mb-0.5">
                        x1 x{Number(charismaRate)}
                      </div>
                    </div>
                  }
                  {iOSBalance > 0 &&
                    <div className="leading-[1] text-right text-green-200 flex items-end justify-end">
                      <div className="font-fine text-sm mr-1 mb-0.5">
                        {millify(iOSBalance / Math.pow(10, 6)
                        )}{' '}
                        iOS
                      </div>
                      <div className="font-fine text-sm mb-0.5">
                        x1 x{Number(charismaRate)}
                      </div>
                    </div>
                  }
                  {iGKBalance > 0 &&
                    <div className="leading-[1] text-right text-green-200 flex items-end justify-end">
                      <div className="font-fine text-sm mr-1 mb-0.5">
                        {millify(iGKBalance / Math.pow(10, 6)
                        )}{' '}
                        iGK
                      </div>
                      <div className="font-fine text-sm mb-0.5">
                        x1 x{Number(charismaRate)}
                      </div>
                    </div>
                  }
                  {fffBalance > 0 &&
                    <div className="leading-[1] text-right text-green-200 flex items-end justify-end">
                      <div className="font-fine text-sm mr-1 mb-0.5">
                        {millify(fffBalance / Math.pow(10, 6))}{' '}
                        FFF
                      </div>
                      <div className="font-fine text-sm mb-0.5">
                        x1 x{Number(charismaRate)}
                      </div>
                    </div>
                  }
                </TableCell>
                <TableCell className="hidden md:table-cell text-xl text-right">
                  ${commafy((chaPrice * totalCharismaTokens).toFixed(2))}
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
                    src={welshLogo}
                    width="64"
                  />
                </TableCell>
                <TableCell className="font-medium">
                  <div className="text-lg">Welshcorgicoin</div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-xl text-right">
                  {tokens &&
                    Math.floor(welshBalance / Math.pow(10, 6))}
                </TableCell>
                <TableCell className="md:table-cell text-xl text-right whitespace-nowrap">
                  <div className="leading-[0.8] text-sm text-primary-foreground/80 block sm:hidden">
                    ${commafy((welshPrice * totalWelshTokens).toFixed(2))}
                  </div>
                  <div className="leading-[1]">
                    {tokens && commafy(Math.floor(totalWelshTokens))}
                  </div>
                  {welshBalance > 0 &&
                    <div className="leading-[1] text-right text-green-200 flex items-end justify-end">
                      <div className="font-fine text-sm mb-0.5">
                        {tokens &&
                          Math.floor(welshBalance / Math.pow(10, 6))} WELSH
                      </div>
                    </div>
                  }
                  {sWelshBalance > 0 &&
                    <div className="leading-[1] text-right text-green-200 flex items-end justify-end">
                      <div className="font-fine text-sm mr-1 mb-0.5">
                        {millify(sWelshBalance / Math.pow(10, 6))}{' '}
                        sWELSH
                      </div>
                      <div className="font-fine text-sm mb-0.5">
                        x{Number(welshRate)}
                      </div>
                    </div>
                  }
                  {iCCBalance > 0 &&
                    <div className="leading-[1] text-right text-green-200 flex items-end justify-end">
                      <div className="font-fine text-sm mr-1 mb-0.5">
                        {millify(iCCBalance / Math.pow(10, 6))}{' '}
                        iCC
                      </div>
                      <div className="font-fine text-sm mb-0.5">
                        x100 x{Number(welshRate)}
                      </div>
                    </div>
                  }
                </TableCell>
                <TableCell className="hidden md:table-cell text-xl text-right">
                  ${commafy((welshPrice * totalWelshTokens).toFixed(2))}
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
        )
        }
      </CardContent >
      <CardFooter className='p-2 sm:p-4'>
        <div className="text-xs text-muted-foreground">
          Showing <strong>1-2</strong> of <strong>{Object.keys(tokens).length}</strong> tokens
        </div>
      </CardFooter>
    </Card >
  );
}



const StakedTokenBreakdown = ({ children }: any) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className="relative w-4 h-4">
            <InfoIcon className="w-4 h-4" />
          </div>
        </TooltipTrigger>
        <TooltipContent
          className={`overflow-scroll bg-black text-white border-primary leading-tight shadow-2xl max-w-prose`}
        >
          {children}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};