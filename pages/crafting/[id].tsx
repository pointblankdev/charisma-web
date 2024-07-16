import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import Layout from '@components/layout';
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
import { Button } from '@components/ui/button';
import {
  blocksApi,
  getBlockCounter,
  getBlocksUntilUnlocked,
  getDecimals,
  getIsUnlocked,
  getSymbol,
  getTokenURI,
  getTotalSupply
} from '@lib/stacks-api';
import { GetServerSideProps } from 'next';
import { useEffect, useState } from 'react';
import { cn } from '@lib/utils';
import Link from 'next/link';
import { motion } from 'framer-motion';
import millify from 'millify';
import { Link1Icon } from '@radix-ui/react-icons';
import useWallet from '@lib/hooks/use-wallet-balances';
import LiquidityControls from '@components/liquidity/controls';
import velarApi from '@lib/velar-api';
import { uniqBy } from 'lodash';
import { useConnect } from '@stacks/connect-react';
import { AnchorMode, callReadOnlyFunction, cvToJSON, Pc, PostConditionMode, principalCV, uintCV } from '@stacks/transactions';
import { StacksMainnet } from "@stacks/network";
import { userSession } from '@components/stacks-session/connect';
import numeral from 'numeral';
import VerdantOrchardCard from '@components/stations/verdant-orchard';
import BountifulOrchardCard from '@components/stations/bountiful-orchard';
import AddLiquidityToIndex from '@components/craft/add-liquidity';
import TranquilOrchardCard from '@components/stations/tranquil-orchard';
import IronForgeCard from '@components/stations/iron-forge';

export default function IndexDetailPage({ data }: Props) {
  const meta = {
    title: `Charisma | ${data.metadata?.name}`,
    description: META_DESCRIPTION,
    image: data.metadata?.background
  };

  const [descriptionVisible, setDescriptionVisible] = useState(false);
  const [tokensSelected, setTokensSelected] = useState(0);

  useEffect(() => {
    setDescriptionVisible(true);
  }, []);

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const { balances, getKeyByContractAddress, getBalanceByKey } = useWallet();


  if (!data.metadata || !balances) return <div>Loading...</div>;

  const token = getKeyByContractAddress(data.address);
  const indexWeight = data.indexWeight;
  const indexBalance = getBalanceByKey(token)?.balance || 0;

  const baseTokens = data.metadata?.contains.map((token: any) => {
    const baseToken = getKeyByContractAddress(token.address);
    const baseTokenBalance = getBalanceByKey(baseToken)?.balance || 0;
    return {
      token: baseToken,
      balance: Number(baseTokenBalance),
      weight: Number(token.weight),
      decimals: token.decimals
    };
  });

  // Calculate the maximum possible index tokens for each base token
  let maxPossibleIndex = Infinity;
  baseTokens.forEach((token: { balance: number; weight: number; decimals: number }) => {
    // Calculate how many index tokens can be created from this base token
    const possibleIndex = token.balance / (token.weight / indexWeight);
    if (possibleIndex < maxPossibleIndex) {
      maxPossibleIndex = possibleIndex;
    }
  });

  const tokensRequested = tokensSelected / Math.pow(10, data.decimals);
  const tokensRequired = data.metadata?.contains.map(
    (token: any) => tokensRequested * token.weight * Math.pow(10, 6 - token.decimals)
  );

  // hack: short term workaround for quest specific stuff
  const isApples = data.symbol === 'FUJI'
  const isIron = data.symbol === 'IRON'

  // variable to hide the liquidity controls if they have no index tokens or base tokens
  const absValMin = Math.abs(-indexBalance / indexWeight)

  const fixedAmount = data.tokenPrice < 0.000001 ? 8 : data.tokenPrice < 1 ? 6 : 4

  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="m-2 sm:container sm:mx-auto sm:py-10 md:max-w-2xl lg:max-w-3xl space-y-4"
        >
          <Card className="bg-black text-primary-foreground border-accent-foreground p-0 relative overflow-hidden rounded-md group/card w-full max-w-3xl opacity-[0.99] shadow-black shadow-2xl">
            <CardHeader className="z-20 p-4">
              <div className="flex items-center justify-between">
                <CardTitle className="z-30 text-lg sm:text-xl font-semibold">
                  {data.symbol}
                </CardTitle>
                <div className="flex space-x-4 items-center">
                  <div className="z-30 bg-background border border-primary/40 rounded-full px-2 whitespace-nowrap">
                    ${Number(data.tokenPrice).toFixed(fixedAmount)} / {data.symbol}
                  </div>
                  <div className="text-lg whitespace-nowrap">${millify(data.tvl)} TVL</div>
                  <ActiveRecipeIndicator
                    active={data.isRemoveLiquidityUnlocked}
                    blocksUntilUnlock={data.blocksUntilUnlock}
                  />
                </div>
              </div>
              <CardDescription className="z-30 text-sm sm:text-md font-fine text-foreground">
                {data.metadata.description}
              </CardDescription>
              <div className="z-20">
                <CardTitle className="z-30 mt-2 text-xl font-semibold">Mintable Token</CardTitle>
                {descriptionVisible && (
                  <Link href={`https://explorer.hiro.so/txid/${data.address}`}>
                    <CardDescription className="z-30 mb-4 text-sm font-fine text-foreground flex items-end space-x-1">
                      <div>{data.metadata.name}</div> <Link1Icon className="mb-0.5" />
                    </CardDescription>
                  </Link>
                )}
                <div className="grid grid-cols-4 gap-4 lg:grid-cols-6">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="relative">
                          <Image
                            alt={data.metadata.name}
                            src={data.metadata.image}
                            width={100}
                            height={100}
                            className="z-30 w-full border rounded-full"
                          />
                          <div className="absolute px-1 font-bold rounded-full -top-1 -right-3 text-md md:text-base lg:text-sm bg-accent text-accent-foreground">
                            {numeral(Math.abs(tokensRequested * indexWeight)).format('(0.00a)')}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent
                        side="bottom"
                        className={`text-md max-h-[80vh] overflow-scroll bg-black text-white border-primary leading-tight shadow-2xl max-w-prose`}
                      >
                        {numeral(Math.abs(tokensRequested * indexWeight)).format('(0,0.000000)')} {data.metadata.symbol}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </CardHeader>
            <CardContent className="z-20 p-0">
              <div className="z-30 p-4">
                <div className="z-20 min-h-[136px]">
                  <div className="z-30 text-xl font-semibold">Base Tokens</div>
                  <CardDescription className="z-30 mb-4 text-sm font-fine text-foreground">
                    These tokens will be staked to mint {data.symbol} index tokens
                  </CardDescription>
                  <div className="z-20 grid grid-cols-4 gap-4 lg:grid-cols-6">
                    {data.baseTokens.map((token: any, k: any) => (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="z-20 relative">
                              <Image
                                alt={token.name}
                                src={token.image}
                                width={100}
                                height={100}
                                className="z-30 w-full border rounded-full"
                              />
                              <div className="absolute px-1 font-bold rounded-full -top-1 -right-3 text-md md:text-base lg:text-sm bg-accent text-accent-foreground">
                                {numeral(Math.abs(tokensRequired[k])).format('(0.00a)')}
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent
                            side="bottom"
                            className={`text-md max-h-[80vh] overflow-scroll bg-black text-white border-primary leading-tight shadow-2xl max-w-prose`}
                          >
                            {numeral(Math.abs(tokensRequired[k])).format(`(0,0.${'0'.repeat(token.decimals)})`)}{' '}
                            {data.metadata.contains[k].symbol}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="z-20 flex justify-between pb-4 px-4 items-end">
              <Link href="/tokens">
                <Button variant="ghost" className="z-30">
                  Back
                </Button>
              </Link>
              <div className='flex flex-col justify-end space-y-1'>
                {descriptionVisible && (absValMin !== maxPossibleIndex) && (
                  <LiquidityControls
                    min={-indexBalance / indexWeight}
                    max={maxPossibleIndex}
                    onSetTokensSelected={setTokensSelected}
                    tokensSelected={tokensSelected}
                    indexWeight={indexWeight}
                    tokensRequested={tokensRequested * indexWeight}
                    tokensRequired={tokensRequired}
                    data={data}
                  />
                )}
              </div>
            </CardFooter>
            <Image
              src={data.metadata.background}
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

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {isApples &&
              <VerdantOrchardCard data={data} />
            }
            {isApples &&
              <TranquilOrchardCard data={data} />
            }
            {isIron &&
              <IronForgeCard data={data} />
            }
          </div>
        </motion.div>
      </Layout>
    </Page>
  );
}

type Props = {
  data: any;
};

export const getServerSideProps: GetServerSideProps<Props> = async ({ params }: any) => {
  try {
    const contractName = params?.id.split('.')[1];

    // get token metadata from Stacks API + metadata URL
    const metadata = await getTokenURI(params?.id as string);
    const supply = await getTotalSupply(params?.id as string);
    const symbol = await getSymbol(params?.id as string);
    const decimals = await getDecimals(params?.id as string);
    const indexTokenWeight = metadata.weight || 1;

    // get price data from Velar API
    const prices = await velarApi.tokens();

    // TVL calculation
    let tvl = 0;
    const tokenAddressList = metadata?.contains.map((token: any) => token.address);
    const totalSupply: number = Number(supply) / Math.pow(10, decimals);
    const baseTokensPriceData = prices.filter((token: any) => {
      return tokenAddressList.includes(token.contractAddress);
    });

    // assign decimals to each base token
    metadata.contains.forEach((token: any) => {
      const baseToken = prices.find((baseToken: any) => baseToken.contractAddress === token.address);
      if (baseToken) {
        token.decimals = Number(baseToken.decimal.slice(1));
      }
    })

    // loop for each matching token to get the TVL of base tokens
    const tokenInPriceList = prices.find((token: any) => token.contractAddress === params?.id);
    if (tokenInPriceList && tokenInPriceList.price > 0 && tokenInPriceList.symbol !== 'iQC') {
      tvl = totalSupply * Number(tokenInPriceList.price);
    } else {

      const tokenTVL = baseTokensPriceData.map((baseToken: any) => {
        const tokenIndex = tokenAddressList.indexOf(baseToken.contractAddress);
        const token = metadata.contains[tokenIndex]
        const tokenWeight = Number(token.weight);
        const tokenPrice = Number(baseToken.price);
        const upscale = Math.pow(10, 6 - token.decimals)
        return totalSupply * tokenWeight * tokenPrice * upscale / indexTokenWeight;
      });
      tvl = tokenTVL.reduce((a: number, b: number) => a + b, 0);
    }


    // blocks until unlocked calculation
    let blockCounter = 0;
    let blocksUntilUnlock = 0;
    let isRemoveLiquidityUnlocked = true;
    if (contractName === 'quiet-confidence') {
      blockCounter = await getBlockCounter(params?.id as string);
      const { results } = await blocksApi.getBlockList({ limit: 1 });
      blocksUntilUnlock = 155550 + blockCounter - results[0].height;
      isRemoveLiquidityUnlocked = await getIsUnlocked(params?.id as string);
    } else if (
      // these contracts were made before the block counter was implemented
      contractName === 'outback-stakehouse' ||
      contractName === 'good-karma' ||
      contractName === 'charismatic-corgi' ||
      contractName === 'feather-fall-fund-v1'
    ) {
      blocksUntilUnlock = 0;
      isRemoveLiquidityUnlocked = true;
    } else {
      blocksUntilUnlock = await getBlocksUntilUnlocked(params?.id as string);
      isRemoveLiquidityUnlocked = await getIsUnlocked(params?.id as string);
    }

    // get base token metadata from token-metadata-uri
    const baseTokens = await Promise.all(
      metadata.contains.map(async (token: any) => {
        const tokenMetadata = await getTokenURI(token.address);
        return { ...tokenMetadata };
      })
    );

    // if data.metadata.contains has multiple matching items, create a map to track them and sum of their weights of duplicates
    const uniqueTokens = metadata.contains.reduce((acc: any, token: any) => {
      if (acc[token.address]) {
        acc[token.address].weight = Number(acc[token.address].weight) + Number(token.weight);
      } else {
        acc[token.address] = token;
      }
      return acc;
    }, {});

    // remove duplicates from metadata.contains
    metadata.contains = Object.values(uniqueTokens);

    // calculate token price
    let tokenPrice = 0;
    const tokenOnVelar = prices.find((token: any) => token.contractAddress === params?.id);
    if (tokenOnVelar && tokenOnVelar.price > 0 && tokenOnVelar.symbol !== 'iQC') {
      tokenPrice = Number(tokenOnVelar.price);
    } else {
      metadata.contains.forEach((token: any) => {
        const baseToken = prices.find((baseToken: any) => baseToken.contractAddress === token.address);
        if (baseToken) {
          const upscale = Math.pow(10, 6 - token.decimals)
          tokenPrice += Number(baseToken.price) * upscale * token.weight / indexTokenWeight;
        }
      });
    }

    const data = {
      address: params?.id,
      metadata: metadata,
      totalSupply: totalSupply,
      symbol: symbol,
      indexWeight: metadata.weight || 1,
      baseTokens: uniqBy(baseTokens, 'name'),
      decimals: decimals,
      isRemoveLiquidityUnlocked,
      blocksUntilUnlock,
      prices: prices,
      tvl: tvl,
      tokenPrice
    };

    return {
      props: { data }
    };
  } catch (error) {
    console.log(error);
    return {
      props: {
        data: {}
      }
    };
  }
};

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
            ? 'Index token is unlocked'
            : `Base token asset withdraws are locked for ${blocksUntilUnlock} more block${blocksUntilUnlock !== 1 ? 's' : ''
            }`}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

