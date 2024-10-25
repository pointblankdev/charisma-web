;; Charisma Mine Interaction
;;
;; Deep within the dungeon lies an ancient vein where adventurers can harvest
;; powerful Charisma tokens into being. Through complex extraction and refinement,
;; tokens can be extracted from the dungeon's raw essence or burned back into its depths.
;; These arduous operations require both energy from the adventurer and governance 
;; tokens as catalysts for the transmutation.
;;
;; Actions:
;; - MINT: Convert governance tokens into Charisma tokens
;; - BURN: Convert Charisma tokens back into governance tokens
;;
;; Costs:
;; - Energy cost via Fatigue interaction
;; - Required tokens for wrapping and unwrapping

;; Traits
(impl-trait .dao-traits-v8.interaction-trait)
(use-trait rulebook-trait .dao-traits-v8.rulebook-trait)

;; Constants
(define-constant ERR_UNAUTHORIZED (err u401))
(define-constant CONTRACT_OWNER tx-sender)

;; Data Variables
(define-data-var contract-uri (optional (string-utf8 256)) 
  (some u"https://charisma.rocks/api/v0/interactions/charisma-mine"))

;; Read-only functions

(define-read-only (get-interaction-uri)
  (ok (var-get contract-uri)))

;; Public functions

(define-public (execute (rulebook <rulebook-trait>) (action (string-ascii 32)))
  (let ((sender tx-sender))
    (if (is-eq action "MINT") (mint-action sender)
    (if (is-eq action "BURN") (burn-action sender)
    (err "INVALID_ACTION")))))

;; Action Handlers

(define-private (mint-action (sender principal))
  (let ((fatigue-response (unwrap-panic (contract-call? .fatigue execute "BURN"))))
    (if (is-eq fatigue-response "ENERGY_BURNED") (mint-attempt sender)
    (if (is-eq fatigue-response "ENERGY_NOT_BURNED") (handle-insufficient-energy sender)
    (handle-fatigue-error sender)))))

(define-private (burn-action (sender principal))
  (let ((fatigue-response (unwrap-panic (contract-call? .fatigue execute "BURN"))))
    (if (is-eq fatigue-response "ENERGY_BURNED") (burn-attempt sender)
    (if (is-eq fatigue-response "ENERGY_NOT_BURNED") (handle-insufficient-energy sender)
    (handle-fatigue-error sender)))))

;; Token Operation Handlers

(define-private (mint-attempt (sender principal))
  (let ((amount (unwrap-panic (contract-call? .charisma-token get-max-liquidity-flow))))
    (match (contract-call? .charisma-token wrap amount)
      success (handle-mint-success sender amount)
      error (if (is-eq error u402) (handle-mint-locked sender)
            (if (is-eq error u403) (handle-mint-unprepared sender)
            (if (is-eq error u405) (handle-mint-invalid sender)
            (handle-mint-unknown-error sender)))))))

(define-private (burn-attempt (sender principal))
  (let ((amount (unwrap-panic (contract-call? .charisma-token get-max-liquidity-flow))))
    (match (contract-call? .charisma-token unwrap amount)
      success (handle-burn-success sender amount)
      error   (if (is-eq error u402) (handle-burn-locked sender)
              (if (is-eq error u403) (handle-burn-unprepared sender)
              (if (is-eq error u405) (handle-burn-invalid sender)
              (handle-burn-unknown-error sender)))))))

;; Energy Cost Handlers

(define-private (handle-insufficient-energy (sender principal))
  (begin
    (print "The sender lacks the energy required to wrap tokens.")
    (ok "INSUFFICIENT_ENERGY")))

(define-private (handle-fatigue-error (sender principal))
  (begin
    (print "The senders is too exhausted to wrap tokens.")
    (ok "ENERGY_ERROR")))

;; Response Handlers

(define-private (handle-mint-success (sender principal) (amount uint))
  (begin
    (print "The sender sucessfully minted new Charisma tokens!")
    (ok "TOKENS_WRAPPED")))

(define-private (handle-burn-success (sender principal) (amount uint))
  (begin
    (print "The Charisma tokens dissolve back into the dungeon's mysterious aether.")
    (ok "TOKENS_UNWRAPPED")))

(define-private (handle-mint-locked (sender principal))
  (begin
    (print "The dungeon's minting crucible is currently sealed by magical wards.")
    (ok "LIQUIDITY_LOCKED")))

(define-private (handle-burn-locked (sender principal))
  (begin
    (print "The dungeon's burning altar is currently sealed by magical wards.")
    (ok "LIQUIDITY_LOCKED")))

(define-private (handle-mint-unprepared (sender principal))
  (begin
    (print "The adventurer hasn't been red-pilled and was unable to mint Charisma tokens.")
    (ok "NOT_RED_PILLED")))

(define-private (handle-burn-unprepared (sender principal))
  (begin
    (print "The adventurer hasn't been red-pilled and was unable to mint Charisma tokens.")
    (ok "NOT_RED_PILLED")))

(define-private (handle-mint-invalid (sender principal))
  (begin
    (print "The mystical crystallization fails as the arcane formulae go awry.")
    (ok "INVALID_INPUT")))

(define-private (handle-burn-invalid (sender principal))
  (begin
    (print "The sacrificial ritual falters as the arcane formulae go awry.")
    (ok "INVALID_INPUT")))

(define-private (handle-mint-unknown-error (sender principal))
  (begin
    (print "Unknown forces within the dungeon disrupt the minting ritual.")
    (ok "UNKNOWN_ERROR")))

(define-private (handle-burn-unknown-error (sender principal))
  (begin
    (print "Unknown forces within the dungeon disrupt the burning ritual.")
    (ok "UNKNOWN_ERROR")))

;; Admin functions

(define-public (set-contract-uri (new-uri (optional (string-utf8 256))))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
    (ok (var-set contract-uri new-uri))))