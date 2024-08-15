
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
    "fungible_tokens": [], "epoch": "Epoch21", "clarity_version": "Clarity1",
    contractName: 'dao-traits-v2',
  },
  dungeonMaster: {
    "functions": {
      isSelfOrExtension: { "name": "is-self-or-extension", "access": "private", "args": [], "outputs": { "type": { "response": { "ok": "bool", "error": "uint128" } } } } as TypedAbiFunction<[], Response<boolean, bigint>>,
      setExtensionsIter: { "name": "set-extensions-iter", "access": "private", "args": [{ "name": "item", "type": { "tuple": [{ "name": "enabled", "type": "bool" }, { "name": "extension", "type": "principal" }] } }], "outputs": { "type": "bool" } } as TypedAbiFunction<[item: TypedAbiArg<{
        "enabled": boolean;
        "extension": string;
      }, "item">], boolean>,
      construct: { "name": "construct", "access": "public", "args": [{ "name": "proposal", "type": "trait_reference" }], "outputs": { "type": { "response": { "ok": "bool", "error": "uint128" } } } } as TypedAbiFunction<[proposal: TypedAbiArg<string, "proposal">], Response<boolean, bigint>>,
      execute: { "name": "execute", "access": "public", "args": [{ "name": "proposal", "type": "trait_reference" }, { "name": "sender", "type": "principal" }], "outputs": { "type": { "response": { "ok": "bool", "error": "uint128" } } } } as TypedAbiFunction<[proposal: TypedAbiArg<string, "proposal">, sender: TypedAbiArg<string, "sender">], Response<boolean, bigint>>,
      requestExtensionCallback: { "name": "request-extension-callback", "access": "public", "args": [{ "name": "extension", "type": "trait_reference" }, { "name": "memo", "type": { "buffer": { "length": 34 } } }], "outputs": { "type": { "response": { "ok": "bool", "error": "uint128" } } } } as TypedAbiFunction<[extension: TypedAbiArg<string, "extension">, memo: TypedAbiArg<Uint8Array, "memo">], Response<boolean, bigint>>,
      setExtension: { "name": "set-extension", "access": "public", "args": [{ "name": "extension", "type": "principal" }, { "name": "enabled", "type": "bool" }], "outputs": { "type": { "response": { "ok": "bool", "error": "uint128" } } } } as TypedAbiFunction<[extension: TypedAbiArg<string, "extension">, enabled: TypedAbiArg<boolean, "enabled">], Response<boolean, bigint>>,
      setExtensions: { "name": "set-extensions", "access": "public", "args": [{ "name": "extension-list", "type": { "list": { "type": { "tuple": [{ "name": "enabled", "type": "bool" }, { "name": "extension", "type": "principal" }] }, "length": 200 } } }], "outputs": { "type": { "response": { "ok": { "list": { "type": "bool", "length": 200 } }, "error": "uint128" } } } } as TypedAbiFunction<[extensionList: TypedAbiArg<{
        "enabled": boolean;
        "extension": string;
      }[], "extensionList">], Response<boolean[], bigint>>,
      executedAt: { "name": "executed-at", "access": "read_only", "args": [{ "name": "proposal", "type": "trait_reference" }], "outputs": { "type": { "optional": "uint128" } } } as TypedAbiFunction<[proposal: TypedAbiArg<string, "proposal">], bigint | null>,
      isExtension: { "name": "is-extension", "access": "read_only", "args": [{ "name": "extension", "type": "principal" }], "outputs": { "type": "bool" } } as TypedAbiFunction<[extension: TypedAbiArg<string, "extension">], boolean>
    },
    "maps": {
      executedProposals: { "name": "executed-proposals", "key": "principal", "value": "uint128" } as TypedAbiMap<string, bigint>,
      extensions: { "name": "extensions", "key": "principal", "value": "bool" } as TypedAbiMap<string, boolean>
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
        value: BigInt('1001')
      },
      errInvalidExtension: {
        isOk: false,
        value: BigInt('1002')
      },
      errUnauthorized: {
        isOk: false,
        value: BigInt('1000')
      },
      executive: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'
    },
    "non_fungible_tokens": [

    ],
    "fungible_tokens": [], "epoch": "Epoch21", "clarity_version": "Clarity1",
    contractName: 'dungeon-master',
  }
} as const;

export const accounts = { "deployer": { "address": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM", "balance": "100000000000000" }, "faucet": { "address": "STNHKEPYEPJ8ET55ZZ0M5A34J0R3N5FM2CMMMAZ6", "balance": "100000000000000" }, "wallet_1": { "address": "ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5", "balance": "100000000000000" }, "wallet_2": { "address": "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG", "balance": "100000000000000" }, "wallet_3": { "address": "ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC", "balance": "100000000000000" }, "wallet_4": { "address": "ST2NEB84ASENDXKYGJPQW86YXQCEFEX2ZQPG87ND", "balance": "100000000000000" }, "wallet_5": { "address": "ST2REHHS5J3CERCRBEPMGH7921Q6PYKAADT7JP2VB", "balance": "100000000000000" }, "wallet_6": { "address": "ST3AM1A56AK2C1XAFJ4115ZSV26EB49BVQ10MGCS0", "balance": "100000000000000" }, "wallet_7": { "address": "ST3PF13W7Z0RRM42A8VZRVFQ75SV1K26RXEP8YGKJ", "balance": "100000000000000" }, "wallet_8": { "address": "ST3NBRSFKX28FQ2ZJ1MAKX58HKHSDGNV5N7R21XCP", "balance": "100000000000000" } } as const;

export const identifiers = { "daoTraitsV2": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dao-traits-v2", "dungeonMaster": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dungeon-master" } as const

export const simnet = {
  accounts,
  contracts,
  identifiers,
} as const;


export const deployments = { "daoTraitsV2": { "devnet": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dao-traits-v2", "simnet": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dao-traits-v2", "testnet": null, "mainnet": null }, "dungeonMaster": { "devnet": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dungeon-master", "simnet": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dungeon-master", "testnet": null, "mainnet": null } } as const;

export const project = {
  contracts,
  deployments,
} as const;
