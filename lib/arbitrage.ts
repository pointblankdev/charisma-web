import { uintCV } from "@stacks/transactions";
import { executeArbitrageStrategy, getArbitrageTxsFromMempool } from "./stacks-api";

const RESET_NONCE = false

export function getConfig() {
    return {
        jobs: [
            // { address: "SPHFW52QXFX4S6JAM6EFR5JZ61MVEW8KBZ50Z3W.kraqen", function: "execute1" },
            // { address: "SPHFW52QXFX4S6JAM6EFR5JZ61MVEW8KBZ50Z3W.kraqen", function: "execute2" },
            // { address: "SPHFW52QXFX4S6JAM6EFR5JZ61MVEW8KBZ50Z3W.kraqen", function: "execute3" },
            // { address: "SPHFW52QXFX4S6JAM6EFR5JZ61MVEW8KBZ50Z3W.kraqen", function: "execute4" },
            // { address: "SPHFW52QXFX4S6JAM6EFR5JZ61MVEW8KBZ50Z3W.kraqen", function: "execute7" },
            // { address: "SPHFW52QXFX4S6JAM6EFR5JZ61MVEW8KBZ50Z3W.kraqen", function: "execute8" },
            // { address: "SPHFW52QXFX4S6JAM6EFR5JZ61MVEW8KBZ50Z3W.kraqen", function: "execute9" },
            // { address: "SPHFW52QXFX4S6JAM6EFR5JZ61MVEW8KBZ50Z3W.kraqen", function: "execute10" },
            { address: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-stabilizer-v0", function: "execute-strategy-a", args: [uintCV(1000000000)] },
            { address: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-stabilizer-v0", function: "execute-strategy-b", args: [uintCV(1000000000)] },
            { address: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.arbitrage-w-s-sw-w-zf", function: "execute-strategy", args: [uintCV(100000000000)] },
            { address: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.icc-arb-2", function: "execute-strategy-a", args: [uintCV(1000000000)] },
            { address: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.icc-arb-2", function: "execute-strategy-b", args: [uintCV(1000000000), uintCV(50)] },
        ],
        gasFee: undefined, // in uSTX
    };
}

export async function runAll() {
    const config = getConfig();
    // const mempoolTxs1 = await getArbitrageTxsFromMempool('SPHFW52QXFX4S6JAM6EFR5JZ61MVEW8KBZ50Z3W.kraqen');
    const mempoolTxs2 = await getArbitrageTxsFromMempool('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-stabilizer-v0');
    const mempoolTxs3 = await getArbitrageTxsFromMempool('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.icc-arb-2');
    const mempoolTxs4 = await getArbitrageTxsFromMempool('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.arbitrage-w-s-sw-w-zf');

    // filter out jobs in mempool with receipt_time > 2 hours
    const now = new Date().getTime();
    const twoHoursAgo = now - 2 * 60 * 60 * 1000;
    const mempoolTxs = [...mempoolTxs2, ...mempoolTxs3, ...mempoolTxs4].filter((tx: any) => {
        console.log(tx.contract_call.function_name, tx.receipt_time, twoHoursAgo)
        return Number(tx.receipt_time) > (RESET_NONCE ? Infinity : twoHoursAgo);
    });

    console.log({ arbitrageJobs: config.jobs, gasFee: config.gasFee })
    console.log({ mempoolTxs: mempoolTxs.map((tx: any) => tx.txid) })

    // get highest none in mempool
    let highestNonce = mempoolTxs.reduce((acc: number, tx: any) => {
        return Math.max(acc, tx.nonce);
    }, 0);

    // run all jobs in config except ones still in the mempool
    const newJobs = config.jobs.filter((job: any) => {
        return !mempoolTxs.find((tx: any) => tx.contract_call.contract_id === job.address && tx.contract_call.function_name === job.function);
    });

    // run all jobs
    const broadcastedJobs = []
    for (const job of newJobs) {
        console.log(`Running job: ${job.function}`);
        const strategy: any = { address: job.address, functionName: job.function, fee: config.gasFee, args: job.args }

        if (highestNonce !== 0) { strategy.nonce = ++highestNonce }

        const newTx = await executeArbitrageStrategy(strategy)
        broadcastedJobs.push(newTx)
    }

    return broadcastedJobs
}