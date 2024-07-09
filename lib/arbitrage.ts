import { getArbitrageTxsFromMempool } from "./stacks-api";

export async function runAll() {
    const config = getConfig();
    const txs = await getArbitrageTxsFromMempool('SPHFW52QXFX4S6JAM6EFR5JZ61MVEW8KBZ50Z3W.kraqen');

    console.log({ config, txs })

    //   for (const job of config.jobs) {
    //     if (!tsx.includes(job.txId)) {
    //       try {
    //         const result = await executeJob(job);
    //         await updateJobStatus(job.id, result);
    //       } catch (error) {
    //         console.error(`Error executing job ${job.id}:`, error);
    //         await updateJobStatus(job.id, { success: false, error: error.message });
    //       }
    //     }
    //   }

}

export function getConfig() {
    return {
        jobs: JSON.parse(process.env.ARBITRAGE_JOBS || '[]'),
        gasFee: process.env.GAS_FEE || 1000, // in STX
    };
}