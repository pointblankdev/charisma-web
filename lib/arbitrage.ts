import { getArbitrageTxsFromMempool } from "./stacks-api";

export async function runAll() {
    const config = getConfig();
    const txs = await getArbitrageTxsFromMempool('SPHFW52QXFX4S6JAM6EFR5JZ61MVEW8KBZ50Z3W.kraqen');

    console.log({ config, txs })

    // run all jobs in config except ones still in the mempool
    const jobs = config.jobs.filter((job: any) => {
        return !txs.find((tx: any) => tx.contract_call.function_name === job);
    });

    console.log({ jobs })
    return {}
}

export function getConfig() {
    return {
        jobs: JSON.parse(process.env.ARBITRAGE_JOBS || '[]'),
        gasFee: process.env.GAS_FEE || 1000, // in STX
    };
}