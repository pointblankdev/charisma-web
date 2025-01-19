import { Vault } from "dexterity-sdk"

import { Dexterity, Opcode, Quote, Token } from "dexterity-sdk"

export const craftOrSalvage = async (vault: Vault, index: number, tokens: Token[], prices: Record<string, number>) => {
    try {
        console.log('Processing vault:', vault.contractName, `${index + 1}/${tokens.length}`)

        // Get initial amount for LP token
        const lpAmount = Math.floor(10 ** vault.decimals / prices[vault.contractId])
        const halfLpAmount = Math.floor(lpAmount / 2)

        // Get all quotes in parallel
        const [swapQuote1, swapQuote2, removeLiquidityQuote] = await Promise.all([
            Dexterity.getQuote(vault.contractId, vault.tokenA.contractId, halfLpAmount),
            Dexterity.getQuote(vault.contractId, vault.tokenB.contractId, halfLpAmount),
            vault.quote(lpAmount, Opcode.removeLiquidity()) as Promise<Quote>
        ]);

        const salvage = {
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
            dx: sell.dx - salvage.dx,
            dy: sell.dy - salvage.dy,
            dk: sell.dk - salvage.dk
        }

        const result = {
            salvage: salvage,
            sell: sell,
            delta: delta,
            usd: {
                dx: (delta.dx * prices[vault.tokenA.contractId]) / 10 ** vault.tokenA.decimals,
                dy: (delta.dy * prices[vault.tokenB.contractId]) / 10 ** vault.tokenB.decimals
            }
        }

        // take action based on the best arbitrage opportunity
        if (result.usd.dx + result.usd.dy > 0) {
            console.log('Taking craft action:', result.usd.dx)
            // sell the tokens
            const sellTx1 = await Dexterity.router.executeSwap(swapQuote1.route, halfLpAmount)
            const sellTx2 = await Dexterity.router.executeSwap(swapQuote2.route, halfLpAmount)
            const addLiquidityTx = await vault.executeTransaction(Opcode.addLiquidity(), lpAmount, {})
            console.log('Sell and add liquidity transaction:', sellTx1, sellTx2, addLiquidityTx)

        } else if (result.usd.dx + result.usd.dy < 0) {
            console.log('Taking salvage action:', result.usd.dx)
            // salvage the tokens
            const removeLiquidityTx = await vault.executeTransaction(Opcode.removeLiquidity(), lpAmount, {})
            const buyTx1 = await Dexterity.executeSwap(vault.tokenA.contractId, vault.contractId, removeLiquidityQuote.amountIn)
            const buyTx2 = await Dexterity.executeSwap(vault.tokenB.contractId, vault.contractId, removeLiquidityQuote.amountOut)
            console.log('Remove liquidity and buy transaction:', removeLiquidityTx, buyTx1, buyTx2)
        }
        return result

    } catch (error) {
        console.error('Error processing vault:', error);
        return { vault: vault.contractName, error: error }
    }
}
