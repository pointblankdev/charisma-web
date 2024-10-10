;; Define the SIP-010 token trait
(define-trait sip-010-token
  (
    (get-balance-at (principal uint) (response uint uint))
  )
)

;; Hardcoded list of 40 integers (0 to 39)
(define-data-var range-list (list 40 uint) 
  (list 
    u0 u1 u2 u3 u4 u5 u6 u7 u8 u9 u10 u11 u12 u13 u14 u15 u16 u17 u18 u19 
    u20 u21 u22 u23 u24 u25 u26 u27 u28 u29 u30 u31 u32 u33 u34 u35 u36 u37 u38 u39
  )
)

;; Function to generate a range of block heights
(define-read-only (generate-range (start uint) (end uint))
  (ok (map filter-range (var-get range-list)))
)

;; Helper function for generate-range
(define-private (filter-range (height uint))
  (and (>= height start) (<= height end))
)

;; Main function to check token holding
(define-read-only (check-token-holding
    (start-height uint)
    (end-height uint)
    (user principal)
    (required-balance uint)
    (token-contract <sip-010-token>))

  (let ((current-height start-height))
    (asserts! (<= start-height end-height) (err u0))
    (asserts! (< end-height u5000) (err u1))
    (ok (fold check-balance-at-height
        (unwrap-panic (generate-range start-height end-height))
        true
        ))
  )
)

;; Helper function to check balance at a specific height
(define-private (check-balance-at-height (height uint) (prev-result bool))
  (and 
    prev-result
    (>= (unwrap-panic (contract-call? token-contract get-balance-at user height)) required-balance)
  )
)