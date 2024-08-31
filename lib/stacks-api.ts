import {
  AccountsApi,
  BlocksApi,
  Configuration,
  FeesApi,
  NamesApi,
  SmartContractsApi,
  TransactionsApi
} from '@stacks/blockchain-api-client';
import {
  AnchorMode,
  boolCV,
  broadcastTransaction,
  callReadOnlyFunction,
  cvToHex,
  hexToCV,
  makeContractCall,
  parseToCV,
  PostConditionMode,
  principalCV,
  uintCV
} from '@stacks/transactions';
import { StacksMainnet } from '@stacks/network';
import { generateWallet } from '@stacks/wallet-sdk';
import { cvToJSON } from '@stacks/transactions';
import contractAbi from '../public/indexes/contract-abi.json';
import { getGlobalState } from './db-providers/kv';
import Logger from './logger';

const network = new StacksMainnet();

const apiConfig: Configuration = new Configuration({
  fetchApi: fetch,
  // for mainnet, replace `testnet` with `mainnet`
  basePath: 'https://api.mainnet.hiro.so', // defaults to http://localhost:3999
  // apiKey: process.env.STACKS_API_KEY,
  headers: {
    'x-hiro-api-key': String(process.env.STACKS_API_KEY)
  }
});

const scApi = new SmartContractsApi(apiConfig);
const blocksApi = new BlocksApi(apiConfig);
const txApi = new TransactionsApi(apiConfig);
const accountsApi = new AccountsApi(apiConfig);
const namesApi = new NamesApi(apiConfig);
const feesApi = new FeesApi(apiConfig);

export { scApi, blocksApi, txApi, accountsApi, namesApi, feesApi };

export async function getNameFromAddress(address: string) {
  const nameInfo = await namesApi.getNamesOwnedByAddress({
    blockchain: 'stacks',
    address: address
  });
  return nameInfo;
}

export async function getTokenStats() {
  const r: any = await callReadOnlyFunction({
    network: new StacksMainnet(),
    contractAddress: 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ',
    contractName: 'dme000-governance-token',
    functionName: 'get-total-supply',
    functionArgs: [],
    senderAddress: 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ'
  });

  const d: any = await callReadOnlyFunction({
    network: new StacksMainnet(),
    contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
    contractName: 'dme005-token-faucet-v0',
    functionName: 'get-drip-amount',
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
        // only add contract_call transactions
        const newTx: any = { args: {} };
        newTx.sender = result.sender_address;
        newTx.event = result.contract_call.function_name;
        result.contract_call.function_args.forEach((arg: any) => {
          let value;
          if (arg.type === 'uint') {
            value = Number(arg.repr.slice(1));
          } else if (arg.type === 'bool') {
            value = arg.repr === 'true';
          } else if (arg.type === 'principal') {
            value = arg.repr.slice(1);
          } else {
            // todo: handle other types
            value = arg.repr;
          }
          newTx.args[arg.name] = value;
        });
        transactions.push(newTx);
      }
    });
    offset += limit; // increment the offset for the next page
  }

  return transactions;
}

export function updateVoteData(proposals: any[], transactions: any[]) {
  const votes = transactions.filter(tx => tx.event === 'vote');

  votes.forEach(vote => {
    try {
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
    } catch (error) {
      console.log('Error updating vote data: ', error);
    }
  });

  return proposals;
}

export async function getProposals() {
  const block = await getGlobalState(`blocks:latest`);
  const latestBlock = block.height;

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

  const proposals: any[] = [];

  for (const r of accountsResp) {
    // only process successful proposal submissions
    if (r.tx?.contract_call?.function_name !== 'propose') continue;
    if (r.tx.tx_status !== 'success') continue;

    try {
      const args = r.tx.contract_call?.function_args;
      if (args) {
        const startBlockHeight = Number(args[1].repr.slice(1));
        const endBlockHeight = startBlockHeight + 1000; // update 1000 to use the parameter from the contract
        let status = '';
        if (latestBlock < startBlockHeight) {
          status = 'Pending';
        } else if (latestBlock < endBlockHeight) {
          status = 'Voting Active';
        } else {
          status = 'Voting Ended';
        }

        const [contractAddress, contractName] = args[0].repr.slice(1).split('.');

        const proposalSourceResp: any = await scApi.getContractSource({
          contractAddress,
          contractName
        });

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
          url: `https://explorer.hiro.so/txid/${contractPrincipal}?chain=mainnet`
        });
      }
    } catch (error) {
      console.error(error);
    }
  }
  return proposals;
}

// set quest complete
export async function setQuestComplete(address: string, questId: number, complete: boolean) {
  const password = String(process.env.STACKS_ORACLE_PASSWORD);
  const secretKey = String(process.env.STACKS_ORACLE_SECRET_KEY);

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
    fee: 250, // set a tx fee if you don't want the builder to estimate
    anchorMode: AnchorMode.Any
  };

  const transaction = await makeContractCall(txOptions);

  const broadcastResponse = await broadcastTransaction(transaction, network);

  return broadcastResponse;
}

export async function getStxQuestRewardsDeposited(address: string, questId: number) {
  const response: any = await callReadOnlyFunction({
    network: new StacksMainnet(),
    contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
    contractName: 'dme016-quest-ownership',
    functionName: 'get-quest-rewards-deposited',
    functionArgs: [uintCV(questId)],
    senderAddress: address
  });

  return cvToJSON(response);
}

export async function getStxProtocolFeePercentage(address: string) {
  const response: any = await callReadOnlyFunction({
    network: new StacksMainnet(),
    contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
    contractName: 'dme014-stx-rewards',
    functionName: 'get-fee-percentage',
    functionArgs: [],
    senderAddress: address
  });

  return cvToJSON(response);
}

export async function getQuestActivationBlock(address: string, questId: number) {
  const response: any = await callReadOnlyFunction({
    network: new StacksMainnet(),
    contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
    contractName: 'dme012-quest-activation',
    functionName: 'get-activation',
    functionArgs: [uintCV(questId)],
    senderAddress: address
  });

  return cvToJSON(response);
}

export async function getQuestExpirationBlock(address: string, questId: number) {
  const response: any = await callReadOnlyFunction({
    network: new StacksMainnet(),
    contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
    contractName: 'dme011-quest-expiration',
    functionName: 'get-expiration',
    functionArgs: [uintCV(questId)],
    senderAddress: address
  });

  return cvToJSON(response);
}

// check quest max completions
export async function getQuestMaxCompletions(address: string, questId: number) {
  const response: any = await callReadOnlyFunction({
    network: new StacksMainnet(),
    contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
    contractName: 'dme013-quest-max-completions',
    functionName: 'get-max-completions',
    functionArgs: [uintCV(questId)],
    senderAddress: address
  });

  return cvToJSON(response);
}

// check quest STX rewards
export async function checkQuestStxRewards(address: string, questId: number) {
  const response: any = await callReadOnlyFunction({
    network: new StacksMainnet(),
    contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
    contractName: 'dme014-stx-rewards',
    functionName: 'get-rewards',
    functionArgs: [uintCV(questId)],
    senderAddress: address
  });

  return cvToJSON(response);
}

// check if quest is complete and unlocked
export async function checkQuestCompleteAndUnlocked(address: string, questId: number) {
  const response: any = await callReadOnlyFunction({
    network: new StacksMainnet(),
    contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
    contractName: 'dme015-quest-reward-helper',
    functionName: 'is-completed-and-unlocked',
    functionArgs: [uintCV(questId)],
    senderAddress: address
  });

  return cvToJSON(response);
}

// check if quest is activated and not expired
export async function checkQuestActivatedAndUnexpired(address: string, questId: number) {
  const response: any = await callReadOnlyFunction({
    network: new StacksMainnet(),
    contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
    contractName: 'dme015-quest-reward-helper',
    functionName: 'is-activated-and-unexpired',
    functionArgs: [uintCV(questId)],
    senderAddress: address
  });

  return cvToJSON(response);
}

// check if quest is complete
export async function checkQuestComplete(address: string, questId: number) {
  const response: any = await callReadOnlyFunction({
    network: new StacksMainnet(),
    contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
    contractName: 'dme006-quest-completion',
    functionName: 'is-complete',
    functionArgs: [principalCV(address), uintCV(questId)],
    senderAddress: address
  });

  // console.log(cvToJSON(response))

  return response.value;
}

export async function checkQuestLocked(address: string, questId: number) {
  const response: any = await callReadOnlyFunction({
    network: new StacksMainnet(),
    contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
    contractName: 'dme009-charisma-rewards',
    functionName: 'is-locked',
    functionArgs: [principalCV(address), uintCV(questId)],
    senderAddress: address
  });

  return response.value;
}

export async function getQuestRewards(questId: number) {
  const response: any = await callReadOnlyFunction({
    network: new StacksMainnet(),
    contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
    contractName: 'dme009-charisma-rewards',
    functionName: 'get-rewards',
    functionArgs: [uintCV(questId)],
    senderAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS'
  });

  return cvToJSON(response);
}

export async function getTitleBeltHolder() {
  const response: any = await callReadOnlyFunction({
    network: new StacksMainnet(),
    contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
    contractName: 'dme023-wooo-title-belt-nft',
    functionName: 'get-title-holder',
    functionArgs: [],
    senderAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS'
  });

  return cvToJSON(response);
}

export async function getTitleBeltHoldeBalance() {
  const response: any = await callReadOnlyFunction({
    network: new StacksMainnet(),
    contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
    contractName: 'dme023-wooo-title-belt-nft',
    functionName: 'get-title-holder-balance',
    functionArgs: [],
    senderAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS'
  });

  return cvToJSON(response);
}

export async function getAccountAssets(principal: string) {
  const response: any = await accountsApi.getAccountAssets({
    principal
  });
  return response;
}

export async function getAccountBalance(principal: string) {
  const response: any = await accountsApi.getAccountBalance({
    principal
  });
  return response;
}

export async function getWooTitleBeltContractEvents() {
  const response = await scApi.getContractEventsById({
    contractId: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.dme022-wooo-title-belt-nft'
  });
  return response;
}

export async function getStakedTokenExchangeRate(contract: string) {
  const [address, name] = contract.split('.');

  const response: any = await callReadOnlyFunction({
    network: new StacksMainnet(),
    contractAddress: address,
    contractName: name,
    functionName: 'get-exchange-rate',
    functionArgs: [],
    senderAddress: address
  });

  return cvToJSON(response).value;
}

export async function getTokenBalance(contract: string, user: string) {
  const [address, name] = contract.split('.');
  const response: any = await scApi.callReadOnlyFunction({
    contractAddress: address,
    contractName: name,
    functionName: 'get-balance',
    readOnlyFunctionArgs: {
      sender: address,
      arguments: [cvToHex(parseToCV(String(user), 'principal'))]
    }
  });

  const result = hexToCV(response.result);
  const cv = cvToJSON(result).value.value;
  return Number(cv);
}

export async function getDeployedIndexes() {
  const response = await scApi.getContractsByTrait({
    traitAbi: JSON.stringify(contractAbi)
  });
  return response.results.map((r: any) => r.contract_id);
}

export async function getTokenURI(contract: string) {
  const [address, name] = contract.split('.');

  const response: any = await scApi.callReadOnlyFunction({
    contractAddress: address,
    contractName: name,
    functionName: 'get-token-uri',
    readOnlyFunctionArgs: {
      sender: address,
      arguments: []
    }
  });

  const result = hexToCV(response.result);
  const cv = cvToJSON(result);
  const tokenUri = cv.value.value.value;
  // console.log(tokenUri)
  const corsProxy = 'https://corsproxy.io/?';
  const res = await fetch(`${corsProxy}${tokenUri}`);
  const metadata = await res.json();
  return metadata;
}

export async function getNftURI(contract: string, tokenId: number) {
  try {
    const [address, name] = contract.split('.');

    const response: any = await scApi.callReadOnlyFunction({
      contractAddress: address,
      contractName: name,
      functionName: 'get-token-uri',
      readOnlyFunctionArgs: {
        sender: address,
        arguments: [cvToHex(parseToCV(String(tokenId), 'uint128'))]
      }
    });

    const result = hexToCV(response.result);
    const cv = cvToJSON(result);
    const url = cv.value.value.value.replace('{id}', tokenId);
    const metadata = await (await fetch(url)).json();
    return metadata;
  } catch (error) {
    return null;
  }
}

export async function getSymbol(contract: string): Promise<string> {
  const [address, name] = contract.split('.');

  const response: any = await callReadOnlyFunction({
    network: new StacksMainnet(),
    contractAddress: address,
    contractName: name,
    functionName: 'get-symbol',
    functionArgs: [],
    senderAddress: address
  });

  return cvToJSON(response).value.value;
}

export async function getDecimals(contract: string) {
  const [address, name] = contract.split('.');

  const response: any = await callReadOnlyFunction({
    network: new StacksMainnet(),
    contractAddress: address,
    contractName: name,
    functionName: 'get-decimals',
    functionArgs: [],
    senderAddress: address
  });

  return cvToJSON(response).value.value;
}

export async function getIsUnlocked(contract: string) {
  const [address, name] = contract.split('.');

  try {
    const response: any = await callReadOnlyFunction({
      network: new StacksMainnet(),
      contractAddress: address,
      contractName: name,
      functionName: 'is-unlocked',
      functionArgs: [],
      senderAddress: address
    });

    return cvToJSON(response)?.value?.value === true;
  } catch (error) {
    return true;
  }
}

export async function getBlockCounter(contract: string) {
  const [address, name] = contract.split('.');

  const response: any = await callReadOnlyFunction({
    network: new StacksMainnet(),
    contractAddress: address,
    contractName: name,
    functionName: 'get-block-counter',
    functionArgs: [],
    senderAddress: address
  });

  return Number(cvToJSON(response)?.value?.value);
}

export async function getGuestlist(contract: string) {
  const response: any = await callReadOnlyFunction({
    network: new StacksMainnet(),
    contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
    contractName: 'green-room',
    functionName: 'check-guestlist',
    functionArgs: [principalCV(contract)],
    senderAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS'
  });

  return cvToJSON(response)?.value ? true : false;
}

export async function getBlocksUntilUnlocked(contract: string) {
  const [address, name] = contract.split('.');

  try {
    const response: any = await callReadOnlyFunction({
      network: new StacksMainnet(),
      contractAddress: address,
      contractName: name,
      functionName: 'get-blocks-until-unlock',
      functionArgs: [],
      senderAddress: address
    });
    return Number(cvToJSON(response)?.value?.value);
  } catch (error) {
    return 0;
  }
}

export async function getTotalSupply(contract: string) {
  const [address, name] = contract.split('.');

  const response: any = await scApi.callReadOnlyFunction({
    contractAddress: address,
    contractName: name,
    functionName: 'get-total-supply',
    readOnlyFunctionArgs: {
      sender: address,
      arguments: []
    }
  });

  const cv = hexToCV(response.result);
  const json = cvToJSON(cv);
  return Number(json.value.value);
}

export async function getTotalInPool(contract: string) {
  const [address, name] = contract.split('.');

  let response: any;
  if (name === 'liquid-staked-odin') {
    response = await scApi.callReadOnlyFunction({
      contractAddress: address,
      contractName: name,
      functionName: 'get-total-odin-in-pool',
      readOnlyFunctionArgs: {
        sender: address,
        arguments: []
      }
    });
  } else if (name === 'liquid-staked-roo') {
    response = await scApi.callReadOnlyFunction({
      contractAddress: address,
      contractName: name,
      functionName: 'get-total-roo-in-pool',
      readOnlyFunctionArgs: {
        sender: address,
        arguments: []
      }
    });
  } else if (name === 'liquid-staked-welsh') {
    response = await scApi.callReadOnlyFunction({
      contractAddress: address,
      contractName: name,
      functionName: 'get-total-welsh-in-pool',
      readOnlyFunctionArgs: {
        sender: address,
        arguments: []
      }
    });
  } else
    try {
      const response = await scApi?.callReadOnlyFunction({
        contractAddress: address,
        contractName: name,
        functionName: 'get-total-in-pool',
        readOnlyFunctionArgs: {
          sender: address,
          arguments: []
        }
      });

      // Check if the response and response.result are valid
      if (!response || !response.result) {
        return 0; // Exit early since further processing will fail
      }

      // Now process the response.result with the valueOut function
      const valueOut = (value: any) => {
        try {
          const cv = hexToCV(value.result);
          const json = cvToJSON(cv);
          const valueOutResult = json.value?.value || json.value;

          return valueOutResult;
        } catch (error) {
          return 0; // Handle error in valueOut
        }
      };

      return Number(valueOut(response));
    } catch (error) {
      console.error('Error in callReadOnlyFunction:', error);
      return 0; // Handle error in callReadOnlyFunction
    }
}

export async function getFenrirTotalSupply() {
  const response: any = await callReadOnlyFunction({
    network: new StacksMainnet(),
    contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
    contractName: 'fenrir-corgi-of-ragnarok',
    functionName: 'get-total-supply',
    functionArgs: [],
    senderAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS'
  });

  return cvToJSON(response);
}

export async function getWooBalance(contract: string) {
  const response: any = await callReadOnlyFunction({
    network: new StacksMainnet(),
    contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
    contractName: contract,
    functionName: 'get-balance',
    functionArgs: [
      principalCV('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.woo-meme-world-champion')
    ],
    senderAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS'
  });

  return cvToJSON(response);
}

export async function getWooTotalSupply() {
  const response: any = await callReadOnlyFunction({
    network: new StacksMainnet(),
    contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
    contractName: 'woo-meme-world-champion',
    functionName: 'get-total-supply',
    functionArgs: [],
    senderAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS'
  });

  return cvToJSON(response);
}

export async function getAllCharismaWallets() {
  let offset = 0;
  const limit = 50;
  const wallets: any[] = [];
  const uniqueWallets: Set<string> = new Set();

  while (true) {
    const resp: any = await accountsApi.getAccountTransactions({
      principal: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.dme005-token-faucet-v0',
      limit: limit,
      offset: offset,
      unanchored: true
    });

    if (!resp.results || resp.results.length === 0) {
      break; // exit the loop if there are no more results
    }

    for (const r of resp.results) {
      if (!uniqueWallets.has(r.sender_address)) {
        uniqueWallets.add(r.sender_address);
        wallets.push(r.sender_address);
      }
    }

    offset += limit; // increment the offset for the next page
  }

  return wallets;
}

export async function getCraftingRewards(contract: string) {
  const response: any = await callReadOnlyFunction({
    network: new StacksMainnet(),
    contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
    contractName: contract,
    functionName: 'get-craft-reward-factor',
    functionArgs: [],
    senderAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS'
  });

  return cvToJSON(response);
}

export async function getIsWhitelisted(contract: string) {
  const response: any = await callReadOnlyFunction({
    network: new StacksMainnet(),
    contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
    contractName: 'lands',
    functionName: 'is-whitelisted',
    functionArgs: [principalCV(contract)],
    senderAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS'
  });

  return cvToJSON(response).value;
}

export async function getContractSource({ contractAddress, contractName }: any) {
  const proposalSourceResp = await scApi.getContractSource({ contractAddress, contractName });
  return proposalSourceResp;
}

export async function checkIfEpochIsEnding(contractAddress: string) {
  const [address, name] = contractAddress.split('.');
  const response = await scApi.callReadOnlyFunction({
    contractAddress: address,
    contractName: name,
    functionName: 'get-epoch-info',
    readOnlyFunctionArgs: {
      sender: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
      arguments: []
    }
  });
  const result = hexToCV((response as any).result);
  const epochInfo = cvToJSON(result).value.value;
  console.log('Epoch Info: ', epochInfo);
  // const mob = await getMob('hogger');
  // mob.hoggerDefeatBlock = Number(epochInfo['hogger-defeat-block'].value)
  // mob.canStartNewEpoch = epochInfo['can-start-new-epoch'].value
  // console.log('Mob: ', mob);
  return epochInfo;
}

export async function getTxsFromMempool(contractAddress: string) {
  let offset = 0;
  const limit = 50;
  const transactions: any[] = [];

  while (true) {
    const resp: any = await txApi.getAddressMempoolTransactions({
      address: contractAddress,
      limit: limit,
      offset: offset
    });

    if (!resp.results || resp.results.length === 0) {
      break; // exit the loop if there are no more results
    }

    resp.results.forEach((result: any) => {
      transactions.push(result);
    });
    offset += limit; // increment the offset for the next page
  }
  return transactions;
}

export async function tryCallContractPublicFunction({
  seedPhrase,
  password,
  publicAddress,
  contractAddress,
  functionName,
  fee,
  nonce,
  args
}: any) {
  const txsInMempool = await getTxsFromMempool(contractAddress);

  const isInMempool = txsInMempool.some(
    (tx: any) =>
      tx.contract_call.function_name === functionName && tx.sender_address === publicAddress
  );

  if (!isInMempool) {
    Logger.oracle({ 'players-job': { contractAddress, functionName, args } });

    const wallet = await generateWallet({ secretKey: seedPhrase, password });

    const account = wallet.accounts[0];

    const txOptions = {
      contractAddress: contractAddress.split('.')[0],
      contractName: contractAddress.split('.')[1],
      functionName: functionName,
      functionArgs: args || [],
      senderKey: account.stxPrivateKey,
      network,
      postConditionMode: PostConditionMode.Allow
    } as any;

    if (nonce) {
      txOptions.nonce = nonce;
    }

    // set a tx fee if you don't want the builder to estimate
    if (fee) {
      txOptions.fee = fee;
    }

    // console.log(txOptions)

    const transaction = await makeContractCall(txOptions);

    const broadcastResponse = await broadcastTransaction(transaction, network);

    return broadcastResponse;
  } else {
    return 'Transaction already in mempool';
  }
}

export async function callContractPublicFunction({ address, functionName, fee, nonce, args }: any) {
  // reset the epoch so that state can be updated
  const password = String(process.env.STACKS_ORACLE_PASSWORD);
  const secretKey = String(process.env.STACKS_ORACLE_SECRET_KEY);

  const wallet = await generateWallet({ secretKey, password });

  const account = wallet.accounts[0];

  const txOptions = {
    contractAddress: address.split('.')[0],
    contractName: address.split('.')[1],
    functionName: functionName,
    functionArgs: args || [],
    senderKey: account.stxPrivateKey,
    network,
    postConditionMode: PostConditionMode.Allow
  } as any;

  if (nonce) {
    txOptions.nonce = nonce;
  }

  // set a tx fee if you don't want the builder to estimate
  if (fee) {
    txOptions.fee = fee;
  }

  // console.log(txOptions)

  const transaction = await makeContractCall(txOptions);

  const broadcastResponse = await broadcastTransaction(transaction, network);

  return broadcastResponse;
}

export async function executeArbitrageStrategy({ address, functionName, fee, nonce, args }: any) {
  const password = String(process.env.STACKS_ORACLE_PASSWORD);
  const secretKey = String(process.env.STACKS_ORACLE_SECRET_KEY);

  const wallet = await generateWallet({ secretKey, password });

  const account = wallet.accounts[0];

  const txOptions = {
    contractAddress: address.split('.')[0],
    contractName: address.split('.')[1],
    functionName: functionName,
    functionArgs: args || [],
    senderKey: account.stxPrivateKey,
    network,
    postConditionMode: PostConditionMode.Allow
  } as any;

  if (nonce) {
    txOptions.nonce = nonce;
  }

  // set a tx fee if you don't want the builder to estimate
  if (fee) {
    txOptions.fee = fee;
  }

  // console.log(txOptions)

  const transaction = await makeContractCall(txOptions);

  const broadcastResponse = await broadcastTransaction(transaction, network);

  return broadcastResponse;
}

export async function getFeeEstimate(tx: string) {
  const response = await feesApi.postFeeTransaction({
    transactionFeeEstimateRequest: {
      transaction_payload: tx
    }
  });
  return response;
}

export async function getVelarSwapAmountOut({
  amountIn,
  tokenIn,
  tokenOut
}: {
  amountIn: number;
  tokenIn: string;
  tokenOut: string;
}) {
  const response: any = await callReadOnlyFunction({
    network: new StacksMainnet(),
    contractAddress: 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1',
    contractName: 'univ2-path2',
    functionName: 'amount-out',
    functionArgs: [uintCV(amountIn), principalCV(tokenIn), principalCV(tokenOut)],
    senderAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS'
  });

  return cvToJSON(response).value;
}

export async function getCreatureCost(
  creatureId: number,
  sender = 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ'
) {
  const response = await callReadOnlyFunction({
    network: new StacksMainnet(),
    contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
    contractName: 'creatures-core',
    functionName: 'get-creature-cost',
    functionArgs: [uintCV(creatureId)],
    senderAddress: sender
  });
  return Number(cvToJSON(response).value);
}

export async function getLandAmount(creatureId: number, sender: string) {
  const response = await scApi.callReadOnlyFunction({
    contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
    contractName: 'lands',
    functionName: 'get-balance',
    readOnlyFunctionArgs: {
      sender: sender,
      arguments: [
        cvToHex(parseToCV(String(creatureId), 'uint128')),
        cvToHex(parseToCV(sender, 'principal'))
      ]
    }
  });
  const result = hexToCV((response as any).result);
  return Number(cvToJSON(result).value.value);
}

export async function getOldCreatureAmount(creatureId: number, sender: string) {
  const response = await callReadOnlyFunction({
    network: new StacksMainnet(),
    contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
    contractName: 'creatures',
    functionName: 'get-balance',
    functionArgs: [uintCV(creatureId), principalCV(sender)],
    senderAddress: sender
  });
  return Number(cvToJSON(response).value.value);
}

export async function getCreaturePower(
  creatureId: number,
  sender = 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ'
) {
  const response = await scApi.callReadOnlyFunction({
    contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
    contractName: 'creatures-core',
    functionName: 'get-creature-power',
    readOnlyFunctionArgs: {
      sender: sender,
      arguments: [cvToHex(parseToCV(String(creatureId), 'uint128'))]
    }
  });
  const result = hexToCV((response as any).result);
  return Number(cvToJSON(result).value);
}

export async function getClaimableAmount(landId: number, sender: string) {
  const response = await scApi.callReadOnlyFunction({
    contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
    contractName: 'lands',
    functionName: 'get-untapped-amount',
    readOnlyFunctionArgs: {
      sender: sender,
      arguments: [
        cvToHex(parseToCV(String(landId), 'uint128')),
        cvToHex(parseToCV(sender, 'principal'))
      ]
    }
  });
  const result = hexToCV((response as any).result);
  return Number(cvToJSON(result).value.value);
}

export async function getStoredEnergy(sender: string) {
  const response = await scApi.callReadOnlyFunction({
    contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
    contractName: 'energy-storage',
    functionName: 'get-stored-energy',
    readOnlyFunctionArgs: {
      sender: sender,
      arguments: [
        cvToHex(parseToCV(sender, 'principal'))
      ]
    }
  });
  const result = hexToCV((response as any).result);
  return Number(cvToJSON(result).value);
}

export async function hasPercentageBalance(contract: string, who: string, factor: number) {
  const [address, name] = contract.split('.');
  const response = await scApi.callReadOnlyFunction({
    contractAddress: address,
    contractName: name,
    functionName: 'has-percentage-balance',
    readOnlyFunctionArgs: {
      sender: who,
      arguments: [
        cvToHex(parseToCV(who, 'principal')),
        cvToHex(parseToCV(String(factor), 'uint128'))
      ]
    }
  });
  const result = hexToCV((response as any).result);
  return cvToJSON(result).value.value;
}

export async function getLandBalance(landId: number, sender: string) {
  const response = await scApi.callReadOnlyFunction({
    contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
    contractName: 'lands',
    functionName: 'get-balance',
    readOnlyFunctionArgs: {
      sender: sender,
      arguments: [
        cvToHex(parseToCV(String(landId), 'uint128')),
        cvToHex(parseToCV(sender, 'principal'))
      ]
    }
  });
  const result = hexToCV((response as any).result);
  return Number(cvToJSON(result).value.value);
}

// get land id from contract address
export async function getLandId(contractAddress: string) {
  const response = await scApi.callReadOnlyFunction({
    contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
    contractName: 'lands',
    functionName: 'get-land-id',
    readOnlyFunctionArgs: {
      sender: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
      arguments: [cvToHex(parseToCV(contractAddress, 'principal'))]
    }
  });
  const result = hexToCV((response as any).result);
  return Number(cvToJSON(result).value.value);
}
export async function getLandContractById(id: number | string) {
  const response = await scApi.callReadOnlyFunction({
    contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
    contractName: 'lands',
    functionName: 'get-land-asset-contract',
    readOnlyFunctionArgs: {
      sender: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
      arguments: [cvToHex(parseToCV(String(id), 'uint128'))]
    }
  });
  const result = hexToCV((response as any).result);
  return String(cvToJSON(result).value.value);
}

export async function getNftOwner(contractAddress: string, id: number) {
  const [address, name] = contractAddress.split('.');
  const response = await scApi.callReadOnlyFunction({
    contractAddress: address,
    contractName: name,
    functionName: 'get-owner',
    readOnlyFunctionArgs: {
      sender: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
      arguments: [cvToHex(parseToCV(String(id), 'uint128'))]
    }
  });
  const result = hexToCV((response as any).result);
  return String(cvToJSON(result).value.value.value);
}
