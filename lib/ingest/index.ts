import { ContractId, Dexterity } from "dexterity-sdk";
import { Inngest } from "inngest";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "dexterity" });

// Reference to existing Dexterity configuration from:
const blacklist = [
    'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.chdollar',
    'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.dmg-runes',
    'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.uahdmg',
    'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.dmg-lp-token',
    'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.stx-lp-token',
] as ContractId[];

export const swap = inngest.createFunction(
    { id: "swap" },
    { event: "swap" },
    async ({ event, step }) => {
        console.log('Dexterity Swap Execution')

        // Initialize Dexterity SDK
        await Dexterity.configure({
            apiKeys: process.env.HIRO_API_KEYS!.split(','),
            apiKeyRotation: 'loop',
            parallelRequests: 10,
            maxHops: 4
        })

        await Dexterity.discover({ blacklist });

        const tx = await Dexterity.executeSwap(event.data.from, event.data.to, event.data.amount, { fee: 1000 }) as any

        if (tx.error) throw new Error(tx.error)
        return { tx }
    },
);