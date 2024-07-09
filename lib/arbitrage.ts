import { executeArbitrageStrategy, getArbitrageTxsFromMempool } from "./stacks-api";

export async function runAll() {
    const config = getConfig();
    // const mempoolTxs = await getArbitrageTxsFromMempool('SPHFW52QXFX4S6JAM6EFR5JZ61MVEW8KBZ50Z3W.kraqen');
    const mempoolTxs = await getArbitrageTxsFromMempool('SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.univ2-router');

    console.log({ config, mempoolTxs: mempoolTxs.map((tx: any) => tx.contract_call.function_name) })

    // run all jobs in config except ones still in the mempool
    const jobs = config.jobs.filter((job: any) => {
        return !mempoolTxs.find((tx: any) => tx.contract_call.function_name === job);
    });

    console.log({ jobs })

    // run all jobs
    for (const job of jobs) {
        console.log(`Running job: ${job}`);
        // await executeArbitrageStrategy('SPHFW52QXFX4S6JAM6EFR5JZ61MVEW8KBZ50Z3W.kraqen', job, config.gasFee);
    }
    return {}
}

export function getConfig() {
    return {
        jobs: JSON.parse(process.env.ARBITRAGE_JOBS || '[]'),
        gasFee: Number(process.env.GAS_FEE || 1000), // in STX
    };
}