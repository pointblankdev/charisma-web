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

// Import images
import fujiApplesLogo from '@public/stations/fuji-apples.png';
import charismaLogo from '@public/charisma.png';
import wrappedCharismaLogo from '@public/indexes/wrapped-charisma-logo.png';
import liquidStakedCharismaLogo from '@public/liquid-staked-charisma.png';
import quietConfidenceLogo from '@public/indexes/quiet-confidence-logo.png';
import charismaticCorgiLogo from '@public/indexes/charismatic-corgi-logo.png';
import welshLogo from '@public/welsh-logo.png';
import liquidWelshLogo from '@public/liquid-staked-welshcorgicoin.png';
import rooLogo from '@public/roo-logo.png';
import liquidRooLogo from '@public/liquid-staked-roo.png';
import odinLogo from '@public/odin-logo.png';
import liquidOdinLogo from '@public/liquid-staked-odin.png';
import { GetServerSideProps } from 'next';
import millify from 'millify';
import { isEmpty } from 'lodash';
import numeral from 'numeral';
import useWallet from '@lib/hooks/wallet-balance-provider';

const tokenList = [
  {
    address: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.fuji-apples',
    ft: 'index-token',
    name: 'Fuji Apples',
    symbol: 'FUJI',
    decimals: 6,
    image: fujiApplesLogo,
    proxy: {
      address: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wrapped-charisma',
      factor: 0.000001
    }
  },
  {
    address: 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme000-governance-token',
    ft: 'charisma',
    name: 'Charisma',
    symbol: 'CHA',
    decimals: 6,
    image: charismaLogo,
    proxy: {
      address: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wrapped-charisma',
      factor: 1
    }
  },
  {
    address: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wrapped-charisma',
    ft: 'index-token',
    name: 'Wrapped Charisma',
    symbol: 'wCHA',
    decimals: 6,
    image: wrappedCharismaLogo
  },
  {
    address: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-charisma',
    ft: 'liquid-staked-token',
    name: 'Liquid Staked Charisma',
    symbol: 'sCHA',
    decimals: 6,
    image: liquidStakedCharismaLogo
  },
  {
    address: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.quiet-confidence',
    ft: 'index-token',
    name: 'Quiet Confience',
    symbol: 'iQC',
    decimals: 6,
    image: quietConfidenceLogo,
    proxy: {
      address: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-charisma',
      factor: 10
    }
  },
  {
    address: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charismatic-corgi',
    ft: 'index-token',
    name: 'Charismatic Corgi',
    symbol: 'iCC',
    decimals: 6,
    image: charismaticCorgiLogo
  },
  {
    address: 'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token',
    ft: 'welshcorgicoin',
    name: 'Welshcorgicoin',
    symbol: 'WELSH',
    decimals: 6,
    image: welshLogo
  },
  {
    address: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-welsh-v2',
    ft: 'liquid-staked-token',
    name: 'Liquid Staked Welsh',
    symbol: 'sWELSH',
    decimals: 6,
    image: liquidWelshLogo
  },
  {
    address: 'SP2C1WREHGM75C7TGFAEJPFKTFTEGZKF6DFT6E2GE.kangaroo',
    ft: 'kangaroo',
    name: 'Kangaroo',
    symbol: 'ROO',
    decimals: 6,
    image: rooLogo
  },
  {
    address: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-roo-v2',
    ft: 'liquid-staked-token',
    name: 'Liquid Staked Roo',
    symbol: 'sROO',
    decimals: 6,
    image: liquidRooLogo
  },
  {
    address: 'SP2X2Z28NXZVJFCJPBR9Q3NBVYBK3GPX8PXA3R83C.odin-tkn',
    ft: 'odin',
    name: 'Odin',
    symbol: 'ODIN',
    decimals: 6,
    image: odinLogo
  },
  {
    address: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-odin',
    ft: 'liquid-staked-odin',
    name: 'Liquid Staked Odin',
    symbol: 'sODIN',
    decimals: 6,
    image: liquidOdinLogo
  }
  // 'SP2F4QC563WN0A0949WPH5W1YXVC4M1R46QKE0G14.memegoatstx',
  // 'SP1JFFSYTSH7VBM54K29ZFS9H4SVB67EA8VT2MYJ9.gus-token',
  // 'SP28NB976TJHHGF4218KT194NPWP9N1X3WY516Z1P.Hashiko',
  // 'SP1AY6K3PQV5MRT6R4S671NWW2FRVPKM0BR162CT6.leo-token',
  // 'SP265WBWD4NH7TVPYQTVD23X3607NNK4484DTXQZ3.longcoin',
  // 'SP7V1SE7EA3ZG3QTWSBA2AAG8SRHEYJ06EBBD1J2.max-token',
  // 'SP32AEEF6WW5Y0NMJ1S8SBSZDAY8R5J32NBZFPKKZ.nope',
  // 'SP1Z92MPDQEWZXW36VX71Q25HKF5K2EPCJ304F275.tokensoft-token-v4k68639zxz',
  // 'SP1PW804599BZ46B4A0FYH86ED26XPJA7SFYNK1XS.play',
  // 'SP1N4EXSR8DP5GRN2XCWZEW9PR32JHNRYW7MVPNTA.PomerenianBoo-Pomboo',
  // 'SP3WPNAEBYMX06RQNNYTH5PTJ1FRGX5A13ZZMZ01D.dogwifhat-token'
  // 'SP1Z92MPDQEWZXW36VX71Q25HKF5K2EPCJ304F275.tokensoft-token-v4kjvtr37ht',
];

// Define the type 'Props' here
type Props = {
  data: any;
};

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  try {
    // Fetch data from external API
    const tokens = await velarApi.tokens();
    return {
      props: {
        data: {
          tokens
        }
      }
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      props: {
        data: {
          tokens: []
        }
      }
    };
  }
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
  const tokens = data.tokens;
  const { balances, getBalanceByKey } = useWallet();

  if (isEmpty(balances)) return <div>Loading...</div>;

  const tokenBalances = tokenList.map(token => {
    const address = token.proxy ? token.proxy.address : token.address;
    const factor = token.proxy ? token.proxy.factor : 1;
    const balance = getBalanceByKey(`${token.address}::${token.ft}`)
    const tokenData = tokens.find((t: any) => t.contractAddress === address);
    const amount = balance / (Math.pow(10, token.decimals) || 1);
    const totalValueUSD = amount * Number(tokenData.price || 0) * factor;

    return {
      ...token,
      amount: numeral(amount).format('0.00 a'),
      totalValueUSD: numeral(totalValueUSD).format('$0,0.00')
    };
  });

  return (
    <Card>
      <CardHeader className="p-2 sm:p-4">
        <CardTitle>Token Balances</CardTitle>
        <CardDescription>A detailed list of all liquid staked tokens held.</CardDescription>
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
            {tokenBalances.map((token: any) => (
              <TableRow key={token.address}>
                <TableCell className="sm:table-cell">
                  <Image
                    alt="Product image"
                    className="aspect-square rounded-full overflow-hidden object-cover border"
                    height="64"
                    src={token.image}
                    width="64"
                  />
                </TableCell>
                <TableCell className="font-medium">
                  <div className="text-lg">{token.name}</div>
                </TableCell>
                <TableCell className="md:table-cell text-xl text-right">
                  {token.amount}
                </TableCell>
                <TableCell className="md:table-cell text-xl text-right">
                  {token.totalValueUSD}
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
