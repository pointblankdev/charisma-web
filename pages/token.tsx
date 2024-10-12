import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import { Card } from '@components/ui/card';
import { ChangeEvent, use, useEffect, useState } from 'react';
import { callReadOnlyFunction, Pc, PostConditionMode, principalCV, uintCV } from "@stacks/transactions";
import { Button } from "@components/ui/button";
import { Input } from '@components/ui/input';
import Layout from '@components/layout/layout';
import redPill from '@public/sip9/pills/red-pill-floating.gif';
import bluePill from '@public/sip9/pills/blue-pill.gif';
import charismaFloating from '@public/sip9/pills/cha-floating.gif';
import bluePillFloating from '@public/sip9/pills/blue-pill-floating.gif';
import Image from 'next/image';
import charismaSquare from '@public/charisma-logo-square.png';
import dmgLogo from '@public/dmg-logo.png';
import stxLogo from '@public/stx-logo.png';
import dmgLogoPulse from '@public/dmg-logo.gif';
import useWallet from '@lib/hooks/wallet-balance-provider';
import numeral from 'numeral';
import { usePersistedState } from '@lib/hooks/use-persisted-state';
import { useGlobalState } from '@lib/hooks/global-state-context';
import { CharismaToken } from '@lib/cha-token-api';
import { GetStaticProps } from 'next';
import velarApi from '@lib/velar-api';
import PricesService from '@lib/prices-service';
import { getTxsFromMempool } from '@lib/stacks-api';
import _, { set } from 'lodash';
import { useConnect } from '@stacks/connect-react';
import { network } from '@components/stacks-session/connect';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip';
import InfoIcon from '@components/icons/icon-info';

type Transaction = {
  anchor_mode: "any";
  contract_call: any;
  fee_rate: string;
  nonce: number;
  post_condition_mode: "deny";
  post_conditions: any[];
  receipt_time: number;
  receipt_time_iso: string;
  sender_address: string;
  sponsored: boolean;
  tx_id: string;
  tx_status: "pending" | "success" | "failed"; // Add other possible statuses if needed
  tx_type: "contract_call";
};

async function getPoolReserves(poolId: number, token0Address: string, token1Address: string): Promise<{ token0: number; token1: number }> {
  try {
    const result: any = await callReadOnlyFunction({
      contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
      contractName: "univ2-core",
      functionName: "lookup-pool",
      functionArgs: [
        principalCV(token0Address),
        principalCV(token1Address)
      ],
      senderAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
    });

    if (result.value) {
      const poolInfo = result.value.data.pool;
      const reserve0 = Number(poolInfo.data.reserve0.value);
      const reserve1 = Number(poolInfo.data.reserve1.value);
      return { token0: reserve0, token1: reserve1 };
    } else {
      console.error("Pool not found");
      return { token0: 0, token1: 0 };
    }
  } catch (error) {
    console.error("Error fetching reserves:", error);
    return { token0: 0, token1: 0 };
  }
}

async function getTokenPrices(): Promise<{ [key: string]: number }> {
  const prices = await velarApi.tokens('all');
  return prices.reduce((acc: { [key: string]: number }, token: any) => {
    acc[token.symbol] = token.price;
    return acc;
  }, {});
}

async function calculateChaPrice(stxPrice: number): Promise<number> {
  const stxChaReserves = await getPoolReserves(
    4,
    "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wstx",
    "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token"
  );

  // Calculate CHA price based on STX-CHA pool reserves
  const chaPrice = (stxPrice * stxChaReserves.token0) / stxChaReserves.token1;
  return chaPrice;
}

const isWithinLastHour = (timestamp: string) => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  return new Date(timestamp) > oneHourAgo;
};

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
}

type Props = {
  data: {
    tokenPrices: { [key: string]: number };
    chaPrice: number;
    transactions: Transaction[];
  };
};

export const getStaticProps: GetStaticProps<Props> = async () => {
  const tokenPrices = await getTokenPrices();
  const chaPrice = await calculateChaPrice(tokenPrices['STX']);
  const transactions = await getTxsFromMempool('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token');
  return {
    props: {
      data: {
        tokenPrices,
        chaPrice,
        transactions
      }
    },
    revalidate: 60
  };
};

export default function TokenPage({ data }: Props) {
  const meta = {
    title: 'Charisma | Token',
    description: "The New Charisma Token",
  };

  const { setWrapTransactions, wrapTransactions } = useGlobalState()
  const { wallet } = useWallet();

  useEffect(() => {
    setWrapTransactions(data.transactions)
  }, [data.transactions, setWrapTransactions])

  const hasEnoughExperience = wallet.experience.balance >= 100;
  const recentTransactions = wrapTransactions.filter(tx => isWithinLastHour(tx.receipt_time_iso));

  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <div className="m-2 rounded-full sm:container sm:mx-auto sm:py-10 md:max-w-5xl">
          <HeroSection />
          <StatsSection data={data} />
          <WrappingSection data={data} />
          {hasEnoughExperience && (
            <div title={`This feature is unlocked for users with over 100 experience points.`}>
              <div className='w-full pt-8 text-3xl font-bold text-center uppercase'>The Mempool</div>
              <div className='w-full pb-8 text-center text-md text-muted/90'>
                Recent transactions in the mempool.
                <p className='mt-2 text-sm text-yellow-500'>
                  ✨ Experience Bonus Feature
                </p>
              </div>
              <Card className='p-0 overflow-hidden bg-black text-primary-foreground border-accent-foreground rounded-xl'>
                <div className='m-2 space-y-2'>
                  {_.uniqBy(recentTransactions, tx => tx.sender_address)
                    .map((tx: Transaction) => {
                      return (
                        <div key={tx.tx_id} className='p-4 bg-[var(--sidebar)] border border-[var(--accents-7)] rounded-lg'>
                          <div className='flex justify-between'>
                            <div>Transaction ID: {tx.tx_id}</div>
                            <div>Fee Rate: {Number(tx.fee_rate) / 10 ** 6} STX</div>
                          </div>
                          <div className='mt-2'>Sender Address: {tx.sender_address}</div>
                          <div className='mt-2'>Receipt Time: {formatRelativeTime(tx.receipt_time_iso)}</div>
                        </div>
                      );
                    })}
                </div>
              </Card>
            </div>
          )}
        </div>
      </Layout>
    </Page>
  );
}

const HeroSection = () => {

  return (
    <div className='flex flex-col items-center overflow-hidden'>
      <Image src={charismaFloating} alt='Red Pill' width={300} height={300} className='transition-all scale-150 translate-y-24 cursor-pointer sm:hidden' />
      <div className='flex w-full pt-24 pb-8 px-8 sm:p-24 sm:pb-0 my-[10vh] bg-[var(--sidebar)] border border-[var(--accents-7)] rounded-lg sm:rounded-lg mt-12'>
        <div className='flex-col items-center hidden w-full space-y-4 sm:w-64 sm:flex'>
          <Image src={charismaFloating} alt='Red Pill' width={300} height={300} className='transition-all -translate-x-12 -translate-y-20 cursor-pointer scale-[2]' />
          {/* <Button disabled onClick={() => makeChoice(true)} size={'sm'} className='text-sm w-36 hover:bg-[#ffffffee] hover:text-primary'>Select Red Pill</Button> */}
        </div>
        <div className='flex flex-col items-center justify-center w-full px-4 text-lg text-center -translate-y-16 sm:text-md sm:text-start sm:items-start sm:justify-start sm:px-0'>
          <div className='flex items-baseline justify-center w-full text-center sm:justify-start'>
            <div className='py-4 text-6xl sm:py-0'>Charisma</div><div className='text-lg font-bold text-primary'>CHA</div>
          </div>
          <div className='mt-4 text-lg grow text-secondary/80'>Introducing the new Charisma token– stability, security, swaps.</div>
          <div className='mt-8 text-md text-secondary/80'>
            The token contract limits how many tokens can be wrapped per transaction, and how many wrapping transactions can occur in a set of blocks.
          </div>
          <div className='mt-8 text-md text-secondary/80'>
            This ensures fair access for all users and adds an exciting element of competition to token supply issuance.
          </div>
        </div>
      </div>
    </div>
  );
};

const StatsSection = ({ data }: Props) => {
  const { charismaTokenStats, highestBid, setHighestBid } = useGlobalState()


  useEffect(() => {
    // find the highest bid
    const newHighestBid = data.transactions
      .filter(tx => isWithinLastHour(tx.receipt_time_iso))
      .reduce((acc, tx) => {
        if (tx.contract_call.function_name === 'wrap') {
          const amount = Number(tx.fee_rate)
          return Math.max(amount, acc)
        }
        return acc
      }, 0)
    setHighestBid(newHighestBid)
  }, [data.transactions, setHighestBid])

  const isUnlocked = charismaTokenStats.blocksUntilUnlock <= 1;
  const stat2Message = charismaTokenStats.blocksPerTransaction === 1 ? charismaTokenStats.transactionsAvailable === 0 ? '100%' : (Number((1 / (Number(charismaTokenStats.transactionsAvailable) + 1))) * 100).toFixed(2) + "%" : charismaTokenStats.blocksPerTransaction
  const profitMargin = ((data.chaPrice * charismaTokenStats.tokensPerTransaction / 10 ** 6) - (data.tokenPrices['STX'] * highestBid / 10 ** 6)).toFixed(2)

  return (
    <div>
      <div className='w-full pt-4 text-3xl font-bold text-center uppercase'>WIN THE BLOCK</div>
      <div className='w-full pb-8 text-center text-md text-muted/90'>Bid in the mempool to wrap your tokens.</div>
      <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
        <div className='flex flex-col items-center justify-center p-4 space-y-2 rounded-lg text-md bg-[var(--sidebar)] border border-[var(--accents-7)]'>
          <div className='text-4xl font-semibold'>{stat2Message}</div>
          <div className='text-muted/80'>{charismaTokenStats.blocksPerTransaction === 1 ? 'Wrap Capacity' : 'Blocks per Transaction'}</div>
        </div>
        <div className={`flex flex-col items-center justify-center ${highestBid === 0 ? 'col-span-2' : 'col-span-1'} p-4 space-y-2 rounded-lg text-md bg-[var(--sidebar)] border border-[var(--accents-7)]`}>
          <div className='flex items-center space-x-0'>
            <div className='-mr-0 text-4xl font-semibold'>{charismaTokenStats.tokensPerTransaction / Math.pow(10, 6)}</div>
            <Image src={charismaSquare} alt='DMG Logo' width={64} height={64} className='inline w-7 h-7 rounded-full translate-x-1.5 translate-y-0.5' />
          </div>
          <div className='text-muted/80'>Block Subsidy</div>
        </div>
        {!isUnlocked && <div className='flex flex-col items-center justify-center p-4 space-y-2 rounded-lg text-md bg-[var(--sidebar)] border border-[var(--accents-7)]'>
          <div className='text-4xl font-semibold'>{charismaTokenStats.transactionsAvailable}</div>
          <div className='text-muted/80'>Transactions Available</div>
        </div>}
        {highestBid > 0 && <div className='flex flex-col items-center justify-center p-4 space-y-2 rounded-lg text-md bg-[var(--sidebar)] border border-[var(--accents-7)]'>
          <div className='flex items-center space-x-0'>
            <div className='-mr-0 text-4xl font-semibold'>{(Math.ceil(highestBid / 10 ** 6 * 100) / 100).toFixed(2)}</div>
            <Image src={stxLogo} alt='DMG Logo' width={64} height={64} className='inline w-7 h-7 rounded-full translate-x-1.5 translate-y-0.5' />
          </div>
          <div className='text-muted/80'>Highest Active Bid</div>
        </div>}
        {isUnlocked ? (
          <div className={`flex flex-col items-center justify-center p-4 space-y-2 rounded-lg text-md bg-[var(--sidebar)] border border-[var(--accents-7)]`}>
            <div className='text-4xl font-semibold'>${profitMargin}</div>
            <div className='text-center text-muted/80'>Value Unlocked</div>
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center p-4 space-y-2 rounded-lg text-md bg-[var(--sidebar)] border border-[var(--accents-7)]'>
            <div className='text-4xl font-semibold'>{charismaTokenStats.blocksUntilUnlock}</div>
            <div className='text-muted/80'>Blocks until Unlocked</div>
          </div>
        )}
      </div>
    </div>
  );
};

const WrappingSection = ({ data }: Props) => {
  const { charismaTokenStats, charismaClaims, setIsMempoolSubscribed, stxAddress } = useGlobalState();
  const { wallet } = useWallet();
  const [amount, setAmount] = useState<string>('');
  const [error, setError] = useState<string>('');
  const { doContractCall } = useConnect();

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^[0-9]*\.?[0-9]*$/.test(value) || value === '') {
      setAmount(value);
      validateAmount(value);
    }
  };

  const validateAmount = (value: string) => {
    const numValue = Number(value);
    const maxAllowed = charismaTokenStats.tokensPerTransaction / Math.pow(10, 6);
    const balance = wallet.charisma.balance;

    if (numValue > balance) {
      setError('Insufficient balance');
    } else if (numValue > maxAllowed) {
      setError(`Maximum allowed amount is ${maxAllowed}`);
    } else if (numValue <= 0) {
      setError('Amount must be greater than 0');
    } else {
      setError('');
    }
  };

  const handleMaxAmountClick = () => {
    const maxAllowed = charismaTokenStats.tokensPerTransaction / Math.pow(10, 6);
    const maxAmount = Math.min(wallet.charisma.balance, maxAllowed);
    const formattedAmount = maxAmount.toString();
    setAmount(formattedAmount);
    validateAmount(formattedAmount);
  }

  const handleWrap = () => {
    if (!error && amount && stxAddress) {
      const amountIn = Number(amount) * Math.pow(10, 6)
      doContractCall({
        network: network,
        contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
        contractName: 'charisma-token',
        functionName: "wrap",
        functionArgs: [uintCV(amountIn)],
        postConditionMode: PostConditionMode.Deny,
        postConditions: [
          Pc.principal(stxAddress).willSendEq(amountIn).ft('SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme000-governance-token', 'charisma')
        ] as any[],
      });
    }
  }

  const handleMintRedPill = () => {
    if (stxAddress) {
      const postConditions = [] as any[]
      if (!charismaClaims.hasFreeClaim && !charismaClaims.hasClaimed) {
        postConditions.push(Pc.principal(stxAddress).willSendEq(100000000).ustx())
      }
      doContractCall({
        contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
        contractName: 'red-pill-nft',
        functionName: "claim",
        functionArgs: [],
        postConditionMode: PostConditionMode.Deny,
        postConditions,
      });
    }
  }

  useEffect(() => {
    if (wallet.redPilled && wallet.experience.balance > 2000) {
      setIsMempoolSubscribed(true)
    }
  }, [wallet.redPilled, wallet.experience.balance, setIsMempoolSubscribed])

  return (
    <div className='mt-20 mb-12'>
      <div className='w-full pt-8 text-3xl font-bold text-center uppercase'>Wrap Tokens</div>
      <div className='w-full pb-8 text-center text-md text-muted/90'>Convert your governance tokens into Charisma tokens.</div>
      <div className='container flex h-48 p-6 space-x-2 rounded-2xl max-w-prose bg-[var(--sidebar)] border-t-2 border-[var(--accents-7)] leading-0'>
        <div className='w-full'>
          <div className='font-bold text-center text-muted-foreground'>
            Available
          </div>
          <div className='flex items-center justify-center mt-2 space-x-1 font-bold text-center'>
            <div className='ml-3'>{numeral(wallet.charisma.balance).format('0.00a')}</div>
            <div className='pb-1'><Image src={wallet.charisma.balance > 0 ? dmgLogoPulse : dmgLogo} alt='DMG Logo' width={20} height={20} className='inline' /></div>
          </div>
        </div>
        <div className='w-full'>
          <div className='font-bold text-center text-muted-foreground whitespace-nowrap'>
            Token Price
          </div>
          <div className='mt-2 font-bold text-center'>
            {numeral(data.chaPrice).format('$0.00')}
          </div>
        </div>
        <div className='w-full'>
          <div className='font-bold text-center text-muted-foreground whitespace-nowrap'>
            Total Value
          </div>
          <div className='mt-2 font-bold text-center'>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className='cursor-default'>
                  <div className='flex items-center justify-center'>
                    <span className='font-bold text-center'>${numeral(wallet.charisma.balance * data.chaPrice).format('0,0.00')}</span>
                    <InfoIcon className="w-4 h-4 ml-1 mt-0.5" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-sm">
                    This value represents your DMG token balances at their post-wrap valuation using current CHA prices.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <div className='w-full'>
          <div className='font-bold text-center text-muted-foreground whitespace-nowrap'>
            Red Pilled
          </div>
          <div className='items-center font-bold text-center'>
            {wallet.redPilled ? (
              <Image src={redPill} alt='Red Pill' width={50} height={50} className='inline cursor-help' title={'The Red Pill NFT enables you to wrap your earned rewards into Charisma tokens.'} />
            ) : (
              <div className='flex items-center mt-2 space-x-2 font-bold'>
                <div>No</div>
                {!charismaClaims.hasClaimed && <Button onClick={handleMintRedPill} className='h-6 px-2 font-normal rounded-full cursor-pointer bg-primary'>
                  Mint
                </Button>}
              </div>
            )}
          </div>
        </div>

      </div>
      <div className='container flex flex-col p-6 pb-0 -translate-y-20 border-t-2 bg-background rounded-2xl max-w-prose min-h-48'>
        <div className='relative w-full space-y-2 grow'>
          {wallet.redPilled ? (
            <div className=''>
              <div className='flex justify-between py-2'>
                <div>Wrap Amount</div>
                <div onClick={handleMaxAmountClick} className='px-2 rounded-full cursor-pointer bg-primary'>Max</div>
              </div>
              <Input
                className='font-bold bg-white/10'
                value={amount}
                onChange={handleAmountChange}
                disabled={!wallet.redPilled}
              />
              {error && <div className="absolute text-sm text-red-500">{error}</div>}
              <div className='pt-8 rounded-lg'>
                <div className='flex justify-between'>
                  <div>Receive</div>
                  <div className='flex items-center space-x-1'>
                    <div>{Number(amount)}</div>
                    <div className='pb-1'>
                      <Image src={charismaSquare} alt='Charisma Logo' width={20} height={20} className='inline rounded-full' />
                    </div>
                  </div>
                </div>
              </div>
              <Button onClick={handleWrap} className='w-full mb-5' disabled={!!error || !amount}>
                Wrap
              </Button>
            </div>
          ) : (
            <div className='text-center'>
              <p className='mb-4'>You need to mint a Red Pill NFT before wrapping tokens.</p>
              {!charismaClaims.hasClaimed ? (
                <Button onClick={handleMintRedPill} className='px-4 py-2 font-light rounded-full cursor-pointer bg-primary'>
                  Mint Red Pill NFT
                </Button>
              ) : (
                <div>
                  <p className='my-12 text-lg font-semibold'>You have already made a NFT claim for this wallet address.</p>
                </div>
              )
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
};