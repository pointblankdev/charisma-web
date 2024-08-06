---
description: >-
  Charisma Creatures is a next-generation yield farming platform that combines
  the power of semi-fungible tokens and gamification to provide users with
  diversified, flexible, and high-yield farming.
---

# 🧑‍🌾 Creatures

### Introduction

Charisma Creatures is a next-generation yield farming platform that leverages unique, semi-fungible tokens (SFTs) to provide innovative and rewarding yield farming opportunities. By combining elements of traditional yield farming with gamification, Charisma Creatures allows users to summon, manage, and harness the power of creatures to optimize their yield farming strategies.

### Key Concepts

#### 1. Creatures

Charisma Creatures are unique semi-fungible tokens that represent digital entities with specific attributes and powers. Each creature can be summoned, traded, and used in various DeFi activities to earn rewards.

#### 2. Semi-Fungible Tokens (SFTs)

SFTs combine the properties of fungible and non-fungible tokens, allowing for unique token instances that can be grouped into classes. This provides flexibility in managing and utilizing these tokens within the Charisma ecosystem.

#### 3. Summoning and Unsummoning

Users can summon creatures by locking up specific amounts of underlying assets. Similarly, creatures can be unsummoned, returning the locked assets to the user's control.

#### 4. Energy Mechanism

Creatures generate energy over time, which can be tapped and used for various purposes within the platform. This energy generation is based on the creature's power, the number of creatures, and the amount of time since the last energy tap.

### Contracts Overview

Charisma Creatures are defined and managed through a set of smart contracts. The key contracts and their functionalities are outlined below.

#### Core Contracts

**Traits Implemented**

```clojure
(impl-trait .sft-traits.sip013-semi-fungible-token-trait)
(impl-trait .sft-traits.sip013-transfer-many-trait)
```

**Token Definitions**

```clojure
(define-fungible-token creatures)
(define-non-fungible-token creature {creature-id: uint, owner: principal})
```

**Data Variables and Maps**

```clojure
(define-data-var token-name (string-ascii 32) "Charisma Creatures")
(define-data-var token-symbol (string-ascii 10) "CREATURES")
(define-data-var creature-uri (string-ascii 80) "https://charisma.rocks/creatures/json/")
(define-data-var last-id uint u0)
(define-map last-owner uint principal)
(define-map creature-balances {creature-id: uint, owner: principal} uint)
(define-map creature-supplies uint uint)
(define-map asset-contract-ids principal uint)
(define-map asset-contract-whitelist principal bool)
(define-data-var nonce uint u0)
(define-map creature-costs uint uint)
(define-map creature-power uint uint)
```

**Constants and Errors**

```clojure
(define-constant err-unauthorized (err u100))
(define-constant err-not-whitelisted (err u101))
(define-constant err-insufficient-balance (err u1))
(define-constant err-invalid-sender (err u4))
(define-constant err-nothing-to-claim (err u3101))
(define-constant err-no-owners (err u102))
```

#### Functions and Methods

**Authorization Check**

```clojure
(define-read-only (is-dao-or-extension)
  (ok (asserts! (or (is-eq tx-sender 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dungeon-master) (contract-call? 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dungeon-master is-extension contract-caller)) err-unauthorized))
)
```

**Balance Management**

```clojure
(define-private (set-balance (creature-id uint) (balance uint) (owner principal))
  (map-set creature-balances {creature-id: creature-id, owner: owner} balance)
)

(define-private (get-balance-uint (creature-id uint) (who principal))
  (default-to u0 (map-get? creature-balances {creature-id: creature-id, owner: who}))
)

(define-read-only (get-balance (creature-id uint) (who principal))
  (ok (get-balance-uint creature-id who))
)
```

**Supply Management**

```clojure
(define-private (get-total-supply-uint (creature-id uint))
  (default-to u0 (map-get? creature-supplies creature-id))
)

(define-read-only (get-total-supply (creature-id uint))
  (ok (get-total-supply-uint creature-id))
)

(define-read-only (get-overall-supply)
  (ok (ft-get-supply creatures))
)
```

**Token Information**

```clojure
(define-read-only (get-name)
  (ok (var-get token-name))
)

(define-read-only (get-symbol)
  (ok (var-get token-symbol))
)

(define-read-only (get-last-token-id)
  (ok (var-get nonce))
)

(define-read-only (get-owner (id uint))
  (ok (nft-get-owner? creature {creature-id: id, owner: (unwrap! (map-get? last-owner id) err-no-owners)}))
)

(define-read-only (get-decimals (creature-id uint))
  (ok u0)
)

(define-read-only (get-token-uri (creature-id uint))
  (ok (some (concat (concat (var-get creature-uri) "{id}") ".json")))
)
```

#### Token Transfer Functions

```clojure
(define-public (transfer (creature-id uint) (amount uint) (sender principal) (recipient principal))
  (let
    (
      (sender-balance (get-balance-uint creature-id sender))
    )
    (asserts! (or (is-eq sender tx-sender) (is-eq sender contract-caller)) err-invalid-sender)
    (asserts! (<= amount sender-balance) err-insufficient-balance)
    (try! (ft-transfer? creatures amount sender recipient))
    (try! (tag-id {creature-id: creature-id, owner: sender}))
    (try! (tag-id {creature-id: creature-id, owner: recipient}))
    (set-balance creature-id (- sender-balance amount) sender)
    (set-balance creature-id (+ (get-balance-uint creature-id recipient) amount) recipient)
    (print {type: "sft_transfer", token-id: creature-id, amount: amount, sender: sender, recipient: recipient})
    (map-set last-owner creature-id recipient)
    (ok true)
  )
)

(define-public (transfer-memo (creature-id uint) (amount uint) (sender principal) (recipient principal) (memo (buff 34)))
  (begin
    (try! (transfer creature-id amount sender recipient))
    (print memo)
    (ok true)
  )
)
```

#### Wrapping and Unwrapping Logic

```clojure
(define-read-only (get-creature-id (asset-contract principal))
  (map-get? asset-contract-ids asset-contract)
)

(define-read-only (get-creature-cost (creature-id uint))
  (default-to u0 (map-get? creature-costs creature-id))
)

(define-read-only (get-creature-power (creature-id uint))
  (default-to u0 (map-get? creature-power creature-id))
)

(define-public (get-or-create-creature-id (sip010-asset <sip010-transferable-trait>))
  (match (get-creature-id (contract-of sip010-asset))
    creature-id (ok creature-id)
    (let
      (
        (creature-id (+ (var-get nonce) u1))
      )
      (try! (is-dao-or-extension))
      (asserts! (is-whitelisted (contract-of sip010-asset)) err-not-whitelisted)
      (map-set asset-contract-ids (contract-of sip010-asset) creature-id)
      (var-set nonce creature-id)
      (ok creature-id)
    )
  )
)

(define-public (summon (amount uint) (sip010-asset <sip010-transferable-trait>))
  (let
    (
      (creature-id (try! (get-or-create-creature-id sip010-asset)))
      (creature-cost (get-creature-cost creature-id))
    )
    (try! (is-dao-or-extension))
    (asserts! (< u0 creature-cost) err-unauthorized)
    (try! (contract-call? sip010-asset transfer (* amount creature-cost) tx-sender (as-contract tx-sender) none))
    (try! (ft-mint? creatures amount tx-sender))
    (try! (tag-id {creature-id: creature-id, owner: tx-sender}))
    (set-balance creature-id (+ (get-balance-uint creature-id tx-sender) amount) tx-sender)
    (map-set creature-supplies creature-id (+ (get-total-supply-uint creature-id) amount))
    (print {type: "sft_mint", token-id: creature-id, amount: amount, recipient: tx-sender})
    (map-set last-owner creature-id tx-sender)
    (ok creature-id)
  )
)

(define-public (unsummon (amount uint) (sip010-asset <sip010-transferable-trait>))
  (let
    (
      (creature-id (try! (get-or-create-creature-id sip010-asset)))
      (original-sender tx-sender)
      (
```
