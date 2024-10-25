;; Keeper's Petition Interaction
;;
;; A configurable mechanism for distributing DMG tokens to players from a designated source.
;; The source address of the tokens and reward amount can be dynamically updated by
;; contract Dungeon Keepers, allowing for flexible distribution strategies.
;;
;; This contract can serve multiple purposes depending on how it's configured:
;; - Distribution from a central treasury
;; - Redistribution from large token holders
;; - Strategic token distribution from specific addresses
;; - Player reward and punishment systems
;;
;; Technical Features:
;; - Configurable token source address
;; - Adjustable reward amounts
;; - Multiple administrator support
;; - Energy-gated claiming mechanism
;;
;; Cost: Fatigue
;; Reward: Variable DMG amount

;; Traits
(impl-trait .dao-traits-v9.interaction-trait)
(use-trait rulebook-trait .dao-traits-v9.rulebook-trait)

;; Constants
(define-constant ERR_UNAUTHORIZED (err u401))

;; Data Variables
(define-data-var token-amount uint u10000000)
(define-data-var token-from principal .charisma-token)
(define-data-var contract-uri (optional (string-utf8 256)) 
  (some u"https://charisma.rocks/api/v0/interactions/keepers-petition"))

;; Data Maps
(define-map contract-owners principal bool)

;; Initialize contract owner
(map-set contract-owners tx-sender true)

;; Read-only functions

(define-read-only (get-interaction-uri)
  (ok (var-get contract-uri)))

(define-read-only (get-token-from)
  (ok (var-get token-from)))

(define-read-only (get-token-amount)
  (ok (var-get token-amount)))

(define-read-only (is-contract-owner (address principal))
  (default-to false (map-get? contract-owners address)))

;; Public functions

(define-public (execute (rulebook <rulebook-trait>) (action (string-ascii 32)))
  (begin
    (try! (contract-call? .registry authorize rulebook))
    (if (is-eq action "PETITION") (petition-action rulebook)
    (err "INVALID_ACTION"))))

;; Action Handler

(define-private (petition-action (rulebook <rulebook-trait>))
  (begin
    (match (contract-call? .fatigue execute rulebook "BURN")
      success (if (is-eq success "ENERGY_BURNED") (handle-petition-attempt rulebook)
              (if (is-eq success "ENERGY_NOT_BURNED") (handle-insufficient-energy)
              (handle-insufficient-energy)))
      error   (handle-unknown-error))))

;; Response Handlers

(define-private (handle-petition-attempt (rulebook <rulebook-trait>))
  (begin
    (match (contract-call? rulebook transfer (var-get token-amount) (var-get token-from) tx-sender)
      success (let ((op "PETITION_SUCCEEDED"))
              (print {op: op, sender: tx-sender, 
                message: "The Dungeon Keeper acknowledges your humble petition and grants you a small reward."})
              (ok op))
      error   (handle-unknown-error))))

(define-private (handle-insufficient-energy)
  (let ((op "PETITION_FAILED"))
    (print {op: op, sender: tx-sender, 
      message: "You lack the energy required to petition the Dungeon Keeper."})
    (ok op)))

(define-private (handle-unknown-error)
  (let ((op "PETITION_FAILED"))
    (print {op: op, sender: tx-sender, 
      message: "You can't request a petition from yourself."})
    (ok op)))

;; Admin functions

(define-public (set-contract-uri (new-uri (optional (string-utf8 256))))
  (begin
    (asserts! (is-contract-owner tx-sender) ERR_UNAUTHORIZED)
    (ok (var-set contract-uri new-uri))))

(define-public (set-token-from (new-principal principal))
  (begin
    (asserts! (is-contract-owner tx-sender) ERR_UNAUTHORIZED)
    (ok (var-set token-from new-principal))))

(define-public (set-token-amount (new-reward uint))
  (begin
    (asserts! (is-contract-owner tx-sender) ERR_UNAUTHORIZED)
    (ok (var-set token-amount new-reward))))

(define-public (add-contract-owner (new-owner principal))
  (begin
    (asserts! (is-contract-owner tx-sender) ERR_UNAUTHORIZED)
    (ok (map-set contract-owners new-owner true))))

(define-public (remove-contract-owner (owner principal))
  (begin
    (asserts! (is-contract-owner tx-sender) ERR_UNAUTHORIZED)
    (ok (map-delete contract-owners owner))))