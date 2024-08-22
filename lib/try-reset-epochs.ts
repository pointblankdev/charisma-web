import { TxBroadcastResult } from "@stacks/transactions";
import { getTxsFromMempool, callContractPublicFunction } from "./stacks-api";


export async function tryResetEpochs(contractJobs: any[]) {

    // Fetch mempool transactions concurrently
    const [mpt1] = await Promise.all([
        getTxsFromMempool('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wanted-hogger-v2'),
    ]);

    // if there as a try-reset-epoch or tap transaction in the mempoolTxs dont run job
    const newJobs = contractJobs.filter((job) => !mpt1.some((tx: any) => {
        return tx.contract_call.function_name === job.function
    }));

    // Run all jobs concurrently
    const jobPromises = newJobs.map((job: { function: string | PromiseLike<string>; address: any; args: any; }, index: number) =>
        new Promise((resolve) => {
            setTimeout(() => {
                console.log(`Running job: ${job.function}`);
                const strategy: any = {
                    address: job.address,
                    functionName: job.function,
                    fee: 10000,
                    args: job.args
                };
                callContractPublicFunction(strategy)
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
    return []
}