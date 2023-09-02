import { AccountsApi, BlocksApi, Configuration, SmartContractsApi, TransactionsApi } from "@stacks/blockchain-api-client";
import { AnchorMode, boolCV, broadcastTransaction, callReadOnlyFunction, makeContractCall, principalCV, uintCV } from "@stacks/transactions";
import { StacksMainnet } from "@stacks/network";
import { generateWallet } from "@stacks/wallet-sdk";
import { getAllWallets } from "./cms-api";

const network = new StacksMainnet();

const apiConfig: Configuration = new Configuration({
    fetchApi: fetch,
    // for mainnet, replace `testnet` with `mainnet`
    basePath: 'https://api.mainnet.hiro.so', // defaults to http://localhost:3999
});

const scApi = new SmartContractsApi(apiConfig);
const blocksApi = new BlocksApi(apiConfig);
const txApi = new TransactionsApi(apiConfig);
const accountsApi = new AccountsApi(apiConfig);

export {
    scApi,
    blocksApi,
    txApi,
    accountsApi
}


export async function fetchAllClaims() {
    let offset = 0;
    const limit = 50;
    const uniqueWallets: Set<string> = new Set();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    let uniqueWalletsLast7Days = 0;

    while (true) {
        const f: any = await accountsApi.getAccountTransactionsWithTransfers({
            principal: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.dme005-token-faucet-v0',
            limit: limit,
            offset: offset
        });

        if (!f.results.length) {
            break; // exit the loop if there are no more results
        }

        f.results.forEach((r: any) => {
            const txDate = new Date(r.tx.burn_block_time_iso);
            if (r.tx.contract_call?.function_name === 'claim' && r.tx.tx_result.repr === '(ok true)') {
                const size = uniqueWallets.size;
                uniqueWallets.add(r.tx.sender_address);
                // if the size of the set has changed, then a new wallet has been added
                if (size !== uniqueWallets.size) {
                    if (txDate > oneWeekAgo) {
                        uniqueWalletsLast7Days++;
                    }
                }
            }
        });

        offset += limit; // increment the offset for the next page
    }

    const totalUniqueWallets = uniqueWallets.size;
    const percentChange = (uniqueWalletsLast7Days / totalUniqueWallets) * 100;

    const wallets = await getAllWallets()
    const walletBalances = wallets.map((wallet) => ({ primary: wallet.stxaddress, secondary: wallet.charisma }))

    console.log(`Total unique wallets that claimed the token: ${totalUniqueWallets}`);
    console.log(`Percentage of new unique wallets in the last 7 days: ${percentChange.toFixed(2)}%`);

    return {
        walletBalances: walletBalances.sort((a, b) => b.secondary - a.secondary).slice(0, 20),
        totalUniqueWallets: totalUniqueWallets,
        percentChange: percentChange
    };
}

export async function getTokenStats() {
    const r: any = await callReadOnlyFunction({
        network: new StacksMainnet(),
        contractAddress: "SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ",
        contractName: "dme000-governance-token",
        functionName: "get-total-supply",
        functionArgs: [],
        senderAddress: 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ'
    });

    const d: any = await callReadOnlyFunction({
        network: new StacksMainnet(),
        contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
        contractName: "dme005-token-faucet-v0",
        functionName: "get-drip-amount",
        functionArgs: [],
        senderAddress: 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ'
    });
    return { totalSupply: Number(r.value.value), dripAmount: Number(d.value.value) };
}

export async function fetchAllContractTransactions(principal: string) {
    let offset = 0;
    const limit = 50;
    const transactions: any[] = [];

    while (true) {
        const resp: any = await accountsApi.getAccountTransactions({
            principal,
            limit: limit,
            offset: offset,
            unanchored: true
        });

        if (!resp.results || resp.results.length === 0) {
            break; // exit the loop if there are no more results
        }

        resp.results.forEach((result: any) => {
            if (result.contract_call && result.tx_status === 'success') {
                // console.log(result)
                // only add contract_call transactions
                const newTx: any = { args: {} }
                newTx.sender = result.sender_address
                newTx.event = result.contract_call.function_name
                result.contract_call.function_args.forEach((arg: any) => {
                    let value;
                    if (arg.type === 'uint') {
                        value = Number((arg.repr).slice(1))
                    } else if (arg.type === 'bool') {
                        value = arg.repr === 'true'
                    } else if (arg.type === 'principal') {
                        value = arg.repr.slice(1)
                    } else {
                        // todo: handle other types
                        value = arg.repr
                    }
                    newTx.args[arg.name] = value
                })
                transactions.push(newTx)
            }
        })
        offset += limit; // increment the offset for the next page
    }

    return transactions;

}

export function updateVoteData(proposals: any[], transactions: any[]) {

    const votes = transactions.filter((tx) => tx.event === 'vote')

    votes.forEach(vote => {
        // Find the entry in the proposals array that matches the name
        const proposal = proposals.find(proposal => proposal.name === vote.args.proposal);

        if (vote.args.for) {
            proposal.amount += vote.args.amount;
        } else {
            proposal.against += vote.args.amount;
        }

        if (proposal.status !== 'Voting Active' && proposal.status !== 'Pending') {

            if (proposal.amount > proposal.against) {
                proposal.status = 'Passed';
            } else {
                proposal.status = 'Failed';
            }
        }

    });

    return proposals;
}

export async function getProposals() {

    const { results } = await blocksApi.getBlockList({ limit: 1 })
    const latestBlock = Number(results[0].height)

    const accountsResp: any = await accountsApi.getAccountTransactionsWithTransfers({
        principal: 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme002-proposal-submission',
    });

    const proposals: any[] = [];

    for (const r of accountsResp.results) {
        const args = r.tx.contract_call?.function_args;
        if (args) {
            const startBlockHeight = Number(args[1].repr.slice(1));
            const endBlockHeight = startBlockHeight + 1440;
            let status = '';
            if (latestBlock < startBlockHeight) {
                status = 'Pending';
            } else if (latestBlock < endBlockHeight) {
                status = 'Voting Active';
            } else {
                status = 'Voting Ended';
            }

            const [contractAddress, contractName] = args[0].repr.slice(1).split('.');

            const proposalSourceResp: any = await scApi.getContractSource({ contractAddress, contractName });

            const contractPrincipal = `${contractAddress}.${contractName}`;
            proposals.push({
                id: args[0].repr.split('.')[1],
                name: contractPrincipal,
                source: proposalSourceResp.source,
                startBlockHeight,
                endBlockHeight: endBlockHeight,
                amount: 0,
                against: 0,
                status,
                url: `https://explorer.hiro.so/txid/${contractPrincipal}?chain=mainnet`,
            });
        }
    }
    return proposals;
}

// set quest complete
export async function setQuestComplete(address: string, questId: number, complete: boolean) {

    const password = String(process.env.STACKS_ORACLE_PASSWORD);
    const secretKey = String(process.env.STACKS_ORACLE_SECRET_KEY)

    const wallet = await generateWallet({ secretKey, password });

    const account = wallet.accounts[0];

    const txOptions = {
        contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
        contractName: 'dme007-quest-completion-oracle',
        functionName: 'set-complete',
        functionArgs: [principalCV(address), uintCV(questId), boolCV(complete)],
        senderKey: account.stxPrivateKey,
        validateWithAbi: true,
        network,
        postConditions: [],
        fee: 225, // set a tx fee if you don't want the builder to estimate
        anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);

    const broadcastResponse = await broadcastTransaction(transaction, network);

    return broadcastResponse
}

// check if quest is complete
export async function checkQuestComplete(address: string, questId: number) {

    const response: any = await callReadOnlyFunction({
        network: new StacksMainnet(),
        contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
        contractName: "dme006-quest-completion",
        functionName: "is-complete",
        functionArgs: [principalCV(address), uintCV(questId)],
        senderAddress: 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ'
    });

    return response.value
}