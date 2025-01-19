import { NextApiRequest, NextApiResponse } from 'next';
import { ContractId, Opcode, Quote, Vault } from 'dexterity-sdk';
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
        console.log('Dexterity LP Arbitrage Cron Job Running')
        await Dexterity.configure({
            apiKeyRotation: 'loop',
            parallelRequests: 10,
            maxHops: 3
        })

        const prices = await Kraxel.getAllTokenPrices();
        await Dexterity.discover({ blacklist, reserves: true })

        const tokens = Dexterity.getTokens()
        const txs = []
        const fee = 1100

        const processVault = async (vault: Vault, index: number) => {
            console.log({ vault })
            try {
                console.log('Processing vault:', vault.contractName, `${index + 1}/${tokens.length}`)
                const baseTokens = vault.liquidity

                // Get initial amount for LP token
                const lpAmount = Math.floor(10 ** vault.decimals / prices[vault.contractId])
                const halfLpAmount = Math.floor(lpAmount / 2)

                // Get all quotes in parallel
                const [swapQuote1, swapQuote2, removeLiquidityQuote] = await Promise.all([
                    Dexterity.getQuote(vault.contractId, baseTokens[0].contractId, halfLpAmount),
                    Dexterity.getQuote(vault.contractId, baseTokens[1].contractId, halfLpAmount),
                    vault.quote(lpAmount, Opcode.removeLiquidity()) as Promise<Quote>
                ]);

                const build = {
                    dx: removeLiquidityQuote.amountIn,
                    dy: removeLiquidityQuote.amountOut,
                    dk: lpAmount
                }

                const sell = {
                    dx: swapQuote1.amountOut,
                    dy: swapQuote2.amountOut,
                    dk: lpAmount
                }

                const delta = {
                    dx: sell.dx - build.dx,
                    dy: sell.dy - build.dy,
                    dk: sell.dk - build.dk
                }

                const result = {
                    build: build,
                    sell: sell,
                    delta: delta,
                    usd: {
                        dx: delta.dx * prices[baseTokens[0].contractId] + delta.dy * prices[baseTokens[1].contractId],
                        dy: delta.dy * prices[baseTokens[1].contractId] + delta.dx * prices[baseTokens[0].contractId]
                    }
                }

                return result

            } catch (error) {
                console.error('Error processing vault:', error);
                return { vault: vault.contractName, error: error }
            }
        }

        // Process vaults in parallel with a concurrency limit
        const vaults = Dexterity.getVaults()
        const batchSize = 35;
        for (let i = 0; i < vaults.length; i += batchSize) {
            const batch = vaults.slice(i, i + batchSize);
            const results = await Promise.all(
                batch.map((vault, index) => processVault(vault, i + index))
            );
            txs.push(...results);
        }

        console.log('Finished processing all vaults')
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