;; Hooter the Owl

(impl-trait 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard.sip-010-trait)
(define-constant TOTAL_SUPPLY u10000000000000000) ;; 10b tokens
(define-fungible-token hooter TOTAL_SUPPLY)

;; --- Fungible Token Traits

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
	(begin
		(asserts! (or (is-eq tx-sender sender) (is-eq contract-caller sender)) err-not-token-owner)
		(ft-transfer? hooter amount sender recipient)))

(define-public (burn (amount uint))
  (ft-burn? hooter amount tx-sender))

(define-read-only (get-name) (ok "Hooter the Owl"))

(define-read-only (get-symbol) (ok "HOOT"))

(define-read-only (get-decimals) (ok u6))

(define-read-only (get-balance (who principal))
	(ok (ft-get-balance hooter who)))

(define-read-only (get-total-supply)
	(ok (ft-get-supply hooter)))

(define-read-only (get-token-uri)
	(ok (some u"https://charisma.rocks/sip10/hooter/metadata.json")))

;; --- Batch Transfer

(define-public (send-many (recipients (list 200 { to: principal, amount: uint, memo: (optional (buff 34)) })))
  (fold check-err (map send-token recipients) (ok true)))

(define-private (check-err (result (response bool uint)) (prior (response bool uint)))
  (match prior ok-value result err-value (err err-value)))

(define-private (send-token (recipient { to: principal, amount: uint, memo: (optional (buff 34)) }))
  (send-token-with-memo (get amount recipient) (get to recipient) (get memo recipient)))

(define-private (send-token-with-memo (amount uint) (to principal) (memo (optional (buff 34))))
  (let ((transferOk (try! (transfer amount tx-sender to memo))))
    (ok transferOk)))

;; --- Initial Mint

(ft-mint? hooter TOTAL_SUPPLY tx-sender)