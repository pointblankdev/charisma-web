(use-trait ft-trait .dao-traits-v4.sip010-ft-trait)
(impl-trait .dao-traits-v4.share-fee-to-trait)

;; Error codes
(define-constant err-check-owner (err u101))
(define-constant err-not-registered (err u102))
(define-constant err-already-registered (err u103))
(define-constant err-unauthorized (err u104))

;; Contract owner management
(define-data-var owner principal tx-sender)
(define-read-only (get-owner) (var-get owner))
(define-private (check-owner)
  (ok (asserts! (is-eq tx-sender (get-owner)) err-check-owner)))
(define-public (set-owner (new-owner principal))
  (begin
   (try! (check-owner))
   (ok (var-set owner new-owner))))

;; Pool fee recipient registry
(define-map pool-recipients uint principal)
(define-map pool-balances {pool: uint, token: principal} uint)

;; Read functions
(define-read-only (get-pool-recipient (pool-id uint))
  (map-get? pool-recipients pool-id))

(define-read-only (get-pool-balance (pool-id uint) (token principal))
  (default-to u0 (map-get? pool-balances {pool: pool-id, token: token})))

;; Register/unregister pool recipients (owner only)
(define-public (register-recipient (pool-id uint) (recipient principal))
  (begin
    (try! (check-owner))
    (asserts! (is-none (get-pool-recipient pool-id)) err-already-registered)
    (ok (map-set pool-recipients pool-id recipient))))

(define-public (unregister-recipient (pool-id uint))
  (begin
    (try! (check-owner))
    (asserts! (is-some (get-pool-recipient pool-id)) err-not-registered)
    (ok (map-delete pool-recipients pool-id))))

;; Receive fees from DEX
(define-public
  (receive
    (pool-id uint)
    (is-token0 bool)
    (amt uint))
  (let ((current-balance (get-pool-balance pool-id (contract-of tx-sender))))
    (ok (map-set pool-balances 
                 {pool: pool-id, token: (contract-of tx-sender)} 
                 (+ current-balance amt)))))

;; Harvest fees (pool recipient only)
(define-public (harvest-pool-fees (pool-id uint) (token <ft-trait>) (amt uint))
  (let ((recipient (unwrap! (get-pool-recipient pool-id) err-not-registered))
        (current-balance (get-pool-balance pool-id (contract-of token))))
    
    ;; Check authorization
    (asserts! (is-eq tx-sender recipient) err-unauthorized)
    ;; Check sufficient balance
    (asserts! (<= amt current-balance) err-unauthorized)
    
    ;; Update balance and transfer
    (map-set pool-balances 
             {pool: pool-id, token: (contract-of token)} 
             (- current-balance amt))
    
    (as-contract 
      (contract-call? token transfer 
                     amt
                     (as-contract tx-sender)
                     recipient
                     none))))

;;; eof