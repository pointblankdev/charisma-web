
import type { TypedAbiArg, TypedAbiFunction, TypedAbiMap, TypedAbiVariable, Response } from '@clarigen/core';

export const contracts = {
  daoTraitsV2: {
  "functions": {
    
  },
  "maps": {
    
  },
  "variables": {
    
  },
  constants: {},
  "non_fungible_tokens": [
    
  ],
  "fungible_tokens":[],"epoch":"Epoch21","clarity_version":"Clarity1",
  contractName: 'dao-traits-v2',
  },
dungeonMaster: {
  "functions": {
    isSelfOrExtension: {"name":"is-self-or-extension","access":"private","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>,
    setExtensionsIter: {"name":"set-extensions-iter","access":"private","args":[{"name":"item","type":{"tuple":[{"name":"enabled","type":"bool"},{"name":"extension","type":"principal"}]}}],"outputs":{"type":"bool"}} as TypedAbiFunction<[item: TypedAbiArg<{
  "enabled": boolean;
  "extension": string;
}, "item">], boolean>,
    construct: {"name":"construct","access":"public","args":[{"name":"proposal","type":"trait_reference"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[proposal: TypedAbiArg<string, "proposal">], Response<boolean, bigint>>,
    execute: {"name":"execute","access":"public","args":[{"name":"proposal","type":"trait_reference"},{"name":"sender","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[proposal: TypedAbiArg<string, "proposal">, sender: TypedAbiArg<string, "sender">], Response<boolean, bigint>>,
    requestExtensionCallback: {"name":"request-extension-callback","access":"public","args":[{"name":"extension","type":"trait_reference"},{"name":"memo","type":{"buffer":{"length":34}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[extension: TypedAbiArg<string, "extension">, memo: TypedAbiArg<Uint8Array, "memo">], Response<boolean, bigint>>,
    setExtension: {"name":"set-extension","access":"public","args":[{"name":"extension","type":"principal"},{"name":"enabled","type":"bool"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[extension: TypedAbiArg<string, "extension">, enabled: TypedAbiArg<boolean, "enabled">], Response<boolean, bigint>>,
    setExtensions: {"name":"set-extensions","access":"public","args":[{"name":"extension-list","type":{"list":{"type":{"tuple":[{"name":"enabled","type":"bool"},{"name":"extension","type":"principal"}]},"length":200}}}],"outputs":{"type":{"response":{"ok":{"list":{"type":"bool","length":200}},"error":"uint128"}}}} as TypedAbiFunction<[extensionList: TypedAbiArg<{
  "enabled": boolean;
  "extension": string;
}[], "extensionList">], Response<boolean[], bigint>>,
    executedAt: {"name":"executed-at","access":"read_only","args":[{"name":"proposal","type":"trait_reference"}],"outputs":{"type":{"optional":"uint128"}}} as TypedAbiFunction<[proposal: TypedAbiArg<string, "proposal">], bigint | null>,
    isExtension: {"name":"is-extension","access":"read_only","args":[{"name":"extension","type":"principal"}],"outputs":{"type":"bool"}} as TypedAbiFunction<[extension: TypedAbiArg<string, "extension">], boolean>
  },
  "maps": {
    executedProposals: {"name":"executed-proposals","key":"principal","value":"uint128"} as TypedAbiMap<string, bigint>,
    extensions: {"name":"extensions","key":"principal","value":"bool"} as TypedAbiMap<string, boolean>
  },
  "variables": {
    errAlreadyExecuted: {
  name: 'err-already-executed',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    errInvalidExtension: {
  name: 'err-invalid-extension',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    errUnauthorized: {
  name: 'err-unauthorized',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    executive: {
  name: 'executive',
  type: 'principal',
  access: 'variable'
} as TypedAbiVariable<string>
  },
  constants: {
  errAlreadyExecuted: {
    isOk: false,
    value: 1_001n
  },
  errInvalidExtension: {
    isOk: false,
    value: 1_002n
  },
  errUnauthorized: {
    isOk: false,
    value: 1_000n
  },
  executive: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'
},
  "non_fungible_tokens": [
    
  ],
  "fungible_tokens":[],"epoch":"Epoch21","clarity_version":"Clarity1",
  contractName: 'dungeon-master',
  },
kraqenLotto: {
  "functions": {
    isDaoOrExtension: {"name":"is-dao-or-extension","access":"private","args":[],"outputs":{"type":"bool"}} as TypedAbiFunction<[], boolean>,
    min: {"name":"min","access":"private","args":[{"name":"a","type":"uint128"},{"name":"b","type":"uint128"}],"outputs":{"type":"uint128"}} as TypedAbiFunction<[a: TypedAbiArg<number | bigint, "a">, b: TypedAbiArg<number | bigint, "b">], bigint>,
    mint: {"name":"mint","access":"private","args":[{"name":"recipient","type":"principal"}],"outputs":{"type":{"response":{"ok":"uint128","error":"uint128"}}}} as TypedAbiFunction<[recipient: TypedAbiArg<string, "recipient">], Response<bigint, bigint>>,
    mintMultiple: {"name":"mint-multiple","access":"private","args":[{"name":"recipient","type":"principal"},{"name":"count","type":"uint128"}],"outputs":{"type":{"response":{"ok":"uint128","error":"uint128"}}}} as TypedAbiFunction<[recipient: TypedAbiArg<string, "recipient">, count: TypedAbiArg<number | bigint, "count">], Response<bigint, bigint>>,
    setTokenUri: {"name":"set-token-uri","access":"public","args":[{"name":"new-uri","type":{"string-ascii":{"length":200}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[newUri: TypedAbiArg<string, "newUri">], Response<boolean, bigint>>,
    setWhitelistedEdk: {"name":"set-whitelisted-edk","access":"public","args":[{"name":"edk","type":"principal"},{"name":"whitelisted","type":"bool"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[edk: TypedAbiArg<string, "edk">, whitelisted: TypedAbiArg<boolean, "whitelisted">], Response<boolean, bigint>>,
    tap: {"name":"tap","access":"public","args":[{"name":"land-id","type":"uint128"},{"name":"edk-contract","type":"trait_reference"}],"outputs":{"type":{"response":{"ok":"uint128","error":"uint128"}}}} as TypedAbiFunction<[landId: TypedAbiArg<number | bigint, "landId">, edkContract: TypedAbiArg<string, "edkContract">], Response<bigint, bigint>>,
    transfer: {"name":"transfer","access":"public","args":[{"name":"token-id","type":"uint128"},{"name":"sender","type":"principal"},{"name":"recipient","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[tokenId: TypedAbiArg<number | bigint, "tokenId">, sender: TypedAbiArg<string, "sender">, recipient: TypedAbiArg<string, "recipient">], Response<boolean, bigint>>,
    getLastTokenId: {"name":"get-last-token-id","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"uint128","error":"none"}}}} as TypedAbiFunction<[], Response<bigint, null>>,
    getOwner: {"name":"get-owner","access":"read_only","args":[{"name":"token-id","type":"uint128"}],"outputs":{"type":{"response":{"ok":{"optional":"principal"},"error":"none"}}}} as TypedAbiFunction<[tokenId: TypedAbiArg<number | bigint, "tokenId">], Response<string | null, null>>,
    getTokenUri: {"name":"get-token-uri","access":"read_only","args":[{"name":"token-id","type":"uint128"}],"outputs":{"type":{"response":{"ok":{"optional":{"string-ascii":{"length":200}}},"error":"none"}}}} as TypedAbiFunction<[tokenId: TypedAbiArg<number | bigint, "tokenId">], Response<string | null, null>>,
    isAuthorized: {"name":"is-authorized","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>,
    isWhitelistedEdk: {"name":"is-whitelisted-edk","access":"read_only","args":[{"name":"edk","type":"principal"}],"outputs":{"type":"bool"}} as TypedAbiFunction<[edk: TypedAbiArg<string, "edk">], boolean>
  },
  "maps": {
    whitelistedEdks: {"name":"whitelisted-edks","key":"principal","value":"bool"} as TypedAbiMap<string, boolean>
  },
  "variables": {
    CHA_AMOUNT: {
  name: 'CHA_AMOUNT',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    COLLECTION_LIMIT: {
  name: 'COLLECTION_LIMIT',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    ENERGY_PER_NFT: {
  name: 'ENERGY_PER_NFT',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    ERR_INVALID_EDK: {
  name: 'ERR_INVALID_EDK',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NOT_TOKEN_OWNER: {
  name: 'ERR_NOT_TOKEN_OWNER',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_SOLD_OUT: {
  name: 'ERR_SOLD_OUT',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_UNAUTHORIZED: {
  name: 'ERR_UNAUTHORIZED',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    MAX_NFTS_PER_TX: {
  name: 'MAX_NFTS_PER_TX',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    OWNER: {
  name: 'OWNER',
  type: 'principal',
  access: 'constant'
} as TypedAbiVariable<string>,
    STX_PER_MINT: {
  name: 'STX_PER_MINT',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    baseUri: {
  name: 'base-uri',
  type: {
    'string-ascii': {
      length: 200
    }
  },
  access: 'variable'
} as TypedAbiVariable<string>,
    lastTokenId: {
  name: 'last-token-id',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>
  },
  constants: {
  CHA_AMOUNT: 5_000_000n,
  COLLECTION_LIMIT: 1_000n,
  ENERGY_PER_NFT: 1_000n,
  ERR_INVALID_EDK: {
    isOk: false,
    value: 400n
  },
  ERR_NOT_TOKEN_OWNER: {
    isOk: false,
    value: 101n
  },
  ERR_SOLD_OUT: {
    isOk: false,
    value: 300n
  },
  ERR_UNAUTHORIZED: {
    isOk: false,
    value: 100n
  },
  MAX_NFTS_PER_TX: 4n,
  OWNER: 'SPGYCP878RYFVT03ZT8TWGPKNYTSQB1578VVXHGE',
  STX_PER_MINT: 1_000_000n,
  baseUri: 'https://charisma.rocks/api/v0/nfts/SPGYCP878RYFVT03ZT8TWGPKNYTSQB1578VVXHGE.kraqen-lotto/{id}.json',
  lastTokenId: 0n
},
  "non_fungible_tokens": [
    {"name":"kraqen-lotto","type":"uint128"}
  ],
  "fungible_tokens":[],"epoch":"Epoch21","clarity_version":"Clarity1",
  contractName: 'kraqen-lotto',
  },
lands: {
  "functions": {
    getBalanceUint: {"name":"get-balance-uint","access":"private","args":[{"name":"land-id","type":"uint128"},{"name":"user","type":"principal"}],"outputs":{"type":"uint128"}} as TypedAbiFunction<[landId: TypedAbiArg<number | bigint, "landId">, user: TypedAbiArg<string, "user">], bigint>,
    getTotalSupplyUint: {"name":"get-total-supply-uint","access":"private","args":[{"name":"land-id","type":"uint128"}],"outputs":{"type":"uint128"}} as TypedAbiFunction<[landId: TypedAbiArg<number | bigint, "landId">], bigint>,
    setBalance: {"name":"set-balance","access":"private","args":[{"name":"land-id","type":"uint128"},{"name":"balance","type":"uint128"},{"name":"user","type":"principal"}],"outputs":{"type":{"response":{"ok":{"response":{"ok":{"tuple":[{"name":"land-id","type":"uint128"},{"name":"owner","type":"principal"},{"name":"stored-energy","type":"uint128"},{"name":"type","type":{"string-ascii":{"length":12}}}]},"error":"none"}},"error":"none"}}}} as TypedAbiFunction<[landId: TypedAbiArg<number | bigint, "landId">, balance: TypedAbiArg<number | bigint, "balance">, user: TypedAbiArg<string, "user">], Response<Response<{
  "landId": bigint;
  "owner": string;
  "storedEnergy": bigint;
  "type": string;
}, null>, null>>,
    store: {"name":"store","access":"private","args":[{"name":"land-id","type":"uint128"},{"name":"user","type":"principal"}],"outputs":{"type":{"response":{"ok":{"tuple":[{"name":"land-id","type":"uint128"},{"name":"owner","type":"principal"},{"name":"stored-energy","type":"uint128"},{"name":"type","type":{"string-ascii":{"length":12}}}]},"error":"none"}}}} as TypedAbiFunction<[landId: TypedAbiArg<number | bigint, "landId">, user: TypedAbiArg<string, "user">], Response<{
  "landId": bigint;
  "owner": string;
  "storedEnergy": bigint;
  "type": string;
}, null>>,
    tagId: {"name":"tag-id","access":"private","args":[{"name":"id","type":{"tuple":[{"name":"land-id","type":"uint128"},{"name":"owner","type":"principal"}]}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[id: TypedAbiArg<{
  "landId": number | bigint;
  "owner": string;
}, "id">], Response<boolean, bigint>>,
    transferManyIter: {"name":"transfer-many-iter","access":"private","args":[{"name":"item","type":{"tuple":[{"name":"amount","type":"uint128"},{"name":"recipient","type":"principal"},{"name":"sender","type":"principal"},{"name":"token-id","type":"uint128"}]}},{"name":"previous-response","type":{"response":{"ok":"bool","error":"uint128"}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[item: TypedAbiArg<{
  "amount": number | bigint;
  "recipient": string;
  "sender": string;
  "tokenId": number | bigint;
}, "item">, previousResponse: TypedAbiArg<Response<boolean, number | bigint>, "previousResponse">], Response<boolean, bigint>>,
    transferManyMemoIter: {"name":"transfer-many-memo-iter","access":"private","args":[{"name":"item","type":{"tuple":[{"name":"amount","type":"uint128"},{"name":"memo","type":{"buffer":{"length":34}}},{"name":"recipient","type":"principal"},{"name":"sender","type":"principal"},{"name":"token-id","type":"uint128"}]}},{"name":"previous-response","type":{"response":{"ok":"bool","error":"uint128"}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[item: TypedAbiArg<{
  "amount": number | bigint;
  "memo": Uint8Array;
  "recipient": string;
  "sender": string;
  "tokenId": number | bigint;
}, "item">, previousResponse: TypedAbiArg<Response<boolean, number | bigint>, "previousResponse">], Response<boolean, bigint>>,
    getOrCreateLandId: {"name":"get-or-create-land-id","access":"public","args":[{"name":"sip010-asset","type":"trait_reference"}],"outputs":{"type":{"response":{"ok":"uint128","error":"uint128"}}}} as TypedAbiFunction<[sip010Asset: TypedAbiArg<string, "sip010Asset">], Response<bigint, bigint>>,
    setLandDifficulty: {"name":"set-land-difficulty","access":"public","args":[{"name":"land-id","type":"uint128"},{"name":"new-difficulty","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[landId: TypedAbiArg<number | bigint, "landId">, newDifficulty: TypedAbiArg<number | bigint, "newDifficulty">], Response<boolean, bigint>>,
    setWhitelisted: {"name":"set-whitelisted","access":"public","args":[{"name":"asset-contract","type":"principal"},{"name":"whitelisted","type":"bool"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[assetContract: TypedAbiArg<string, "assetContract">, whitelisted: TypedAbiArg<boolean, "whitelisted">], Response<boolean, bigint>>,
    tap: {"name":"tap","access":"public","args":[{"name":"land-id","type":"uint128"}],"outputs":{"type":{"response":{"ok":{"tuple":[{"name":"energy","type":"uint128"},{"name":"land-amount","type":"uint128"},{"name":"land-id","type":"uint128"},{"name":"type","type":{"string-ascii":{"length":10}}}]},"error":"uint128"}}}} as TypedAbiFunction<[landId: TypedAbiArg<number | bigint, "landId">], Response<{
  "energy": bigint;
  "landAmount": bigint;
  "landId": bigint;
  "type": string;
}, bigint>>,
    transfer: {"name":"transfer","access":"public","args":[{"name":"land-id","type":"uint128"},{"name":"amount","type":"uint128"},{"name":"sender","type":"principal"},{"name":"recipient","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[landId: TypedAbiArg<number | bigint, "landId">, amount: TypedAbiArg<number | bigint, "amount">, sender: TypedAbiArg<string, "sender">, recipient: TypedAbiArg<string, "recipient">], Response<boolean, bigint>>,
    transferMany: {"name":"transfer-many","access":"public","args":[{"name":"transfers","type":{"list":{"type":{"tuple":[{"name":"amount","type":"uint128"},{"name":"recipient","type":"principal"},{"name":"sender","type":"principal"},{"name":"token-id","type":"uint128"}]},"length":200}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[transfers: TypedAbiArg<{
  "amount": number | bigint;
  "recipient": string;
  "sender": string;
  "tokenId": number | bigint;
}[], "transfers">], Response<boolean, bigint>>,
    transferManyMemo: {"name":"transfer-many-memo","access":"public","args":[{"name":"transfers","type":{"list":{"type":{"tuple":[{"name":"amount","type":"uint128"},{"name":"memo","type":{"buffer":{"length":34}}},{"name":"recipient","type":"principal"},{"name":"sender","type":"principal"},{"name":"token-id","type":"uint128"}]},"length":200}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[transfers: TypedAbiArg<{
  "amount": number | bigint;
  "memo": Uint8Array;
  "recipient": string;
  "sender": string;
  "tokenId": number | bigint;
}[], "transfers">], Response<boolean, bigint>>,
    transferMemo: {"name":"transfer-memo","access":"public","args":[{"name":"land-id","type":"uint128"},{"name":"amount","type":"uint128"},{"name":"sender","type":"principal"},{"name":"recipient","type":"principal"},{"name":"memo","type":{"buffer":{"length":34}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[landId: TypedAbiArg<number | bigint, "landId">, amount: TypedAbiArg<number | bigint, "amount">, sender: TypedAbiArg<string, "sender">, recipient: TypedAbiArg<string, "recipient">, memo: TypedAbiArg<Uint8Array, "memo">], Response<boolean, bigint>>,
    unwrap: {"name":"unwrap","access":"public","args":[{"name":"amount","type":"uint128"},{"name":"sip010-asset","type":"trait_reference"}],"outputs":{"type":{"response":{"ok":{"response":{"ok":{"response":{"ok":{"tuple":[{"name":"land-id","type":"uint128"},{"name":"owner","type":"principal"},{"name":"stored-energy","type":"uint128"},{"name":"type","type":{"string-ascii":{"length":12}}}]},"error":"none"}},"error":"none"}},"error":"uint128"}}}} as TypedAbiFunction<[amount: TypedAbiArg<number | bigint, "amount">, sip010Asset: TypedAbiArg<string, "sip010Asset">], Response<Response<Response<{
  "landId": bigint;
  "owner": string;
  "storedEnergy": bigint;
  "type": string;
}, null>, null>, bigint>>,
    wrap: {"name":"wrap","access":"public","args":[{"name":"amount","type":"uint128"},{"name":"sip010-asset","type":"trait_reference"}],"outputs":{"type":{"response":{"ok":{"response":{"ok":{"response":{"ok":{"tuple":[{"name":"land-id","type":"uint128"},{"name":"owner","type":"principal"},{"name":"stored-energy","type":"uint128"},{"name":"type","type":{"string-ascii":{"length":12}}}]},"error":"none"}},"error":"none"}},"error":"uint128"}}}} as TypedAbiFunction<[amount: TypedAbiArg<number | bigint, "amount">, sip010Asset: TypedAbiArg<string, "sip010Asset">], Response<Response<Response<{
  "landId": bigint;
  "owner": string;
  "storedEnergy": bigint;
  "type": string;
}, null>, null>, bigint>>,
    blocksToTargetEnergy: {"name":"blocks-to-target-energy","access":"read_only","args":[{"name":"land-id","type":"uint128"},{"name":"user","type":"principal"},{"name":"target-energy","type":"uint128"}],"outputs":{"type":"uint128"}} as TypedAbiFunction<[landId: TypedAbiArg<number | bigint, "landId">, user: TypedAbiArg<string, "user">, targetEnergy: TypedAbiArg<number | bigint, "targetEnergy">], bigint>,
    getBalance: {"name":"get-balance","access":"read_only","args":[{"name":"land-id","type":"uint128"},{"name":"user","type":"principal"}],"outputs":{"type":{"response":{"ok":"uint128","error":"none"}}}} as TypedAbiFunction<[landId: TypedAbiArg<number | bigint, "landId">, user: TypedAbiArg<string, "user">], Response<bigint, null>>,
    getBlocksSinceLastUpdate: {"name":"get-blocks-since-last-update","access":"read_only","args":[{"name":"land-id","type":"uint128"},{"name":"user","type":"principal"}],"outputs":{"type":"uint128"}} as TypedAbiFunction<[landId: TypedAbiArg<number | bigint, "landId">, user: TypedAbiArg<string, "user">], bigint>,
    getDecimals: {"name":"get-decimals","access":"read_only","args":[{"name":"land-id","type":"uint128"}],"outputs":{"type":{"response":{"ok":"uint128","error":"none"}}}} as TypedAbiFunction<[landId: TypedAbiArg<number | bigint, "landId">], Response<bigint, null>>,
    getEnergyPerBlock: {"name":"get-energy-per-block","access":"read_only","args":[{"name":"land-id","type":"uint128"},{"name":"user","type":"principal"}],"outputs":{"type":"uint128"}} as TypedAbiFunction<[landId: TypedAbiArg<number | bigint, "landId">, user: TypedAbiArg<string, "user">], bigint>,
    getLandAssetContract: {"name":"get-land-asset-contract","access":"read_only","args":[{"name":"land-id","type":"uint128"}],"outputs":{"type":{"optional":"principal"}}} as TypedAbiFunction<[landId: TypedAbiArg<number | bigint, "landId">], string | null>,
    getLandDifficulty: {"name":"get-land-difficulty","access":"read_only","args":[{"name":"land-id","type":"uint128"}],"outputs":{"type":"uint128"}} as TypedAbiFunction<[landId: TypedAbiArg<number | bigint, "landId">], bigint>,
    getLandId: {"name":"get-land-id","access":"read_only","args":[{"name":"asset-contract","type":"principal"}],"outputs":{"type":{"optional":"uint128"}}} as TypedAbiFunction<[assetContract: TypedAbiArg<string, "assetContract">], bigint | null>,
    getLastLandId: {"name":"get-last-land-id","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"uint128","error":"none"}}}} as TypedAbiFunction<[], Response<bigint, null>>,
    getNewEnergy: {"name":"get-new-energy","access":"read_only","args":[{"name":"land-id","type":"uint128"},{"name":"user","type":"principal"}],"outputs":{"type":"uint128"}} as TypedAbiFunction<[landId: TypedAbiArg<number | bigint, "landId">, user: TypedAbiArg<string, "user">], bigint>,
    getOverallBalance: {"name":"get-overall-balance","access":"read_only","args":[{"name":"user","type":"principal"}],"outputs":{"type":{"response":{"ok":"uint128","error":"none"}}}} as TypedAbiFunction<[user: TypedAbiArg<string, "user">], Response<bigint, null>>,
    getOverallSupply: {"name":"get-overall-supply","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"uint128","error":"none"}}}} as TypedAbiFunction<[], Response<bigint, null>>,
    getStoredEnergy: {"name":"get-stored-energy","access":"read_only","args":[{"name":"land-id","type":"uint128"},{"name":"user","type":"principal"}],"outputs":{"type":"uint128"}} as TypedAbiFunction<[landId: TypedAbiArg<number | bigint, "landId">, user: TypedAbiArg<string, "user">], bigint>,
    getTokenUri: {"name":"get-token-uri","access":"read_only","args":[{"name":"land-id","type":"uint128"}],"outputs":{"type":{"response":{"ok":{"optional":{"string-ascii":{"length":89}}},"error":"none"}}}} as TypedAbiFunction<[landId: TypedAbiArg<number | bigint, "landId">], Response<string | null, null>>,
    getTotalSupply: {"name":"get-total-supply","access":"read_only","args":[{"name":"land-id","type":"uint128"}],"outputs":{"type":{"response":{"ok":"uint128","error":"none"}}}} as TypedAbiFunction<[landId: TypedAbiArg<number | bigint, "landId">], Response<bigint, null>>,
    getTotalTappedEnergy: {"name":"get-total-tapped-energy","access":"read_only","args":[{"name":"land-id","type":"uint128"},{"name":"user","type":"principal"}],"outputs":{"type":"uint128"}} as TypedAbiFunction<[landId: TypedAbiArg<number | bigint, "landId">, user: TypedAbiArg<string, "user">], bigint>,
    getUntappedAmount: {"name":"get-untapped-amount","access":"read_only","args":[{"name":"land-id","type":"uint128"},{"name":"user","type":"principal"}],"outputs":{"type":{"response":{"ok":"uint128","error":"none"}}}} as TypedAbiFunction<[landId: TypedAbiArg<number | bigint, "landId">, user: TypedAbiArg<string, "user">], Response<bigint, null>>,
    getUserLastUpdate: {"name":"get-user-last-update","access":"read_only","args":[{"name":"land-id","type":"uint128"},{"name":"user","type":"principal"}],"outputs":{"type":"uint128"}} as TypedAbiFunction<[landId: TypedAbiArg<number | bigint, "landId">, user: TypedAbiArg<string, "user">], bigint>,
    isDaoOrExtension: {"name":"is-dao-or-extension","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>,
    isWhitelisted: {"name":"is-whitelisted","access":"read_only","args":[{"name":"asset-contract","type":"principal"}],"outputs":{"type":"bool"}} as TypedAbiFunction<[assetContract: TypedAbiArg<string, "assetContract">], boolean>
  },
  "maps": {
    assetContractIds: {"name":"asset-contract-ids","key":"principal","value":"uint128"} as TypedAbiMap<string, bigint>,
    assetContractWhitelist: {"name":"asset-contract-whitelist","key":"principal","value":"bool"} as TypedAbiMap<string, boolean>,
    idAssetContracts: {"name":"id-asset-contracts","key":"uint128","value":"principal"} as TypedAbiMap<number | bigint, string>,
    landBalances: {"name":"land-balances","key":{"tuple":[{"name":"land-id","type":"uint128"},{"name":"owner","type":"principal"}]},"value":"uint128"} as TypedAbiMap<{
  "landId": number | bigint;
  "owner": string;
}, bigint>,
    landDifficulty: {"name":"land-difficulty","key":"uint128","value":"uint128"} as TypedAbiMap<number | bigint, bigint>,
    landSupplies: {"name":"land-supplies","key":"uint128","value":"uint128"} as TypedAbiMap<number | bigint, bigint>,
    lastUpdate: {"name":"last-update","key":{"tuple":[{"name":"land-id","type":"uint128"},{"name":"owner","type":"principal"}]},"value":"uint128"} as TypedAbiMap<{
  "landId": number | bigint;
  "owner": string;
}, bigint>,
    storedEnergy: {"name":"stored-energy","key":{"tuple":[{"name":"land-id","type":"uint128"},{"name":"owner","type":"principal"}]},"value":"uint128"} as TypedAbiMap<{
  "landId": number | bigint;
  "owner": string;
}, bigint>,
    totalTappedEnergy: {"name":"total-tapped-energy","key":{"tuple":[{"name":"land-id","type":"uint128"},{"name":"owner","type":"principal"}]},"value":"uint128"} as TypedAbiMap<{
  "landId": number | bigint;
  "owner": string;
}, bigint>
  },
  "variables": {
    errInsufficientBalance: {
  name: 'err-insufficient-balance',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    errInvalidSender: {
  name: 'err-invalid-sender',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    errNoOwners: {
  name: 'err-no-owners',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    errNotWhitelisted: {
  name: 'err-not-whitelisted',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    errNothingToClaim: {
  name: 'err-nothing-to-claim',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    errUnauthorized: {
  name: 'err-unauthorized',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    landUri: {
  name: 'land-uri',
  type: {
    'string-ascii': {
      length: 80
    }
  },
  access: 'variable'
} as TypedAbiVariable<string>,
    nonce: {
  name: 'nonce',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>
  },
  constants: {
  errInsufficientBalance: {
    isOk: false,
    value: 1n
  },
  errInvalidSender: {
    isOk: false,
    value: 4n
  },
  errNoOwners: {
    isOk: false,
    value: 102n
  },
  errNotWhitelisted: {
    isOk: false,
    value: 101n
  },
  errNothingToClaim: {
    isOk: false,
    value: 3_101n
  },
  errUnauthorized: {
    isOk: false,
    value: 100n
  },
  landUri: 'https://charisma.rocks/lands/json/',
  nonce: 0n
},
  "non_fungible_tokens": [
    {"name":"land","type":{"tuple":[{"name":"land-id","type":"uint128"},{"name":"owner","type":"principal"}]}}
  ],
  "fungible_tokens":[{"name":"lands"}],"epoch":"Epoch21","clarity_version":"Clarity1",
  contractName: 'lands',
  }
} as const;

export const accounts = {"deployer":{"address":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM","balance":"100000000000000"},"faucet":{"address":"STNHKEPYEPJ8ET55ZZ0M5A34J0R3N5FM2CMMMAZ6","balance":"100000000000000"},"wallet_1":{"address":"ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5","balance":"100000000000000"},"wallet_2":{"address":"ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG","balance":"100000000000000"},"wallet_3":{"address":"ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC","balance":"100000000000000"},"wallet_4":{"address":"ST2NEB84ASENDXKYGJPQW86YXQCEFEX2ZQPG87ND","balance":"100000000000000"},"wallet_5":{"address":"ST2REHHS5J3CERCRBEPMGH7921Q6PYKAADT7JP2VB","balance":"100000000000000"},"wallet_6":{"address":"ST3AM1A56AK2C1XAFJ4115ZSV26EB49BVQ10MGCS0","balance":"100000000000000"},"wallet_7":{"address":"ST3PF13W7Z0RRM42A8VZRVFQ75SV1K26RXEP8YGKJ","balance":"100000000000000"},"wallet_8":{"address":"ST3NBRSFKX28FQ2ZJ1MAKX58HKHSDGNV5N7R21XCP","balance":"100000000000000"}} as const;

export const identifiers = {"daoTraitsV2":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dao-traits-v2","dungeonMaster":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dungeon-master","kraqenLotto":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.kraqen-lotto","lands":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.lands"} as const

export const simnet = {
  accounts,
  contracts,
  identifiers,
} as const;


export const deployments = {"daoTraitsV2":{"devnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dao-traits-v2","simnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dao-traits-v2","testnet":null,"mainnet":null},"dungeonMaster":{"devnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dungeon-master","simnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dungeon-master","testnet":null,"mainnet":null},"kraqenLotto":{"devnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.kraqen-lotto","simnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.kraqen-lotto","testnet":null,"mainnet":null},"lands":{"devnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.lands","simnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.lands","testnet":null,"mainnet":null}} as const;

export const project = {
  contracts,
  deployments,
} as const;
  