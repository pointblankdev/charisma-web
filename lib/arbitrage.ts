import { executeArbitrageStrategy, getArbitrageTxsFromMempool } from "./stacks-api";

export function getConfig() {
    return {
        jobs: JSON.parse(process.env.ARBITRAGE_JOBS || '[]'),
        gasFee: 25000, // in STX
    };
}

export async function runAll() {
    const config = getConfig();
    const mempoolTxs = await getArbitrageTxsFromMempool('SPHFW52QXFX4S6JAM6EFR5JZ61MVEW8KBZ50Z3W.kraqen');

    console.log({ arbitrageJobs: config.jobs, gasFee: config.gasFee })
    console.log({ mempoolTxs: mempoolTxs.map((tx: any) => tx) })

    // get highest none in mempool
    let highestNonce = mempoolTxs.reduce((acc: number, tx: any) => {
        return Math.max(acc, tx.nonce);
    }, 0);

    // run all jobs in config except ones still in the mempool
    const newJobs = config.jobs.filter((job: any) => {
        return !mempoolTxs.find((tx: any) => tx.contract_call.function_name === job.function);
    });

    // run all jobs
    const broadcastedJobs = []
    for (const job of newJobs) {
        console.log(`Running job: ${job.function}`);
        let newTx;
        if (highestNonce === 0) {
            newTx = await executeArbitrageStrategy(job.address, job.name, config.gasFee)
        } else {
            newTx = await executeArbitrageStrategy(job.address, job.name, config.gasFee, ++highestNonce)
        }
        broadcastedJobs.push(newTx)
    }

    return broadcastedJobs
}