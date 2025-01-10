import PricesService from "@lib/server/prices/prices-service";
import { ContractId, Dexterity, Quote } from "dexterity-sdk";
import { Inngest, InngestMiddleware } from "inngest";

const blacklist = [
    'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.chdollar',
    'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.dmg-runes',
    'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.uahdmg',
    'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.dmg-lp-token',
    'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.stx-lp-token',
] as ContractId[];

const dexterityMiddleware = new InngestMiddleware({
    name: "Dexterity Middleware",
    async init() {

        // Initialize Dexterity SDK
        await Dexterity.configure({
            apiKeyRotation: 'loop',
            parallelRequests: 10,
            maxHops: 4
        })


        const prices = await PricesService.getInstance().getAllTokenPrices();

        await Dexterity.discover({ blacklist })

        return {
            onFunctionRun(ctx) {
                return {
                    transformInput(ctx) {
                        return {
                            // Anything passed via `ctx` will be merged with the function's arguments
                            ctx: {
                                ...ctx,
                                dex: Dexterity,
                                prices
                            },
                        };
                    },
                };
            },
        };
    },
});

// Create a client to send and receive events
export const inngest = new Inngest({ id: "dexterity", middleware: [dexterityMiddleware] });


export const swapper = inngest.createFunction(
    { id: "swapper" },
    { event: "swap" },
    async ({ dex, event, step }) => {
        let quote: any, tx: any
        await step.run(`get quote ${event.data.from} to ${event.data.to}`, async () => {
            quote = await dex.getQuote(event.data.from, event.data.to, event.data.amount)
        })
        if (!quote?.route?.hops?.length) return { quote }
        await step.run(`swap ${event.data.from} to ${event.data.to}`, async () => {
            tx = await dex.router.executeSwap(quote.route, event.data.amount, { fee: 1000 }) as any
        })
        return { quote, tx }
    },
);

export const balancer = inngest.createFunction(
    { id: "balancer" },
    { event: "balance" },
    async ({ dex, step, prices }) => {
        const tokens = dex.getTokens()
        // for all tokens
        const txs = []
        for (const token of tokens) {
            txs.push(await step.sendEvent(`swap`,
                {
                    name: 'swap',
                    data: {
                        from: token.contractId,
                        to: token.contractId,
                        amount: Math.floor(10 ** token.decimals / prices[token.contractId])
                    }
                }
            ))
        }
        return { txs }

    },
);
