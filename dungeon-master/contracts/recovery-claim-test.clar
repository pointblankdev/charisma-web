(define-constant err-already-claimed (err u400))
(define-constant err-no-staked-memes (err u401))

(define-map claimed principal bool)
(define-map red-pill principal bool)

(define-data-var last-id uint u0)

(define-read-only (get-last-claim-id)
  (var-get last-id)
)

(define-read-only (has-claimed (address principal))
  (default-to false (map-get? claimed address))
)

(define-public (claim (choice bool))
  (let
    (
      (welsh-amount (try! (get-staked-welsh-at-block tx-sender u166688)))
      (roo-amount (try! (get-staked-roo-at-block tx-sender u166688)))
    )
    (asserts! (or (> welsh-amount u0) (> roo-amount u0)) err-no-staked-memes)
    (asserts! (not (has-claimed tx-sender)) err-already-claimed)
    (map-set claimed tx-sender true)
    (map-set red-pill tx-sender choice)
    (var-set last-id (+ (var-get last-id) u1))
    (print {
      address: tx-sender,
      welsh-amount: welsh-amount,
      roo-amount: roo-amount,
      red-pill: choice
    })
    (ok {
      last-id: (var-get last-id),
      red-pill: choice
    })
  )
)

(define-read-only (get-staked-welsh-at-block (address principal) (block uint))
 (let
	(
		(block-hash (unwrap! (get-block-info? id-header-hash block) (err u500)))
		(staked-welsh-balance (at-block block-hash (unwrap! (contract-call? .lands get-balance u4 address) (err u500))))
	)
	(ok staked-welsh-balance)
 )
)

(define-read-only (get-staked-roo-at-block (address principal) (block uint))
 (let
	(
		(block-hash (unwrap! (get-block-info? id-header-hash block) (err u500)))
		(staked-roo-balance (at-block block-hash (unwrap! (contract-call? .lands get-balance u20 address) (err u500))))
	)
	(ok staked-roo-balance)
 )
)