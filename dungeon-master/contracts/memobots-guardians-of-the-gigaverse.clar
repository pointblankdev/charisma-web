;; Title: MemoBots: Guardians of the Gigaverse
;; Author: SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS
;; Created With Charisma
;; https://charisma.rocks

;; Description:
;; Every Giga Pepe has their trusted robot guardian Memo!

;; This contract implements the SIP-009 community-standard Non-Fungible Token trait
;; (impl-trait 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait.nft-trait)

;; Define the NFT's name
(define-non-fungible-token memobots-guardians-of-the-gigaverse uint)

;; Keep track of the last minted token ID
(define-data-var last-token-id uint u0)

;; Keep track of the mint price globally
(define-data-var mint-cost-stx uint u5000000)

;; Define constants
(define-constant COLLECTION_LIMIT u1300) ;; Limit to series of 1300
(define-constant STX_PER_MINT u5000000) ;; 5 STX per MINT base cost
(define-constant MAX_NFTS_PER_TX u4) ;; Maximum 4 NFTs per transaction
(define-constant OWNER 'SP2RNHHQDTHGHPEVX83291K4AQZVGWEJ7WCQQDA9R) ;; Collection creator
(define-constant CHA_AMOUNT (* u5 STX_PER_MINT)) ;; 25.000000 CHA per mint to creator
(define-constant ENERGY_DISCOUNT_RATE u1000) ;; 1000 energy = 1 STX discount
(define-constant MIN_STX_PRICE u1) ;; Minimum price of 1 STX

(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_TOKEN_OWNER (err u101))
(define-constant ERR_SOLD_OUT (err u300))
(define-constant ERR_ALREADY_CLAIMED (err u600))

(define-data-var base-uri (string-ascii 200) "https://charisma.rocks/api/v0/nfts/SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.memobots-guardians-of-the-gigaverse/{id}.json")

;; Map to track which addresses have already claimed
(define-map claimed principal bool)

;; New map to keep track of NFT balances
(define-map token-balances principal uint)

;; Authorization check
(define-private (is-dao-or-extension)
    (or (is-eq tx-sender .dungeon-master) (contract-call? .dungeon-master is-extension contract-caller))
)

(define-read-only (is-authorized)
    (ok (asserts! (is-dao-or-extension) ERR_UNAUTHORIZED))
)

(define-public (set-mint-cost-stx (new-cost uint))
  (begin
    (try! (is-authorized))
    (ok (var-set mint-cost-stx new-cost))
  )
)

(define-read-only (get-mint-cost-stx)
  (ok (var-get mint-cost-stx))
)

;; SIP-009 function: Get the last minted token ID.
(define-read-only (get-last-token-id)
  (ok (var-get last-token-id))
)

;; SIP-009 function: Get link where token metadata is hosted
(define-read-only (get-token-uri (token-id uint))
  (ok (some (var-get base-uri)))
)

;; Function to update the token URI
(define-public (set-token-uri (new-uri (string-ascii 200)))
  (begin
    (try! (is-authorized))
    (ok (var-set base-uri new-uri))
  )
)

;; SIP-009 function: Get the owner of a given token
(define-read-only (get-owner (token-id uint))
  (ok (nft-get-owner? memobots-guardians-of-the-gigaverse token-id))
)

(define-private (is-owner (id uint) (user principal))
    (is-eq user (unwrap! (nft-get-owner? memobots-guardians-of-the-gigaverse id) false))
)

(define-public (burn (id uint))
  	(begin 
    	(asserts! (is-owner id tx-sender) ERR_NOT_TOKEN_OWNER)
    	(nft-burn? memobots-guardians-of-the-gigaverse id tx-sender)
	)
)

;; New function to get the balance of NFTs for a principal
(define-read-only (get-balance (account principal))
  (ok (default-to u0 (map-get? token-balances account)))
)

;; SIP-009 function: Transfer NFT token to another owner.
(define-public (transfer (token-id uint) (sender principal) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender sender) ERR_NOT_TOKEN_OWNER)
    (match (nft-transfer? memobots-guardians-of-the-gigaverse token-id sender recipient)
      success
        (begin
          (map-set token-balances sender (- (default-to u0 (map-get? token-balances sender)) u1))
          (map-set token-balances recipient (+ (default-to u0 (map-get? token-balances recipient)) u1))
          (ok success)
        )
      error (err error)
    )
  )
)

;; Mint a new NFT.
(define-public (mint (recipient principal))
  ;; Create the new token ID by incrementing the last minted ID.
  (let ((token-id (+ (var-get last-token-id) u1)))
    (try! (is-authorized))
    ;; Ensure the collection stays within the limit.
    (asserts! (< (var-get last-token-id) COLLECTION_LIMIT) ERR_SOLD_OUT)
    ;; Mint the NFT and send it to the given recipient.
    (try! (nft-mint? memobots-guardians-of-the-gigaverse token-id recipient))
    ;; 1 STX cost send to dungeon-master
    (try! (stx-transfer? (var-get mint-cost-stx) tx-sender .dungeon-master))
    ;; Mint 1 governance token to the OWNER
    (try! (contract-call? .dme000-governance-token dmg-mint CHA_AMOUNT OWNER))
    ;; Update the last minted token ID.
    (var-set last-token-id token-id)
    ;; Update the balance for the recipient
    (map-set token-balances recipient (+ (default-to u0 (map-get? token-balances recipient)) u1))
    ;; Return the newly minted NFT ID.
    (ok token-id)
  )
)

;; Mint multiple NFTs based on the count (1 to 4)
(define-public (mint-multiple (recipient principal) (count uint))
  (if (is-eq count u1) (mint recipient)
  (if (is-eq count u2) (begin (try! (mint recipient)) (mint recipient))
  (if (is-eq count u3) (begin (try! (mint recipient)) (try! (mint recipient)) (mint recipient))
  (if (is-eq count u4) (begin (try! (mint recipient)) (try! (mint recipient)) (try! (mint recipient)) (mint recipient))
  (err u500)
)))))

;; Utility function to get the minimum of two uints
(define-private (min (a uint) (b uint))
  (if (<= a b) a b)
)

;; Utility function to get the maximum of two uints
(define-private (max (a uint) (b uint))
  (if (>= a b) a b)
)