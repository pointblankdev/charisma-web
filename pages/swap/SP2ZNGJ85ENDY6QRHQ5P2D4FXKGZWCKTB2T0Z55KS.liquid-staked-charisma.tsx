import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import Image from 'next/image';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@components/ui/card';
import {
  getStakedTokenExchangeRate,
  getTotalInPool
} from '@lib/stacks-api';
import { GetServerSideProps } from 'next';
import { useEffect, useState } from 'react';
import { cn } from '@lib/utils';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Link1Icon } from '@radix-ui/react-icons';
import velarApi from '@lib/velar-api';
import numeral from 'numeral';
import { PiArrowFatLineDownFill, PiArrowFatLineUpFill } from "react-icons/pi";
import Layout from '@components/layout/layout';
import StakingControls from '@components/liquidity/staking';
import useWallet from '@lib/hooks/wallet-balance-provider';


export const getServerSideProps: GetServerSideProps<Props> = async ({ params }: any) => {

  const exchangeRate = await getStakedTokenExchangeRate('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-charisma')

  const tokensInPool = await getTotalInPool('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-charisma')

  // if rebase token has a price on velar, calculate TVL with that
  // if not, check base token price on velar, and calculate TVL with that
  // otherwise, set TVL to 0
  const [rebaseToken] = await velarApi.tokens('sCHA')
  const tvl = tokensInPool * Number(rebaseToken.price) / Math.pow(10, 6)


  const data = {
    // address: params?.id,
    contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
    contractName: 'liquid-staked-charisma',
    cardImage: '/liquid-charisma-21.png',
    description: 'The rebase token of Charisma',
    image: '/liquid-staked-charisma.png',
    name: 'Liquid Staked Charisma',
    symbol: 'sCHA',
    baseTokenImage: '/charisma.png',
    isRemoveLiquidityUnlocked: true,
    blocksUntilUnlock: 0,
    tokenPrice: rebaseToken.price,
    exchangeRate: exchangeRate / Math.pow(10, 6),
    tvl: tvl
  };

  return {
    props: {
      data
    }
  };

};
type Props = {
  data: any;
};

export default function LiquidStakedCharismaPage({ data }: Props) {
  const meta = {
    title: `Charisma | Liquid Staked Charisma`,
    description: META_DESCRIPTION,
    image: data.metadata?.background
  };

  const [descriptionVisible, setDescriptionVisible] = useState(false);
  const [tokensSelected, setTokensSelected] = useState(0);

  const tokensRequested = Number((tokensSelected / data.exchangeRate).toFixed(0));

  useEffect(() => {
    setDescriptionVisible(true);
  }, []);

  const { getBalanceByKey, wallet } = useWallet();
  const rebaseTokenBalance = getBalanceByKey(`${data.contractAddress}.${data.contractName}::liquid-staked-token`)
  const baseTokenBalance = wallet.charisma.amount

  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
          className="m-2 sm:container sm:mx-auto sm:py-10 md:max-w-2xl lg:max-w-3xl space-y-4"
        >
          <Card className="bg-black text-primary-foreground border-accent-foreground p-0 relative overflow-hidden rounded-md group/card w-full max-w-3xl opacity-[0.99] shadow-black shadow-2xl">
            <CardHeader className="z-20 p-4">
              <div className="flex items-center justify-between">
                <CardTitle className="z-30 text-lg sm:text-xl font-semibold">
                  {data.name}
                </CardTitle>
                <div className="flex space-x-4 items-center">
                  <div className="z-30 bg-background border border-primary/40 rounded-full px-2 whitespace-nowrap">
                    ${Number(data.tokenPrice).toFixed(2)} / {data.symbol}
                  </div>
                  <div className="text-lg whitespace-nowrap">${numeral(data.tvl).format('0a')} TVL</div>
                  <ActiveRecipeIndicator
                    active={data.isRemoveLiquidityUnlocked}
                    blocksUntilUnlock={data.blocksUntilUnlock}
                  />
                </div>
              </div>
              <CardDescription className="z-30 text-sm sm:text-md font-fine text-foreground">
                {data.description}
              </CardDescription>
              <div className="z-20">
                <CardTitle className="z-30 mt-2 text-xl font-semibold">Mintable Token</CardTitle>
                {descriptionVisible && (
                  <Link href={`https://explorer.hiro.so/txid/${data.address}`}>
                    <CardDescription className="z-30 mb-4 text-sm font-fine text-foreground flex items-end space-x-1">
                      <div>{data.name}</div> <Link1Icon className="mb-0.5" />
                    </CardDescription>
                  </Link>
                )}
                <div className="grid grid-cols-4 gap-4 lg:grid-cols-6">

                  <div className="relative">
                    <Image
                      alt={data.name}
                      src={data.image}
                      width={100}
                      height={100}
                      className="z-30 w-full border rounded-full"
                    />
                    {Math.abs(tokensRequested) > 0 &&
                      <div className="absolute px-1 font-bold rounded-full -top-1 -right-3 text-md md:text-base lg:text-sm bg-accent text-accent-foreground">
                        {numeral(Math.abs(tokensRequested / Math.pow(10, 6))).format('0a')}
                        {tokensRequested > 0 ? <PiArrowFatLineUpFill className="absolute top-0 -right-7 text-xl text-green-500 animate-bounce" /> : <PiArrowFatLineDownFill className="absolute top-0 -right-7 text-xl text-red-500 animate-pulse" />}
                      </div>
                    }
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="z-20 p-0">
              <div className="z-30 p-4">
                <div className="z-20 min-h-[136px]">
                  <div className="z-30 text-xl font-semibold">Base Tokens</div>
                  <CardDescription className="z-30 mb-4 text-sm font-fine text-foreground">
                    These tokens will be staked to mint {data.symbol} tokens
                  </CardDescription>
                  <div className="z-20 grid grid-cols-4 gap-4 lg:grid-cols-6 h-48">
                    <div className={`z-30 relative`}>
                      <Image
                        alt={data.baseTokenName}
                        src={data.baseTokenImage}
                        width={100}
                        height={100}
                        className="z-20 w-full border rounded-full absolute"
                      />
                      {Math.abs(tokensSelected) > 0 && <div className="z-40 absolute px-1 font-bold rounded-full -top-1 -right-3 text-md md:text-base lg:text-sm bg-accent text-accent-foreground">
                        {numeral(Math.abs(tokensSelected / Math.pow(10, 6))).format('0a')}
                        {tokensSelected / Math.pow(10, 6) < 0 ? <PiArrowFatLineUpFill className="absolute top-0 -right-7 text-xl text-green-500 animate-bounce" /> : <PiArrowFatLineDownFill className="absolute top-0 -right-7 text-xl text-red-500 animate-pulse" />}
                      </div>}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="z-20 flex justify-between pb-4 px-4 items-end">
              <div className='w-full'>
                <StakingControls
                  min={-rebaseTokenBalance}
                  max={baseTokenBalance}
                  onSetTokensSelected={setTokensSelected}
                  tokensSelected={tokensSelected}
                  contractAddress={'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS'}
                  contractName={'liquid-staked-charisma'}
                  fungibleTokenName={'liquid-staked-token'}
                  decimals={6}
                  symbol={'CHA'}
                  baseTokenContractAddress={'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ'}
                  baseTokenContractName={'dme000-governance-token'}
                  baseFungibleTokenName={'charisma'}
                  exchangeRate={data.exchangeRate}
                />
              </div>
            </CardFooter>
            <Image
              src={data.cardImage}
              width={800}
              height={1600}
              alt={'quest-background-image'}
              className={cn(
                'object-cover',
                'lg:aspect-square',
                'sm:aspect-[2/3]',
                'aspect-[1/2]',
                'opacity-10',
                'flex',
                'z-10',
                'absolute',
                'inset-0',
                'pointer-events-none'
              )}
            />
            <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-white to-black opacity-10" />
          </Card>
        </motion.div>
      </Layout>
    </Page >
  );
}

const ActiveRecipeIndicator = ({
  active,
  blocksUntilUnlock
}: {
  active: boolean;
  blocksUntilUnlock: number;
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className="relative w-4 h-4">
            <div
              className={`absolute top-0 left-0 w-4 h-4 rounded-full ${active ? 'bg-green-500 animate-ping' : 'bg-yellow-500'
                }`}
            />
            <div
              className={`absolute top-0 left-0 w-4 h-4 rounded-full ${active ? 'bg-green-500' : 'bg-yellow-500 animate-ping'
                }`}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent
          className={`overflow-scroll bg-black text-white border-primary leading-tight shadow-2xl max-w-prose`}
        >
          {active
            ? 'Token liquidity is unlocked'
            : `Asset withdraws and deposits are locked for ${blocksUntilUnlock} more block${blocksUntilUnlock !== 1 ? 's' : ''
            }`}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

