;; Keepers' Challenge Interaction
;;
;; A medium-risk interaction where players can challenge the Dungeon Keeper
;; for a moderate reward. Success is determined by a randomized roll.
;;
;; Cost: Fatigue
;; Reward: 40 DMG
;; Success Rate: 50% (if energy check passes)

(impl-trait .dao-traits-v7.interaction-trait)

;; Constants
(define-constant ERR_UNAUTHORIZED (err u401))
(define-constant CONTRACT_OWNER tx-sender)
(define-constant DMG_REWARD u100000000) ;; 100 DMG

;; Data Variables
(define-data-var contract-uri (optional (string-utf8 256)) (some u"https://charisma.rocks/api/v0/interactions/keepers-challenge"))

;; Read-only functions

(define-read-only (get-interaction-uri)
  (ok (var-get contract-uri))
)

;; Public functions

(define-public (execute (action (string-ascii 32)))
  (let ((sender tx-sender))
    (if (is-eq action "CHALLENGE") (challenge-action sender)
    (err "INVALID_ACTION")))
)

;; Action Handler

(define-private (challenge-action (sender principal))
  (let ((fatigue-response (unwrap-panic (contract-call? .fatigue execute "BURN"))))
    (if (is-eq fatigue-response "ENERGY_BURNED") (handle-challenge-attempt sender)
    (if (is-eq fatigue-response "ENERGY_NOT_BURNED") (handle-insufficient-energy sender)
    (handle-unknown-error sender))))
)

;; Response Handlers

(define-private (handle-challenge-attempt (sender principal))
  (let ((roll-response (unwrap-panic (contract-call? .fate-randomizer execute "D6"))))
    (if (is-eq roll-response "6") (handle-challenge-success sender)
    (handle-challenge-failure sender)))
)

(define-private (handle-challenge-success (sender principal))
  (begin
    (match (contract-call? .dungeon-keeper transfer DMG_REWARD CONTRACT_OWNER sender)
      success (begin 
        (print "The Dungeon Keeper is impressed by your prowess and rewards your success!")
        (ok "CHALLENGE_SUCCEEDED"))
      error (handle-unknown-error sender)
    )
  )
)

(define-private (handle-challenge-failure (sender principal))
  (begin
    (print "Your challenge falls short of the Dungeon Keeper's expectations.")
    (ok "CHALLENGE_FAILED"))
)

(define-private (handle-insufficient-energy (sender principal))
  (begin
    (print "You lack the energy required to challenge the Dungeon Keeper.")
    (ok "CHALLENGE_FAILED"))
)

(define-private (handle-unknown-error (sender principal))
  (begin
    (print "The Dungeon Keeper is unable to process your challenge.")
    (ok "CHALLENGE_ERROR"))
)

;; Admin functions

(define-public (set-contract-uri (new-uri (optional (string-utf8 256))))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
    (ok (var-set contract-uri new-uri)))
)