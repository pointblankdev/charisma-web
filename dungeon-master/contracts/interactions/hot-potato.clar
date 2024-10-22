;; Hot Potato Interaction Contract
;;
;; This contract implements a critical utility interaction for the Charisma protocol's
;; exploration system. It serves two key purposes:
;; 1. Ensures consistent post-condition setup for governance token transfers, which
;;    are necessary for the protocol's wrapping mechanics that occur during exploration.
;; 2. Prevents consecutive exploration attempts by the same user by requiring the DMG
;;    token to be "passed" to the previous explorer.
;;
;; Background:
;; During exploration, each interaction set includes an attempt to wrap Charisma tokens.
;; While these wrapping attempts succeed only a small percentage of the time, the 
;; post-conditions for governance token transfers must be set for every exploration 
;; attempt to handle successful cases. The Hot Potato ensures these post-conditions
;; are consistently present by guaranteeing a small token transfer in every interaction.
;;
;; Key Features:
;; 1. Minimal Token Transfer: Implements a small DMG transfer (1,000,000 base units)
;;    to ensure post-conditions are always set.
;; 2. Anti-Spam Mechanism: By transferring to the previous explorer, prevents the same
;;    user from executing consecutive explorations.
;; 3. Last User Tracking: Maintains record of the previous explorer to facilitate the
;;    token passing mechanism.
;; 4. Dungeon Keeper Integration: Uses the protocol's secure transfer functions.
;;
;; Actions:
;; - PASS: Transfers the DMG token to the last user who interacted with the contract,
;;   effectively "passing the potato" and enabling the next exploration attempt.
;;
;; Integration with Exploration System:
;; - Required Component: Included in exploration interaction sets to ensure proper
;;   post-condition setup for potential wrapping operations.
;; - Spam Prevention: Natural cooldown mechanism as users must wait for another
;;   explorer to interact before they can explore again.
;; 
;; Usage:
;; This contract is typically called as part of an exploration interaction set.
;; When executed, it:
;; 1. Records the current sender as the new last-user
;; 2. Transfers the DMG token to the previous user
;; 3. Enables the next exploration attempt
;;
;; The combination of consistent token transfers and user rotation helps maintain
;; the protocol's security and fairness while ensuring proper technical setup for
;; the wrapping mechanics.

;; Implement the interaction-trait
(impl-trait .dao-traits-v7.interaction-trait)

;; Constants
(define-constant ERR_UNAUTHORIZED (err u401))
(define-constant CONTRACT_OWNER tx-sender)
(define-constant TRANSFER_AMOUNT u1000000)

;; Data Variables
(define-data-var contract-uri (optional (string-utf8 256)) (some u"https://charisma.rocks/api/v0/interactions/hot-potato"))
(define-data-var last-user principal tx-sender)

;; Read-only functions

(define-read-only (get-interaction-uri)
  (ok (var-get contract-uri))
)

(define-read-only (get-last-user)
  (ok (var-get last-user))
)

;; Public functions

(define-public (execute (action (string-ascii 32)))
  (let ((sender tx-sender))
    (if (is-eq action "PASS") (transfer-dmg-action sender)
      (err "INVALID_ACTION")))
)

;; Hot Potato Action Handler

(define-private (transfer-dmg-action (sender principal))
  (let ((last-user-principal (var-get last-user)))
    (var-set last-user sender)
    (match (contract-call? .dungeon-keeper transfer TRANSFER_AMOUNT sender last-user-principal)
      success (handle-potato-success sender last-user-principal TRANSFER_AMOUNT)
      error   (if (is-eq error u1) (handle-potato-insufficient-balance sender last-user-principal TRANSFER_AMOUNT)
              (if (is-eq error u2) (handle-potato-self-pass sender last-user-principal TRANSFER_AMOUNT)
              (if (is-eq error u3) (handle-potato-invalid-amount sender last-user-principal TRANSFER_AMOUNT)
              (if (is-eq error u405) (handle-potato-limit-exceeded sender last-user-principal TRANSFER_AMOUNT)
              (if (is-eq error u403) (handle-potato-unverified sender last-user-principal TRANSFER_AMOUNT)
              (handle-potato-unknown-error sender last-user-principal TRANSFER_AMOUNT))))))))
)

;; Hot Potato Response Handlers

(define-private (handle-potato-success (sender principal) (recipient principal) (amount uint))
  (begin
    (print "The adventurer readies their next exploration by passing DMG to the previous explorer.")
    (ok "DMG_TRANSFERRED"))
)

(define-private (handle-potato-insufficient-balance (sender principal) (recipient principal) (amount uint))
  (begin
    (print "The adventurer lacks the required DMG to prepare their exploration attempt.")
    (ok "DMG_NOT_TRANSFERRED"))
)

(define-private (handle-potato-self-pass (sender principal) (recipient principal) (amount uint))
  (begin
    (print "The adventurer must wait for another explorer before attempting again.")
    (ok "DMG_NOT_TRANSFERRED"))
)

(define-private (handle-potato-invalid-amount (sender principal) (recipient principal) (amount uint))
  (begin
    (print "The exploration preparation requires a specific amount of DMG.")
    (ok "DMG_NOT_TRANSFERRED"))
)

(define-private (handle-potato-limit-exceeded (sender principal) (recipient principal) (amount uint))
  (begin
    (print "The dungeon's transfer mechanisms are temporarily at capacity.")
    (ok "DMG_NOT_TRANSFERRED"))
)

(define-private (handle-potato-unverified (sender principal) (recipient principal) (amount uint))
  (begin
    (print "This interaction is not verified for exploration preparation.")
    (ok "DMG_NOT_TRANSFERRED"))
)

(define-private (handle-potato-unknown-error (sender principal) (recipient principal) (amount uint))
  (begin
    (print "An unexpected error occurred while preparing for exploration.")
    (ok "DMG_NOT_TRANSFERRED"))
)

;; Admin functions

(define-public (set-contract-uri (new-uri (optional (string-utf8 256))))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
    (ok (var-set contract-uri new-uri)))
)