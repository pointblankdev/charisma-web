(define-read-only (get-cha-at-block (address principal) (block uint))
 (let
	(
		(block-hash (unwrap! (get-block-info? id-header-hash block) (err u500)))
		(cha-balance (at-block block-hash (unwrap! (contract-call? .dme000-governance-token get-balance address) (err u500))))
	)
	(ok cha-balance)
 )
)

(define-read-only (get-scha-at-block (address principal) (block uint))
 (let
	(
		(block-hash (unwrap! (get-block-info? id-header-hash block) (err u500)))
		(scha-balance (at-block block-hash (unwrap! (contract-call? .liquid-staked-charisma get-balance address) (err u500))))
	)
	(ok scha-balance)
 )
)

(define-read-only (get-wcha-at-block (address principal) (block uint))
 (let
	(
		(block-hash (unwrap! (get-block-info? id-header-hash block) (err u500)))
		(wcha-balance (at-block block-hash (unwrap! (contract-call? .liquid-staked-charisma get-balance address) (err u500))))
	)
	(ok wcha-balance)
 )
)

(define-read-only (get-staked-scha-at-block (address principal) (block uint))
 (let
	(
		(block-hash (unwrap! (get-block-info? id-header-hash block) (err u500)))
		(staked-scha-balance (at-block block-hash (unwrap! (contract-call? .lands get-balance u1 address) (err u500))))
	)
	(ok staked-scha-balance)
 )
)