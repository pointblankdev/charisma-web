
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
  }
} as const;

export const accounts = {"deployer":{"address":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM","balance":"100000000000000"},"faucet":{"address":"STNHKEPYEPJ8ET55ZZ0M5A34J0R3N5FM2CMMMAZ6","balance":"100000000000000"},"wallet_1":{"address":"ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5","balance":"100000000000000"},"wallet_2":{"address":"ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG","balance":"100000000000000"},"wallet_3":{"address":"ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC","balance":"100000000000000"},"wallet_4":{"address":"ST2NEB84ASENDXKYGJPQW86YXQCEFEX2ZQPG87ND","balance":"100000000000000"},"wallet_5":{"address":"ST2REHHS5J3CERCRBEPMGH7921Q6PYKAADT7JP2VB","balance":"100000000000000"},"wallet_6":{"address":"ST3AM1A56AK2C1XAFJ4115ZSV26EB49BVQ10MGCS0","balance":"100000000000000"},"wallet_7":{"address":"ST3PF13W7Z0RRM42A8VZRVFQ75SV1K26RXEP8YGKJ","balance":"100000000000000"},"wallet_8":{"address":"ST3NBRSFKX28FQ2ZJ1MAKX58HKHSDGNV5N7R21XCP","balance":"100000000000000"}} as const;

export const identifiers = {"daoTraitsV2":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dao-traits-v2","dungeonMaster":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dungeon-master","kraqenLotto":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.kraqen-lotto"} as const

export const simnet = {
  accounts,
  contracts,
  identifiers,
} as const;


export const deployments = {"daoTraitsV2":{"devnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dao-traits-v2","simnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dao-traits-v2","testnet":null,"mainnet":null},"dungeonMaster":{"devnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dungeon-master","simnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dungeon-master","testnet":null,"mainnet":null},"kraqenLotto":{"devnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.kraqen-lotto","simnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.kraqen-lotto","testnet":null,"mainnet":null}} as const;

export const project = {
  contracts,
  deployments,
} as const;
  