// pages/pools/[id].tsx

import React, { useEffect, useRef, useState } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import Layout from '@components/layout/layout';
import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import { startOfDay, addMinutes, format } from 'date-fns';
import { createChart, ColorType, UTCTimestamp, IChartApi, ISeriesApi, LineStyle, CrosshairMode } from 'lightweight-charts';
import { getPoolData, SwapEvent } from '@lib/db-providers/kv';
import { kv } from '@vercel/kv';

interface DataPoint {
    time: UTCTimestamp;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

interface PoolData {
    id: string;
    data: DataPoint[];
}

export const getStaticPaths: GetStaticPaths = () => {
    // Fetch all pool symbols
    const poolIds = ["1", "2", "3"] //await kv.smembers('pool:ids');

    return {
        paths: [
            { params: { id: '2' } },
        ],
        // paths: poolIds.map(symbol => ({ params: { id: symbol } })),
        fallback: 'blocking',
    };
};

export const getStaticProps: GetStaticProps<any> = async ({ params }) => {
    const id = params?.id as string;

    // Fetch pool metadata
    const meta = await kv.hgetall(`pool:${id}:meta`);

    if (!meta) {
        return {
            notFound: true,
        };
    }

    // Fetch the last 1000 swap events (adjust as needed)
    const poolData = await getPoolData(id)

    // Parse and format the data for the chart
    const data = poolData.swaps.map((swap: SwapEvent) => ({
        time: format(new Date(swap.timestamp), 'yyyy-MM-dd'),
        open: swap.price,
        high: swap.price,
        low: swap.price,
        close: swap.price,
        volume: swap.volume,
    }));

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

const PoolDetail: React.FC<PoolData> = ({ id, data }) => {
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
                },
                timeScale: {
                    timeVisible: true,
                    secondsVisible: false,
                },
            });

            const candlestickSeries = chart.addCandlestickSeries({
                upColor: '#4CAF50',
                downColor: '#FF5252',
                borderVisible: false,
                wickUpColor: '#4CAF50',
                wickDownColor: '#FF5252',
            });

            candlestickSeries.setData(data);

            const volumeSeries = chart.addHistogramSeries({
                color: '#26a69a',
                priceFormat: {
                    type: 'volume',
                },
                priceScaleId: 'volume',
            });

            volumeSeries.setData(
                data.map(d => ({
                    time: d.time,
                    value: d.volume,
                    color: d.close > d.open ? 'rgba(76, 175, 80, 0.5)' : 'rgba(255, 82, 82, 0.5)',
                }))
            );

            const smaData = calculateSMA(data, 20);
            const smaSeries = chart.addLineSeries({
                color: '#2962FF',
                lineWidth: 2,
                priceLineVisible: false,
            });
            smaSeries.setData(smaData);

            const rsiData = calculateRSI(data, 14);
            const rsiSeries = chart.addLineSeries({
                color: '#E91E63',
                lineWidth: 2,
                priceScaleId: 'right',
                priceLineVisible: false,
            });
            rsiSeries.setData(rsiData);

            const rsiLevels = [30, 70];
            rsiLevels.forEach(level => {
                chart.addLineSeries({
                    color: '#787B86',
                    lineWidth: 1,
                    lineStyle: LineStyle.Dashed,
                    priceScaleId: 'right',
                }).setData(rsiData.map(d => ({ time: d.time, value: level })));
            });

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
                    const dateStr = param.time
                    const price = param.seriesData?.get(candlestickSeries) || 0 as any;
                    const volume = param.seriesData?.get(volumeSeries) || {};
                    const sma = param.seriesData?.get(smaSeries) || {};
                    const rsi = param.seriesData?.get(rsiSeries) || {};

                    setTooltipData({
                        time: dateStr,
                        price: price ? `$${price.close.toFixed(2)}` : 'N/A',
                        open: price ? `$${price.open.toFixed(2)}` : 'N/A',
                        high: price ? `$${price.high.toFixed(2)}` : 'N/A',
                        low: price ? `$${price.low.toFixed(2)}` : 'N/A',
                        close: price ? `$${price.close.toFixed(2)}` : 'N/A',
                        // volume: volume ? volume.toFixed(0) : 'N/A',
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
                <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 64px)' }}>
                    <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />
                    <div style={{
                        position: 'absolute',
                        top: 10,
                        left: 10,
                        background: 'rgba(0,0,0,0.7)',
                        padding: '10px',
                        borderRadius: '5px',
                        color: '#fff',
                    }}>
                        <div>Pool: {id}</div>
                        <div>Current Price: ${currentPrice.toFixed(2)}</div>
                        <div>24h Change: ${priceChange.toFixed(2)} ({((priceChange / data[0].close) * 100).toFixed(2)}%)</div>
                        {/* <div>Last Update: {format(new Date(data[data.length - 1].time), 'HH:mm:ss')}</div> */}
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
                            <div>Time: {tooltipData.time}</div>
                            <div>Price: {tooltipData.price}</div>
                            <div>Open: {tooltipData.open}</div>
                            <div>High: {tooltipData.high}</div>
                            <div>Low: {tooltipData.low}</div>
                            <div>Close: {tooltipData.close}</div>
                            {/* <div>Volume: {tooltipData.volume}</div>
                            <div>SMA(20): {tooltipData.sma}</div>
                            <div>RSI(14): {tooltipData.rsi}</div> */}
                        </div>
                    )}
                </div>
            </Layout>
        </Page>
    );
}

export default PoolDetail;