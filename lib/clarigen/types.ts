
import type { TypedAbiArg, TypedAbiFunction, TypedAbiMap, TypedAbiVariable, Response } from '@clarigen/core';

export const contracts = {
  daoTraitsV4: {
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
  contractName: 'dao-traits-v4',
  },
dme000GovernanceToken: {
  "functions": {
    dmgMintManyIter: {"name":"dmg-mint-many-iter","access":"private","args":[{"name":"item","type":{"tuple":[{"name":"amount","type":"uint128"},{"name":"recipient","type":"principal"}]}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[item: TypedAbiArg<{
  "amount": number | bigint;
  "recipient": string;
}, "item">], Response<boolean, bigint>>,
    callback: {"name":"callback","access":"public","args":[{"name":"sender","type":"principal"},{"name":"memo","type":{"buffer":{"length":34}}}],"outputs":{"type":{"response":{"ok":"bool","error":"none"}}}} as TypedAbiFunction<[sender: TypedAbiArg<string, "sender">, memo: TypedAbiArg<Uint8Array, "memo">], Response<boolean, null>>,
    dmgBurn: {"name":"dmg-burn","access":"public","args":[{"name":"amount","type":"uint128"},{"name":"owner","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[amount: TypedAbiArg<number | bigint, "amount">, owner: TypedAbiArg<string, "owner">], Response<boolean, bigint>>,
    dmgLock: {"name":"dmg-lock","access":"public","args":[{"name":"amount","type":"uint128"},{"name":"owner","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[amount: TypedAbiArg<number | bigint, "amount">, owner: TypedAbiArg<string, "owner">], Response<boolean, bigint>>,
    dmgMint: {"name":"dmg-mint","access":"public","args":[{"name":"amount","type":"uint128"},{"name":"recipient","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[amount: TypedAbiArg<number | bigint, "amount">, recipient: TypedAbiArg<string, "recipient">], Response<boolean, bigint>>,
    dmgMintMany: {"name":"dmg-mint-many","access":"public","args":[{"name":"recipients","type":{"list":{"type":{"tuple":[{"name":"amount","type":"uint128"},{"name":"recipient","type":"principal"}]},"length":200}}}],"outputs":{"type":{"response":{"ok":{"list":{"type":{"response":{"ok":"bool","error":"uint128"}},"length":200}},"error":"uint128"}}}} as TypedAbiFunction<[recipients: TypedAbiArg<{
  "amount": number | bigint;
  "recipient": string;
}[], "recipients">], Response<Response<boolean, bigint>[], bigint>>,
    dmgTransfer: {"name":"dmg-transfer","access":"public","args":[{"name":"amount","type":"uint128"},{"name":"sender","type":"principal"},{"name":"recipient","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[amount: TypedAbiArg<number | bigint, "amount">, sender: TypedAbiArg<string, "sender">, recipient: TypedAbiArg<string, "recipient">], Response<boolean, bigint>>,
    dmgUnlock: {"name":"dmg-unlock","access":"public","args":[{"name":"amount","type":"uint128"},{"name":"owner","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[amount: TypedAbiArg<number | bigint, "amount">, owner: TypedAbiArg<string, "owner">], Response<boolean, bigint>>,
    isDaoOrExtension: {"name":"is-dao-or-extension","access":"public","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>,
    setDecimals: {"name":"set-decimals","access":"public","args":[{"name":"new-decimals","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[newDecimals: TypedAbiArg<number | bigint, "newDecimals">], Response<boolean, bigint>>,
    setName: {"name":"set-name","access":"public","args":[{"name":"new-name","type":{"string-ascii":{"length":32}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[newName: TypedAbiArg<string, "newName">], Response<boolean, bigint>>,
    setSymbol: {"name":"set-symbol","access":"public","args":[{"name":"new-symbol","type":{"string-ascii":{"length":10}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[newSymbol: TypedAbiArg<string, "newSymbol">], Response<boolean, bigint>>,
    setTokenUri: {"name":"set-token-uri","access":"public","args":[{"name":"new-uri","type":{"optional":{"string-utf8":{"length":256}}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[newUri: TypedAbiArg<string | null, "newUri">], Response<boolean, bigint>>,
    transfer: {"name":"transfer","access":"public","args":[{"name":"amount","type":"uint128"},{"name":"sender","type":"principal"},{"name":"recipient","type":"principal"},{"name":"memo","type":{"optional":{"buffer":{"length":34}}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[amount: TypedAbiArg<number | bigint, "amount">, sender: TypedAbiArg<string, "sender">, recipient: TypedAbiArg<string, "recipient">, memo: TypedAbiArg<Uint8Array | null, "memo">], Response<boolean, bigint>>,
    dmgGetBalance: {"name":"dmg-get-balance","access":"read_only","args":[{"name":"who","type":"principal"}],"outputs":{"type":{"response":{"ok":"uint128","error":"none"}}}} as TypedAbiFunction<[who: TypedAbiArg<string, "who">], Response<bigint, null>>,
    dmgGetLocked: {"name":"dmg-get-locked","access":"read_only","args":[{"name":"owner","type":"principal"}],"outputs":{"type":{"response":{"ok":"uint128","error":"none"}}}} as TypedAbiFunction<[owner: TypedAbiArg<string, "owner">], Response<bigint, null>>,
    dmgHasPercentageBalance: {"name":"dmg-has-percentage-balance","access":"read_only","args":[{"name":"who","type":"principal"},{"name":"factor","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"none"}}}} as TypedAbiFunction<[who: TypedAbiArg<string, "who">, factor: TypedAbiArg<number | bigint, "factor">], Response<boolean, null>>,
    getBalance: {"name":"get-balance","access":"read_only","args":[{"name":"who","type":"principal"}],"outputs":{"type":{"response":{"ok":"uint128","error":"none"}}}} as TypedAbiFunction<[who: TypedAbiArg<string, "who">], Response<bigint, null>>,
    getDecimals: {"name":"get-decimals","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"uint128","error":"none"}}}} as TypedAbiFunction<[], Response<bigint, null>>,
    getName: {"name":"get-name","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":{"string-ascii":{"length":32}},"error":"none"}}}} as TypedAbiFunction<[], Response<string, null>>,
    getSymbol: {"name":"get-symbol","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":{"string-ascii":{"length":10}},"error":"none"}}}} as TypedAbiFunction<[], Response<string, null>>,
    getTokenUri: {"name":"get-token-uri","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":{"optional":{"string-utf8":{"length":256}}},"error":"none"}}}} as TypedAbiFunction<[], Response<string | null, null>>,
    getTotalSupply: {"name":"get-total-supply","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"uint128","error":"none"}}}} as TypedAbiFunction<[], Response<bigint, null>>
  },
  "maps": {
    
  },
  "variables": {
    errNotTokenOwner: {
  name: 'err-not-token-owner',
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
    tokenDecimals: {
  name: 'token-decimals',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    tokenName: {
  name: 'token-name',
  type: {
    'string-ascii': {
      length: 32
    }
  },
  access: 'variable'
} as TypedAbiVariable<string>,
    tokenSymbol: {
  name: 'token-symbol',
  type: {
    'string-ascii': {
      length: 10
    }
  },
  access: 'variable'
} as TypedAbiVariable<string>,
    tokenUri: {
  name: 'token-uri',
  type: {
    optional: {
      'string-utf8': {
        length: 256
      }
    }
  },
  access: 'variable'
} as TypedAbiVariable<string | null>
  },
  constants: {
  errNotTokenOwner: {
    isOk: false,
    value: 4n
  },
  errUnauthorized: {
    isOk: false,
    value: 3_000n
  },
  tokenDecimals: 6n,
  tokenName: 'Charisma',
  tokenSymbol: 'CHA',
  tokenUri: null
},
  "non_fungible_tokens": [
    
  ],
  "fungible_tokens":[{"name":"charisma"},{"name":"charisma-locked"}],"epoch":"Epoch21","clarity_version":"Clarity1",
  contractName: 'dme000-governance-token',
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
edkV0: {
  "functions": {
    calculateEnergyUsage: {"name":"calculate-energy-usage","access":"private","args":[{"name":"tapped-energy","type":"uint128"},{"name":"stored-energy","type":"uint128"},{"name":"energy-max-out","type":{"optional":"uint128"}}],"outputs":{"type":{"tuple":[{"name":"energy-from-storage","type":"uint128"},{"name":"energy-to-use","type":"uint128"},{"name":"event","type":{"string-ascii":{"length":12}}},{"name":"excess-energy","type":"uint128"}]}}} as TypedAbiFunction<[tappedEnergy: TypedAbiArg<number | bigint, "tappedEnergy">, storedEnergy: TypedAbiArg<number | bigint, "storedEnergy">, energyMaxOut: TypedAbiArg<number | bigint | null, "energyMaxOut">], {
  "energyFromStorage": bigint;
  "energyToUse": bigint;
  "event": string;
  "excessEnergy": bigint;
}>,
    isDaoOrExtension: {"name":"is-dao-or-extension","access":"private","args":[],"outputs":{"type":"bool"}} as TypedAbiFunction<[], boolean>,
    isNftOwner: {"name":"is-nft-owner","access":"private","args":[{"name":"user","type":"principal"}],"outputs":{"type":"bool"}} as TypedAbiFunction<[user: TypedAbiArg<string, "user">], boolean>,
    min: {"name":"min","access":"private","args":[{"name":"a","type":"uint128"},{"name":"b","type":"uint128"}],"outputs":{"type":"uint128"}} as TypedAbiFunction<[a: TypedAbiArg<number | bigint, "a">, b: TypedAbiArg<number | bigint, "b">], bigint>,
    storeExcessEnergy: {"name":"store-excess-energy","access":"private","args":[{"name":"amount","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[amount: TypedAbiArg<number | bigint, "amount">], Response<boolean, bigint>>,
    useStoredEnergy: {"name":"use-stored-energy","access":"private","args":[{"name":"amount","type":"uint128"}],"outputs":{"type":{"response":{"ok":"uint128","error":"uint128"}}}} as TypedAbiFunction<[amount: TypedAbiArg<number | bigint, "amount">], Response<bigint, bigint>>,
    setWhitelistedCdk: {"name":"set-whitelisted-cdk","access":"public","args":[{"name":"cdk-contract","type":"principal"},{"name":"whitelisted","type":"bool"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[cdkContract: TypedAbiArg<string, "cdkContract">, whitelisted: TypedAbiArg<boolean, "whitelisted">], Response<boolean, bigint>>,
    tap: {"name":"tap","access":"public","args":[{"name":"land-id","type":"uint128"},{"name":"cdk-contract","type":"trait_reference"},{"name":"energy-max-out","type":{"optional":"uint128"}}],"outputs":{"type":{"response":{"ok":{"tuple":[{"name":"energy","type":"uint128"},{"name":"land-amount","type":"uint128"},{"name":"land-id","type":"uint128"},{"name":"type","type":{"string-ascii":{"length":10}}}]},"error":"uint128"}}}} as TypedAbiFunction<[landId: TypedAbiArg<number | bigint, "landId">, cdkContract: TypedAbiArg<string, "cdkContract">, energyMaxOut: TypedAbiArg<number | bigint | null, "energyMaxOut">], Response<{
  "energy": bigint;
  "landAmount": bigint;
  "landId": bigint;
  "type": string;
}, bigint>>,
    isAuthorized: {"name":"is-authorized","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>,
    isWhitelistedCdk: {"name":"is-whitelisted-cdk","access":"read_only","args":[{"name":"cdk-contract","type":"principal"}],"outputs":{"type":"bool"}} as TypedAbiFunction<[cdkContract: TypedAbiArg<string, "cdkContract">], boolean>
  },
  "maps": {
    whitelistedCdks: {"name":"whitelisted-cdks","key":"principal","value":"bool"} as TypedAbiMap<string, boolean>
  },
  "variables": {
    ERR_INVALID_CDK: {
  name: 'ERR-INVALID-CDK',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_UNAUTHORIZED: {
  name: 'ERR-UNAUTHORIZED',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>
  },
  constants: {
  eRRINVALIDCDK: {
    isOk: false,
    value: 100n
  },
  eRRUNAUTHORIZED: {
    isOk: false,
    value: 101n
  }
},
  "non_fungible_tokens": [
    
  ],
  "fungible_tokens":[],"epoch":"Epoch21","clarity_version":"Clarity1",
  contractName: 'edk-v0',
  },
energyStorage: {
  "functions": {
    isDaoOrExtension: {"name":"is-dao-or-extension","access":"private","args":[],"outputs":{"type":"bool"}} as TypedAbiFunction<[], boolean>,
    min: {"name":"min","access":"private","args":[{"name":"a","type":"uint128"},{"name":"b","type":"uint128"}],"outputs":{"type":"uint128"}} as TypedAbiFunction<[a: TypedAbiArg<number | bigint, "a">, b: TypedAbiArg<number | bigint, "b">], bigint>,
    storeEnergy: {"name":"store-energy","access":"public","args":[{"name":"user","type":"principal"},{"name":"amount","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[user: TypedAbiArg<string, "user">, amount: TypedAbiArg<number | bigint, "amount">], Response<boolean, bigint>>,
    useEnergy: {"name":"use-energy","access":"public","args":[{"name":"user","type":"principal"},{"name":"amount","type":"uint128"}],"outputs":{"type":{"response":{"ok":"uint128","error":"uint128"}}}} as TypedAbiFunction<[user: TypedAbiArg<string, "user">, amount: TypedAbiArg<number | bigint, "amount">], Response<bigint, bigint>>,
    getStoredEnergy: {"name":"get-stored-energy","access":"read_only","args":[{"name":"user","type":"principal"}],"outputs":{"type":"uint128"}} as TypedAbiFunction<[user: TypedAbiArg<string, "user">], bigint>,
    isAuthorized: {"name":"is-authorized","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>
  },
  "maps": {
    storedEnergy: {"name":"stored-energy","key":"principal","value":"uint128"} as TypedAbiMap<string, bigint>
  },
  "variables": {
    ERR_UNAUTHORIZED: {
  name: 'ERR_UNAUTHORIZED',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>
  },
  constants: {
  ERR_UNAUTHORIZED: {
    isOk: false,
    value: 401n
  }
},
  "non_fungible_tokens": [
    
  ],
  "fungible_tokens":[],"epoch":"Epoch21","clarity_version":"Clarity1",
  contractName: 'energy-storage',
  },
experience: {
  "functions": {
    checkErr: {"name":"check-err","access":"private","args":[{"name":"result","type":{"response":{"ok":"bool","error":"uint128"}}},{"name":"prior","type":{"response":{"ok":"bool","error":"uint128"}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[result: TypedAbiArg<Response<boolean, number | bigint>, "result">, prior: TypedAbiArg<Response<boolean, number | bigint>, "prior">], Response<boolean, bigint>>,
    mintManyIter: {"name":"mint-many-iter","access":"private","args":[{"name":"item","type":{"tuple":[{"name":"amount","type":"uint128"},{"name":"recipient","type":"principal"}]}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[item: TypedAbiArg<{
  "amount": number | bigint;
  "recipient": string;
}, "item">], Response<boolean, bigint>>,
    sendToken: {"name":"send-token","access":"private","args":[{"name":"recipient","type":{"tuple":[{"name":"amount","type":"uint128"},{"name":"memo","type":{"optional":{"buffer":{"length":34}}}},{"name":"to","type":"principal"}]}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[recipient: TypedAbiArg<{
  "amount": number | bigint;
  "memo": Uint8Array | null;
  "to": string;
}, "recipient">], Response<boolean, bigint>>,
    sendTokenWithMemo: {"name":"send-token-with-memo","access":"private","args":[{"name":"amount","type":"uint128"},{"name":"to","type":"principal"},{"name":"memo","type":{"optional":{"buffer":{"length":34}}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[amount: TypedAbiArg<number | bigint, "amount">, to: TypedAbiArg<string, "to">, memo: TypedAbiArg<Uint8Array | null, "memo">], Response<boolean, bigint>>,
    burn: {"name":"burn","access":"public","args":[{"name":"amount","type":"uint128"},{"name":"owner","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[amount: TypedAbiArg<number | bigint, "amount">, owner: TypedAbiArg<string, "owner">], Response<boolean, bigint>>,
    callback: {"name":"callback","access":"public","args":[{"name":"sender","type":"principal"},{"name":"memo","type":{"buffer":{"length":34}}}],"outputs":{"type":{"response":{"ok":"bool","error":"none"}}}} as TypedAbiFunction<[sender: TypedAbiArg<string, "sender">, memo: TypedAbiArg<Uint8Array, "memo">], Response<boolean, null>>,
    isDaoOrExtension: {"name":"is-dao-or-extension","access":"public","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>,
    mint: {"name":"mint","access":"public","args":[{"name":"amount","type":"uint128"},{"name":"recipient","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[amount: TypedAbiArg<number | bigint, "amount">, recipient: TypedAbiArg<string, "recipient">], Response<boolean, bigint>>,
    mintMany: {"name":"mint-many","access":"public","args":[{"name":"recipients","type":{"list":{"type":{"tuple":[{"name":"amount","type":"uint128"},{"name":"recipient","type":"principal"}]},"length":200}}}],"outputs":{"type":{"response":{"ok":{"list":{"type":{"response":{"ok":"bool","error":"uint128"}},"length":200}},"error":"uint128"}}}} as TypedAbiFunction<[recipients: TypedAbiArg<{
  "amount": number | bigint;
  "recipient": string;
}[], "recipients">], Response<Response<boolean, bigint>[], bigint>>,
    sendMany: {"name":"send-many","access":"public","args":[{"name":"recipients","type":{"list":{"type":{"tuple":[{"name":"amount","type":"uint128"},{"name":"memo","type":{"optional":{"buffer":{"length":34}}}},{"name":"to","type":"principal"}]},"length":200}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[recipients: TypedAbiArg<{
  "amount": number | bigint;
  "memo": Uint8Array | null;
  "to": string;
}[], "recipients">], Response<boolean, bigint>>,
    setDecimals: {"name":"set-decimals","access":"public","args":[{"name":"new-decimals","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[newDecimals: TypedAbiArg<number | bigint, "newDecimals">], Response<boolean, bigint>>,
    setName: {"name":"set-name","access":"public","args":[{"name":"new-name","type":{"string-ascii":{"length":32}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[newName: TypedAbiArg<string, "newName">], Response<boolean, bigint>>,
    setSymbol: {"name":"set-symbol","access":"public","args":[{"name":"new-symbol","type":{"string-ascii":{"length":10}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[newSymbol: TypedAbiArg<string, "newSymbol">], Response<boolean, bigint>>,
    setTokenUri: {"name":"set-token-uri","access":"public","args":[{"name":"new-uri","type":{"optional":{"string-utf8":{"length":256}}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[newUri: TypedAbiArg<string | null, "newUri">], Response<boolean, bigint>>,
    transfer: {"name":"transfer","access":"public","args":[{"name":"amount","type":"uint128"},{"name":"sender","type":"principal"},{"name":"recipient","type":"principal"},{"name":"memo","type":{"optional":{"buffer":{"length":34}}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[amount: TypedAbiArg<number | bigint, "amount">, sender: TypedAbiArg<string, "sender">, recipient: TypedAbiArg<string, "recipient">, memo: TypedAbiArg<Uint8Array | null, "memo">], Response<boolean, bigint>>,
    getBalance: {"name":"get-balance","access":"read_only","args":[{"name":"who","type":"principal"}],"outputs":{"type":{"response":{"ok":"uint128","error":"none"}}}} as TypedAbiFunction<[who: TypedAbiArg<string, "who">], Response<bigint, null>>,
    getDecimals: {"name":"get-decimals","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"uint128","error":"none"}}}} as TypedAbiFunction<[], Response<bigint, null>>,
    getName: {"name":"get-name","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":{"string-ascii":{"length":32}},"error":"none"}}}} as TypedAbiFunction<[], Response<string, null>>,
    getSymbol: {"name":"get-symbol","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":{"string-ascii":{"length":10}},"error":"none"}}}} as TypedAbiFunction<[], Response<string, null>>,
    getTokenUri: {"name":"get-token-uri","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":{"optional":{"string-utf8":{"length":256}}},"error":"none"}}}} as TypedAbiFunction<[], Response<string | null, null>>,
    getTotalSupply: {"name":"get-total-supply","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"uint128","error":"none"}}}} as TypedAbiFunction<[], Response<bigint, null>>,
    hasPercentageBalance: {"name":"has-percentage-balance","access":"read_only","args":[{"name":"who","type":"principal"},{"name":"factor","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"none"}}}} as TypedAbiFunction<[who: TypedAbiArg<string, "who">, factor: TypedAbiArg<number | bigint, "factor">], Response<boolean, null>>
  },
  "maps": {
    
  },
  "variables": {
    errNotTokenOwner: {
  name: 'err-not-token-owner',
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
    tokenDecimals: {
  name: 'token-decimals',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    tokenName: {
  name: 'token-name',
  type: {
    'string-ascii': {
      length: 32
    }
  },
  access: 'variable'
} as TypedAbiVariable<string>,
    tokenSymbol: {
  name: 'token-symbol',
  type: {
    'string-ascii': {
      length: 10
    }
  },
  access: 'variable'
} as TypedAbiVariable<string>,
    tokenUri: {
  name: 'token-uri',
  type: {
    optional: {
      'string-utf8': {
        length: 256
      }
    }
  },
  access: 'variable'
} as TypedAbiVariable<string | null>
  },
  constants: {
  errNotTokenOwner: {
    isOk: false,
    value: 4n
  },
  errUnauthorized: {
    isOk: false,
    value: 401n
  },
  tokenDecimals: 6n,
  tokenName: 'Experience',
  tokenSymbol: 'EXP',
  tokenUri: 'https://charisma.rocks/experience.json'
},
  "non_fungible_tokens": [
    
  ],
  "fungible_tokens":[{"name":"experience"}],"epoch":"Epoch21","clarity_version":"Clarity1",
  contractName: 'experience',
  },
gigaPepeV2: {
  "functions": {
    isOwner: {"name":"is-owner","access":"private","args":[{"name":"token-id","type":"uint128"},{"name":"user","type":"principal"}],"outputs":{"type":"bool"}} as TypedAbiFunction<[tokenId: TypedAbiArg<number | bigint, "tokenId">, user: TypedAbiArg<string, "user">], boolean>,
    isSenderOwner: {"name":"is-sender-owner","access":"private","args":[{"name":"id","type":"uint128"}],"outputs":{"type":"bool"}} as TypedAbiFunction<[id: TypedAbiArg<number | bigint, "id">], boolean>,
    mint: {"name":"mint","access":"private","args":[{"name":"orders","type":{"list":{"type":"bool","length":25}}}],"outputs":{"type":{"response":{"ok":"uint128","error":"uint128"}}}} as TypedAbiFunction<[orders: TypedAbiArg<boolean[], "orders">], Response<bigint, bigint>>,
    mintMany: {"name":"mint-many","access":"private","args":[{"name":"orders","type":{"list":{"type":"bool","length":25}}}],"outputs":{"type":{"response":{"ok":"uint128","error":"uint128"}}}} as TypedAbiFunction<[orders: TypedAbiArg<boolean[], "orders">], Response<bigint, bigint>>,
    mintManyIter: {"name":"mint-many-iter","access":"private","args":[{"name":"ignore","type":"bool"},{"name":"next-id","type":"uint128"}],"outputs":{"type":"uint128"}} as TypedAbiFunction<[ignore: TypedAbiArg<boolean, "ignore">, nextId: TypedAbiArg<number | bigint, "nextId">], bigint>,
    payRoyalty: {"name":"pay-royalty","access":"private","args":[{"name":"price","type":"uint128"},{"name":"royalty","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[price: TypedAbiArg<number | bigint, "price">, royalty: TypedAbiArg<number | bigint, "royalty">], Response<boolean, bigint>>,
    trnsfr: {"name":"trnsfr","access":"private","args":[{"name":"id","type":"uint128"},{"name":"sender","type":"principal"},{"name":"recipient","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[id: TypedAbiArg<number | bigint, "id">, sender: TypedAbiArg<string, "sender">, recipient: TypedAbiArg<string, "recipient">], Response<boolean, bigint>>,
    burn: {"name":"burn","access":"public","args":[{"name":"token-id","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[tokenId: TypedAbiArg<number | bigint, "tokenId">], Response<boolean, bigint>>,
    claim: {"name":"claim","access":"public","args":[],"outputs":{"type":{"response":{"ok":"uint128","error":"uint128"}}}} as TypedAbiFunction<[], Response<bigint, bigint>>,
    claimFifteen: {"name":"claim-fifteen","access":"public","args":[],"outputs":{"type":{"response":{"ok":"uint128","error":"uint128"}}}} as TypedAbiFunction<[], Response<bigint, bigint>>,
    claimFive: {"name":"claim-five","access":"public","args":[],"outputs":{"type":{"response":{"ok":"uint128","error":"uint128"}}}} as TypedAbiFunction<[], Response<bigint, bigint>>,
    claimTen: {"name":"claim-ten","access":"public","args":[],"outputs":{"type":{"response":{"ok":"uint128","error":"uint128"}}}} as TypedAbiFunction<[], Response<bigint, bigint>>,
    claimThree: {"name":"claim-three","access":"public","args":[],"outputs":{"type":{"response":{"ok":"uint128","error":"uint128"}}}} as TypedAbiFunction<[], Response<bigint, bigint>>,
    claimTwenty: {"name":"claim-twenty","access":"public","args":[],"outputs":{"type":{"response":{"ok":"uint128","error":"uint128"}}}} as TypedAbiFunction<[], Response<bigint, bigint>>,
    claimTwentyfive: {"name":"claim-twentyfive","access":"public","args":[],"outputs":{"type":{"response":{"ok":"uint128","error":"uint128"}}}} as TypedAbiFunction<[], Response<bigint, bigint>>,
    disablePremint: {"name":"disable-premint","access":"public","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>,
    enablePremint: {"name":"enable-premint","access":"public","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>,
    freezeMetadata: {"name":"freeze-metadata","access":"public","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>,
    setArtistAddress: {"name":"set-artist-address","access":"public","args":[{"name":"address","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], Response<boolean, bigint>>,
    setBaseUri: {"name":"set-base-uri","access":"public","args":[{"name":"new-base-uri","type":{"string-ascii":{"length":80}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[newBaseUri: TypedAbiArg<string, "newBaseUri">], Response<boolean, bigint>>,
    setLicenseName: {"name":"set-license-name","access":"public","args":[{"name":"name","type":{"string-ascii":{"length":40}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[name: TypedAbiArg<string, "name">], Response<boolean, bigint>>,
    setLicenseUri: {"name":"set-license-uri","access":"public","args":[{"name":"uri","type":{"string-ascii":{"length":80}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[uri: TypedAbiArg<string, "uri">], Response<boolean, bigint>>,
    setMintLimit: {"name":"set-mint-limit","access":"public","args":[{"name":"limit","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[limit: TypedAbiArg<number | bigint, "limit">], Response<boolean, bigint>>,
    setPrice: {"name":"set-price","access":"public","args":[{"name":"price","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[price: TypedAbiArg<number | bigint, "price">], Response<boolean, bigint>>,
    setRoyaltyPercent: {"name":"set-royalty-percent","access":"public","args":[{"name":"royalty","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[royalty: TypedAbiArg<number | bigint, "royalty">], Response<boolean, bigint>>,
    togglePause: {"name":"toggle-pause","access":"public","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>,
    toggleSaleState: {"name":"toggle-sale-state","access":"public","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>,
    transfer: {"name":"transfer","access":"public","args":[{"name":"id","type":"uint128"},{"name":"sender","type":"principal"},{"name":"recipient","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[id: TypedAbiArg<number | bigint, "id">, sender: TypedAbiArg<string, "sender">, recipient: TypedAbiArg<string, "recipient">], Response<boolean, bigint>>,
    unlistInUstx: {"name":"unlist-in-ustx","access":"public","args":[{"name":"id","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[id: TypedAbiArg<number | bigint, "id">], Response<boolean, bigint>>,
    getArtistAddress: {"name":"get-artist-address","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"principal","error":"none"}}}} as TypedAbiFunction<[], Response<string, null>>,
    getBalance: {"name":"get-balance","access":"read_only","args":[{"name":"account","type":"principal"}],"outputs":{"type":"uint128"}} as TypedAbiFunction<[account: TypedAbiArg<string, "account">], bigint>,
    getLastTokenId: {"name":"get-last-token-id","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"uint128","error":"none"}}}} as TypedAbiFunction<[], Response<bigint, null>>,
    getLicenseName: {"name":"get-license-name","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":{"string-ascii":{"length":40}},"error":"none"}}}} as TypedAbiFunction<[], Response<string, null>>,
    getLicenseUri: {"name":"get-license-uri","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":{"string-ascii":{"length":80}},"error":"none"}}}} as TypedAbiFunction<[], Response<string, null>>,
    getListingInUstx: {"name":"get-listing-in-ustx","access":"read_only","args":[{"name":"id","type":"uint128"}],"outputs":{"type":{"optional":{"tuple":[{"name":"commission","type":"principal"},{"name":"price","type":"uint128"},{"name":"royalty","type":"uint128"}]}}}} as TypedAbiFunction<[id: TypedAbiArg<number | bigint, "id">], {
  "commission": string;
  "price": bigint;
  "royalty": bigint;
} | null>,
    getMintLimit: {"name":"get-mint-limit","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"uint128","error":"none"}}}} as TypedAbiFunction<[], Response<bigint, null>>,
    getMints: {"name":"get-mints","access":"read_only","args":[{"name":"caller","type":"principal"}],"outputs":{"type":"uint128"}} as TypedAbiFunction<[caller: TypedAbiArg<string, "caller">], bigint>,
    getOwner: {"name":"get-owner","access":"read_only","args":[{"name":"token-id","type":"uint128"}],"outputs":{"type":{"response":{"ok":{"optional":"principal"},"error":"none"}}}} as TypedAbiFunction<[tokenId: TypedAbiArg<number | bigint, "tokenId">], Response<string | null, null>>,
    getPasses: {"name":"get-passes","access":"read_only","args":[{"name":"caller","type":"principal"}],"outputs":{"type":"uint128"}} as TypedAbiFunction<[caller: TypedAbiArg<string, "caller">], bigint>,
    getPaused: {"name":"get-paused","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"none"}}}} as TypedAbiFunction<[], Response<boolean, null>>,
    getPremintEnabled: {"name":"get-premint-enabled","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"none"}}}} as TypedAbiFunction<[], Response<boolean, null>>,
    getPrice: {"name":"get-price","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"uint128","error":"none"}}}} as TypedAbiFunction<[], Response<bigint, null>>,
    getRoyaltyPercent: {"name":"get-royalty-percent","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"uint128","error":"none"}}}} as TypedAbiFunction<[], Response<bigint, null>>,
    getSaleEnabled: {"name":"get-sale-enabled","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"none"}}}} as TypedAbiFunction<[], Response<boolean, null>>,
    getTokenUri: {"name":"get-token-uri","access":"read_only","args":[{"name":"token-id","type":"uint128"}],"outputs":{"type":{"response":{"ok":{"optional":{"string-ascii":{"length":89}}},"error":"none"}}}} as TypedAbiFunction<[tokenId: TypedAbiArg<number | bigint, "tokenId">], Response<string | null, null>>
  },
  "maps": {
    market: {"name":"market","key":"uint128","value":{"tuple":[{"name":"commission","type":"principal"},{"name":"price","type":"uint128"},{"name":"royalty","type":"uint128"}]}} as TypedAbiMap<number | bigint, {
  "commission": string;
  "price": bigint;
  "royalty": bigint;
}>,
    mintPasses: {"name":"mint-passes","key":"principal","value":"uint128"} as TypedAbiMap<string, bigint>,
    mintsPerUser: {"name":"mints-per-user","key":"principal","value":"uint128"} as TypedAbiMap<string, bigint>,
    tokenCount: {"name":"token-count","key":"principal","value":"uint128"} as TypedAbiMap<string, bigint>
  },
  "variables": {
    COMM: {
  name: 'COMM',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    COMM_ADDR: {
  name: 'COMM-ADDR',
  type: 'principal',
  access: 'constant'
} as TypedAbiVariable<string>,
    DEPLOYER: {
  name: 'DEPLOYER',
  type: 'principal',
  access: 'constant'
} as TypedAbiVariable<string>,
    ERR_AIRDROP_CALLED: {
  name: 'ERR-AIRDROP-CALLED',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    ERR_CONTRACT_INITIALIZED: {
  name: 'ERR-CONTRACT-INITIALIZED',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    ERR_INVALID_PERCENTAGE: {
  name: 'ERR-INVALID-PERCENTAGE',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    ERR_INVALID_USER: {
  name: 'ERR-INVALID-USER',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    ERR_LISTING: {
  name: 'ERR-LISTING',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    ERR_METADATA_FROZEN: {
  name: 'ERR-METADATA-FROZEN',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    ERR_MINT_LIMIT: {
  name: 'ERR-MINT-LIMIT',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    ERR_NO_MORE_MINTS: {
  name: 'ERR-NO-MORE-MINTS',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    ERR_NO_MORE_NFTS: {
  name: 'ERR-NO-MORE-NFTS',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    ERR_NOT_AUTHORIZED: {
  name: 'ERR-NOT-AUTHORIZED',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    ERR_NOT_ENOUGH_PASSES: {
  name: 'ERR-NOT-ENOUGH-PASSES',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    ERR_NOT_FOUND: {
  name: 'ERR-NOT-FOUND',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    ERR_PAUSED: {
  name: 'ERR-PAUSED',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    ERR_PUBLIC_SALE_DISABLED: {
  name: 'ERR-PUBLIC-SALE-DISABLED',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    ERR_WRONG_COMMISSION: {
  name: 'ERR-WRONG-COMMISSION',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    airdropCalled: {
  name: 'airdrop-called',
  type: 'bool',
  access: 'variable'
} as TypedAbiVariable<boolean>,
    artistAddress: {
  name: 'artist-address',
  type: 'principal',
  access: 'variable'
} as TypedAbiVariable<string>,
    ipfsRoot: {
  name: 'ipfs-root',
  type: {
    'string-ascii': {
      length: 80
    }
  },
  access: 'variable'
} as TypedAbiVariable<string>,
    lastId: {
  name: 'last-id',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    licenseName: {
  name: 'license-name',
  type: {
    'string-ascii': {
      length: 40
    }
  },
  access: 'variable'
} as TypedAbiVariable<string>,
    licenseUri: {
  name: 'license-uri',
  type: {
    'string-ascii': {
      length: 80
    }
  },
  access: 'variable'
} as TypedAbiVariable<string>,
    metadataFrozen: {
  name: 'metadata-frozen',
  type: 'bool',
  access: 'variable'
} as TypedAbiVariable<boolean>,
    mintCap: {
  name: 'mint-cap',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    mintLimit: {
  name: 'mint-limit',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    mintPaused: {
  name: 'mint-paused',
  type: 'bool',
  access: 'variable'
} as TypedAbiVariable<boolean>,
    premintEnabled: {
  name: 'premint-enabled',
  type: 'bool',
  access: 'variable'
} as TypedAbiVariable<boolean>,
    royaltyPercent: {
  name: 'royalty-percent',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    saleEnabled: {
  name: 'sale-enabled',
  type: 'bool',
  access: 'variable'
} as TypedAbiVariable<boolean>,
    totalPrice: {
  name: 'total-price',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>
  },
  constants: {
  COMM: 1_000n,
  cOMMADDR: 'SPNWZ5V2TPWGQGVDR6T7B6RQ4XMGZ4PXTEE0VQ0S',
  DEPLOYER: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  eRRAIRDROPCALLED: 112n,
  eRRCONTRACTINITIALIZED: 103n,
  eRRINVALIDPERCENTAGE: 114n,
  eRRINVALIDUSER: 105n,
  eRRLISTING: 106n,
  eRRMETADATAFROZEN: 111n,
  eRRMINTLIMIT: 110n,
  eRRNOMOREMINTS: 113n,
  eRRNOMORENFTS: 100n,
  eRRNOTAUTHORIZED: 104n,
  eRRNOTENOUGHPASSES: 101n,
  eRRNOTFOUND: 108n,
  eRRPAUSED: 109n,
  eRRPUBLICSALEDISABLED: 102n,
  eRRWRONGCOMMISSION: 107n,
  airdropCalled: false,
  artistAddress: 'SP1FETXHJNYJ20ZE5SY778EJF5KJ1S9RTN0T7VHD9',
  ipfsRoot: 'ipfs://ipfs/Qme1zBPY8umFbKJ4up5uKcmAM2kFF68EZsTkE6puXLLcMn/json/',
  lastId: 1n,
  licenseName: '',
  licenseUri: '',
  metadataFrozen: false,
  mintCap: 10_000n,
  mintLimit: 10_000n,
  mintPaused: true,
  premintEnabled: false,
  royaltyPercent: 500n,
  saleEnabled: false,
  totalPrice: 3_000_000n
},
  "non_fungible_tokens": [
    {"name":"giga-pepe-v2","type":"uint128"}
  ],
  "fungible_tokens":[],"epoch":"Epoch21","clarity_version":"Clarity1",
  contractName: 'giga-pepe-v2',
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
landHelperV3: {
  "functions": {
    burnFee: {"name":"burn-fee","access":"private","args":[{"name":"user","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[user: TypedAbiArg<string, "user">], Response<boolean, bigint>>,
    calculateBurnReduction: {"name":"calculate-burn-reduction","access":"private","args":[{"name":"user","type":"principal"}],"outputs":{"type":"uint128"}} as TypedAbiFunction<[user: TypedAbiArg<string, "user">], bigint>,
    calculateFee: {"name":"calculate-fee","access":"private","args":[{"name":"experience","type":"uint128"}],"outputs":{"type":"uint128"}} as TypedAbiFunction<[experience: TypedAbiArg<number | bigint, "experience">], bigint>,
    checkRavenOwnership: {"name":"check-raven-ownership","access":"private","args":[{"name":"id","type":"uint128"},{"name":"highest-owned","type":"uint128"}],"outputs":{"type":"uint128"}} as TypedAbiFunction<[id: TypedAbiArg<number | bigint, "id">, highestOwned: TypedAbiArg<number | bigint, "highestOwned">], bigint>,
    getRavenOwner: {"name":"get-raven-owner","access":"private","args":[{"name":"id","type":"uint128"}],"outputs":{"type":{"optional":"principal"}}} as TypedAbiFunction<[id: TypedAbiArg<number | bigint, "id">], string | null>,
    getUserExperience: {"name":"get-user-experience","access":"private","args":[{"name":"user","type":"principal"}],"outputs":{"type":"uint128"}} as TypedAbiFunction<[user: TypedAbiArg<string, "user">], bigint>,
    getUserRavenId: {"name":"get-user-raven-id","access":"private","args":[{"name":"user","type":"principal"}],"outputs":{"type":"uint128"}} as TypedAbiFunction<[user: TypedAbiArg<string, "user">], bigint>,
    max: {"name":"max","access":"private","args":[{"name":"a","type":"uint128"},{"name":"b","type":"uint128"}],"outputs":{"type":"uint128"}} as TypedAbiFunction<[a: TypedAbiArg<number | bigint, "a">, b: TypedAbiArg<number | bigint, "b">], bigint>,
    tap: {"name":"tap","access":"public","args":[{"name":"land-id","type":"uint128"}],"outputs":{"type":{"response":{"ok":{"tuple":[{"name":"energy","type":"uint128"},{"name":"land-amount","type":"uint128"},{"name":"land-id","type":"uint128"},{"name":"type","type":{"string-ascii":{"length":10}}}]},"error":"uint128"}}}} as TypedAbiFunction<[landId: TypedAbiArg<number | bigint, "landId">], Response<{
  "energy": bigint;
  "landAmount": bigint;
  "landId": bigint;
  "type": string;
}, bigint>>,
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
}, null>, null>, bigint>>
  },
  "maps": {
    
  },
  "variables": {
    EXPERIENCE_SCALE: {
  name: 'EXPERIENCE-SCALE',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    FEE_SCALE: {
  name: 'FEE-SCALE',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    MAX_BURN_REDUCTION: {
  name: 'MAX-BURN-REDUCTION',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    MAX_RAVEN_ID: {
  name: 'MAX-RAVEN-ID',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>
  },
  constants: {
  eXPERIENCESCALE: 1_000_000_000n,
  fEESCALE: 1_000_000n,
  mAXBURNREDUCTION: 500_000n,
  mAXRAVENID: 100n
},
  "non_fungible_tokens": [
    
  ],
  "fungible_tokens":[],"epoch":"Epoch21","clarity_version":"Clarity1",
  contractName: 'land-helper-v3',
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
  },
liquidStakedCharisma: {
  "functions": {
    burn: {"name":"burn","access":"private","args":[{"name":"amount","type":"uint128"},{"name":"owner","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[amount: TypedAbiArg<number | bigint, "amount">, owner: TypedAbiArg<string, "owner">], Response<boolean, bigint>>,
    mint: {"name":"mint","access":"private","args":[{"name":"amount","type":"uint128"},{"name":"recipient","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[amount: TypedAbiArg<number | bigint, "amount">, recipient: TypedAbiArg<string, "recipient">], Response<boolean, bigint>>,
    deflate: {"name":"deflate","access":"public","args":[{"name":"amount","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[amount: TypedAbiArg<number | bigint, "amount">], Response<boolean, bigint>>,
    deposit: {"name":"deposit","access":"public","args":[{"name":"amount","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[amount: TypedAbiArg<number | bigint, "amount">], Response<boolean, bigint>>,
    isDaoOrExtension: {"name":"is-dao-or-extension","access":"public","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>,
    setDecimals: {"name":"set-decimals","access":"public","args":[{"name":"new-decimals","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[newDecimals: TypedAbiArg<number | bigint, "newDecimals">], Response<boolean, bigint>>,
    setName: {"name":"set-name","access":"public","args":[{"name":"new-name","type":{"string-ascii":{"length":32}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[newName: TypedAbiArg<string, "newName">], Response<boolean, bigint>>,
    setSymbol: {"name":"set-symbol","access":"public","args":[{"name":"new-symbol","type":{"string-ascii":{"length":10}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[newSymbol: TypedAbiArg<string, "newSymbol">], Response<boolean, bigint>>,
    setTokenUri: {"name":"set-token-uri","access":"public","args":[{"name":"new-uri","type":{"optional":{"string-utf8":{"length":256}}}}],"outputs":{"type":{"response":{"ok":{"tuple":[{"name":"notification","type":{"string-ascii":{"length":21}}},{"name":"payload","type":{"tuple":[{"name":"contract-id","type":"principal"},{"name":"token-class","type":{"string-ascii":{"length":2}}}]}}]},"error":"uint128"}}}} as TypedAbiFunction<[newUri: TypedAbiArg<string | null, "newUri">], Response<{
  "notification": string;
  "payload": {
  "contractId": string;
  "tokenClass": string;
};
}, bigint>>,
    stake: {"name":"stake","access":"public","args":[{"name":"amount","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[amount: TypedAbiArg<number | bigint, "amount">], Response<boolean, bigint>>,
    transfer: {"name":"transfer","access":"public","args":[{"name":"amount","type":"uint128"},{"name":"sender","type":"principal"},{"name":"recipient","type":"principal"},{"name":"memo","type":{"optional":{"buffer":{"length":34}}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[amount: TypedAbiArg<number | bigint, "amount">, sender: TypedAbiArg<string, "sender">, recipient: TypedAbiArg<string, "recipient">, memo: TypedAbiArg<Uint8Array | null, "memo">], Response<boolean, bigint>>,
    unstake: {"name":"unstake","access":"public","args":[{"name":"amount","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[amount: TypedAbiArg<number | bigint, "amount">], Response<boolean, bigint>>,
    getBalance: {"name":"get-balance","access":"read_only","args":[{"name":"who","type":"principal"}],"outputs":{"type":{"response":{"ok":"uint128","error":"none"}}}} as TypedAbiFunction<[who: TypedAbiArg<string, "who">], Response<bigint, null>>,
    getDecimals: {"name":"get-decimals","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"uint128","error":"none"}}}} as TypedAbiFunction<[], Response<bigint, null>>,
    getExchangeRate: {"name":"get-exchange-rate","access":"read_only","args":[],"outputs":{"type":"uint128"}} as TypedAbiFunction<[], bigint>,
    getInverseRate: {"name":"get-inverse-rate","access":"read_only","args":[],"outputs":{"type":"uint128"}} as TypedAbiFunction<[], bigint>,
    getName: {"name":"get-name","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":{"string-ascii":{"length":32}},"error":"none"}}}} as TypedAbiFunction<[], Response<string, null>>,
    getSymbol: {"name":"get-symbol","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":{"string-ascii":{"length":10}},"error":"none"}}}} as TypedAbiFunction<[], Response<string, null>>,
    getTokenUri: {"name":"get-token-uri","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":{"optional":{"string-utf8":{"length":256}}},"error":"none"}}}} as TypedAbiFunction<[], Response<string | null, null>>,
    getTotalInPool: {"name":"get-total-in-pool","access":"read_only","args":[],"outputs":{"type":"uint128"}} as TypedAbiFunction<[], bigint>,
    getTotalSupply: {"name":"get-total-supply","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"uint128","error":"none"}}}} as TypedAbiFunction<[], Response<bigint, null>>
  },
  "maps": {
    
  },
  "variables": {
    oNE_6: {
  name: 'ONE_6',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    contract: {
  name: 'contract',
  type: 'principal',
  access: 'constant'
} as TypedAbiVariable<string>,
    errNotTokenOwner: {
  name: 'err-not-token-owner',
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
    tokenDecimals: {
  name: 'token-decimals',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    tokenName: {
  name: 'token-name',
  type: {
    'string-ascii': {
      length: 32
    }
  },
  access: 'variable'
} as TypedAbiVariable<string>,
    tokenSymbol: {
  name: 'token-symbol',
  type: {
    'string-ascii': {
      length: 10
    }
  },
  access: 'variable'
} as TypedAbiVariable<string>,
    tokenUri: {
  name: 'token-uri',
  type: {
    optional: {
      'string-utf8': {
        length: 256
      }
    }
  },
  access: 'variable'
} as TypedAbiVariable<string | null>
  },
  constants: {
  oNE_6: 1_000_000n,
  contract: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.liquidStakedCharisma-vars',
  errNotTokenOwner: {
    isOk: false,
    value: 4n
  },
  errUnauthorized: {
    isOk: false,
    value: 3_000n
  },
  tokenDecimals: 6n,
  tokenName: 'Liquid Staked Charisma',
  tokenSymbol: 'sCHA',
  tokenUri: 'https://charisma.rocks/liquid-staked-charisma.json'
},
  "non_fungible_tokens": [
    
  ],
  "fungible_tokens":[{"name":"liquid-staked-token"}],"epoch":"Epoch21","clarity_version":"Clarity1",
  contractName: 'liquid-staked-charisma',
  },
memobotsGuardiansOfTheGigaverse: {
  "functions": {
    isDaoOrExtension: {"name":"is-dao-or-extension","access":"private","args":[],"outputs":{"type":"bool"}} as TypedAbiFunction<[], boolean>,
    isOwner: {"name":"is-owner","access":"private","args":[{"name":"id","type":"uint128"},{"name":"user","type":"principal"}],"outputs":{"type":"bool"}} as TypedAbiFunction<[id: TypedAbiArg<number | bigint, "id">, user: TypedAbiArg<string, "user">], boolean>,
    max: {"name":"max","access":"private","args":[{"name":"a","type":"uint128"},{"name":"b","type":"uint128"}],"outputs":{"type":"uint128"}} as TypedAbiFunction<[a: TypedAbiArg<number | bigint, "a">, b: TypedAbiArg<number | bigint, "b">], bigint>,
    min: {"name":"min","access":"private","args":[{"name":"a","type":"uint128"},{"name":"b","type":"uint128"}],"outputs":{"type":"uint128"}} as TypedAbiFunction<[a: TypedAbiArg<number | bigint, "a">, b: TypedAbiArg<number | bigint, "b">], bigint>,
    mint: {"name":"mint","access":"private","args":[{"name":"recipient","type":"principal"}],"outputs":{"type":{"response":{"ok":"uint128","error":"uint128"}}}} as TypedAbiFunction<[recipient: TypedAbiArg<string, "recipient">], Response<bigint, bigint>>,
    burn: {"name":"burn","access":"public","args":[{"name":"id","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[id: TypedAbiArg<number | bigint, "id">], Response<boolean, bigint>>,
    mintMultiple: {"name":"mint-multiple","access":"public","args":[{"name":"recipient","type":"principal"},{"name":"count","type":"uint128"}],"outputs":{"type":{"response":{"ok":"uint128","error":"uint128"}}}} as TypedAbiFunction<[recipient: TypedAbiArg<string, "recipient">, count: TypedAbiArg<number | bigint, "count">], Response<bigint, bigint>>,
    setMintCostStx: {"name":"set-mint-cost-stx","access":"public","args":[{"name":"new-cost","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[newCost: TypedAbiArg<number | bigint, "newCost">], Response<boolean, bigint>>,
    setTokenUri: {"name":"set-token-uri","access":"public","args":[{"name":"new-uri","type":{"string-ascii":{"length":200}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[newUri: TypedAbiArg<string, "newUri">], Response<boolean, bigint>>,
    transfer: {"name":"transfer","access":"public","args":[{"name":"token-id","type":"uint128"},{"name":"sender","type":"principal"},{"name":"recipient","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[tokenId: TypedAbiArg<number | bigint, "tokenId">, sender: TypedAbiArg<string, "sender">, recipient: TypedAbiArg<string, "recipient">], Response<boolean, bigint>>,
    getBalance: {"name":"get-balance","access":"read_only","args":[{"name":"account","type":"principal"}],"outputs":{"type":{"response":{"ok":"uint128","error":"none"}}}} as TypedAbiFunction<[account: TypedAbiArg<string, "account">], Response<bigint, null>>,
    getLastTokenId: {"name":"get-last-token-id","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"uint128","error":"none"}}}} as TypedAbiFunction<[], Response<bigint, null>>,
    getMintCostStx: {"name":"get-mint-cost-stx","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"uint128","error":"none"}}}} as TypedAbiFunction<[], Response<bigint, null>>,
    getOwner: {"name":"get-owner","access":"read_only","args":[{"name":"token-id","type":"uint128"}],"outputs":{"type":{"response":{"ok":{"optional":"principal"},"error":"none"}}}} as TypedAbiFunction<[tokenId: TypedAbiArg<number | bigint, "tokenId">], Response<string | null, null>>,
    getTokenUri: {"name":"get-token-uri","access":"read_only","args":[{"name":"token-id","type":"uint128"}],"outputs":{"type":{"response":{"ok":{"optional":{"string-ascii":{"length":200}}},"error":"none"}}}} as TypedAbiFunction<[tokenId: TypedAbiArg<number | bigint, "tokenId">], Response<string | null, null>>,
    isAuthorized: {"name":"is-authorized","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>
  },
  "maps": {
    claimed: {"name":"claimed","key":"principal","value":"bool"} as TypedAbiMap<string, boolean>,
    tokenBalances: {"name":"token-balances","key":"principal","value":"uint128"} as TypedAbiMap<string, bigint>
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
    ENERGY_DISCOUNT_RATE: {
  name: 'ENERGY_DISCOUNT_RATE',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    ERR_ALREADY_CLAIMED: {
  name: 'ERR_ALREADY_CLAIMED',
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
    MIN_STX_PRICE: {
  name: 'MIN_STX_PRICE',
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
} as TypedAbiVariable<bigint>,
    mintCostStx: {
  name: 'mint-cost-stx',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>
  },
  constants: {
  CHA_AMOUNT: 25_000_000n,
  COLLECTION_LIMIT: 1_300n,
  ENERGY_DISCOUNT_RATE: 1_000n,
  ERR_ALREADY_CLAIMED: {
    isOk: false,
    value: 600n
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
  MIN_STX_PRICE: 1n,
  OWNER: 'SP2RNHHQDTHGHPEVX83291K4AQZVGWEJ7WCQQDA9R',
  STX_PER_MINT: 5_000_000n,
  baseUri: 'https://charisma.rocks/api/v0/nfts/SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.memobots-guardians-of-the-gigaverse/{id}.json',
  lastTokenId: 0n,
  mintCostStx: 5_000_000n
},
  "non_fungible_tokens": [
    {"name":"memobots-guardians-of-the-gigaverse","type":"uint128"}
  ],
  "fungible_tokens":[],"epoch":"Epoch21","clarity_version":"Clarity1",
  contractName: 'memobots-guardians-of-the-gigaverse',
  },
memobotsHelper: {
  "functions": {
    max: {"name":"max","access":"private","args":[{"name":"a","type":"uint128"},{"name":"b","type":"uint128"}],"outputs":{"type":"uint128"}} as TypedAbiFunction<[a: TypedAbiArg<number | bigint, "a">, b: TypedAbiArg<number | bigint, "b">], bigint>,
    mint: {"name":"mint","access":"public","args":[{"name":"land-id","type":"uint128"},{"name":"nfts-to-mint","type":"uint128"}],"outputs":{"type":{"response":{"ok":"uint128","error":"uint128"}}}} as TypedAbiFunction<[landId: TypedAbiArg<number | bigint, "landId">, nftsToMint: TypedAbiArg<number | bigint, "nftsToMint">], Response<bigint, bigint>>
  },
  "maps": {
    
  },
  "variables": {
    ENERGY_DISCOUNT_RATE: {
  name: 'ENERGY_DISCOUNT_RATE',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    MIN_STX_PRICE: {
  name: 'MIN_STX_PRICE',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    STX_PER_NFT: {
  name: 'STX_PER_NFT',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>
  },
  constants: {
  ENERGY_DISCOUNT_RATE: 10n,
  MIN_STX_PRICE: 1n,
  STX_PER_NFT: 5_000_000n
},
  "non_fungible_tokens": [
    
  ],
  "fungible_tokens":[],"epoch":"Epoch21","clarity_version":"Clarity1",
  contractName: 'memobots-helper',
  },
odinsRaven: {
  "functions": {
    isOwner: {"name":"is-owner","access":"private","args":[{"name":"id","type":"uint128"},{"name":"user","type":"principal"}],"outputs":{"type":"bool"}} as TypedAbiFunction<[id: TypedAbiArg<number | bigint, "id">, user: TypedAbiArg<string, "user">], boolean>,
    burn: {"name":"burn","access":"public","args":[{"name":"id","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[id: TypedAbiArg<number | bigint, "id">], Response<boolean, bigint>>,
    callback: {"name":"callback","access":"public","args":[{"name":"sender","type":"principal"},{"name":"memo","type":{"buffer":{"length":34}}}],"outputs":{"type":{"response":{"ok":"bool","error":"none"}}}} as TypedAbiFunction<[sender: TypedAbiArg<string, "sender">, memo: TypedAbiArg<Uint8Array, "memo">], Response<boolean, null>>,
    freezeMetadata: {"name":"freeze-metadata","access":"public","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>,
    mint: {"name":"mint","access":"public","args":[{"name":"required-token","type":"trait_reference"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[requiredToken: TypedAbiArg<string, "requiredToken">], Response<boolean, bigint>>,
    setRequiredTokenBalance: {"name":"set-required-token-balance","access":"public","args":[{"name":"new-required-token-balance","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[newRequiredTokenBalance: TypedAbiArg<number | bigint, "newRequiredTokenBalance">], Response<boolean, bigint>>,
    setRequiredTokenToMint: {"name":"set-required-token-to-mint","access":"public","args":[{"name":"new-required-token-to-mint","type":"trait_reference"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[newRequiredTokenToMint: TypedAbiArg<string, "newRequiredTokenToMint">], Response<boolean, bigint>>,
    setTokenUri: {"name":"set-token-uri","access":"public","args":[{"name":"new-uri","type":{"string-ascii":{"length":80}}}],"outputs":{"type":{"response":{"ok":{"tuple":[{"name":"notification","type":{"string-ascii":{"length":21}}},{"name":"payload","type":{"tuple":[{"name":"contract-id","type":"principal"},{"name":"token-class","type":{"string-ascii":{"length":3}}}]}}]},"error":"uint128"}}}} as TypedAbiFunction<[newUri: TypedAbiArg<string, "newUri">], Response<{
  "notification": string;
  "payload": {
  "contractId": string;
  "tokenClass": string;
};
}, bigint>>,
    transfer: {"name":"transfer","access":"public","args":[{"name":"id","type":"uint128"},{"name":"sender","type":"principal"},{"name":"recipient","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[id: TypedAbiArg<number | bigint, "id">, sender: TypedAbiArg<string, "sender">, recipient: TypedAbiArg<string, "recipient">], Response<boolean, bigint>>,
    getLastTokenId: {"name":"get-last-token-id","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"uint128","error":"none"}}}} as TypedAbiFunction<[], Response<bigint, null>>,
    getOwner: {"name":"get-owner","access":"read_only","args":[{"name":"id","type":"uint128"}],"outputs":{"type":{"response":{"ok":{"optional":"principal"},"error":"none"}}}} as TypedAbiFunction<[id: TypedAbiArg<number | bigint, "id">], Response<string | null, null>>,
    getRequiredTokenBalance: {"name":"get-required-token-balance","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"uint128","error":"none"}}}} as TypedAbiFunction<[], Response<bigint, null>>,
    getRequiredTokenToMint: {"name":"get-required-token-to-mint","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"principal","error":"none"}}}} as TypedAbiFunction<[], Response<string, null>>,
    getTokenUri: {"name":"get-token-uri","access":"read_only","args":[{"name":"token-id","type":"uint128"}],"outputs":{"type":{"response":{"ok":{"optional":{"string-ascii":{"length":89}}},"error":"none"}}}} as TypedAbiFunction<[tokenId: TypedAbiArg<number | bigint, "tokenId">], Response<string | null, null>>,
    isDaoOrExtension: {"name":"is-dao-or-extension","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>
  },
  "maps": {
    
  },
  "variables": {
    oNE_6: {
  name: 'ONE_6',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    contract: {
  name: 'contract',
  type: 'principal',
  access: 'constant'
} as TypedAbiVariable<string>,
    errBalanceNotFound: {
  name: 'err-balance-not-found',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    errMessyRecipe: {
  name: 'err-messy-recipe',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    errNeedMoreTokens: {
  name: 'err-need-more-tokens',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    errNotTokenOwner: {
  name: 'err-not-token-owner',
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
    lastId: {
  name: 'last-id',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    metadataFrozen: {
  name: 'metadata-frozen',
  type: 'bool',
  access: 'variable'
} as TypedAbiVariable<boolean>,
    mintLimit: {
  name: 'mint-limit',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    requiredTokenBalance: {
  name: 'required-token-balance',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    requiredTokenToMint: {
  name: 'required-token-to-mint',
  type: 'principal',
  access: 'variable'
} as TypedAbiVariable<string>,
    tokenUri: {
  name: 'token-uri',
  type: {
    'string-ascii': {
      length: 80
    }
  },
  access: 'variable'
} as TypedAbiVariable<string>
  },
  constants: {
  oNE_6: 1_000_000n,
  contract: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.odinsRaven-vars',
  errBalanceNotFound: {
    isOk: false,
    value: 404n
  },
  errMessyRecipe: {
    isOk: false,
    value: 4_024n
  },
  errNeedMoreTokens: {
    isOk: false,
    value: 3_103n
  },
  errNotTokenOwner: {
    isOk: false,
    value: 4n
  },
  errUnauthorized: {
    isOk: false,
    value: 3_000n
  },
  lastId: 1n,
  metadataFrozen: false,
  mintLimit: 100n,
  requiredTokenBalance: 10_000_000_000n,
  requiredTokenToMint: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.fenrir-corgi-of-ragnarok',
  tokenUri: 'https://charisma.rocks/odins-raven/json/'
},
  "non_fungible_tokens": [
    {"name":"raven","type":"uint128"}
  ],
  "fungible_tokens":[],"epoch":"Epoch21","clarity_version":"Clarity1",
  contractName: 'odins-raven',
  },
tokenGateV0: {
  "functions": {
    isDaoOrExtension: {"name":"is-dao-or-extension","access":"private","args":[],"outputs":{"type":"bool"}} as TypedAbiFunction<[], boolean>,
    hasBalance: {"name":"has-balance","access":"public","args":[{"name":"token-contract","type":"trait_reference"},{"name":"user","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"none"}}}} as TypedAbiFunction<[tokenContract: TypedAbiArg<string, "tokenContract">, user: TypedAbiArg<string, "user">], Response<boolean, null>>,
    isAuthorized: {"name":"is-authorized","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>
  },
  "maps": {
    
  },
  "variables": {
    ERR_UNAUTHORIZED: {
  name: 'ERR-UNAUTHORIZED',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>
  },
  constants: {
  eRRUNAUTHORIZED: {
    isOk: false,
    value: 401n
  }
},
  "non_fungible_tokens": [
    
  ],
  "fungible_tokens":[],"epoch":"Epoch21","clarity_version":"Clarity1",
  contractName: 'token-gate-v0',
  }
} as const;

export const accounts = {"deployer":{"address":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM","balance":"100000000000000"},"faucet":{"address":"STNHKEPYEPJ8ET55ZZ0M5A34J0R3N5FM2CMMMAZ6","balance":"100000000000000"},"wallet_1":{"address":"ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5","balance":"100000000000000"},"wallet_2":{"address":"ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG","balance":"100000000000000"},"wallet_3":{"address":"ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC","balance":"100000000000000"},"wallet_4":{"address":"ST2NEB84ASENDXKYGJPQW86YXQCEFEX2ZQPG87ND","balance":"100000000000000"},"wallet_5":{"address":"ST2REHHS5J3CERCRBEPMGH7921Q6PYKAADT7JP2VB","balance":"100000000000000"},"wallet_6":{"address":"ST3AM1A56AK2C1XAFJ4115ZSV26EB49BVQ10MGCS0","balance":"100000000000000"},"wallet_7":{"address":"ST3PF13W7Z0RRM42A8VZRVFQ75SV1K26RXEP8YGKJ","balance":"100000000000000"},"wallet_8":{"address":"ST3NBRSFKX28FQ2ZJ1MAKX58HKHSDGNV5N7R21XCP","balance":"100000000000000"}} as const;

export const identifiers = {"daoTraitsV4":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dao-traits-v4","dme000GovernanceToken":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dme000-governance-token","dungeonMaster":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dungeon-master","edkV0":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.edk-v0","energyStorage":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.energy-storage","experience":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.experience","gigaPepeV2":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.giga-pepe-v2","kraqenLotto":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.kraqen-lotto","landHelperV3":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.land-helper-v3","lands":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.lands","liquidStakedCharisma":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.liquid-staked-charisma","memobotsGuardiansOfTheGigaverse":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.memobots-guardians-of-the-gigaverse","memobotsHelper":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.memobots-helper","odinsRaven":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.odins-raven","tokenGateV0":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.token-gate-v0"} as const

export const simnet = {
  accounts,
  contracts,
  identifiers,
} as const;


export const deployments = {"daoTraitsV4":{"devnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dao-traits-v4","simnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dao-traits-v4","testnet":null,"mainnet":null},"dme000GovernanceToken":{"devnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dme000-governance-token","simnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dme000-governance-token","testnet":null,"mainnet":null},"dungeonMaster":{"devnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dungeon-master","simnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dungeon-master","testnet":null,"mainnet":null},"edkV0":{"devnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.edk-v0","simnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.edk-v0","testnet":null,"mainnet":null},"energyStorage":{"devnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.energy-storage","simnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.energy-storage","testnet":null,"mainnet":null},"experience":{"devnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.experience","simnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.experience","testnet":null,"mainnet":null},"gigaPepeV2":{"devnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.giga-pepe-v2","simnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.giga-pepe-v2","testnet":null,"mainnet":null},"kraqenLotto":{"devnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.kraqen-lotto","simnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.kraqen-lotto","testnet":null,"mainnet":null},"landHelperV3":{"devnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.land-helper-v3","simnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.land-helper-v3","testnet":null,"mainnet":null},"lands":{"devnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.lands","simnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.lands","testnet":null,"mainnet":null},"liquidStakedCharisma":{"devnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.liquid-staked-charisma","simnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.liquid-staked-charisma","testnet":null,"mainnet":null},"memobotsGuardiansOfTheGigaverse":{"devnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.memobots-guardians-of-the-gigaverse","simnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.memobots-guardians-of-the-gigaverse","testnet":null,"mainnet":null},"memobotsHelper":{"devnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.memobots-helper","simnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.memobots-helper","testnet":null,"mainnet":null},"odinsRaven":{"devnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.odins-raven","simnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.odins-raven","testnet":null,"mainnet":null},"tokenGateV0":{"devnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.token-gate-v0","simnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.token-gate-v0","testnet":null,"mainnet":null}} as const;

export const project = {
  contracts,
  deployments,
} as const;
  