;; Test Interaction Contract
;;
;; Purpose:
;; This contract serves as a simple test implementation of the interaction-trait
;; for the Charisma protocol. It provides a basic action that can be triggered
;; through the Charisma Interaction Client.

;; Traits
(impl-trait .dao-traits-v6.interaction-trait)

;; Constants
(define-constant ERR_UNAUTHORIZED (err u401))
(define-constant ERR_INVALID_ACTION (err u402))
(define-constant CONTRACT_OWNER tx-sender)

;; Data Variables
(define-data-var contract-uri (optional (string-utf8 256)) (some u"https://charisma.rocks/white-paper.pdf"))

;; Read-only functions

(define-read-only (get-interaction-uri)
  (ok (var-get contract-uri))
)

(define-read-only (get-actions)
  (ok (list "TEST"))
)

;; Public functions

;; Implement execute from interaction-trait
(define-public (execute (action (string-ascii 32)))
  (if (is-eq action "TEST")
      (begin
        (print "Test action executed successfully!")
        (ok true)
      )
      ERR_INVALID_ACTION
  )
)

;; Admin functions

;; Update the contract URI
(define-public (set-contract-uri (new-uri (optional (string-utf8 256))))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
    (ok (var-set contract-uri new-uri))
  )
)