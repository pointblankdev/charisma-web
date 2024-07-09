import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import Layout from '@components/layout';
import Image from 'next/image';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@components/ui/tooltip"
import { Info } from 'lucide-react';
import { Card } from '@components/ui/card';
import { GetServerSideProps, GetStaticProps } from 'next';
import { useState } from 'react';
import millify from 'millify';
import useWallet from '@lib/hooks/use-wallet-balances';
import StakingControls from '@components/liquidity/staking';
import velarApi from '@lib/velar-api';
import { getDecimals, getStakedTokenExchangeRate, getSymbol, getTokenURI, getTotalInPool, getTotalSupply } from '@lib/stacks-api';

export default function Stake({ data }: Props) {

    const meta = {
        title: `Charisma | ${data.metadata?.name || 'Stake Tokens'}`,
        description: META_DESCRIPTION,
        image: data.metadata?.cardImage || '/liquid-charisma.png',
    };

    const tokensInPool = data.tokensInPool

    const { balances, getBalanceByKey } = useWallet()

    const rebaseTokenBalance = getBalanceByKey(`${data.ca}::${data.metadata?.ft || 'liquid-staked-token'}`)?.balance || 0
    const baseTokenBalance = getBalanceByKey(`${data.baseToken?.address}::${data.baseToken?.ft}`)?.balance || 0

    const tvl = data.tvl

    const [tokensSelected, setTokensSelected] = useState(0);

    return (
        <Page meta={meta} fullViewport>
            <SkipNavContent />
            <Layout>
                <div className="m-2 sm:container sm:mx-auto sm:py-10 md:max-w-2xl">

                    <Card className='p-0 overflow-hidden bg-black text-primary-foreground border-accent-foreground rounded-xl relative'>
                        {data.metadata?.cardImage && <Image alt={data.metadata?.name} src={data.metadata?.cardImage} width="1080" height="605" className='border-b border-accent-foreground' />}
                        {tvl > 0 && <div className='my-2 mx-4 absolute top-0 right-0 font-medium text-lg px-2 rounded-full bg-background border border-primary overflow-hidden'>${millify(tvl)} TVL</div>}
                        <div className='m-2'>
                            <div className='flex justify-between mb-2'>
                                <h1 className="self-center font-bold text-md sm:text-2xl whitespace-nowrap">{data.metadata?.name}</h1>
                                {data.exchangeRate && <div className="self-center px-2 my-1 text-xs font-light text-center rounded-full sm:text-lg sm:p-0 sm:px-4">
                                    <div className="self-center px-2 my-1 text-xs font-light text-center rounded-full sm:text-md bg-primary sm:p-0 sm:px-4 whitespace-nowrap">1 {data.symbol} = {Number(data.exchangeRate)} {data.baseToken.symbol}</div>
                                </div>}
                            </div>

                            <div className='flex justify-between'>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <div className='flex items-center gap-1 mb-2'>
                                                <h1 className="font-bold text-left text-md">How Staking Works</h1>
                                                <Info size={16} color='#948f8f' />
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent className='max-w-2xl leading-tight text-white bg-black border-primary'>
                                            <h2 className="mb-2 text-lg font-bold">Interacting with the Staking Dashboard:</h2>
                                            <ul className="pl-5 mb-4 space-y-2 list-disc text-md">
                                                <li>
                                                    <b>Stake Tokens</b>: Stake your {data.baseToken?.name} tokens to receive {data.metadata?.name} ({data.symbol}). The amount of {data.symbol} you receive is calculated based on the current inverse exchange rate.
                                                </li>
                                                <li>
                                                    <b>Unstake Tokens</b>: Redeem your {data.symbol} for {data.baseToken?.name} tokens based on the current exchange rate.
                                                </li>
                                            </ul>
                                            <p className="mb-4">
                                                Staking your {data.baseToken?.name} tokens allows you to participate in governance and earn staking rewards generated from network activities. Your staked tokens help secure the network and in return, you earn more tokens over time.
                                            </p>
                                            <p className="mb-4">
                                                The staking interface aims to provide a transparent, user-friendly experience to support your investment decisions.
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                <div className='px-2 sm:p-0 sm:px-4'>
                                    {millify(tokensInPool / Math.pow(10, data.decimals))} {data.baseToken?.symbol} Staked
                                </div>
                            </div>
                            <p className="mb-8 text-xs font-thin leading-tight sm:text-sm">
                                {data.baseToken?.name} staking is a crucial part of the network's financial ecosystem, providing a way for token holders to earn passive income while contributing to the token's number-go-up mechanism.
                            </p>
                            <div className='space-y-2'>
                                <StakingControls
                                    min={-rebaseTokenBalance}
                                    max={baseTokenBalance}
                                    onSetTokensSelected={setTokensSelected}
                                    tokensSelected={tokensSelected}
                                    tokensRequested={0}
                                    tokensRequired={[]}
                                    contractAddress={data.contractAddress}
                                    contractName={data.contractName}
                                    fungibleTokenName={data.metadata?.ft || 'liquid-staked-token'}
                                    symbol={tokensSelected >= 0 ? `${data.baseToken?.symbol}` : `${data.symbol}`}
                                    baseTokenContractAddress={data.baseToken?.address.split('.')[0]}
                                    baseTokenContractName={data.baseToken?.address.split('.')[1]}
                                    baseFungibleTokenName={data.baseToken?.ft}
                                    decimals={data.decimals}
                                    exchangeRate={data.exchangeRate}
                                />
                            </div>
                        </div>
                    </Card>
                </div>
            </Layout>
        </Page>
    );
}

type Props = {
    data: any;
};

export const getServerSideProps: GetServerSideProps<Props> = async ({ params }: any) => {

    try {
        const [contractAddress, contractName] = params.ca.split('.');

        // get token metadata from Stacks API + metadata URL
        const metadata = await getTokenURI(params.ca);
        const supply = await getTotalSupply(params.ca);
        const symbol = await getSymbol(params.ca);
        const decimals = await getDecimals(params.ca);

        const exchangeRate = await getStakedTokenExchangeRate(params.ca)

        const tokensInPool = await getTotalInPool(params.ca)

        // if rebase token has a price on velar, calculate TVL with that
        // if not, check base token price on velar, and calculate TVL with that
        // otherwise, set TVL to 0
        let tvl = 0
        const [rebaseToken] = await velarApi.tokens(symbol)
        const [baseToken] = await velarApi.tokens(metadata.contains[0].symbol)
        if (rebaseToken) {
            tvl = tokensInPool * Number(rebaseToken.price) / Math.pow(10, decimals)
        } else if (baseToken) {
            tvl = Number(baseToken.price) * (tokensInPool / baseToken.tokenDecimalNum)
        } else {
            tvl = 0
        }

        const data = {
            ca: params.ca,
            contractAddress,
            contractName,
            metadata,
            symbol,
            decimals: Number(decimals),
            supply: Number(supply),
            exchangeRate: Number(exchangeRate) / 1000000,
            tokensInPool,
            baseToken: { ...metadata.contains[0], ...baseToken },
            tvl,
        }

        // console.log(data)

        return {
            props: { data }
        };

    } catch (error) {
        console.error(error)
        return {
            props: {
                data: {}
            },
        }
    }
};