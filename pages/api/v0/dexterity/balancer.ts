import { NextApiRequest, NextApiResponse } from 'next';
import { ContractId } from 'dexterity-sdk';
import { Dexterity } from 'dexterity-sdk';
import PricesService from '@lib/server/prices/prices-service';

// Opt out of caching; every request should send a new event
export const dynamic = "force-dynamic";

const kraxel = PricesService.getInstance();

const blacklist = [
    'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.chdollar',
    'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.dmg-runes',
    'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.uahdmg',
    'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.dmg-lp-token',
    'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.stx-lp-token',
] as ContractId[];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

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

        const prices = await kraxel.getAllTokenPrices();
        await Dexterity.discover({ blacklist, reserves: false })

        const tokens = Dexterity.getTokens()
        const txs = []
        const fee = 1500

        try {
            // Buy CHA with STX
            const cha = tokens.find(token => token.contractId === 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token')!
            const amount2 = Math.floor(10 ** cha.decimals / prices[cha.contractId] / 5)
            txs.push(await Dexterity.executeSwap('.stx', cha.contractId, amount2, { fee }))
        } catch (error) {
            console.error('Error buying CHA:', error);
        }

        // wait 2 seconds
        await new Promise(resolve => setTimeout(resolve, 1000));

        for (const token of tokens) {
            try {
                const vaults = Dexterity.getVaultsForToken(token.contractId)
                if (vaults.size <= 1) {
                    txs.push({ token: token.symbol, msg: "less than 2 vaults" })
                    continue
                }

                const amount = Math.floor(10 ** token.decimals / prices[token.contractId])
                const quote = await Dexterity.getQuote(token.contractId, token.contractId, amount)

                // Check if the quote is profitable including the fee in uSTX with prices
                const feeInUSD = fee / 10 ** token.decimals * prices['.stx']
                // amount out and in are in token units, convert to USD with decimals
                const grossProfit = quote.amountOut / 10 ** token.decimals * prices[token.contractId] - feeInUSD
                const netProfit = grossProfit - quote.amountIn / 10 ** token.decimals * prices[token.contractId]

                if (netProfit < 0) {
                    txs.push({ token: token.symbol, msg: "not profitable", grossProfit, netProfit })
                    continue
                }

                if (!quote.route.hops.length) {
                    txs.push({ token: token.symbol, msg: "no routes found" })
                    continue
                }

                const tx = await Dexterity.router.executeSwap(quote.route, amount, { fee }) as any
                txs.push({ tx, grossProfit, netProfit })

                // wait 2 seconds
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                console.error('Error executing swap:', error);
            }
        }

        return res.status(200).json({ txs });

    } catch (error) {
        console.error('Arbitrage scan error:', error);

        return res.status(500).json({
            status: 'error',
            error: 'Internal server error during arbitrage scan'
        });
    }
}