;; Keeper's Petition Interaction
;;
;; A simple interaction that allows players to petition the Dungeon Keeper
;; for a small reward of DMG tokens. This is the safest option with a
;; guaranteed reward, intended as an entry point for new players.
;;
;; Cost: Fatigue
;; Reward: 10 DMG
;; Success Rate: 100% (if energy check passes)

(impl-trait .dao-traits-v7.interaction-trait)

;; Constants
(define-constant ERR_UNAUTHORIZED (err u401))
(define-constant CONTRACT_OWNER tx-sender)
(define-constant DMG_REWARD u10000000) ;; 10 DMG

;; Data Variables
(define-data-var contract-uri (optional (string-utf8 256)) (some u"https://charisma.rocks/api/v0/interactions/keepers-petition"))

;; Read-only functions

(define-read-only (get-interaction-uri)
  (ok (var-get contract-uri))
)

;; Public functions

(define-public (execute (action (string-ascii 32)))
  (let ((sender tx-sender))
    (if (is-eq action "PETITION") (petition-action sender)
    (err "INVALID_ACTION")))
)

;; Action Handler

(define-private (petition-action (sender principal))
  (let ((fatigue-response (unwrap-panic (contract-call? .fatigue execute "BURN"))))
    (if (is-eq fatigue-response "ENERGY_BURNED") (handle-petition-attempt sender)
    (if (is-eq fatigue-response "ENERGY_NOT_BURNED") (handle-insufficient-energy sender)
    (handle-unknown-error sender))))
)

;; Response Handlers

(define-private (handle-petition-attempt (sender principal))
  (begin
    (match (contract-call? .dungeon-keeper transfer DMG_REWARD CONTRACT_OWNER sender)
      success (begin 
        (print "The Dungeon Keeper acknowledges your humble petition and grants you a small reward.")
        (ok "PETITION_SUCCEEDED"))
      error (handle-unknown-error sender)
    )
  )
)

(define-private (handle-insufficient-energy (sender principal))
  (begin
    (print "You lack the energy required to petition the Dungeon Keeper.")
    (ok "PETITION_FAILED"))
)

(define-private (handle-unknown-error (sender principal))
  (begin
    (print "The Dungeon Keeper is unable to process your petition.")
    (ok "PETITION_ERROR"))
)

;; Admin functions

(define-public (set-contract-uri (new-uri (optional (string-utf8 256))))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
    (ok (var-set contract-uri new-uri)))
)