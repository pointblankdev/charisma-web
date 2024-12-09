(use-trait ft-trait 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-traits-v1.sip010-ft-trait)
(use-trait share-fee-to-trait 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-traits-v1.share-fee-to-trait)
(use-trait xyk-pool-trait 'SM1793C4R5PZ4NS4VQ4WMP7SKKYVH8JZEWSZ9HCCR.xyk-pool-trait-v-1-1.xyk-pool-trait)

(define-constant ERR_NOT_AUTHORIZED (err u1001))
(define-constant ERR_INVALID_AMOUNT (err u1002))
(define-constant ERR_INVALID_PRINCIPAL (err u1003))
(define-constant ERR_ALREADY_ADMIN (err u2001))
(define-constant ERR_ADMIN_LIMIT_REACHED (err u2002))
(define-constant ERR_ADMIN_NOT_IN_LIST (err u2003))
(define-constant ERR_CANNOT_REMOVE_CONTRACT_DEPLOYER (err u2004))
(define-constant ERR_SWAP_STATUS (err u4001))
(define-constant ERR_MINIMUM_RECEIVED (err u4002))
(define-constant ERR_SWAP_A (err u5001))
(define-constant ERR_SWAP_B (err u5002))

(define-constant CONTRACT_DEPLOYER tx-sender)

(define-data-var admins (list 5 principal) (list tx-sender))
(define-data-var admin-helper principal tx-sender)

(define-data-var swap-status bool true)

(define-read-only (get-admins)
  (ok (var-get admins))
)

(define-read-only (get-admin-helper)
  (ok (var-get admin-helper))
)

(define-read-only (get-swap-status)
  (ok (var-get swap-status))
)

(define-public (get-quote-a
    (amount uint)
    (pool-trait <xyk-pool-trait>)
    (xyk-reversed bool)
    (id uint)
    (swap-fee (tuple (num uint) (den uint)))
    (charisma-reversed bool)
  )
  (let (
    (quote-a (if (is-eq xyk-reversed false)
                 (try! (contract-call? pool-trait get-dy amount))
                 (try! (contract-call? pool-trait get-dx amount))))
    (charisma-pool (contract-call? 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.univ2-core do-get-pool id))
    (r0 (if (is-eq charisma-reversed false)
            (get reserve0 charisma-pool)
            (get reserve1 charisma-pool)))
    (r1 (if (is-eq charisma-reversed false)
            (get reserve1 charisma-pool)
            (get reserve0 charisma-pool)))
    (quote-b (try! (contract-call? 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.univ2-library get-amount-out
                   quote-a
                   r0 r1
                   swap-fee)))
  )
    (ok quote-b)
  )
)

(define-public (get-quote-b
    (amount uint)
    (pool-trait <xyk-pool-trait>)
    (xyk-reversed bool)
    (id uint)
    (swap-fee (tuple (num uint) (den uint)))
    (charisma-reversed bool)
  )
  (let (
    (charisma-pool (contract-call? 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.univ2-core do-get-pool id))
    (r0 (if (is-eq charisma-reversed false)
            (get reserve0 charisma-pool)
            (get reserve1 charisma-pool)))
    (r1 (if (is-eq charisma-reversed false)
            (get reserve1 charisma-pool)
            (get reserve0 charisma-pool)))
    (quote-a (try! (contract-call? 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.univ2-library get-amount-out
                   amount
                   r0 r1
                   swap-fee)))
    (quote-b (if (is-eq xyk-reversed false)
                 (try! (contract-call? pool-trait get-dy quote-a))
                 (try! (contract-call? pool-trait get-dx quote-a))))
  )
    (ok quote-b)
  )
)

(define-public (set-swap-status (status bool))
  (let (
    (admins-list (var-get admins))
    (caller tx-sender)
  )
    (begin
      (asserts! (is-some (index-of admins-list caller)) ERR_NOT_AUTHORIZED)
      (var-set swap-status status)
      (print {action: "set-swap-status", caller: caller, data: {status: status}})
      (ok true)
    )
  )
)

(define-public (add-admin (admin principal))
  (let (
    (admins-list (var-get admins))
    (caller tx-sender)
  )
    (asserts! (is-some (index-of admins-list caller)) ERR_NOT_AUTHORIZED)
    (asserts! (is-none (index-of admins-list admin)) ERR_ALREADY_ADMIN)
    (asserts! (is-standard admin) ERR_INVALID_PRINCIPAL)
    (var-set admins (unwrap! (as-max-len? (append admins-list admin) u5) ERR_ADMIN_LIMIT_REACHED))
    (print {action: "add-admin", caller: caller, data: {admin: admin}})
    (ok true)
  )
)

(define-public (remove-admin (admin principal))
  (let (
    (admins-list (var-get admins))
    (caller-in-list (index-of admins-list tx-sender))
    (admin-to-remove-in-list (index-of admins-list admin))
    (caller tx-sender)
  )
    (asserts! (is-some caller-in-list) ERR_NOT_AUTHORIZED)
    (asserts! (is-some admin-to-remove-in-list) ERR_ADMIN_NOT_IN_LIST)
    (asserts! (not (is-eq admin CONTRACT_DEPLOYER)) ERR_CANNOT_REMOVE_CONTRACT_DEPLOYER)
    (asserts! (is-standard admin) ERR_INVALID_PRINCIPAL)
    (var-set admin-helper admin)
    (var-set admins (filter admin-not-removeable admins-list))
    (print {action: "remove-admin", caller: caller, data: {admin: admin}})
    (ok true)
  )
)

(define-public (swap-helper-a
    (amount uint) (min-received uint)
    (pool-trait <xyk-pool-trait>)
    (x-token-trait <ft-trait>) (y-token-trait <ft-trait>)
    (xyk-reversed bool)
    (id uint)
    (token0 <ft-trait>) (token1 <ft-trait>)
    (token-in <ft-trait>) (token-out <ft-trait>)
    (share-fee-to <share-fee-to-trait>)
  )
  (let (
    (swap-a (if (is-eq xyk-reversed false)
                (unwrap! (xyk-a pool-trait x-token-trait y-token-trait amount) ERR_SWAP_A)
                (unwrap! (xyk-b pool-trait x-token-trait y-token-trait amount) ERR_SWAP_A)))
    (swap-b (unwrap! (charisma-a id token0 token1 token-in token-out share-fee-to swap-a) ERR_SWAP_B))
    (caller tx-sender)
  )
    (begin
      (asserts! (is-eq (var-get swap-status) true) ERR_SWAP_STATUS)
      (asserts! (> amount u0) ERR_INVALID_AMOUNT)
      (asserts! (>= swap-b min-received) ERR_MINIMUM_RECEIVED)
      (print {
        action: "swap-helper-a",
        caller: caller, 
        data: {
          amount: amount,
          min-received: min-received,
          received: swap-b,
          pool-trait: (contract-of pool-trait),
          x-token-trait: (contract-of x-token-trait),
          y-token-trait: (contract-of y-token-trait),
          xyk-reversed: xyk-reversed,
          id: id,
          token0: (contract-of token0),
          token1: (contract-of token1),
          token-in: (contract-of token-in),
          token-out: (contract-of token-out),
          share-fee-to: (contract-of share-fee-to)
        }
      })
      (ok swap-b)
    )
  )
)

(define-public (swap-helper-b
    (amount uint) (min-received uint)
    (pool-trait <xyk-pool-trait>)
    (x-token-trait <ft-trait>) (y-token-trait <ft-trait>)
    (xyk-reversed bool)
    (id uint)
    (token0 <ft-trait>) (token1 <ft-trait>)
    (token-in <ft-trait>) (token-out <ft-trait>)
    (share-fee-to <share-fee-to-trait>)
  )
  (let (
    (swap-a (unwrap! (charisma-a id token0 token1 token-in token-out share-fee-to amount) ERR_SWAP_A))
    (swap-b (if (is-eq xyk-reversed false)
                (unwrap! (xyk-a pool-trait x-token-trait y-token-trait swap-a) ERR_SWAP_B)
                (unwrap! (xyk-b pool-trait x-token-trait y-token-trait swap-a) ERR_SWAP_B)))
    (caller tx-sender)
  )
    (begin
      (asserts! (is-eq (var-get swap-status) true) ERR_SWAP_STATUS)
      (asserts! (> amount u0) ERR_INVALID_AMOUNT)
      (asserts! (>= swap-b min-received) ERR_MINIMUM_RECEIVED)
      (print {
        action: "swap-helper-b",
        caller: caller, 
        data: {
          amount: amount,
          min-received: min-received,
          received: swap-b,
          pool-trait: (contract-of pool-trait),
          x-token-trait: (contract-of x-token-trait),
          y-token-trait: (contract-of y-token-trait),
          xyk-reversed: xyk-reversed,
          id: id,
          token0: (contract-of token0),
          token1: (contract-of token1),
          token-in: (contract-of token-in),
          token-out: (contract-of token-out),
          share-fee-to: (contract-of share-fee-to)
        }
      })
      (ok swap-b)
    )
  )
)

(define-private (xyk-a
    (pool-trait <xyk-pool-trait>)
    (x-token-trait <ft-trait>) (y-token-trait <ft-trait>)
    (x-amount uint)
  )
  (let (
    (swap-a (try! (contract-call?
                  'SM1793C4R5PZ4NS4VQ4WMP7SKKYVH8JZEWSZ9HCCR.xyk-core-v-1-1 swap-x-for-y
                  pool-trait
                  x-token-trait y-token-trait
                  x-amount u1)))
  )
    (ok swap-a)
  )
)

(define-private (xyk-b
    (pool-trait <xyk-pool-trait>)
    (x-token-trait <ft-trait>) (y-token-trait <ft-trait>)
    (y-amount uint)
  )
  (let (
    (swap-a (try! (contract-call?
                  'SM1793C4R5PZ4NS4VQ4WMP7SKKYVH8JZEWSZ9HCCR.xyk-core-v-1-1 swap-y-for-x
                  pool-trait
                  x-token-trait y-token-trait
                  y-amount u1)))
  )
    (ok swap-a)
  )
)

(define-private (charisma-a
    (id uint)
    (token0 <ft-trait>) (token1 <ft-trait>)
    (token-in <ft-trait>) (token-out <ft-trait>)
    (share-fee-to <share-fee-to-trait>)
    (amt-in uint)
  )
  (let (
    (swap-a (try! (contract-call?
                  'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.univ2-router swap-exact-tokens-for-tokens
                  id 
                  token0 token1
                  token-in token-out
                  share-fee-to
                  amt-in u1)))
  )
    (ok (get amt-out swap-a))
  )
)

(define-private (admin-not-removeable (admin principal))
  (not (is-eq admin (var-get admin-helper)))
)