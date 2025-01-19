import { NextApiRequest, NextApiResponse } from 'next';
import { ContractId } from 'dexterity-sdk';
import { Dexterity } from 'dexterity-sdk';
import _ from 'lodash';
import { Kraxel } from '@lib/kraxel';

// Opt out of caching; every request should send a new event
export const dynamic = "force-dynamic";

const blacklist = [
    'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.chdollar',
    'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.dmg-runes',
    'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.uahdmg',
    'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.dmg-lp-token',
    'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.stx-lp-token',
] as ContractId[];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    res.writeHead(200, {
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    });

    // Verify the request is from Vercel Cron
    // if (process.env.VERCEL_ENV === 'production' && !req.headers['x-vercel-cron']) {
    //     return res.status(401).json({ error: 'Unauthorized' });
    // }

    try {
        console.log('Dexterity Balancer Cron Job Running')
        // Initialize Dexterity SDK
        await Dexterity.configure({
            apiKeyRotation: 'loop',
            parallelRequests: 10,
            maxHops: 4
        })

        const prices = await Kraxel.getAllTokenPrices();
        await Dexterity.discover({ blacklist, reserves: false })

        const tokens = Dexterity.getTokens()
        const txs = []
        const fee = 1100

        // Filter out tokens with less than 2 vaults
        const filteredTokens = tokens.filter(token => Dexterity.getVaultsForToken(token.contractId).size > 1)
            .slice(0, 10)

        // Pick 3 random tokens
        // const randomTokens = _.sampleSize(filteredTokens, 20)

        const processToken = async (token: any, index: number) => {
            try {
                console.log('Processing token:', token.symbol, `${index + 1}/${tokens.length}`)

                const amount = Math.floor(10 ** token.decimals / prices[token.contractId])
                const quote = await Dexterity.getQuote(token.contractId, token.contractId, amount)

                // Check if the quote is profitable including the fee in uSTX with prices
                const feeInUSD = fee / 10 ** token.decimals * prices['.stx']
                const grossProfit = quote.amountOut / 10 ** token.decimals * prices[token.contractId] - feeInUSD
                const errorMargin = Dexterity.config.defaultSlippage
                const grossProfitWithMargin = grossProfit * (1 - errorMargin)
                const netProfit = grossProfitWithMargin - quote.amountIn / 10 ** token.decimals * prices[token.contractId]

                if (netProfit < 0) {
                    return { token: token.symbol, msg: "not profitable", grossProfit, netProfit }
                }

                if (!quote.route.hops.length) {
                    return { token: token.symbol, msg: "no routes found" }
                }

                console.log('Executing swap', quote.route.hops.map(hop => hop.vault.contractName).join(' -> '))
                const tx = await Dexterity.router.executeSwap(quote.route, amount, { fee, disablePostConditions: false })
                await new Promise(resolve => setTimeout(resolve, 10000));
                return { tx, grossProfit, netProfit }
            } catch (error) {
                console.error('Error executing swap:', error);
                return { token: token.symbol, error: error }
            }
        }

        // Process tokens in parallel with a concurrency limit of 3
        const batchSize = 10;
        for (let i = 0; i < filteredTokens.length; i += batchSize) {
            const batch = filteredTokens.slice(i, i + batchSize);
            const results = await Promise.all(
                batch.map((token, index) => processToken(token, i + index))
            );
            txs.push(...results);
        }

        console.log('Finished processing all tokens')
        console.log(txs)

        return res.status(200).json({ txs });

    } catch (error) {
        console.error('Arbitrage scan error:', error);

        return res.status(500).json({
            status: 'error',
            error: 'Internal server error during task'
        });
    }
}