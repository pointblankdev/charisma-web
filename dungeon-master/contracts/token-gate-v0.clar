(define-trait balance-trait
	(
		(get-balance (principal) (response uint uint))
	)
)

(define-constant ERR-UNAUTHORIZED (err u401))

;; Authorization check
(define-private (is-dao-or-extension)
    (or (is-eq tx-sender .dungeon-master) (contract-call? .dungeon-master is-extension contract-caller))
)

(define-read-only (is-authorized)
    (ok (asserts! (is-dao-or-extension) ERR-UNAUTHORIZED))
)

;; Check if an address has a token balance
(define-public (has-balance (token-contract <balance-trait>) (user principal))
  (ok (> (unwrap-panic (contract-call? token-contract get-balance user)) u0))
)