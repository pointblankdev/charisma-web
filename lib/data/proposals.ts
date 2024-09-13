import { accountsApi } from "../stacks-api";

export const getProposals = async () => {

  // const block = await getGlobalState(`blocks:latest`);
  // const latestBlock = block.height;

  const limit = 50;
  let offset = 0;
  const accountsResp: any[] = [];

  while (true) {
    const resp: any = await accountsApi.getAccountTransactionsWithTransfers({
      principal: 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme002-proposal-submission',
      limit: limit,
      offset: offset
    });

    if (!resp.results || resp.results.length === 0) {
      break; // exit the loop if there are no more results
    }

    accountsResp.push(...resp.results);
    offset += limit; // increment the offset for the next page
  }

  return accountsResp;
}

export const getVotes = async (proposalId: string) => {
  const limit = 50;
  let offset = 0;
  const accountsResp: any[] = [];

  while (true) {
    const resp: any = await accountsApi.getAccountTransactionsWithTransfers({
      principal: 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme001-proposal-voting',
      limit: limit,
      offset: offset
    });

    if (!resp.results || resp.results.length === 0) {
      break; // exit the loop if there are no more results
    }

    accountsResp.push(...resp.results);
    offset += limit; // increment the offset for the next page
  }

  return accountsResp;
}