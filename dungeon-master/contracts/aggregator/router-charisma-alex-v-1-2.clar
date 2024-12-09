(use-trait ft-trait 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-traits-v1.sip010-ft-trait)
(use-trait share-fee-to-trait 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-traits-v1.share-fee-to-trait)
(use-trait a-ft-trait 'SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.trait-sip-010.sip-010-trait)

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
(define-constant ERR_SCALED_AMOUNT_A (err u6001))
(define-constant ERR_QUOTE_A (err u7001))
(define-constant ERR_QUOTE_B (err u7002))

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

(define-public (get-quote-a
    (amount uint)
    (swaps-reversed bool)
    (c-tokens (tuple (a <ft-trait>) (b <ft-trait>)))
    (a-tokens (tuple (a <a-ft-trait>) (b <a-ft-trait>)))
    (a-factors (tuple (a uint)))
  )
  (let (
    (quote-a (if (is-eq swaps-reversed false)
                 (unwrap! (charisma-qa amount c-tokens) ERR_QUOTE_A)
                 (unwrap! (alex-qa amount a-tokens a-factors) ERR_QUOTE_A)))
    (scaled-amount (if (is-eq swaps-reversed false)
                       (unwrap! (scale-charisma-amount quote-a (get b c-tokens) (get a a-tokens)) ERR_SCALED_AMOUNT_A)
                       (unwrap! (scale-alex-amount quote-a (get b a-tokens) (get a c-tokens)) ERR_SCALED_AMOUNT_A)))
    (quote-b (if (is-eq swaps-reversed false)
                 (unwrap! (alex-qa scaled-amount a-tokens a-factors) ERR_QUOTE_B)
                 (unwrap! (charisma-qa scaled-amount c-tokens) ERR_QUOTE_B)))
  )
    (ok quote-b)
  )
)

(define-public (get-quote-b
    (amount uint)
    (swaps-reversed bool)
    (c-tokens (tuple (a <ft-trait>) (b <ft-trait>)))
    (a-tokens (tuple (a <a-ft-trait>) (b <a-ft-trait>) (c <a-ft-trait>)))
    (a-factors (tuple (a uint) (b uint)))
  )
  (let (
    (quote-a (if (is-eq swaps-reversed false)
                 (unwrap! (charisma-qa amount c-tokens) ERR_QUOTE_A)
                 (unwrap! (alex-qb amount a-tokens a-factors) ERR_QUOTE_A)))
    (scaled-amount (if (is-eq swaps-reversed false)
                       (unwrap! (scale-charisma-amount quote-a (get b c-tokens) (get a a-tokens)) ERR_SCALED_AMOUNT_A)
                       (unwrap! (scale-alex-amount quote-a (get c a-tokens) (get a c-tokens)) ERR_SCALED_AMOUNT_A)))
    (quote-b (if (is-eq swaps-reversed false)
                 (unwrap! (alex-qb scaled-amount a-tokens a-factors) ERR_QUOTE_B)
                 (unwrap! (charisma-qa scaled-amount c-tokens) ERR_QUOTE_B)))
  )
    (ok quote-b)
  )
)

(define-public (get-quote-c
    (amount uint)
    (swaps-reversed bool)
    (c-tokens (tuple (a <ft-trait>) (b <ft-trait>)))
    (a-tokens (tuple (a <a-ft-trait>) (b <a-ft-trait>) (c <a-ft-trait>) (d <a-ft-trait>)))
    (a-factors (tuple (a uint) (b uint) (c uint)))
  )
  (let (
    (quote-a (if (is-eq swaps-reversed false)
                 (unwrap! (charisma-qa amount c-tokens) ERR_QUOTE_A)
                 (unwrap! (alex-qc amount a-tokens a-factors) ERR_QUOTE_A)))
    (scaled-amount (if (is-eq swaps-reversed false)
                       (unwrap! (scale-charisma-amount quote-a (get b c-tokens) (get a a-tokens)) ERR_SCALED_AMOUNT_A)
                       (unwrap! (scale-alex-amount quote-a (get d a-tokens) (get a c-tokens)) ERR_SCALED_AMOUNT_A)))
    (quote-b (if (is-eq swaps-reversed false)
                 (unwrap! (alex-qc scaled-amount a-tokens a-factors) ERR_QUOTE_B)
                 (unwrap! (charisma-qa scaled-amount c-tokens) ERR_QUOTE_B)))
  )
    (ok quote-b)
  )
)

(define-public (get-quote-d
    (amount uint)
    (swaps-reversed bool)
    (c-tokens (tuple (a <ft-trait>) (b <ft-trait>)))
    (a-tokens (tuple (a <a-ft-trait>) (b <a-ft-trait>) (c <a-ft-trait>) (d <a-ft-trait>) (e <a-ft-trait>)))
    (a-factors (tuple (a uint) (b uint) (c uint) (d uint)))
  )
  (let (
    (quote-a (if (is-eq swaps-reversed false)
                 (unwrap! (charisma-qa amount c-tokens) ERR_QUOTE_A)
                 (unwrap! (alex-qd amount a-tokens a-factors) ERR_QUOTE_A)))
    (scaled-amount (if (is-eq swaps-reversed false)
                       (unwrap! (scale-charisma-amount quote-a (get b c-tokens) (get a a-tokens)) ERR_SCALED_AMOUNT_A)
                       (unwrap! (scale-alex-amount quote-a (get e a-tokens) (get a c-tokens)) ERR_SCALED_AMOUNT_A)))
    (quote-b (if (is-eq swaps-reversed false)
                 (unwrap! (alex-qd scaled-amount a-tokens a-factors) ERR_QUOTE_B)
                 (unwrap! (charisma-qa scaled-amount c-tokens) ERR_QUOTE_B)))
  )
    (ok quote-b)
  )
)

(define-public (get-quote-e
    (amount uint)
    (swaps-reversed bool)
    (c-tokens (tuple (a <ft-trait>) (b <ft-trait>) (c <ft-trait>)))
    (a-tokens (tuple (a <a-ft-trait>) (b <a-ft-trait>)))
    (a-factors (tuple (a uint)))
  )
  (let (
    (quote-a (if (is-eq swaps-reversed false)
                 (unwrap! (charisma-qb amount c-tokens) ERR_QUOTE_A)
                 (unwrap! (alex-qa amount a-tokens a-factors) ERR_QUOTE_A)))
    (scaled-amount (if (is-eq swaps-reversed false)
                       (unwrap! (scale-charisma-amount quote-a (get c c-tokens) (get a a-tokens)) ERR_SCALED_AMOUNT_A)
                       (unwrap! (scale-alex-amount quote-a (get b a-tokens) (get a c-tokens)) ERR_SCALED_AMOUNT_A)))
    (quote-b (if (is-eq swaps-reversed false)
                 (unwrap! (alex-qa scaled-amount a-tokens a-factors) ERR_QUOTE_B)
                 (unwrap! (charisma-qb scaled-amount c-tokens) ERR_QUOTE_B)))
  )
    (ok quote-b)
  )
)

(define-public (get-quote-f
    (amount uint)
    (swaps-reversed bool)
    (c-tokens (tuple (a <ft-trait>) (b <ft-trait>) (c <ft-trait>)))
    (a-tokens (tuple (a <a-ft-trait>) (b <a-ft-trait>) (c <a-ft-trait>)))
    (a-factors (tuple (a uint) (b uint)))
  )
  (let (
    (quote-a (if (is-eq swaps-reversed false)
                 (unwrap! (charisma-qb amount c-tokens) ERR_QUOTE_A)
                 (unwrap! (alex-qb amount a-tokens a-factors) ERR_QUOTE_A)))
    (scaled-amount (if (is-eq swaps-reversed false)
                       (unwrap! (scale-charisma-amount quote-a (get c c-tokens) (get a a-tokens)) ERR_SCALED_AMOUNT_A)
                       (unwrap! (scale-alex-amount quote-a (get c a-tokens) (get a c-tokens)) ERR_SCALED_AMOUNT_A)))
    (quote-b (if (is-eq swaps-reversed false)
                 (unwrap! (alex-qb scaled-amount a-tokens a-factors) ERR_QUOTE_B)
                 (unwrap! (charisma-qb scaled-amount c-tokens) ERR_QUOTE_B)))
  )
    (ok quote-b)
  )
)

(define-public (get-quote-g
    (amount uint)
    (swaps-reversed bool)
    (c-tokens (tuple (a <ft-trait>) (b <ft-trait>) (c <ft-trait>)))
    (a-tokens (tuple (a <a-ft-trait>) (b <a-ft-trait>) (c <a-ft-trait>) (d <a-ft-trait>)))
    (a-factors (tuple (a uint) (b uint) (c uint)))
  )
  (let (
    (quote-a (if (is-eq swaps-reversed false)
                 (unwrap! (charisma-qb amount c-tokens) ERR_QUOTE_A)
                 (unwrap! (alex-qc amount a-tokens a-factors) ERR_QUOTE_A)))
    (scaled-amount (if (is-eq swaps-reversed false)
                       (unwrap! (scale-charisma-amount quote-a (get c c-tokens) (get a a-tokens)) ERR_SCALED_AMOUNT_A)
                       (unwrap! (scale-alex-amount quote-a (get d a-tokens) (get a c-tokens)) ERR_SCALED_AMOUNT_A)))
    (quote-b (if (is-eq swaps-reversed false)
                 (unwrap! (alex-qc scaled-amount a-tokens a-factors) ERR_QUOTE_B)
                 (unwrap! (charisma-qb scaled-amount c-tokens) ERR_QUOTE_B)))
  )
    (ok quote-b)
  )
)

(define-public (get-quote-h
    (amount uint)
    (swaps-reversed bool)
    (c-tokens (tuple (a <ft-trait>) (b <ft-trait>) (c <ft-trait>)))
    (a-tokens (tuple (a <a-ft-trait>) (b <a-ft-trait>) (c <a-ft-trait>) (d <a-ft-trait>) (e <a-ft-trait>)))
    (a-factors (tuple (a uint) (b uint) (c uint) (d uint)))
  )
  (let (
    (quote-a (if (is-eq swaps-reversed false)
                 (unwrap! (charisma-qb amount c-tokens) ERR_QUOTE_A)
                 (unwrap! (alex-qd amount a-tokens a-factors) ERR_QUOTE_A)))
    (scaled-amount (if (is-eq swaps-reversed false)
                       (unwrap! (scale-charisma-amount quote-a (get c c-tokens) (get a a-tokens)) ERR_SCALED_AMOUNT_A)
                       (unwrap! (scale-alex-amount quote-a (get e a-tokens) (get a c-tokens)) ERR_SCALED_AMOUNT_A)))
    (quote-b (if (is-eq swaps-reversed false)
                 (unwrap! (alex-qd scaled-amount a-tokens a-factors) ERR_QUOTE_B)
                 (unwrap! (charisma-qb scaled-amount c-tokens) ERR_QUOTE_B)))
  )
    (ok quote-b)
  )
)

(define-public (get-quote-i
    (amount uint)
    (swaps-reversed bool)
    (c-tokens (tuple (a <ft-trait>) (b <ft-trait>) (c <ft-trait>) (d <ft-trait>)))
    (a-tokens (tuple (a <a-ft-trait>) (b <a-ft-trait>)))
    (a-factors (tuple (a uint)))
  )
  (let (
    (quote-a (if (is-eq swaps-reversed false)
                 (unwrap! (charisma-qc amount c-tokens) ERR_QUOTE_A)
                 (unwrap! (alex-qa amount a-tokens a-factors) ERR_QUOTE_A)))
    (scaled-amount (if (is-eq swaps-reversed false)
                       (unwrap! (scale-charisma-amount quote-a (get d c-tokens) (get a a-tokens)) ERR_SCALED_AMOUNT_A)
                       (unwrap! (scale-alex-amount quote-a (get b a-tokens) (get a c-tokens)) ERR_SCALED_AMOUNT_A)))
    (quote-b (if (is-eq swaps-reversed false)
                 (unwrap! (alex-qa scaled-amount a-tokens a-factors) ERR_QUOTE_B)
                 (unwrap! (charisma-qc scaled-amount c-tokens) ERR_QUOTE_B)))
  )
    (ok quote-b)
  )
)

(define-public (get-quote-j
    (amount uint)
    (swaps-reversed bool)
    (c-tokens (tuple (a <ft-trait>) (b <ft-trait>) (c <ft-trait>) (d <ft-trait>)))
    (a-tokens (tuple (a <a-ft-trait>) (b <a-ft-trait>) (c <a-ft-trait>)))
    (a-factors (tuple (a uint) (b uint)))
  )
  (let (
    (quote-a (if (is-eq swaps-reversed false)
                 (unwrap! (charisma-qc amount c-tokens) ERR_QUOTE_A)
                 (unwrap! (alex-qb amount a-tokens a-factors) ERR_QUOTE_A)))
    (scaled-amount (if (is-eq swaps-reversed false)
                       (unwrap! (scale-charisma-amount quote-a (get d c-tokens) (get a a-tokens)) ERR_SCALED_AMOUNT_A)
                       (unwrap! (scale-alex-amount quote-a (get c a-tokens) (get a c-tokens)) ERR_SCALED_AMOUNT_A)))
    (quote-b (if (is-eq swaps-reversed false)
                 (unwrap! (alex-qb scaled-amount a-tokens a-factors) ERR_QUOTE_B)
                 (unwrap! (charisma-qc scaled-amount c-tokens) ERR_QUOTE_B)))
  )
    (ok quote-b)
  )
)

(define-public (get-quote-k
    (amount uint)
    (swaps-reversed bool)
    (c-tokens (tuple (a <ft-trait>) (b <ft-trait>) (c <ft-trait>) (d <ft-trait>)))
    (a-tokens (tuple (a <a-ft-trait>) (b <a-ft-trait>) (c <a-ft-trait>) (d <a-ft-trait>)))
    (a-factors (tuple (a uint) (b uint) (c uint)))
  )
  (let (
    (quote-a (if (is-eq swaps-reversed false)
                 (unwrap! (charisma-qc amount c-tokens) ERR_QUOTE_A)
                 (unwrap! (alex-qc amount a-tokens a-factors) ERR_QUOTE_A)))
    (scaled-amount (if (is-eq swaps-reversed false)
                       (unwrap! (scale-charisma-amount quote-a (get d c-tokens) (get a a-tokens)) ERR_SCALED_AMOUNT_A)
                       (unwrap! (scale-alex-amount quote-a (get d a-tokens) (get a c-tokens)) ERR_SCALED_AMOUNT_A)))
    (quote-b (if (is-eq swaps-reversed false)
                 (unwrap! (alex-qc scaled-amount a-tokens a-factors) ERR_QUOTE_B)
                 (unwrap! (charisma-qc scaled-amount c-tokens) ERR_QUOTE_B)))
  )
    (ok quote-b)
  )
)

(define-public (get-quote-l
    (amount uint)
    (swaps-reversed bool)
    (c-tokens (tuple (a <ft-trait>) (b <ft-trait>) (c <ft-trait>) (d <ft-trait>)))
    (a-tokens (tuple (a <a-ft-trait>) (b <a-ft-trait>) (c <a-ft-trait>) (d <a-ft-trait>) (e <a-ft-trait>)))
    (a-factors (tuple (a uint) (b uint) (c uint) (d uint)))
  )
  (let (
    (quote-a (if (is-eq swaps-reversed false)
                 (unwrap! (charisma-qc amount c-tokens) ERR_QUOTE_A)
                 (unwrap! (alex-qd amount a-tokens a-factors) ERR_QUOTE_A)))
    (scaled-amount (if (is-eq swaps-reversed false)
                       (unwrap! (scale-charisma-amount quote-a (get d c-tokens) (get a a-tokens)) ERR_SCALED_AMOUNT_A)
                       (unwrap! (scale-alex-amount quote-a (get e a-tokens) (get a c-tokens)) ERR_SCALED_AMOUNT_A)))
    (quote-b (if (is-eq swaps-reversed false)
                 (unwrap! (alex-qd scaled-amount a-tokens a-factors) ERR_QUOTE_B)
                 (unwrap! (charisma-qc scaled-amount c-tokens) ERR_QUOTE_B)))
  )
    (ok quote-b)
  )
)

(define-public (get-quote-m
    (amount uint)
    (swaps-reversed bool)
    (c-tokens (tuple (a <ft-trait>) (b <ft-trait>) (c <ft-trait>) (d <ft-trait>) (e <ft-trait>)))
    (a-tokens (tuple (a <a-ft-trait>) (b <a-ft-trait>)))
    (a-factors (tuple (a uint)))
  )
  (let (
    (quote-a (if (is-eq swaps-reversed false)
                 (unwrap! (charisma-qd amount c-tokens) ERR_QUOTE_A)
                 (unwrap! (alex-qa amount a-tokens a-factors) ERR_QUOTE_A)))
    (scaled-amount (if (is-eq swaps-reversed false)
                       (unwrap! (scale-charisma-amount quote-a (get e c-tokens) (get a a-tokens)) ERR_SCALED_AMOUNT_A)
                       (unwrap! (scale-alex-amount quote-a (get b a-tokens) (get a c-tokens)) ERR_SCALED_AMOUNT_A)))
    (quote-b (if (is-eq swaps-reversed false)
                 (unwrap! (alex-qa scaled-amount a-tokens a-factors) ERR_QUOTE_B)
                 (unwrap! (charisma-qd scaled-amount c-tokens) ERR_QUOTE_B)))
  )
    (ok quote-b)
  )
)

(define-public (get-quote-n
    (amount uint)
    (swaps-reversed bool)
    (c-tokens (tuple (a <ft-trait>) (b <ft-trait>) (c <ft-trait>) (d <ft-trait>) (e <ft-trait>)))
    (a-tokens (tuple (a <a-ft-trait>) (b <a-ft-trait>) (c <a-ft-trait>)))
    (a-factors (tuple (a uint) (b uint)))
  )
  (let (
    (quote-a (if (is-eq swaps-reversed false)
                 (unwrap! (charisma-qd amount c-tokens) ERR_QUOTE_A)
                 (unwrap! (alex-qb amount a-tokens a-factors) ERR_QUOTE_A)))
    (scaled-amount (if (is-eq swaps-reversed false)
                       (unwrap! (scale-charisma-amount quote-a (get e c-tokens) (get a a-tokens)) ERR_SCALED_AMOUNT_A)
                       (unwrap! (scale-alex-amount quote-a (get c a-tokens) (get a c-tokens)) ERR_SCALED_AMOUNT_A)))
    (quote-b (if (is-eq swaps-reversed false)
                 (unwrap! (alex-qb scaled-amount a-tokens a-factors) ERR_QUOTE_B)
                 (unwrap! (charisma-qd scaled-amount c-tokens) ERR_QUOTE_B)))
  )
    (ok quote-b)
  )
)

(define-public (get-quote-o
    (amount uint)
    (swaps-reversed bool)
    (c-tokens (tuple (a <ft-trait>) (b <ft-trait>) (c <ft-trait>) (d <ft-trait>) (e <ft-trait>)))
    (a-tokens (tuple (a <a-ft-trait>) (b <a-ft-trait>) (c <a-ft-trait>) (d <a-ft-trait>)))
    (a-factors (tuple (a uint) (b uint) (c uint)))
  )
  (let (
    (quote-a (if (is-eq swaps-reversed false)
                 (unwrap! (charisma-qd amount c-tokens) ERR_QUOTE_A)
                 (unwrap! (alex-qc amount a-tokens a-factors) ERR_QUOTE_A)))
    (scaled-amount (if (is-eq swaps-reversed false)
                       (unwrap! (scale-charisma-amount quote-a (get e c-tokens) (get a a-tokens)) ERR_SCALED_AMOUNT_A)
                       (unwrap! (scale-alex-amount quote-a (get d a-tokens) (get a c-tokens)) ERR_SCALED_AMOUNT_A)))
    (quote-b (if (is-eq swaps-reversed false)
                 (unwrap! (alex-qc scaled-amount a-tokens a-factors) ERR_QUOTE_B)
                 (unwrap! (charisma-qd scaled-amount c-tokens) ERR_QUOTE_B)))
  )
    (ok quote-b)
  )
)

(define-public (get-quote-p
    (amount uint)
    (swaps-reversed bool)
    (c-tokens (tuple (a <ft-trait>) (b <ft-trait>) (c <ft-trait>) (d <ft-trait>) (e <ft-trait>)))
    (a-tokens (tuple (a <a-ft-trait>) (b <a-ft-trait>) (c <a-ft-trait>) (d <a-ft-trait>) (e <a-ft-trait>)))
    (a-factors (tuple (a uint) (b uint) (c uint) (d uint)))
  )
  (let (
    (quote-a (if (is-eq swaps-reversed false)
                 (unwrap! (charisma-qd amount c-tokens) ERR_QUOTE_A)
                 (unwrap! (alex-qd amount a-tokens a-factors) ERR_QUOTE_A)))
    (scaled-amount (if (is-eq swaps-reversed false)
                       (unwrap! (scale-charisma-amount quote-a (get e c-tokens) (get a a-tokens)) ERR_SCALED_AMOUNT_A)
                       (unwrap! (scale-alex-amount quote-a (get e a-tokens) (get a c-tokens)) ERR_SCALED_AMOUNT_A)))
    (quote-b (if (is-eq swaps-reversed false)
                 (unwrap! (alex-qd scaled-amount a-tokens a-factors) ERR_QUOTE_B)
                 (unwrap! (charisma-qd scaled-amount c-tokens) ERR_QUOTE_B)))
  )
    (ok quote-b)
  )
)

(define-public (swap-helper-a
    (amount uint) (min-received uint)
    (swaps-reversed bool)
    (c-tokens (tuple (a <ft-trait>) (b <ft-trait>)))
    (c-share-fee-to <share-fee-to-trait>)
    (a-tokens (tuple (a <a-ft-trait>) (b <a-ft-trait>)))
    (a-factors (tuple (a uint)))
  )
  (let (
    (swap-a (if (is-eq swaps-reversed false)
                (unwrap! (charisma-sa amount c-tokens c-share-fee-to) ERR_SWAP_A)
                (unwrap! (alex-sa amount a-tokens a-factors) ERR_SWAP_A)))
    (scaled-amount (if (is-eq swaps-reversed false)
                       (unwrap! (scale-charisma-amount swap-a (get b c-tokens) (get a a-tokens)) ERR_SCALED_AMOUNT_A)
                       (unwrap! (scale-alex-amount swap-a (get b a-tokens) (get a c-tokens)) ERR_SCALED_AMOUNT_A)))
    (swap-b (if (is-eq swaps-reversed false)
                (unwrap! (alex-sa scaled-amount a-tokens a-factors) ERR_SWAP_B)
                (unwrap! (charisma-sa scaled-amount c-tokens c-share-fee-to) ERR_SWAP_B)))
  )
    (begin
      (asserts! (is-eq (var-get swap-status) true) ERR_SWAP_STATUS)
      (asserts! (> amount u0) ERR_INVALID_AMOUNT)
      (asserts! (>= swap-b min-received) ERR_MINIMUM_RECEIVED)
      (print {
        action: "swap-helper-a",
        caller: tx-sender, 
        data: {
          amount: amount,
          min-received: min-received,
          received: swap-b,
          swaps-reversed: swaps-reversed,
          charisma-data: {
            c-tokens: c-tokens,
            c-share-fee-to: c-share-fee-to,
            c-swap: (if (is-eq swaps-reversed false) swap-a swap-b)
          },
          alex-data: {
            a-tokens: a-tokens,
            a-factors: a-factors,
            a-swap: (if (is-eq swaps-reversed false) swap-b swap-a)
          }
        }
      })
      (ok swap-b)
    )
  )
)

(define-public (swap-helper-b
    (amount uint) (min-received uint)
    (swaps-reversed bool)
    (c-tokens (tuple (a <ft-trait>) (b <ft-trait>)))
    (c-share-fee-to <share-fee-to-trait>)
    (a-tokens (tuple (a <a-ft-trait>) (b <a-ft-trait>) (c <a-ft-trait>)))
    (a-factors (tuple (a uint) (b uint)))
  )
  (let (
    (swap-a (if (is-eq swaps-reversed false)
                (unwrap! (charisma-sa amount c-tokens c-share-fee-to) ERR_SWAP_A)
                (unwrap! (alex-sb amount a-tokens a-factors) ERR_SWAP_A)))
    (scaled-amount (if (is-eq swaps-reversed false)
                       (unwrap! (scale-charisma-amount swap-a (get b c-tokens) (get a a-tokens)) ERR_SCALED_AMOUNT_A)
                       (unwrap! (scale-alex-amount swap-a (get c a-tokens) (get a c-tokens)) ERR_SCALED_AMOUNT_A)))
    (swap-b (if (is-eq swaps-reversed false)
                (unwrap! (alex-sb scaled-amount a-tokens a-factors) ERR_SWAP_B)
                (unwrap! (charisma-sa scaled-amount c-tokens c-share-fee-to) ERR_SWAP_B)))
  )
    (begin
      (asserts! (is-eq (var-get swap-status) true) ERR_SWAP_STATUS)
      (asserts! (> amount u0) ERR_INVALID_AMOUNT)
      (asserts! (>= swap-b min-received) ERR_MINIMUM_RECEIVED)
      (print {
        action: "swap-helper-b",
        caller: tx-sender, 
        data: {
          amount: amount,
          min-received: min-received,
          received: swap-b,
          swaps-reversed: swaps-reversed,
          charisma-data: {
            c-tokens: c-tokens,
            c-share-fee-to: c-share-fee-to,
            c-swap: (if (is-eq swaps-reversed false) swap-a swap-b)
          },
          alex-data: {
            a-tokens: a-tokens,
            a-factors: a-factors,
            a-swap: (if (is-eq swaps-reversed false) swap-b swap-a)
          }
        }
      })
      (ok swap-b)
    )
  )
)

(define-public (swap-helper-c
    (amount uint) (min-received uint)
    (swaps-reversed bool)
    (c-tokens (tuple (a <ft-trait>) (b <ft-trait>)))
    (c-share-fee-to <share-fee-to-trait>)
    (a-tokens (tuple (a <a-ft-trait>) (b <a-ft-trait>) (c <a-ft-trait>) (d <a-ft-trait>)))
    (a-factors (tuple (a uint) (b uint) (c uint)))
  )
  (let (
    (swap-a (if (is-eq swaps-reversed false)
                (unwrap! (charisma-sa amount c-tokens c-share-fee-to) ERR_SWAP_A)
                (unwrap! (alex-sc amount a-tokens a-factors) ERR_SWAP_A)))
    (scaled-amount (if (is-eq swaps-reversed false)
                       (unwrap! (scale-charisma-amount swap-a (get b c-tokens) (get a a-tokens)) ERR_SCALED_AMOUNT_A)
                       (unwrap! (scale-alex-amount swap-a (get d a-tokens) (get a c-tokens)) ERR_SCALED_AMOUNT_A)))
    (swap-b (if (is-eq swaps-reversed false)
                (unwrap! (alex-sc scaled-amount a-tokens a-factors) ERR_SWAP_B)
                (unwrap! (charisma-sa scaled-amount c-tokens c-share-fee-to) ERR_SWAP_B)))
  )
    (begin
      (asserts! (is-eq (var-get swap-status) true) ERR_SWAP_STATUS)
      (asserts! (> amount u0) ERR_INVALID_AMOUNT)
      (asserts! (>= swap-b min-received) ERR_MINIMUM_RECEIVED)
      (print {
        action: "swap-helper-c",
        caller: tx-sender, 
        data: {
          amount: amount,
          min-received: min-received,
          received: swap-b,
          swaps-reversed: swaps-reversed,
          charisma-data: {
            c-tokens: c-tokens,
            c-share-fee-to: c-share-fee-to,
            c-swap: (if (is-eq swaps-reversed false) swap-a swap-b)
          },
          alex-data: {
            a-tokens: a-tokens,
            a-factors: a-factors,
            a-swap: (if (is-eq swaps-reversed false) swap-b swap-a)
          }
        }
      })
      (ok swap-b)
    )
  )
)

(define-public (swap-helper-d
    (amount uint) (min-received uint)
    (swaps-reversed bool)
    (c-tokens (tuple (a <ft-trait>) (b <ft-trait>)))
    (c-share-fee-to <share-fee-to-trait>)
    (a-tokens (tuple (a <a-ft-trait>) (b <a-ft-trait>) (c <a-ft-trait>) (d <a-ft-trait>) (e <a-ft-trait>)))
    (a-factors (tuple (a uint) (b uint) (c uint) (d uint)))
  )
  (let (
    (swap-a (if (is-eq swaps-reversed false)
                (unwrap! (charisma-sa amount c-tokens c-share-fee-to) ERR_SWAP_A)
                (unwrap! (alex-sd amount a-tokens a-factors) ERR_SWAP_A)))
    (scaled-amount (if (is-eq swaps-reversed false)
                       (unwrap! (scale-charisma-amount swap-a (get b c-tokens) (get a a-tokens)) ERR_SCALED_AMOUNT_A)
                       (unwrap! (scale-alex-amount swap-a (get e a-tokens) (get a c-tokens)) ERR_SCALED_AMOUNT_A)))
    (swap-b (if (is-eq swaps-reversed false)
                (unwrap! (alex-sd scaled-amount a-tokens a-factors) ERR_SWAP_B)
                (unwrap! (charisma-sa scaled-amount c-tokens c-share-fee-to) ERR_SWAP_B)))
  )
    (begin
      (asserts! (is-eq (var-get swap-status) true) ERR_SWAP_STATUS)
      (asserts! (> amount u0) ERR_INVALID_AMOUNT)
      (asserts! (>= swap-b min-received) ERR_MINIMUM_RECEIVED)
      (print {
        action: "swap-helper-d",
        caller: tx-sender, 
        data: {
          amount: amount,
          min-received: min-received,
          received: swap-b,
          swaps-reversed: swaps-reversed,
          charisma-data: {
            c-tokens: c-tokens,
            c-share-fee-to: c-share-fee-to,
            c-swap: (if (is-eq swaps-reversed false) swap-a swap-b)
          },
          alex-data: {
            a-tokens: a-tokens,
            a-factors: a-factors,
            a-swap: (if (is-eq swaps-reversed false) swap-b swap-a)
          }
        }
      })
      (ok swap-b)
    )
  )
)

(define-public (swap-helper-e
    (amount uint) (min-received uint)
    (swaps-reversed bool)
    (c-tokens (tuple (a <ft-trait>) (b <ft-trait>) (c <ft-trait>)))
    (c-share-fee-to <share-fee-to-trait>)
    (a-tokens (tuple (a <a-ft-trait>) (b <a-ft-trait>)))
    (a-factors (tuple (a uint)))
  )
  (let (
    (swap-a (if (is-eq swaps-reversed false)
                (unwrap! (charisma-sb amount c-tokens c-share-fee-to) ERR_SWAP_A)
                (unwrap! (alex-sa amount a-tokens a-factors) ERR_SWAP_A)))
    (scaled-amount (if (is-eq swaps-reversed false)
                       (unwrap! (scale-charisma-amount swap-a (get c c-tokens) (get a a-tokens)) ERR_SCALED_AMOUNT_A)
                       (unwrap! (scale-alex-amount swap-a (get b a-tokens) (get a c-tokens)) ERR_SCALED_AMOUNT_A)))
    (swap-b (if (is-eq swaps-reversed false)
                (unwrap! (alex-sa scaled-amount a-tokens a-factors) ERR_SWAP_B)
                (unwrap! (charisma-sb scaled-amount c-tokens c-share-fee-to) ERR_SWAP_B)))
  )
    (begin
      (asserts! (is-eq (var-get swap-status) true) ERR_SWAP_STATUS)
      (asserts! (> amount u0) ERR_INVALID_AMOUNT)
      (asserts! (>= swap-b min-received) ERR_MINIMUM_RECEIVED)
      (print {
        action: "swap-helper-e",
        caller: tx-sender, 
        data: {
          amount: amount,
          min-received: min-received,
          received: swap-b,
          swaps-reversed: swaps-reversed,
          charisma-data: {
            c-tokens: c-tokens,
            c-share-fee-to: c-share-fee-to,
            c-swap: (if (is-eq swaps-reversed false) swap-a swap-b)
          },
          alex-data: {
            a-tokens: a-tokens,
            a-factors: a-factors,
            a-swap: (if (is-eq swaps-reversed false) swap-b swap-a)
          }
        }
      })
      (ok swap-b)
    )
  )
)

(define-public (swap-helper-f
    (amount uint) (min-received uint)
    (swaps-reversed bool)
    (c-tokens (tuple (a <ft-trait>) (b <ft-trait>) (c <ft-trait>)))
    (c-share-fee-to <share-fee-to-trait>)
    (a-tokens (tuple (a <a-ft-trait>) (b <a-ft-trait>) (c <a-ft-trait>)))
    (a-factors (tuple (a uint) (b uint)))
  )
  (let (
    (swap-a (if (is-eq swaps-reversed false)
                (unwrap! (charisma-sb amount c-tokens c-share-fee-to) ERR_SWAP_A)
                (unwrap! (alex-sb amount a-tokens a-factors) ERR_SWAP_A)))
    (scaled-amount (if (is-eq swaps-reversed false)
                       (unwrap! (scale-charisma-amount swap-a (get c c-tokens) (get a a-tokens)) ERR_SCALED_AMOUNT_A)
                       (unwrap! (scale-alex-amount swap-a (get c a-tokens) (get a c-tokens)) ERR_SCALED_AMOUNT_A)))
    (swap-b (if (is-eq swaps-reversed false)
                (unwrap! (alex-sb scaled-amount a-tokens a-factors) ERR_SWAP_B)
                (unwrap! (charisma-sb scaled-amount c-tokens c-share-fee-to) ERR_SWAP_B)))
  )
    (begin
      (asserts! (is-eq (var-get swap-status) true) ERR_SWAP_STATUS)
      (asserts! (> amount u0) ERR_INVALID_AMOUNT)
      (asserts! (>= swap-b min-received) ERR_MINIMUM_RECEIVED)
      (print {
        action: "swap-helper-f",
        caller: tx-sender, 
        data: {
          amount: amount,
          min-received: min-received,
          received: swap-b,
          swaps-reversed: swaps-reversed,
          charisma-data: {
            c-tokens: c-tokens,
            c-share-fee-to: c-share-fee-to,
            c-swap: (if (is-eq swaps-reversed false) swap-a swap-b)
          },
          alex-data: {
            a-tokens: a-tokens,
            a-factors: a-factors,
            a-swap: (if (is-eq swaps-reversed false) swap-b swap-a)
          }
        }
      })
      (ok swap-b)
    )
  )
)

(define-public (swap-helper-g
    (amount uint) (min-received uint)
    (swaps-reversed bool)
    (c-tokens (tuple (a <ft-trait>) (b <ft-trait>) (c <ft-trait>)))
    (c-share-fee-to <share-fee-to-trait>)
    (a-tokens (tuple (a <a-ft-trait>) (b <a-ft-trait>) (c <a-ft-trait>) (d <a-ft-trait>)))
    (a-factors (tuple (a uint) (b uint) (c uint)))
  )
  (let (
    (swap-a (if (is-eq swaps-reversed false)
                (unwrap! (charisma-sb amount c-tokens c-share-fee-to) ERR_SWAP_A)
                (unwrap! (alex-sc amount a-tokens a-factors) ERR_SWAP_A)))
    (scaled-amount (if (is-eq swaps-reversed false)
                       (unwrap! (scale-charisma-amount swap-a (get c c-tokens) (get a a-tokens)) ERR_SCALED_AMOUNT_A)
                       (unwrap! (scale-alex-amount swap-a (get d a-tokens) (get a c-tokens)) ERR_SCALED_AMOUNT_A)))
    (swap-b (if (is-eq swaps-reversed false)
                (unwrap! (alex-sc scaled-amount a-tokens a-factors) ERR_SWAP_B)
                (unwrap! (charisma-sb scaled-amount c-tokens c-share-fee-to) ERR_SWAP_B)))
  )
    (begin
      (asserts! (is-eq (var-get swap-status) true) ERR_SWAP_STATUS)
      (asserts! (> amount u0) ERR_INVALID_AMOUNT)
      (asserts! (>= swap-b min-received) ERR_MINIMUM_RECEIVED)
      (print {
        action: "swap-helper-g",
        caller: tx-sender, 
        data: {
          amount: amount,
          min-received: min-received,
          received: swap-b,
          swaps-reversed: swaps-reversed,
          charisma-data: {
            c-tokens: c-tokens,
            c-share-fee-to: c-share-fee-to,
            c-swap: (if (is-eq swaps-reversed false) swap-a swap-b)
          },
          alex-data: {
            a-tokens: a-tokens,
            a-factors: a-factors,
            a-swap: (if (is-eq swaps-reversed false) swap-b swap-a)
          }
        }
      })
      (ok swap-b)
    )
  )
)

(define-public (swap-helper-h
    (amount uint) (min-received uint)
    (swaps-reversed bool)
    (c-tokens (tuple (a <ft-trait>) (b <ft-trait>) (c <ft-trait>)))
    (c-share-fee-to <share-fee-to-trait>)
    (a-tokens (tuple (a <a-ft-trait>) (b <a-ft-trait>) (c <a-ft-trait>) (d <a-ft-trait>) (e <a-ft-trait>)))
    (a-factors (tuple (a uint) (b uint) (c uint) (d uint)))
  )
  (let (
    (swap-a (if (is-eq swaps-reversed false)
                (unwrap! (charisma-sb amount c-tokens c-share-fee-to) ERR_SWAP_A)
                (unwrap! (alex-sd amount a-tokens a-factors) ERR_SWAP_A)))
    (scaled-amount (if (is-eq swaps-reversed false)
                       (unwrap! (scale-charisma-amount swap-a (get c c-tokens) (get a a-tokens)) ERR_SCALED_AMOUNT_A)
                       (unwrap! (scale-alex-amount swap-a (get e a-tokens) (get a c-tokens)) ERR_SCALED_AMOUNT_A)))
    (swap-b (if (is-eq swaps-reversed false)
                (unwrap! (alex-sd scaled-amount a-tokens a-factors) ERR_SWAP_B)
                (unwrap! (charisma-sb scaled-amount c-tokens c-share-fee-to) ERR_SWAP_B)))
  )
    (begin
      (asserts! (is-eq (var-get swap-status) true) ERR_SWAP_STATUS)
      (asserts! (> amount u0) ERR_INVALID_AMOUNT)
      (asserts! (>= swap-b min-received) ERR_MINIMUM_RECEIVED)
      (print {
        action: "swap-helper-h",
        caller: tx-sender, 
        data: {
          amount: amount,
          min-received: min-received,
          received: swap-b,
          swaps-reversed: swaps-reversed,
          charisma-data: {
            c-tokens: c-tokens,
            c-share-fee-to: c-share-fee-to,
            c-swap: (if (is-eq swaps-reversed false) swap-a swap-b)
          },
          alex-data: {
            a-tokens: a-tokens,
            a-factors: a-factors,
            a-swap: (if (is-eq swaps-reversed false) swap-b swap-a)
          }
        }
      })
      (ok swap-b)
    )
  )
)

(define-public (swap-helper-i
    (amount uint) (min-received uint)
    (swaps-reversed bool)
    (c-tokens (tuple (a <ft-trait>) (b <ft-trait>) (c <ft-trait>) (d <ft-trait>)))
    (c-share-fee-to <share-fee-to-trait>)
    (a-tokens (tuple (a <a-ft-trait>) (b <a-ft-trait>)))
    (a-factors (tuple (a uint)))
  )
  (let (
    (swap-a (if (is-eq swaps-reversed false)
                (unwrap! (charisma-sc amount c-tokens c-share-fee-to) ERR_SWAP_A)
                (unwrap! (alex-sa amount a-tokens a-factors) ERR_SWAP_A)))
    (scaled-amount (if (is-eq swaps-reversed false)
                       (unwrap! (scale-charisma-amount swap-a (get d c-tokens) (get a a-tokens)) ERR_SCALED_AMOUNT_A)
                       (unwrap! (scale-alex-amount swap-a (get b a-tokens) (get a c-tokens)) ERR_SCALED_AMOUNT_A)))
    (swap-b (if (is-eq swaps-reversed false)
                (unwrap! (alex-sa scaled-amount a-tokens a-factors) ERR_SWAP_B)
                (unwrap! (charisma-sc scaled-amount c-tokens c-share-fee-to) ERR_SWAP_B)))
  )
    (begin
      (asserts! (is-eq (var-get swap-status) true) ERR_SWAP_STATUS)
      (asserts! (> amount u0) ERR_INVALID_AMOUNT)
      (asserts! (>= swap-b min-received) ERR_MINIMUM_RECEIVED)
      (print {
        action: "swap-helper-i",
        caller: tx-sender, 
        data: {
          amount: amount,
          min-received: min-received,
          received: swap-b,
          swaps-reversed: swaps-reversed,
          charisma-data: {
            c-tokens: c-tokens,
            c-share-fee-to: c-share-fee-to,
            c-swap: (if (is-eq swaps-reversed false) swap-a swap-b)
          },
          alex-data: {
            a-tokens: a-tokens,
            a-factors: a-factors,
            a-swap: (if (is-eq swaps-reversed false) swap-b swap-a)
          }
        }
      })
      (ok swap-b)
    )
  )
)

(define-public (swap-helper-j
    (amount uint) (min-received uint)
    (swaps-reversed bool)
    (c-tokens (tuple (a <ft-trait>) (b <ft-trait>) (c <ft-trait>) (d <ft-trait>)))
    (c-share-fee-to <share-fee-to-trait>)
    (a-tokens (tuple (a <a-ft-trait>) (b <a-ft-trait>) (c <a-ft-trait>)))
    (a-factors (tuple (a uint) (b uint)))
  )
  (let (
    (swap-a (if (is-eq swaps-reversed false)
                (unwrap! (charisma-sc amount c-tokens c-share-fee-to) ERR_SWAP_A)
                (unwrap! (alex-sb amount a-tokens a-factors) ERR_SWAP_A)))
    (scaled-amount (if (is-eq swaps-reversed false)
                       (unwrap! (scale-charisma-amount swap-a (get d c-tokens) (get a a-tokens)) ERR_SCALED_AMOUNT_A)
                       (unwrap! (scale-alex-amount swap-a (get c a-tokens) (get a c-tokens)) ERR_SCALED_AMOUNT_A)))
    (swap-b (if (is-eq swaps-reversed false)
                (unwrap! (alex-sb scaled-amount a-tokens a-factors) ERR_SWAP_B)
                (unwrap! (charisma-sc scaled-amount c-tokens c-share-fee-to) ERR_SWAP_B)))
  )
    (begin
      (asserts! (is-eq (var-get swap-status) true) ERR_SWAP_STATUS)
      (asserts! (> amount u0) ERR_INVALID_AMOUNT)
      (asserts! (>= swap-b min-received) ERR_MINIMUM_RECEIVED)
      (print {
        action: "swap-helper-j",
        caller: tx-sender, 
        data: {
          amount: amount,
          min-received: min-received,
          received: swap-b,
          swaps-reversed: swaps-reversed,
          charisma-data: {
            c-tokens: c-tokens,
            c-share-fee-to: c-share-fee-to,
            c-swap: (if (is-eq swaps-reversed false) swap-a swap-b)
          },
          alex-data: {
            a-tokens: a-tokens,
            a-factors: a-factors,
            a-swap: (if (is-eq swaps-reversed false) swap-b swap-a)
          }
        }
      })
      (ok swap-b)
    )
  )
)

(define-public (swap-helper-k
    (amount uint) (min-received uint)
    (swaps-reversed bool)
    (c-tokens (tuple (a <ft-trait>) (b <ft-trait>) (c <ft-trait>) (d <ft-trait>)))
    (c-share-fee-to <share-fee-to-trait>)
    (a-tokens (tuple (a <a-ft-trait>) (b <a-ft-trait>) (c <a-ft-trait>) (d <a-ft-trait>)))
    (a-factors (tuple (a uint) (b uint) (c uint)))
  )
  (let (
    (swap-a (if (is-eq swaps-reversed false)
                (unwrap! (charisma-sc amount c-tokens c-share-fee-to) ERR_SWAP_A)
                (unwrap! (alex-sc amount a-tokens a-factors) ERR_SWAP_A)))
    (scaled-amount (if (is-eq swaps-reversed false)
                       (unwrap! (scale-charisma-amount swap-a (get d c-tokens) (get a a-tokens)) ERR_SCALED_AMOUNT_A)
                       (unwrap! (scale-alex-amount swap-a (get d a-tokens) (get a c-tokens)) ERR_SCALED_AMOUNT_A)))
    (swap-b (if (is-eq swaps-reversed false)
                (unwrap! (alex-sc scaled-amount a-tokens a-factors) ERR_SWAP_B)
                (unwrap! (charisma-sc scaled-amount c-tokens c-share-fee-to) ERR_SWAP_B)))
  )
    (begin
      (asserts! (is-eq (var-get swap-status) true) ERR_SWAP_STATUS)
      (asserts! (> amount u0) ERR_INVALID_AMOUNT)
      (asserts! (>= swap-b min-received) ERR_MINIMUM_RECEIVED)
      (print {
        action: "swap-helper-k",
        caller: tx-sender, 
        data: {
          amount: amount,
          min-received: min-received,
          received: swap-b,
          swaps-reversed: swaps-reversed,
          charisma-data: {
            c-tokens: c-tokens,
            c-share-fee-to: c-share-fee-to,
            c-swap: (if (is-eq swaps-reversed false) swap-a swap-b)
          },
          alex-data: {
            a-tokens: a-tokens,
            a-factors: a-factors,
            a-swap: (if (is-eq swaps-reversed false) swap-b swap-a)
          }
        }
      })
      (ok swap-b)
    )
  )
)

(define-public (swap-helper-l
    (amount uint) (min-received uint)
    (swaps-reversed bool)
    (c-tokens (tuple (a <ft-trait>) (b <ft-trait>) (c <ft-trait>) (d <ft-trait>)))
    (c-share-fee-to <share-fee-to-trait>)
    (a-tokens (tuple (a <a-ft-trait>) (b <a-ft-trait>) (c <a-ft-trait>) (d <a-ft-trait>) (e <a-ft-trait>)))
    (a-factors (tuple (a uint) (b uint) (c uint) (d uint)))
  )
  (let (
    (swap-a (if (is-eq swaps-reversed false)
                (unwrap! (charisma-sc amount c-tokens c-share-fee-to) ERR_SWAP_A)
                (unwrap! (alex-sd amount a-tokens a-factors) ERR_SWAP_A)))
    (scaled-amount (if (is-eq swaps-reversed false)
                       (unwrap! (scale-charisma-amount swap-a (get d c-tokens) (get a a-tokens)) ERR_SCALED_AMOUNT_A)
                       (unwrap! (scale-alex-amount swap-a (get e a-tokens) (get a c-tokens)) ERR_SCALED_AMOUNT_A)))
    (swap-b (if (is-eq swaps-reversed false)
                (unwrap! (alex-sd scaled-amount a-tokens a-factors) ERR_SWAP_B)
                (unwrap! (charisma-sc scaled-amount c-tokens c-share-fee-to) ERR_SWAP_B)))
  )
    (begin
      (asserts! (is-eq (var-get swap-status) true) ERR_SWAP_STATUS)
      (asserts! (> amount u0) ERR_INVALID_AMOUNT)
      (asserts! (>= swap-b min-received) ERR_MINIMUM_RECEIVED)
      (print {
        action: "swap-helper-l",
        caller: tx-sender, 
        data: {
          amount: amount,
          min-received: min-received,
          received: swap-b,
          swaps-reversed: swaps-reversed,
          charisma-data: {
            c-tokens: c-tokens,
            c-share-fee-to: c-share-fee-to,
            c-swap: (if (is-eq swaps-reversed false) swap-a swap-b)
          },
          alex-data: {
            a-tokens: a-tokens,
            a-factors: a-factors,
            a-swap: (if (is-eq swaps-reversed false) swap-b swap-a)
          }
        }
      })
      (ok swap-b)
    )
  )
)

(define-public (swap-helper-m
    (amount uint) (min-received uint)
    (swaps-reversed bool)
    (c-tokens (tuple (a <ft-trait>) (b <ft-trait>) (c <ft-trait>) (d <ft-trait>) (e <ft-trait>)))
    (c-share-fee-to <share-fee-to-trait>)
    (a-tokens (tuple (a <a-ft-trait>) (b <a-ft-trait>)))
    (a-factors (tuple (a uint)))
  )
  (let (
    (swap-a (if (is-eq swaps-reversed false)
                (unwrap! (charisma-sd amount c-tokens c-share-fee-to) ERR_SWAP_A)
                (unwrap! (alex-sa amount a-tokens a-factors) ERR_SWAP_A)))
    (scaled-amount (if (is-eq swaps-reversed false)
                       (unwrap! (scale-charisma-amount swap-a (get e c-tokens) (get a a-tokens)) ERR_SCALED_AMOUNT_A)
                       (unwrap! (scale-alex-amount swap-a (get b a-tokens) (get a c-tokens)) ERR_SCALED_AMOUNT_A)))
    (swap-b (if (is-eq swaps-reversed false)
                (unwrap! (alex-sa scaled-amount a-tokens a-factors) ERR_SWAP_B)
                (unwrap! (charisma-sd scaled-amount c-tokens c-share-fee-to) ERR_SWAP_B)))
  )
    (begin
      (asserts! (is-eq (var-get swap-status) true) ERR_SWAP_STATUS)
      (asserts! (> amount u0) ERR_INVALID_AMOUNT)
      (asserts! (>= swap-b min-received) ERR_MINIMUM_RECEIVED)
      (print {
        action: "swap-helper-m",
        caller: tx-sender, 
        data: {
          amount: amount,
          min-received: min-received,
          received: swap-b,
          swaps-reversed: swaps-reversed,
          charisma-data: {
            c-tokens: c-tokens,
            c-share-fee-to: c-share-fee-to,
            c-swap: (if (is-eq swaps-reversed false) swap-a swap-b)
          },
          alex-data: {
            a-tokens: a-tokens,
            a-factors: a-factors,
            a-swap: (if (is-eq swaps-reversed false) swap-b swap-a)
          }
        }
      })
      (ok swap-b)
    )
  )
)

(define-public (swap-helper-n
    (amount uint) (min-received uint)
    (swaps-reversed bool)
    (c-tokens (tuple (a <ft-trait>) (b <ft-trait>) (c <ft-trait>) (d <ft-trait>) (e <ft-trait>)))
    (c-share-fee-to <share-fee-to-trait>)
    (a-tokens (tuple (a <a-ft-trait>) (b <a-ft-trait>) (c <a-ft-trait>)))
    (a-factors (tuple (a uint) (b uint)))
  )
  (let (
    (swap-a (if (is-eq swaps-reversed false)
                (unwrap! (charisma-sd amount c-tokens c-share-fee-to) ERR_SWAP_A)
                (unwrap! (alex-sb amount a-tokens a-factors) ERR_SWAP_A)))
    (scaled-amount (if (is-eq swaps-reversed false)
                       (unwrap! (scale-charisma-amount swap-a (get e c-tokens) (get a a-tokens)) ERR_SCALED_AMOUNT_A)
                       (unwrap! (scale-alex-amount swap-a (get c a-tokens) (get a c-tokens)) ERR_SCALED_AMOUNT_A)))
    (swap-b (if (is-eq swaps-reversed false)
                (unwrap! (alex-sb scaled-amount a-tokens a-factors) ERR_SWAP_B)
                (unwrap! (charisma-sd scaled-amount c-tokens c-share-fee-to) ERR_SWAP_B)))
  )
    (begin
      (asserts! (is-eq (var-get swap-status) true) ERR_SWAP_STATUS)
      (asserts! (> amount u0) ERR_INVALID_AMOUNT)
      (asserts! (>= swap-b min-received) ERR_MINIMUM_RECEIVED)
      (print {
        action: "swap-helper-n",
        caller: tx-sender, 
        data: {
          amount: amount,
          min-received: min-received,
          received: swap-b,
          swaps-reversed: swaps-reversed,
          charisma-data: {
            c-tokens: c-tokens,
            c-share-fee-to: c-share-fee-to,
            c-swap: (if (is-eq swaps-reversed false) swap-a swap-b)
          },
          alex-data: {
            a-tokens: a-tokens,
            a-factors: a-factors,
            a-swap: (if (is-eq swaps-reversed false) swap-b swap-a)
          }
        }
      })
      (ok swap-b)
    )
  )
)

(define-public (swap-helper-o
    (amount uint) (min-received uint)
    (swaps-reversed bool)
    (c-tokens (tuple (a <ft-trait>) (b <ft-trait>) (c <ft-trait>) (d <ft-trait>) (e <ft-trait>)))
    (c-share-fee-to <share-fee-to-trait>)
    (a-tokens (tuple (a <a-ft-trait>) (b <a-ft-trait>) (c <a-ft-trait>) (d <a-ft-trait>)))
    (a-factors (tuple (a uint) (b uint) (c uint)))
  )
  (let (
    (swap-a (if (is-eq swaps-reversed false)
                (unwrap! (charisma-sd amount c-tokens c-share-fee-to) ERR_SWAP_A)
                (unwrap! (alex-sc amount a-tokens a-factors) ERR_SWAP_A)))
    (scaled-amount (if (is-eq swaps-reversed false)
                       (unwrap! (scale-charisma-amount swap-a (get e c-tokens) (get a a-tokens)) ERR_SCALED_AMOUNT_A)
                       (unwrap! (scale-alex-amount swap-a (get d a-tokens) (get a c-tokens)) ERR_SCALED_AMOUNT_A)))
    (swap-b (if (is-eq swaps-reversed false)
                (unwrap! (alex-sc scaled-amount a-tokens a-factors) ERR_SWAP_B)
                (unwrap! (charisma-sd scaled-amount c-tokens c-share-fee-to) ERR_SWAP_B)))
  )
    (begin
      (asserts! (is-eq (var-get swap-status) true) ERR_SWAP_STATUS)
      (asserts! (> amount u0) ERR_INVALID_AMOUNT)
      (asserts! (>= swap-b min-received) ERR_MINIMUM_RECEIVED)
      (print {
        action: "swap-helper-o",
        caller: tx-sender, 
        data: {
          amount: amount,
          min-received: min-received,
          received: swap-b,
          swaps-reversed: swaps-reversed,
          charisma-data: {
            c-tokens: c-tokens,
            c-share-fee-to: c-share-fee-to,
            c-swap: (if (is-eq swaps-reversed false) swap-a swap-b)
          },
          alex-data: {
            a-tokens: a-tokens,
            a-factors: a-factors,
            a-swap: (if (is-eq swaps-reversed false) swap-b swap-a)
          }
        }
      })
      (ok swap-b)
    )
  )
)

(define-public (swap-helper-p
    (amount uint) (min-received uint)
    (swaps-reversed bool)
    (c-tokens (tuple (a <ft-trait>) (b <ft-trait>) (c <ft-trait>) (d <ft-trait>) (e <ft-trait>)))
    (c-share-fee-to <share-fee-to-trait>)
    (a-tokens (tuple (a <a-ft-trait>) (b <a-ft-trait>) (c <a-ft-trait>) (d <a-ft-trait>) (e <a-ft-trait>)))
    (a-factors (tuple (a uint) (b uint) (c uint) (d uint)))
  )
  (let (
    (swap-a (if (is-eq swaps-reversed false)
                (unwrap! (charisma-sd amount c-tokens c-share-fee-to) ERR_SWAP_A)
                (unwrap! (alex-sd amount a-tokens a-factors) ERR_SWAP_A)))
    (scaled-amount (if (is-eq swaps-reversed false)
                       (unwrap! (scale-charisma-amount swap-a (get e c-tokens) (get a a-tokens)) ERR_SCALED_AMOUNT_A)
                       (unwrap! (scale-alex-amount swap-a (get e a-tokens) (get a c-tokens)) ERR_SCALED_AMOUNT_A)))
    (swap-b (if (is-eq swaps-reversed false)
                (unwrap! (alex-sd scaled-amount a-tokens a-factors) ERR_SWAP_B)
                (unwrap! (charisma-sd scaled-amount c-tokens c-share-fee-to) ERR_SWAP_B)))
  )
    (begin
      (asserts! (is-eq (var-get swap-status) true) ERR_SWAP_STATUS)
      (asserts! (> amount u0) ERR_INVALID_AMOUNT)
      (asserts! (>= swap-b min-received) ERR_MINIMUM_RECEIVED)
      (print {
        action: "swap-helper-p",
        caller: tx-sender, 
        data: {
          amount: amount,
          min-received: min-received,
          received: swap-b,
          swaps-reversed: swaps-reversed,
          charisma-data: {
            c-tokens: c-tokens,
            c-share-fee-to: c-share-fee-to,
            c-swap: (if (is-eq swaps-reversed false) swap-a swap-b)
          },
          alex-data: {
            a-tokens: a-tokens,
            a-factors: a-factors,
            a-swap: (if (is-eq swaps-reversed false) swap-b swap-a)
          }
        }
      })
      (ok swap-b)
    )
  )
)

(define-private (charisma-qa
    (amount uint)
    (tokens (tuple (a <ft-trait>) (b <ft-trait>)))
  )
  (let (
    (quote-a (contract-call?
             'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.univ2-path2 amount-out
             amount
             (get a tokens) (get b tokens)))
  )
    (ok quote-a)
  )
)

(define-private (charisma-qb
    (amount uint)
    (tokens (tuple (a <ft-trait>) (b <ft-trait>) (c <ft-trait>)))
  )
  (let (
    (quote-a (contract-call?
             'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.univ2-path2 get-amount-out-3
             amount
             (get a tokens) (get b tokens) (get c tokens)))
  )
    (ok (get c quote-a))
  )
)

(define-private (charisma-qc
    (amount uint)
    (tokens (tuple (a <ft-trait>) (b <ft-trait>) (c <ft-trait>) (d <ft-trait>)))
  )
  (let (
    (quote-a (contract-call?
             'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.univ2-path2 get-amount-out-4
             amount
             (get a tokens) (get b tokens) (get c tokens) (get d tokens)
             (list u1 u2 u3 u4)))
  )
    (ok (get d quote-a))
  )
)

(define-private (charisma-qd
    (amount uint)
    (tokens (tuple (a <ft-trait>) (b <ft-trait>) (c <ft-trait>) (d <ft-trait>) (e <ft-trait>)))
  )
  (let (
    (quote-a (contract-call?
             'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.univ2-path2 get-amount-out-5
             amount
             (get a tokens) (get b tokens) (get c tokens) (get d tokens) (get e tokens)))
  )
    (ok (get e quote-a))
  )
)

(define-private (alex-qa
    (amount uint)
    (tokens (tuple (a <a-ft-trait>) (b <a-ft-trait>)))
    (factors (tuple (a uint)))
  )
  (let (
    (a-token (get a tokens))
    (b-token (get b tokens))
    (quote-a (unwrap-panic (contract-call?
                           'SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.amm-pool-v2-01 get-helper
                           (contract-of a-token) (contract-of b-token)
                           (get a factors)
                           amount)))
  )
    (ok quote-a)
  )
)

(define-private (alex-qb
    (amount uint)
    (tokens (tuple (a <a-ft-trait>) (b <a-ft-trait>) (c <a-ft-trait>)))
    (factors (tuple (a uint) (b uint)))
  )
  (let (
    (a-token (get a tokens))
    (b-token (get b tokens))
    (c-token (get c tokens))
    (quote-a (unwrap-panic (contract-call?
                           'SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.amm-pool-v2-01 get-helper-a
                           (contract-of a-token) (contract-of b-token) (contract-of c-token)
                           (get a factors) (get b factors)
                           amount)))
  )
    (ok quote-a)
  )
)

(define-private (alex-qc
    (amount uint)
    (tokens (tuple (a <a-ft-trait>) (b <a-ft-trait>) (c <a-ft-trait>) (d <a-ft-trait>)))
    (factors (tuple (a uint) (b uint) (c uint)))
  )
  (let (
    (a-token (get a tokens))
    (b-token (get b tokens))
    (c-token (get c tokens))
    (d-token (get d tokens))
    (quote-a (unwrap-panic (contract-call?
                           'SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.amm-pool-v2-01 get-helper-b
                           (contract-of a-token) (contract-of b-token) (contract-of c-token)
                           (contract-of d-token)
                           (get a factors) (get b factors) (get c factors)
                           amount)))
  )
    (ok quote-a)
  )
)

(define-private (alex-qd
    (amount uint)
    (tokens (tuple (a <a-ft-trait>) (b <a-ft-trait>) (c <a-ft-trait>) (d <a-ft-trait>) (e <a-ft-trait>)))
    (factors (tuple (a uint) (b uint) (c uint) (d uint)))
  )
  (let (
    (a-token (get a tokens))
    (b-token (get b tokens))
    (c-token (get c tokens))
    (d-token (get d tokens))
    (e-token (get e tokens))
    (quote-a (unwrap-panic (contract-call?
                           'SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.amm-pool-v2-01 get-helper-c
                           (contract-of a-token) (contract-of b-token) (contract-of c-token)
                           (contract-of d-token) (contract-of e-token)
                           (get a factors) (get b factors) (get c factors) (get d factors)
                           amount)))
  )
    (ok quote-a)
  )
)

(define-private (charisma-sa
    (amount uint)
    (tokens (tuple (a <ft-trait>) (b <ft-trait>)))
    (share-fee-to <share-fee-to-trait>)
  )
  (let (
    (swap-a (try! (contract-call?
                  'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.univ2-path2 do-swap
                  amount
                  (get a tokens) (get b tokens)
                  share-fee-to)))
  )
    (ok (get amt-out swap-a))
  )
)

(define-private (charisma-sb
    (amount uint)
    (tokens (tuple (a <ft-trait>) (b <ft-trait>) (c <ft-trait>)))
    (share-fee-to <share-fee-to-trait>)
  )
  (let (
    (swap-a (try! (contract-call?
                  'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.univ2-path2 swap-3
                  amount u1
                  (get a tokens) (get b tokens) (get c tokens)
                  share-fee-to)))
  )
    (ok (get amt-out (get c swap-a)))
  )
)

(define-private (charisma-sc
    (amount uint)
    (tokens (tuple (a <ft-trait>) (b <ft-trait>) (c <ft-trait>) (d <ft-trait>)))
    (share-fee-to <share-fee-to-trait>)
  )
  (let (
    (swap-a (try! (contract-call?
                  'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.univ2-path2 swap-4
                  amount u1
                  (get a tokens) (get b tokens) (get c tokens) (get d tokens)
                  share-fee-to)))
  )
    (ok (get amt-out (get d swap-a)))
  )
)

(define-private (charisma-sd
    (amount uint)
    (tokens (tuple (a <ft-trait>) (b <ft-trait>) (c <ft-trait>) (d <ft-trait>) (e <ft-trait>)))
    (share-fee-to <share-fee-to-trait>)
  )
  (let (
    (swap-a (try! (contract-call?
                  'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.univ2-path2 swap-5
                  amount u1
                  (get a tokens) (get b tokens) (get c tokens) (get d tokens) (get e tokens)
                  share-fee-to)))
  )
    (ok (get amt-out (get e swap-a)))
  )
)

(define-private (alex-sa
    (amount uint)
    (tokens (tuple (a <a-ft-trait>) (b <a-ft-trait>)))
    (factors (tuple (a uint)))
  )
  (let (
    (swap-a (try! (contract-call?
                  'SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.amm-pool-v2-01 swap-helper
                  (get a tokens) (get b tokens)
                  (get a factors)
                  amount (some u1))))
  )
    (ok swap-a)
  )
)

(define-private (alex-sb
    (amount uint)
    (tokens (tuple (a <a-ft-trait>) (b <a-ft-trait>) (c <a-ft-trait>)))
    (factors (tuple (a uint) (b uint)))
  )
  (let (
    (swap-a (try! (contract-call?
                  'SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.amm-pool-v2-01 swap-helper-a
                  (get a tokens) (get b tokens) (get c tokens)
                  (get a factors) (get b factors)
                  amount (some u1))))
  )
    (ok swap-a)
  )
)

(define-private (alex-sc
    (amount uint)
    (tokens (tuple (a <a-ft-trait>) (b <a-ft-trait>) (c <a-ft-trait>) (d <a-ft-trait>)))
    (factors (tuple (a uint) (b uint) (c uint)))
  )
  (let (
    (swap-a (try! (contract-call?
                  'SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.amm-pool-v2-01 swap-helper-b
                  (get a tokens) (get b tokens) (get c tokens) (get d tokens)
                  (get a factors) (get b factors) (get c factors)
                  amount (some u1))))
  )
    (ok swap-a)
  )
)

(define-private (alex-sd
    (amount uint)
    (tokens (tuple (a <a-ft-trait>) (b <a-ft-trait>) (c <a-ft-trait>) (d <a-ft-trait>) (e <a-ft-trait>)))
    (factors (tuple (a uint) (b uint) (c uint) (d uint)))
  )
  (let (
    (swap-a (try! (contract-call?
                  'SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.amm-pool-v2-01 swap-helper-c
                  (get a tokens) (get b tokens) (get c tokens) (get d tokens) (get e tokens)
                  (get a factors) (get b factors) (get c factors) (get d factors)
                  amount (some u1))))
  )
    (ok swap-a)
  )
)

(define-private (scale-charisma-amount (amount uint) (c-token <ft-trait>) (a-token <a-ft-trait>))
  (let (
    (c-decimals (unwrap-panic (contract-call? c-token get-decimals)))
    (a-decimals (unwrap-panic (contract-call? a-token get-decimals)))
    (scaled-amount
      (if (is-eq c-decimals a-decimals)
        amount
        (if (> c-decimals a-decimals)
          (/ amount (pow u10 (- c-decimals a-decimals)))
          (* amount (pow u10 (- a-decimals c-decimals)))
        )
      )
    )
  )
    (ok scaled-amount)
  )
)

(define-private (scale-alex-amount (amount uint) (a-token <a-ft-trait>) (c-token <ft-trait>))
  (let (
    (a-decimals (unwrap-panic (contract-call? a-token get-decimals)))
    (c-decimals (unwrap-panic (contract-call? c-token get-decimals)))
    (scaled-amount
      (if (is-eq a-decimals c-decimals)
        amount
        (if (> a-decimals c-decimals)
          (/ amount (pow u10 (- a-decimals c-decimals)))
          (* amount (pow u10 (- c-decimals a-decimals)))
        )
      )
    )
  )
    (ok scaled-amount)
  )
)

(define-private (admin-not-removeable (admin principal))
  (not (is-eq admin (var-get admin-helper)))
)