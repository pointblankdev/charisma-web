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

        // Calculate percentage differences for each token
        const deltaPercentA = Math.abs(delta.dx / salvage.dx);
        const deltaPercentB = Math.abs(delta.dy / salvage.dy);
        const errorMargin = Dexterity.config.defaultSlippage; // error margin

        // take action based on the best arbitrage opportunity
        if (deltaPercentA > errorMargin && deltaPercentB > errorMargin) {
            console.log('Taking craft action. Token A delta %:', deltaPercentA * 100, 'Token B delta %:', deltaPercentB * 100)
            // sell the tokens and add liquidity in parallel
            const [sellTx1, sellTx2, addLiquidityTx] = await Promise.all([
                Dexterity.router.executeSwap(swapQuote1.route, halfLpAmount),
                Dexterity.router.executeSwap(swapQuote2.route, halfLpAmount),
                vault.executeTransaction(Opcode.addLiquidity(), lpAmount, {})
            ]);
            console.log('Sell and add liquidity transaction:', sellTx1, sellTx2, addLiquidityTx)
        } else if (deltaPercentA > errorMargin && deltaPercentB > errorMargin) {
            console.log('Taking salvage action. Token A delta %:', deltaPercentA * 100, 'Token B delta %:', deltaPercentB * 100)
            // salvage the tokens and buy in parallel
            const [removeLiquidityTx, buyTx1, buyTx2] = await Promise.all([
                vault.executeTransaction(Opcode.removeLiquidity(), lpAmount, {}),
                Dexterity.executeSwap(vault.tokenA.contractId, vault.contractId, removeLiquidityQuote.amountIn),
                Dexterity.executeSwap(vault.tokenB.contractId, vault.contractId, removeLiquidityQuote.amountOut)
            ]);
            console.log('Remove liquidity and buy transaction:', removeLiquidityTx, buyTx1, buyTx2)
        } else {
            console.log('Difference within error margin. Token A delta %:', deltaPercentA * 100, 'Token B delta %:', deltaPercentB * 100)
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

        return result

    } catch (error) {
        console.error('Error processing vault:', error);
        return { vault: vault.contractName, error: error }
    }
}
