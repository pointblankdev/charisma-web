import { TxBroadcastResult, uintCV } from "@stacks/transactions";
import { executeArbitrageStrategy, getTxsFromMempool } from "./stacks-api";

export function getConfig() {
    return {
        jobs: [
            { address: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-stabilizer-v0", function: "execute-strategy-a", args: [uintCV(1000000000)] },
            { address: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-stabilizer-v0", function: "execute-strategy-b", args: [uintCV(1000000000)] },
            // { address: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.icc-stabilizer-v0", function: "execute-strategy-a", args: [uintCV(1000000000)] },
            // { address: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.icc-stabilizer-v0", function: "execute-strategy-b", args: [uintCV(1000000000), uintCV(50)] },
        ],
        fee: 10000, // in uSTX
    };
}

export async function runAll() {
    const config = getConfig();

    // Fetch mempool transactions concurrently
    const [mpt1] = await Promise.all([
        getTxsFromMempool('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-stabilizer-v0'),
        // getTxsFromMempool('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.icc-stabilizer-v0'),
    ]);

    // filter for only real mempool transactions and not stale ones
    const mempoolTxs = [...mpt1].filter((tx: any) => tx.receipt_time > (Date.now() / 1000) - 5000);

    // Filter out jobs in mempool
    const newJobs = config.jobs.filter((job: any) =>
        !mempoolTxs.find((tx: any) =>
            tx.contract_call.contract_id === job.address &&
            tx.contract_call.function_name === job.function
        )
    );

    // console.log({
    //     arbitrageJobs: config.jobs.map((job: { address: any; function: any; }) => `${job.address}::${job.function}`),
    //     newJobs: newJobs.map((job: { address: any; function: any; }) => `${job.address}::${job.function}`),
    //     fee: config.fee,
    //     mempoolTxs: mempoolTxs.length
    // });

    // Run all jobs concurrently
    const jobPromises = newJobs.map((job: { function: string | PromiseLike<string>; address: any; args: any; }, index: number) =>
        new Promise((resolve) => {
            setTimeout(() => {
                // console.log(`Running job: ${job.function}`);
                const strategy: any = {
                    address: job.address,
                    functionName: job.function,
                    fee: config.fee,
                    args: job.args
                };
                executeArbitrageStrategy(strategy)
                    .then(() => resolve(strategy))
                    .catch((error) => {
                        console.error(`Error executing job ${job.function}:`, error);
                        resolve(strategy);
                    });
            }, index * 3000); // Stagger job execution by 3 seconds to get new nonce
        })
    );

    const jobs = (await Promise.all(jobPromises)) as TxBroadcastResult[];
    return jobs.map((job) => job.txid);
}