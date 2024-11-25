(use-trait ft-trait .charisma-traits-v1.sip010-ft-trait)
(impl-trait .charisma-dex.revenue-share-trait)

;; Error codes
(define-constant err-check-owner (err u403))

;; Contract owner management
(define-data-var owner principal tx-sender)
(define-read-only (get-owner) (var-get owner))
(define-private (check-owner)
  (ok (asserts! (is-eq contract-caller (get-owner)) err-check-owner)))
(define-public (set-owner (new-owner principal))
  (begin
   (try! (check-owner))
   (ok (var-set owner new-owner))))

;; Pool fee recipient registry
(define-map fee-recipients {pool-id: uint, token: principal} principal)

;; Read functions
(define-read-only (get-fee-recipient (pool-id uint) (token <ft-trait>))
  (ok (default-to (get-owner) (map-get? fee-recipients {pool-id: pool-id, token: (contract-of token)}))))

;; Register/unregister pool recipients (owner only)
(define-public (register-recipient (pool-id uint) (token principal) (recipient principal))
  (begin
    (try! (check-owner))
    (ok (map-set fee-recipients {pool-id: pool-id, token: token} recipient))))

(define-public (unregister-recipient (pool-id uint) (token principal))
  (begin
    (try! (check-owner))
    (ok (map-delete fee-recipients {pool-id: pool-id, token: token}))))