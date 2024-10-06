// pages/pools/[id].tsx

import React, { useEffect, useRef, useState } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import Layout from '@components/layout/layout';
import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import { startOfDay, parseISO, format } from 'date-fns';
import { createChart, ColorType, UTCTimestamp, IChartApi, ISeriesApi, LineStyle, CrosshairMode } from 'lightweight-charts';
import { getPoolData } from '@lib/db-providers/kv';
import { kv } from '@vercel/kv';
import _, { last } from 'lodash';
import velarApi from '@lib/velar-api';
import { callReadOnlyFunction, principalCV } from '@stacks/transactions';
import cmc from '@lib/cmc-api';


interface DataPoint {
    ts: Date;
    time: UTCTimestamp | number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

interface PoolData {
    id: string;
    symbol: string;
    token0: string;
    token1: string;
    data: any[];
}

async function getTokenPrices(): Promise<{ [key: string]: number }> {
    const prices = await velarApi.tokens('all');
    return prices.reduce((acc: { [key: string]: number }, token: any) => {
        acc[token.symbol] = token.price;
        return acc;
    }, {});
}

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

export const getStaticPaths: GetStaticPaths = async () => {
    // Fetch all pool symbols
    const poolIds = await kv.smembers('pool:ids');

    return {
        paths: poolIds.map(id => ({ params: { id: String(id) } })),
        fallback: 'blocking',
    };
};

export const getStaticProps: GetStaticProps<any> = async ({ params }) => {
    const id = params?.id as string;

    // Fetch token prices
    const tokenPrices = await getTokenPrices();
    const cmcPriceData = await cmc.getQuotes({ symbol: ['STX', 'ORDI', 'WELSH'] })

    // Calculate CHA price
    const chaPrice = await calculateChaPrice(cmcPriceData.data['STX'].quote.USD.price);
    tokenPrices['CHA'] = chaPrice;

    // Calculate IOU prices
    tokenPrices['iouWELSH'] = cmcPriceData.data['WELSH'].quote.USD.price;
    tokenPrices['iouROO'] = tokenPrices['$ROO'];

    tokenPrices['ORDI'] = cmcPriceData.data['ORDI'].quote.USD.price

    const getPriceByContract = (contract: string) => {
        switch (contract) {
            case 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wstx':
                return tokenPrices['STX']
            case 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token':
                return tokenPrices['CHA']
            case 'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token':
                return tokenPrices['WELSH']
            case 'SP2C1WREHGM75C7TGFAEJPFKTFTEGZKF6DFT6E2GE.kangaroo':
                return tokenPrices['$ROO']
            case 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-welsh':
                return tokenPrices['iouWELSH']
            case 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-roo':
                return tokenPrices['iouROO']
            case 'ORDI':
                return tokenPrices['ORDI']
            default:
                return 0;
        }
    }

    const getDecimalsByContract = (contract: string) => {
        switch (contract) {
            case 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wstx':
                return 6
            case 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token':
                return 6
            case 'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token':
                return 6
            case 'SP2C1WREHGM75C7TGFAEJPFKTFTEGZKF6DFT6E2GE.kangaroo':
                return 6
            case 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-welsh':
                return 6
            case 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-roo':
                return 6
            case 'ORDI':
                return 8
            default:
                return 0;
        }
    }

    // Fetch pool metadata
    const meta = await kv.hgetall(`pool:${id}:meta`);

    if (!meta) {
        return {
            notFound: true,
        };
    }

    // Fetch the last 999999 swap events (adjust as needed)
    const poolData = await getPoolData(id)

    // Parse and aggregate the data by block height
    const groupedSwaps = _.groupBy(poolData.swaps, (swap: any) => swap.pool['block-height']);

    // loop through keys and create a data point for each block height
    let lastClose = 0
    const data: DataPoint[] = Object.keys(groupedSwaps).map((blockHeight) => {
        const swaps = _.sortBy(groupedSwaps[blockHeight], 'timestamp', 'asc');
        const prices = swaps.map((swap: any) => poolData.token1 === swap['token-out'] ? swap['amt-in-adjusted'] / swap['amt-out'] : swap['amt-out'] / swap['amt-in-adjusted']);
        const volume = swaps.reduce((acc: number, swap: any) => Number(acc) + (
            Number(swap['amt-in']) / 10 ** getDecimalsByContract(swap['token-in']) * getPriceByContract(swap['token-in'])
            + Number(swap['amt-out']) / 10 ** getDecimalsByContract(swap['token-out']) * getPriceByContract(swap['token-out'])
        ), 0);
        const dataPoint = {
            ts: swaps[0].timestamp,
            time: Number(blockHeight),
            open: lastClose,
            high: Math.max(...prices),
            low: Math.min(...prices),
            close: prices[prices.length - 1],
            volume,
        }
        lastClose = dataPoint.close
        return dataPoint;
    });


    return {
        props: {
            id,
            symbol: meta.symbol,
            token0: meta.token0,
            token1: meta.token1,
            data,
        },
        revalidate: 60, // Revalidate every minute
    };
};

const calculateSMA = (data: DataPoint[], period: number) => {
    const sma = [];
    for (let i = period - 1; i < data.length; i++) {
        const sum = data.slice(i - period + 1, i + 1).reduce((total, d) => total + d.close, 0);
        sma.push({ time: data[i].time, value: sum / period });
    }
    return sma;
};

const calculateRSI = (data: DataPoint[], period: number) => {
    const rsi = [];
    let gains = 0;
    let losses = 0;

    for (let i = 1; i < data.length; i++) {
        const difference = data[i].close - data[i - 1].close;
        if (difference >= 0) {
            gains += difference;
        } else {
            losses -= difference;
        }

        if (i >= period) {
            if (i > period) {
                gains = (gains * (period - 1) + (difference > 0 ? difference : 0)) / period;
                losses = (losses * (period - 1) + (difference < 0 ? -difference : 0)) / period;
            }

            const rs = gains / losses;
            rsi.push({ time: data[i].time, value: 100 - (100 / (1 + rs)) });
        }
    }

    return rsi;
};

const PoolDetail: React.FC<PoolData> = ({ id, data, symbol, token0, token1 }) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const [currentPrice, setCurrentPrice] = useState<number>(0);
    const [priceChange, setPriceChange] = useState<number>(0);
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [tooltipData, setTooltipData] = useState<{
        time: string;
        price: string;
        open: string;
        high: string;
        low: string;
        close: string;
        volume: string;
        sma: string;
        rsi: string;
    }>({
        time: '',
        price: '',
        open: '',
        high: '',
        low: '',
        close: '',
        volume: '',
        sma: '',
        rsi: '',
    });
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

    const meta = {
        title: `Charisma | Pool ${id}`,
        description: `View and manage liquidity pool ${id} on the Charisma DEX`,
        image: 'https://charisma.rocks/pools-screenshot.png',
    };

    useEffect(() => {
        if (chartContainerRef.current) {
            const handleResize = () => {
                chart.applyOptions({
                    width: chartContainerRef.current!.clientWidth,
                    height: chartContainerRef.current!.clientHeight
                });
            };

            const chart = createChart(chartContainerRef.current, {
                width: chartContainerRef.current.clientWidth,
                height: chartContainerRef.current.clientHeight,
                layout: {
                    background: { type: ColorType.Solid, color: '#1A1A1A' },
                    textColor: '#DDD',
                },
                grid: {
                    vertLines: { color: '#2B2B2B' },
                    horzLines: { color: '#2B2B2B' },
                },
                crosshair: {
                    mode: CrosshairMode.Normal,
                    vertLine: {
                        labelVisible: false,
                    }

                },
                timeScale: {
                    timeVisible: false,
                    secondsVisible: false,
                    tickMarkFormatter: (time: number) => `${time}`,
                },
            });

            const candlestickSeries = chart.addCandlestickSeries({
                upColor: '#c1121f',
                downColor: '#0e0e10',
                borderVisible: true,
                wickUpColor: '#c1121f',
                wickDownColor: '#0e0e10',
                borderColor: '#333333'
            });

            candlestickSeries.setData(data as any);

            const volumeSeries = chart.addHistogramSeries({
                color: '#c1121f',
                priceFormat: {
                    type: 'volume',
                },
                priceScaleId: 'volume',
            });

            volumeSeries.setData(
                data.map(d => ({
                    time: d.time,
                    value: d.volume,
                    color: d.close > d.open ? '#c1121f20' : '#0e0e1080',
                }))
            );

            // const smaData = calculateSMA(data, 20);
            // const smaSeries = chart.addLineSeries({
            //     color: '#2962FF',
            //     lineWidth: 2,
            //     priceLineVisible: false,
            // });
            // smaSeries.setData(smaData);

            // const rsiData = calculateRSI(data, 14);
            // const rsiSeries = chart.addLineSeries({
            //     color: '#E91E63',
            //     lineWidth: 2,
            //     priceScaleId: 'right',
            //     priceLineVisible: false,
            // });
            // rsiSeries.setData(rsiData);

            // const rsiLevels = [30, 70];
            // rsiLevels.forEach(level => {
            //     chart.addLineSeries({
            //         color: '#787B86',
            //         lineWidth: 1,
            //         lineStyle: LineStyle.Dashed,
            //         priceScaleId: 'right',
            //     }).setData(rsiData.map(d => ({ time: d.time, value: level })));
            // });

            chart.timeScale().fitContent();

            const lastDataPoint = data[data.length - 1];
            setCurrentPrice(lastDataPoint.close);
            setPriceChange(lastDataPoint.close - data[0].close);

            chart.subscribeCrosshairMove((param) => {

                if (
                    param.point === undefined ||
                    !param.time ||
                    param.point.x < 0 ||
                    param.point.x > chartContainerRef.current!.clientWidth ||
                    param.point.y < 0 ||
                    param.point.y > chartContainerRef.current!.clientHeight
                ) {
                    setTooltipVisible(false);
                } else {
                    const blockHeight = param.time;
                    const price = param.seriesData?.get(candlestickSeries) || 0 as any;
                    const volume = param.seriesData?.get(volumeSeries) as any;
                    // const sma = param.seriesData?.get(smaSeries) || {};
                    // const rsi = param.seriesData?.get(rsiSeries) || {};
                    console.log(param)
                    setTooltipData({
                        // ts: param
                        time: `${blockHeight}`,
                        price: price ? `${price.close.toFixed(2)} ${symbol}` : 'N/A',
                        open: price ? `${price.open.toFixed(2)} ${symbol}` : 'N/A',
                        high: price ? `${price.high.toFixed(2)} ${symbol}` : 'N/A',
                        low: price ? `${price.low.toFixed(2)} ${symbol}` : 'N/A',
                        close: price ? `${price.close.toFixed(2)} ${symbol}` : 'N/A',
                        volume: volume ? `$${volume.value!.toFixed(2)}` : 'N/A',
                        // sma: sma ? sma.toFixed(2) : 'N/A',
                        // rsi: rsi ? rsi.toFixed(2) : 'N/A',
                    } as any);

                    setTooltipPosition({
                        x: param.point.x,
                        y: param.point.y,
                    });

                    setTooltipVisible(true);
                }
            });

            window.addEventListener('resize', handleResize);

            return () => {
                window.removeEventListener('resize', handleResize);
                chart.remove();
            };
        }
    }, [data]);

    return (
        <Page meta={meta} fullViewport>
            <SkipNavContent />
            <Layout>
                <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 105px)', overflow: 'hidden' }}>
                    <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />
                    <div style={{
                        position: 'absolute',
                        zIndex: 1000,
                        top: 10,
                        left: 10,
                        background: '#0e0e10',
                        padding: '10px',
                        borderRadius: '5px',
                        border: '1px solid #333',
                        color: '#ffffffDD',
                        fontSize: '16px',
                        fontWeight: '300',
                        boxShadow: '4px 10px 32px #c1121e10',
                    }}>
                        <div>Pool: {symbol}</div>
                        <div>Current Price: {currentPrice.toFixed(2)} {symbol.split('-')[0]}</div>
                        <div>24h Change: {priceChange.toFixed(2)} ({((priceChange / data[0].close) * 100).toFixed(2)}%)</div>
                        <div>Last Update: Block {data[data.length - 1].time}</div>
                    </div>
                    {tooltipVisible && (
                        <div style={{
                            position: 'absolute',
                            left: tooltipPosition.x + 15,
                            top: tooltipPosition.y + 15,
                            padding: '10px',
                            borderRadius: '5px',
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            color: 'white',
                            fontSize: '12px',
                            zIndex: 1000,
                            pointerEvents: 'none',
                        }}>
                            <div>Block: {tooltipData.time}</div>
                            <div>Price: {tooltipData.price}</div>
                            <div>Open: {tooltipData.open}</div>
                            <div>High: {tooltipData.high}</div>
                            <div>Low: {tooltipData.low}</div>
                            <div>Close: {tooltipData.close}</div>
                            <div>Volume: {tooltipData.volume}</div>
                            {/* <div>SMA(20): {tooltipData.sma}</div> */}
                            {/* <div>RSI(14): {tooltipData.rsi}</div> */}
                        </div>
                    )}
                </div>
            </Layout>
        </Page>
    );
}

export default PoolDetail;