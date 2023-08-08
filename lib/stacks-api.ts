import { AccountsApi, BlocksApi, Configuration, SmartContractsApi, TransactionsApi } from "@stacks/blockchain-api-client";

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